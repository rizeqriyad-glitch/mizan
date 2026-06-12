import { useEffect, useRef } from 'react'
import { useApp } from '../contexts/AppContext'
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160/build/three.module.js'

export function Logo({ size = 'md', showText = true }) {
  const { theme } = useApp()
  const containerRef = useRef(null)
  const sceneRef = useRef(null)
  const rendererRef = useRef(null)
  const scaleRef = useRef(null)
  const mouseRef = useRef({ x: 0, y: 0 })

  const sizeMap = {
    sm: { width: 40, height: 40, radius: 8, scale: 0.8 },
    md: { width: 80, height: 80, radius: 16, scale: 1 },
    lg: { width: 120, height: 120, radius: 20, scale: 1.2 },
  }

  const sizes = sizeMap[size] || sizeMap.md

  useEffect(() => {
    if (!containerRef.current) return

    // Scene setup
    const scene = new THREE.Scene()
    scene.background = null
    sceneRef.current = scene

    const camera = new THREE.PerspectiveCamera(
      75,
      sizes.width / sizes.height,
      0.1,
      1000
    )
    camera.position.z = 2

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(window.devicePixelRatio)
    rendererRef.current = renderer
    containerRef.current.innerHTML = ''
    containerRef.current.appendChild(renderer.domElement)

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8)
    const pointLight1 = new THREE.PointLight(0x339cff, 1.5)
    const pointLight2 = new THREE.PointLight(0x66b5ff, 1)
    pointLight1.position.set(5, 5, 5)
    pointLight2.position.set(-5, -5, 5)
    scene.add(ambientLight, pointLight1, pointLight2)

    // Create balanced scales (Three.js geometry)
    const group = new THREE.Group()
    scaleRef.current = group

    // Center beam
    const beamGeom = new THREE.CylinderGeometry(0.05, 0.05, 0.4, 8)
    const beamMat = new THREE.MeshPhysicalMaterial({
      color: 0x339cff,
      metalness: 0.8,
      roughness: 0.2,
      transmission: 0.3,
    })
    const beam = new THREE.Mesh(beamGeom, beamMat)
    beam.position.z = 0.05
    group.add(beam)

    // Left pan (scale)
    const panGeom = new THREE.BoxGeometry(0.25, 0.08, 0.15)
    const panMatLeft = new THREE.MeshPhysicalMaterial({
      color: 0x339cff,
      transmission: 0.6,
      thickness: 0.5,
      ior: 1.5,
      roughness: 0.15,
      metalness: 0.3,
    })
    const leftPan = new THREE.Mesh(panGeom, panMatLeft)
    leftPan.position.set(-0.25, 0.15, 0)
    group.add(leftPan)

    // Right pan (scale)
    const panMatRight = new THREE.MeshPhysicalMaterial({
      color: 0x66b5ff,
      transmission: 0.6,
      thickness: 0.5,
      ior: 1.5,
      roughness: 0.15,
      metalness: 0.3,
    })
    const rightPan = new THREE.Mesh(panGeom, panMatRight)
    rightPan.position.set(0.25, 0.15, 0)
    group.add(rightPan)

    // Left arm
    const armGeom = new THREE.CylinderGeometry(0.04, 0.04, 0.5, 8)
    const armMat = new THREE.MeshPhysicalMaterial({
      color: 0xc0c0c0,
      metalness: 0.9,
      roughness: 0.1,
    })
    const leftArm = new THREE.Mesh(armGeom, armMat)
    leftArm.position.set(-0.25, 0.05, 0)
    leftArm.rotation.z = 0.3
    group.add(leftArm)

    // Right arm
    const rightArm = new THREE.Mesh(armGeom, armMat)
    rightArm.position.set(0.25, 0.05, 0)
    rightArm.rotation.z = -0.3
    group.add(rightArm)

    scene.add(group)

    // Animation loop
    let animationId
    const animate = () => {
      animationId = requestAnimationFrame(animate)

      // Auto-rotate
      group.rotation.x += 0.003
      group.rotation.y += 0.005
      group.rotation.z += 0.001

      // Gentle scale pulsing
      const scale = 1 + Math.sin(Date.now() * 0.001) * 0.05
      group.scale.set(scale, scale, scale)

      // Mouse tracking
      const targetRotX = mouseRef.current.y * 0.3
      const targetRotY = mouseRef.current.x * 0.3

      group.rotation.x += (targetRotX - group.rotation.x) * 0.03
      group.rotation.y += (targetRotY - group.rotation.y) * 0.03

      renderer.render(scene, camera)
    }

    animate()

    // Mouse tracking
    const handleMouseMove = (e) => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      mouseRef.current.x = (e.clientX - rect.left) / rect.width - 0.5
      mouseRef.current.y = -(e.clientY - rect.top) / rect.height + 0.5
    }

    containerRef.current.addEventListener('mousemove', handleMouseMove)

    // Cleanup
    return () => {
      cancelAnimationFrame(animationId)
      containerRef.current?.removeEventListener('mousemove', handleMouseMove)
      renderer.dispose()
      containerRef.current?.removeChild(renderer.domElement)
    }
  }, [sizes, theme])

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        ref={containerRef}
        style={{
          width: `${sizes.width}px`,
          height: `${sizes.height}px`,
          borderRadius: `${sizes.radius}px`,
          background: theme === 'dark'
            ? 'linear-gradient(135deg, rgba(51, 156, 255, 0.15), rgba(102, 181, 255, 0.08))'
            : 'linear-gradient(135deg, rgba(51, 156, 255, 0.1), rgba(102, 181, 255, 0.05))',
          backdropFilter: 'blur(20px) saturate(180%)',
          border: '1px solid rgba(51, 156, 255, 0.25)',
          boxShadow: '0 8px 32px rgba(51, 156, 255, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.4)',
          position: 'relative',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
        }}
        className="hover:shadow-lg hover:border-mizan-purple"
      />
      {showText && size !== 'sm' && (
        <div
          style={{
            fontFamily: 'var(--font-brand)',
            fontSize: size === 'lg' ? '1.5rem' : '1.1rem',
            fontWeight: 400,
            letterSpacing: '0.05em',
            color: 'var(--mizan-purple)',
            marginTop: '0.5rem',
            textAlign: 'center',
          }}
        >
          <div>Mizan</div>
          <div style={{ fontSize: '0.75em', opacity: 0.7 }}>ميزان</div>
        </div>
      )}
    </div>
  )
}
