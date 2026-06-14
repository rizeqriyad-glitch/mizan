import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160/build/three.module.js'
import { useApp } from '../contexts/AppContext'

// Particle System Class
class ParticleSystem {
  constructor(scene) {
    this.scene = scene;
    this.particles = [];
    this.geometry = new THREE.BufferGeometry();
    this.material = new THREE.PointsMaterial({
      size: 0.1,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      vertexColors: true,
    });
    this.points = new THREE.Points(this.geometry, this.material);
    this.scene.add(this.points);
  }

  emit(position, color) {
    const count = 15; // Fewer particles for a subtle effect
    for (let i = 0; i < count; i++) {
      this.particles.push({
        position: position.clone(),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.3, // Reduced velocity spread
          Math.random() * 0.3 + 0.1, // Upward initial velocity
          (Math.random() - 0.5) * 0.3
        ),
        color: new THREE.Color(color),
        alpha: 1,
        life: Math.random() * 0.8 + 0.5, // Shorter lifespan
        age: 0,
        size: Math.random() * 0.03 + 0.01, // Smaller size
      });
    }
  }

  update(dt) {
    const positions = [];
    const colors = [];
    const sizes = []; // To update particle size

    this.particles = this.particles.filter(p => {
      p.age += dt;
      if (p.age < p.life) {
        p.position.addScaledVector(p.velocity, dt);
        p.velocity.y -= 0.3 * dt; // Reduced gravity
        p.alpha = 1 - (p.age / p.life);
        p.size *= 1 + 0.5 * dt; // Grow slightly

        positions.push(p.position.x, p.position.y, p.position.z);
        colors.push(p.color.r, p.color.g, p.color.b, p.alpha);
        sizes.push(p.size);
        return true;
      }
      return false;
    });

    this.geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    this.geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 4));
    this.geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1)); // Add size attribute
    this.geometry.attributes.position.needsUpdate = true;
    this.geometry.attributes.color.needsUpdate = true;
    this.geometry.attributes.size.needsUpdate = true;

    this.points.material.sizeAttenuation = true; // Enable size attenuation
  }
}

export default function Mizan3DBackground() {
  const { completedToday } = useApp()
  const canvasRef = useRef(null)
  const lastCount = useRef(completedToday.length)
  const sceneRef = useRef(null)
  const pansRef = useRef({ left: null, right: null, beam: null })
  const blocksRef = useRef([])
  const particleSystemRef = useRef(null);
  const [tooltip, setTooltip] = useState(null)

  useEffect(() => {
    if (!canvasRef.current) return
    
    const scene = new THREE.Scene()
    sceneRef.current = scene
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000)
    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, alpha: true, antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(window.innerWidth, window.innerHeight)

    particleSystemRef.current = new ParticleSystem(scene);

    // Materials
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff, metalness: 0.1, roughness: 0.05, 
      transmission: 0.95, thickness: 0.5, transparent: true, opacity: 0.4
    })
    const glowMat = new THREE.MeshStandardMaterial({ color: 0x339cff, emissive: 0x66b5ff, emissiveIntensity: 2 })

    // Scale Structure
    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.1, 5, 32), glassMat)
    scene.add(pillar)

    const beamGroup = new THREE.Group()
    beamGroup.position.y = 2
    pansRef.current.beam = beamGroup
    scene.add(beamGroup)
    
    const beam = new THREE.Mesh(new THREE.BoxGeometry(5.5, 0.06, 0.06), glassMat)
    beamGroup.add(beam)

    const createPan = (x) => {
      const g = new THREE.Group()
      g.position.x = x
      const pan = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 0.04, 32), glassMat)
      const rimMat = glowMat.clone()
      const rim = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.02, 16, 100), rimMat)
      rim.rotation.x = Math.PI / 2
      g.add(pan, rim)
      g.userData = { rim, glow: 0 }
      beamGroup.add(g)
      return g
    }

    pansRef.current.left = createPan(-2.7)
    pansRef.current.right = createPan(2.7)

    // Lights
    const p1 = new THREE.PointLight(0x339cff, 50); p1.position.set(5, 5, 5); scene.add(p1)
    const p2 = new THREE.PointLight(0x66b5ff, 30); p2.position.set(-5, -5, 5); scene.add(p2)
    scene.add(new THREE.AmbientLight(0xffffff, 0.5))

    camera.position.z = 9
    camera.position.y = 0.5

    const raycaster = new THREE.Raycaster()
    const pulses = [] // Tracker for gravity pulses
    const mouse = { x: 0, y: 0 }
    const onMove = (e) => { mouse.x = (e.clientX / window.innerWidth - 0.5) * 2; mouse.y = -(e.clientY / window.innerHeight - 0.5) * 2 }
    window.addEventListener('mousemove', onMove)

    const onClick = (e) => {
      // Ignore clicks on UI elements (buttons/inputs)
      if (['BUTTON', 'INPUT', 'A', 'TEXTAREA'].includes(e.target.tagName)) return

      const mouseV = new THREE.Vector2(
        (e.clientX / window.innerWidth) * 2 - 1,
        -(e.clientY / window.innerHeight) * 2 + 1
      )
      
      raycaster.setFromCamera(mouseV, camera)
      const intersects = raycaster.intersectObjects(blocksRef.current.map(b => b.mesh))
      
      if (intersects.length > 0) {
        const hitMesh = intersects[0].object
        const block = blocksRef.current.find(b => b.mesh === hitMesh)
        
        if (block && block.landed) {
          // Trigger gravity pulse ripple
          pulses.push({
            pos: hitMesh.position.clone(),
            startTime: clock.getElapsedTime(),
            duration: 0.6,
            strength: 0.5,
            radius: 3
          })

          const vector = new THREE.Vector3()
          hitMesh.getWorldPosition(vector)
          vector.project(camera)
          
          setTooltip({
            text: block.taskText,
            x: (vector.x * 0.5 + 0.5) * window.innerWidth,
            y: (-(vector.y * 0.5) + 0.5) * window.innerHeight
          })
          
          if (window.mizanTooltipTimer) clearTimeout(window.mizanTooltipTimer)
          window.mizanTooltipTimer = setTimeout(() => setTooltip(null), 3500)
        }
      } else {
        setTooltip(null)
      }
    }
    window.addEventListener('click', onClick)

    const clock = new THREE.Clock()
    const animate = () => {
      const dt = clock.getDelta()
      const t = clock.getElapsedTime()
      
      // Calculate ripple and push forces from clicks
      let pulseRipple = 0
      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i]
        const elapsed = t - p.startTime
        if (elapsed > p.duration) {
          pulses.splice(i, 1)
          continue
        }
        const prog = elapsed / p.duration
        const wave = Math.sin(prog * Math.PI) * (1 - prog)
        pulseRipple += wave * 0.15

        blocksRef.current.forEach(b => {
          if (!b.landed) return
          const d = b.mesh.position.distanceTo(p.pos)
          if (d < p.radius && d > 0.01) {
            const dir = b.mesh.position.clone().sub(p.pos).normalize()
            if (!b.pOffset) b.pOffset = new THREE.Vector3()
            b.pOffset.add(dir.multiplyScalar(wave * p.strength * (1 - d / p.radius)))
          }
        })
      }

      // Decay pulse offsets
      blocksRef.current.forEach(b => {
        if (b.pOffset) {
          b.pOffset.multiplyScalar(0.85)
          if (b.pOffset.length() < 0.001) b.pOffset.set(0, 0, 0)
        }
      })
      
      // Dynamic Balance Physics
      const balance = (blocksRef.current.filter(b => b.target === 'left').length - blocksRef.current.filter(b => b.target === 'right').length) * 0.05
      const ripple = Math.sin(t * 35) * pulseRipple
      const targetTilt = balance + Math.sin(t * 0.5) * 0.05 + ripple
      beamGroup.rotation.z = THREE.MathUtils.lerp(beamGroup.rotation.z, targetTilt, 0.05)
      
      // Keep pans horizontal (counter-rotation)
      // This should be applied to the pan's group, not the pan itself, to keep the pan's local orientation consistent.
      pansRef.current.left.rotation.z = -beamGroup.rotation.z
      pansRef.current.right.rotation.z = -beamGroup.rotation.z

      // Camera drift
      camera.position.x = THREE.MathUtils.lerp(camera.position.x, mouse.x * 1.5, 0.05)
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, mouse.y * 1 + 0.5, 0.05)
      camera.lookAt(0, 1, 0)

      // Update pan glows
      const pans = [pansRef.current.left, pansRef.current.right]
      pans.forEach(pan => {
        if (pan.userData.glow > 0) {
          pan.userData.glow -= dt * 1.5 // Fade out over ~0.66s
          pan.userData.rim.material.emissiveIntensity = 2 + Math.max(0, pan.userData.glow) * 8
        }
      })

      // Animate flying blocks
      blocksRef.current.forEach(b => {
        const pan = b.target === 'left' ? pansRef.current.left : pansRef.current.right
        const targetPos = new THREE.Vector3()
        pan.getWorldPosition(targetPos).add(b.offset)
        if (b.pOffset) targetPos.add(b.pOffset)

        if (b.prog < 1) { // Block is still flying
          b.prog += 0.015
          b.mesh.position.lerp(targetPos, b.prog)
          b.mesh.rotation.x += 0.08
          b.mesh.rotation.y += 0.08
          b.mesh.scale.setScalar(THREE.MathUtils.lerp(0, 0.4, Math.min(b.prog * 4, 1)))
        } else {
          // Block is landed (or just landing)
          b.mesh.position.copy(targetPos)
          
          if (!b.landed) { // First frame of landing
            b.landed = true
            pan.userData.glow = 1.0 // Trigger pan glow spike
            if (particleSystemRef.current) {
              particleSystemRef.current.emit(b.mesh.position, b.mesh.material.color);
            }
          }
        }
      })

      // Update particle system
      particleSystemRef.current.update(dt);

      renderer.render(scene, camera)
      requestAnimationFrame(animate)
    }
    animate()

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener('resize', handleResize)
    return () => { 
      window.removeEventListener('mousemove', onMove); 
      window.removeEventListener('click', onClick);
      window.removeEventListener('resize', handleResize);
      if (window.mizanTooltipTimer) clearTimeout(window.mizanTooltipTimer)
    }
  }, [])

  // Completion Logic: Spawn Block
  useEffect(() => {
    if (completedToday.length > lastCount.current && sceneRef.current) {
      const newItems = completedToday.slice(lastCount.current)
      const PRAYER_IDS = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha']
      const WORSHIP_IDS = ['adhkar', 'quran']

      newItems.forEach(item => {
        const isLeft = Math.random() > 0.5
        
        let geom;
        if (PRAYER_IDS.includes(item.sectionId)) {
          geom = new THREE.SphereGeometry(0.5, 24, 24)
        } else if (WORSHIP_IDS.includes(item.sectionId)) {
          geom = new THREE.ConeGeometry(0.6, 0.9, 4) // Pyramid shape
        } else {
          geom = new THREE.BoxGeometry(0.8, 0.8, 0.8)
        }

        const blockMat = new THREE.MeshPhysicalMaterial({ 
          color: isLeft ? 0x339cff : 0x66b5ff, 
          emissive: isLeft ? 0x339cff : 0x66b5ff, 
          emissiveIntensity: 0.5,
          transmission: 0.8, 
          thickness: 1 
        })
        const mesh = new THREE.Mesh(geom, blockMat)
        mesh.scale.setScalar(0)
        mesh.position.set(Math.random() * 20 - 10, 10, 0)
        sceneRef.current.add(mesh)
        
        blocksRef.current.push({
          mesh,
          target: isLeft ? 'left' : 'right',
          prog: 0,
          offset: new THREE.Vector3(Math.random() * 0.4 - 0.2, 0.1, Math.random() * 0.4 - 0.2),
          taskText: item.text,
          landed: false, // New flag to track if the block has landed
        })
      })
    }
    lastCount.current = completedToday.length
  }, [completedToday])

  return (
    <>
      <canvas 
        ref={canvasRef} 
        style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          pointerEvents: 'none', zIndex: 0, opacity: 0.7
        }} 
      />
      
      <AnimatePresence>
        {tooltip && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            style={{
              position: 'fixed',
              left: tooltip.x,
              top: tooltip.y - 70,
              transform: 'translateX(-50%)',
              zIndex: 1000,
              pointerEvents: 'none',
              background: 'var(--v-glass-bg)',
              backdropFilter: 'blur(16px) saturate(180%)',
              border: '1px solid var(--mizan-cyan)',
              borderRadius: '12px',
              padding: '0.75rem 1.25rem',
              boxShadow: '0 15px 35px rgba(201, 56, 3,0.25), 0 0 20px rgba(251, 70, 4,0.1)',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-brand)',
              fontSize: '0.95rem',
              whiteSpace: 'nowrap',
              textAlign: 'center',
            }}
          >
            {/* Pointer arrow */}
            <div style={{ position: 'absolute', bottom: -6, left: '50%', transform: 'translateX(-50%) rotate(45deg)', width: 12, height: 12, background: 'var(--v-glass-bg)', borderRight: '1px solid var(--mizan-cyan)', borderBottom: '1px solid var(--mizan-cyan)' }} />
            
            <div style={{ opacity: 0.7, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.2rem', color: 'var(--mizan-cyan)' }}>Achievement</div>
            {tooltip.text}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}