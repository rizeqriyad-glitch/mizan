import { useEffect, useRef, useState } from 'react'

/**
 * MizanHero — "The Living Mizan" (landing hero).
 *
 * One hero effect + one ambient, in a single canvas:
 *   ambient : GLSL aurora quad — the night-to-Fajr wash (jet → prussian → azure)
 *   hero    : a glass balance scale whose beam tilt is driven by real data
 *             (completed prayers today). At 5/5 it settles into equilibrium
 *             and the rims brighten. Each new completion fires a particle
 *             burst from a pre-allocated buffer (no per-frame allocation).
 *
 * Engineering contract (§6):
 *   - lazy-inits on first intersection, never on parse (three@0.180 from CDN)
 *   - DPR ≤2 desktop / ≤1.5 mobile · mobile + low-end get aurora only
 *   - pauses when off-screen or tab hidden · full dispose() on unmount
 *   - damp() everywhere — frame-rate independent, mouse parallax springs
 *   - fallback ladder: reduced-motion / WebGL-fail / import-fail → CSS .aurora
 */

/* Same URL as Mizan3DScene's static import — the module cache dedupes,
   so only ONE three.js instance ever loads (no duplicate ~600KB, no
   "Multiple instances of Three.js" warning). */
const THREE_URL = 'https://cdn.jsdelivr.net/npm/three@0.160/build/three.module.js'
const MAX_PARTICLES = 240

const prefersReduce = () =>
  typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches

export default function MizanHero({ completed = 0, total = 5 }) {
  const wrapRef = useRef(null)
  const canvasRef = useRef(null)
  const dataRef = useRef({ completed, total })
  const burstFnRef = useRef(null)
  const prevCompleted = useRef(completed)
  const [fallback, setFallback] = useState(prefersReduce())

  dataRef.current = { completed, total }

  useEffect(() => {
    if (completed > prevCompleted.current) burstFnRef.current?.()
    prevCompleted.current = completed
  }, [completed])

  useEffect(() => {
    if (prefersReduce()) return
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    if (!canvas || !wrap) return

    let disposed = false
    let started = false
    let teardown = null

    async function start() {
      if (started || disposed) return
      started = true
      let THREE
      try {
        THREE = await import(/* @vite-ignore */ THREE_URL)
      } catch {
        if (!disposed) setFallback(true)
        return
      }
      if (disposed) return

      let renderer
      try {
        renderer = new THREE.WebGLRenderer({
          canvas, antialias: true, alpha: true, powerPreference: 'high-performance',
        })
      } catch {
        setFallback(true)
        return
      }

      const lowEnd = (navigator.hardwareConcurrency || 8) < 4
      const mobile = window.innerWidth < 768
      const withScale = !mobile && !lowEnd

      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 2))
      renderer.outputColorSpace = THREE.SRGBColorSpace
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.autoClear = false

      /* ── ambient: aurora quad ──────────────────────────── */
      const THEMES = {
        dark:  { a: '#0c0e18', b: '#003566', c: '#339cff', fog: 0x0c0e18 },
        light: { a: '#eef2f8', b: '#cce6ff', c: '#66b5ff', fog: 0xeef2f8 },
      }
      const themeName = () =>
        document.documentElement.dataset.theme === 'light' ? 'light' : 'dark'

      const uniforms = {
        uTime: { value: 0 },
        uAspect: { value: 1 },
        uMouse: { value: new THREE.Vector2(0, 0) },
        uA: { value: new THREE.Color(THEMES[themeName()].a) },
        uB: { value: new THREE.Color(THEMES[themeName()].b) },
        uC: { value: new THREE.Color(THEMES[themeName()].c) },
      }
      const auroraScene = new THREE.Scene()
      const ortho = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
      const auroraMat = new THREE.ShaderMaterial({
        uniforms,
        depthWrite: false,
        vertexShader: /* glsl */ `
          varying vec2 vUv;
          void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }`,
        fragmentShader: /* glsl */ `
          precision highp float;
          varying vec2 vUv;
          uniform float uTime, uAspect; uniform vec2 uMouse; uniform vec3 uA,uB,uC;
          float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
          float noise(vec2 p){ vec2 i=floor(p), f=fract(p); vec2 u=f*f*(3.-2.*f);
            return mix(mix(hash(i),hash(i+vec2(1,0)),u.x),
                       mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),u.x), u.y); }
          float fbm(vec2 p){ float v=0., a=.5;
            for(int k=0;k<5;k++){ v+=a*noise(p); p*=2.03; a*=.5; } return v; }
          void main(){
            vec2 uv = vUv; uv.x *= uAspect;
            float t = uTime*.045;
            vec2 drift = vec2(fbm(uv*1.6+t), fbm(uv*1.6-t));
            float field = fbm(uv*2.1 + drift*1.5 + uMouse*.10);
            vec3 col = mix(uA, uB, smoothstep(.32,.88,field));
            col = mix(col, uC, fbm(uv*3.4 - t)*.28);
            col *= .5 + .5*smoothstep(1.25,.2,length(vUv-vec2(.5,.42))*1.7);
            gl_FragColor = vec4(col, 1.);
          }`,
      })
      auroraScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), auroraMat))

      /* ── hero: the scale ───────────────────────────────── */
      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(46, 1, 0.1, 60)
      camera.position.set(0, 0.4, 7.4)

      let beamGroup, panL, panR, rimMats = [], finial, scaleGroup
      let points, pPos, pVel, pCol, pLife, pAlive = 0

      if (withScale) {
        scene.fog = new THREE.Fog(THEMES[themeName()].fog, 9, 17)

        const glass = new THREE.MeshPhysicalMaterial({
          color: 0xdfeaff, metalness: 0.05, roughness: 0.14,
          transmission: 0.92, thickness: 0.5, transparent: true, opacity: 0.5,
        })
        const rimMatProto = new THREE.MeshStandardMaterial({
          color: 0x0a1a2f, emissive: 0x339cff, emissiveIntensity: 1.3,
        })

        scaleGroup = new THREE.Group()

        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.09, 4.4, 20), glass)
        post.position.y = -0.05
        scaleGroup.add(post)

        finial = new THREE.Mesh(new THREE.OctahedronGeometry(0.3), rimMatProto.clone())
        rimMats.push(finial.material)
        finial.position.y = 2.55
        scaleGroup.add(finial)

        const base = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.85, 0.16, 28), glass)
        base.position.y = -2.3
        scaleGroup.add(base)
        const baseRim = new THREE.Mesh(new THREE.TorusGeometry(0.85, 0.02, 12, 60), rimMatProto.clone())
        rimMats.push(baseRim.material)
        baseRim.rotation.x = Math.PI / 2
        baseRim.position.y = -2.38
        scaleGroup.add(baseRim)

        beamGroup = new THREE.Group()
        beamGroup.position.y = 2.1
        const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 5.1, 14), glass)
        beam.rotation.z = Math.PI / 2
        beamGroup.add(beam)

        const makePan = (x) => {
          const g = new THREE.Group()
          g.position.x = x
          const chain = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.95, 8), glass)
          chain.position.y = -0.48
          const dish = new THREE.Mesh(new THREE.CylinderGeometry(0.74, 0.6, 0.07, 30), glass)
          dish.position.y = -0.98
          const rim = new THREE.Mesh(new THREE.TorusGeometry(0.74, 0.02, 12, 64), rimMatProto.clone())
          rimMats.push(rim.material)
          rim.rotation.x = Math.PI / 2
          rim.position.y = -0.95
          g.add(chain, dish, rim)
          beamGroup.add(g)
          return g
        }
        panL = makePan(-2.35)
        panR = makePan(2.35)
        scaleGroup.add(beamGroup)
        /* staging: the wordmark is the focal point — the scale sits behind it,
           smaller and deeper into the fog, as a presence rather than a subject */
        scaleGroup.position.set(0, -0.15, -1.4)
        scaleGroup.scale.setScalar(0.82)
        scene.add(scaleGroup)

        scene.add(new THREE.AmbientLight(0xffffff, 0.45))
        const key = new THREE.PointLight(0x339cff, 30)
        key.position.set(4, 5, 6)
        scene.add(key)
        const fill = new THREE.PointLight(0xffffff, 8)
        fill.position.set(-5, 2, 4)
        scene.add(fill)

        /* particle burst — buffers allocated ONCE */
        pPos = new Float32Array(MAX_PARTICLES * 3)
        pVel = new Float32Array(MAX_PARTICLES * 3)
        pCol = new Float32Array(MAX_PARTICLES * 3)
        pLife = new Float32Array(MAX_PARTICLES)
        const pGeo = new THREE.BufferGeometry()
        pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3))
        pGeo.setAttribute('color', new THREE.BufferAttribute(pCol, 3))
        pGeo.setDrawRange(0, 0)
        points = new THREE.Points(pGeo, new THREE.PointsMaterial({
          size: 0.055, vertexColors: true, transparent: true,
          blending: THREE.AdditiveBlending, depthWrite: false,
        }))
        scene.add(points)
      }

      burstFnRef.current = () => {
        if (!withScale || !points) return
        const origin = new THREE.Vector3()
        ;(panR || scaleGroup).getWorldPosition(origin)
        origin.y -= 0.6
        const n = 80
        for (let k = 0; k < n; k++) {
          const i = (pAlive + k) % MAX_PARTICLES
          pPos[i * 3] = origin.x; pPos[i * 3 + 1] = origin.y; pPos[i * 3 + 2] = origin.z
          pVel[i * 3] = (Math.random() - 0.5) * 1.4
          pVel[i * 3 + 1] = Math.random() * 1.6 + 0.4
          pVel[i * 3 + 2] = (Math.random() - 0.5) * 1.4
          pLife[i] = 1
        }
        pAlive = Math.min(pAlive + n, MAX_PARTICLES)
      }

      /* ── frame loop ────────────────────────────────────── */
      const AZURE = new THREE.Color(0x66b5ff)
      const damp = THREE.MathUtils.damp
      const clock = new THREE.Clock()
      const mouse = { x: 0, y: 0 }
      let raf = 0
      let onScreen = false

      const onMove = (e) => {
        mouse.x = (e.clientX / window.innerWidth - 0.5) * 2
        mouse.y = -(e.clientY / window.innerHeight - 0.5) * 2
      }
      window.addEventListener('pointermove', onMove, { passive: true })

      function tick() {
        const dt = Math.min(clock.getDelta(), 0.05)
        const t = clock.elapsedTime

        uniforms.uTime.value = t
        uniforms.uMouse.value.x = damp(uniforms.uMouse.value.x, mouse.x, 2, dt)
        uniforms.uMouse.value.y = damp(uniforms.uMouse.value.y, mouse.y, 2, dt)

        renderer.clear()
        renderer.render(auroraScene, ortho)

        if (withScale) {
          const { completed: done, total: tot } = dataRef.current
          const ratio = Math.min(Math.max(done / (tot || 1), 0), 1)
          const settled = ratio >= 1

          // imbalance while the day is incomplete; equilibrium at 5/5
          const targetTilt = (1 - ratio) * 0.16 + Math.sin(t * 0.6) * (settled ? 0.012 : 0.025)
          beamGroup.rotation.z = damp(beamGroup.rotation.z, targetTilt, 3, dt)
          panL.rotation.z = -beamGroup.rotation.z
          panR.rotation.z = -beamGroup.rotation.z

          const glowTarget = settled ? 2.6 : 1.3
          for (const m of rimMats) m.emissiveIntensity = damp(m.emissiveIntensity, glowTarget, 2.5, dt)

          scaleGroup.position.y = -0.15 + Math.sin(t * 0.8) * 0.05
          finial.rotation.y += dt * 0.5

          camera.position.x = damp(camera.position.x, mouse.x * 0.55, 3, dt)
          camera.position.y = damp(camera.position.y, 0.4 + mouse.y * 0.3, 3, dt)
          camera.lookAt(0, 0.3, 0)

          if (pAlive > 0) {
            let any = false
            for (let i = 0; i < pAlive; i++) {
              if (pLife[i] <= 0) continue
              any = true
              pLife[i] -= dt * 0.9
              pVel[i * 3 + 1] -= 1.6 * dt
              pPos[i * 3] += pVel[i * 3] * dt
              pPos[i * 3 + 1] += pVel[i * 3 + 1] * dt
              pPos[i * 3 + 2] += pVel[i * 3 + 2] * dt
              const a = Math.max(pLife[i], 0)
              pCol[i * 3] = AZURE.r * a
              pCol[i * 3 + 1] = AZURE.g * a
              pCol[i * 3 + 2] = AZURE.b * a
            }
            if (!any) pAlive = 0
            points.geometry.setDrawRange(0, pAlive)
            points.geometry.attributes.position.needsUpdate = true
            points.geometry.attributes.color.needsUpdate = true
          }

          renderer.clearDepth()
          renderer.render(scene, camera)
        }

        raf = requestAnimationFrame(tick)
      }

      function play() {
        cancelAnimationFrame(raf)
        if (onScreen && !document.hidden && !disposed) {
          clock.getDelta() // swallow the pause gap
          raf = requestAnimationFrame(tick)
        }
      }

      const io = new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; play() })
      io.observe(canvas)
      const onVis = () => play()
      document.addEventListener('visibilitychange', onVis)

      function resize() {
        const w = wrap.clientWidth || 1
        const h = wrap.clientHeight || 1
        renderer.setSize(w, h, false)
        camera.aspect = w / h
        camera.updateProjectionMatrix()
        uniforms.uAspect.value = w / h
      }
      resize()
      const ro = new ResizeObserver(resize)
      ro.observe(wrap)

      const applyTheme = () => {
        const th = THEMES[themeName()]
        uniforms.uA.value.set(th.a)
        uniforms.uB.value.set(th.b)
        uniforms.uC.value.set(th.c)
        if (scene.fog) scene.fog.color.setHex(th.fog)
      }
      const mo = new MutationObserver(applyTheme)
      mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })

      teardown = () => {
        cancelAnimationFrame(raf)
        io.disconnect(); ro.disconnect(); mo.disconnect()
        document.removeEventListener('visibilitychange', onVis)
        window.removeEventListener('pointermove', onMove)
        burstFnRef.current = null
        const disposeScene = (s) => s.traverse((o) => {
          o.geometry?.dispose?.()
          const mats = Array.isArray(o.material) ? o.material : o.material ? [o.material] : []
          mats.forEach((m) => {
            Object.values(m).forEach((v) => v?.isTexture && v.dispose())
            m.dispose?.()
          })
        })
        disposeScene(auroraScene)
        disposeScene(scene)
        renderer.dispose()
      }
    }

    // lazy-init only when the hero is (about to be) visible
    const lazy = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { start(); lazy.disconnect() }
    }, { rootMargin: '120px' })
    lazy.observe(canvas)

    return () => {
      disposed = true
      lazy.disconnect()
      teardown?.()
    }
  }, [])

  return (
    <div className="ld-hero-canvas" ref={wrapRef} aria-hidden="true">
      {fallback
        ? <div className="aurora" />
        : <canvas ref={canvasRef} />}
    </div>
  )
}
