import { useEffect, useRef } from 'react'
import { motion } from 'motion/react'
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160/build/three.module.js'

export function Canvas3DIcon({ createGeometry, className = '', size = 'md', interactive = true }) {
  const containerRef = useRef(null)
  const sceneRef = useRef(null)
  const rendererRef = useRef(null)
  const objectRef = useRef(null)
  const mouseRef = useRef({ x: 0, y: 0 })

  const sizeMap = {
    sm: 60,
    md: 100,
    lg: 140,
  }

  const dimension = sizeMap[size] || 100

  useEffect(() => {
    if (!containerRef.current) return

    // Scene setup
    const scene = new THREE.Scene()
    scene.background = null
    sceneRef.current = scene

    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000)
    camera.position.z = 2

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setSize(dimension, dimension)
    renderer.setPixelRatio(window.devicePixelRatio)
    rendererRef.current = renderer
    containerRef.current.innerHTML = ''
    containerRef.current.appendChild(renderer.domElement)

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9)
    const pointLight1 = new THREE.PointLight(0x6c47ff, 1.5)
    const pointLight2 = new THREE.PointLight(0x00c9ff, 1)
    pointLight1.position.set(10, 10, 10)
    pointLight2.position.set(-10, -10, 10)
    scene.add(ambientLight, pointLight1, pointLight2)

    // Create geometry from callback
    const object = createGeometry(scene)
    objectRef.current = object
    object.targetRotationX = 0
    object.targetRotationY = 0
    object.targetRotationZ = 0

    scene.add(object)

    // Animation loop
    let animationId
    const animate = () => {
      animationId = requestAnimationFrame(animate)

      // Auto-rotate
      object.rotation.x += 0.003
      object.rotation.y += 0.005
      object.rotation.z += 0.001

      // Gentle bobbing
      const bobbing = Math.sin(Date.now() * 0.0008) * 0.1
      object.position.y = bobbing

      // Mouse interaction
      if (interactive) {
        object.rotation.x += (object.targetRotationX - object.rotation.x) * 0.08
        object.rotation.y += (object.targetRotationY - object.rotation.y) * 0.08
        object.rotation.z += (object.targetRotationZ - object.rotation.z) * 0.08
      }

      renderer.render(scene, camera)
    }

    animate()

    // Mouse tracking for 3D interaction
    const handleMouseMove = (e) => {
      if (!interactive || !containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const dx = (e.clientX - rect.left) / rect.width - 0.5
      const dy = -(e.clientY - rect.top) / rect.height + 0.5

      mouseRef.current.x = dx
      mouseRef.current.y = dy

      object.targetRotationX = dy * 0.5
      object.targetRotationY = dx * 0.5
    }

    const handleMouseLeave = () => {
      if (!interactive) return
      mouseRef.current = { x: 0, y: 0 }
      object.targetRotationX = 0
      object.targetRotationY = 0
    }

    containerRef.current.addEventListener('mousemove', handleMouseMove)
    containerRef.current.addEventListener('mouseleave', handleMouseLeave)

    // Cleanup
    return () => {
      cancelAnimationFrame(animationId)
      containerRef.current?.removeEventListener('mousemove', handleMouseMove)
      containerRef.current?.removeEventListener('mouseleave', handleMouseLeave)
      renderer.dispose()
      containerRef.current?.removeChild(renderer.domElement)
    }
  }, [dimension, interactive])

  return (
    <motion.div
      className={`glass-icon-mizan ${className}`}
      style={{
        width: `${dimension}px`,
        height: `${dimension}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        cursor: interactive ? 'pointer' : 'default',
      }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 100, damping: 15 }}
      ref={containerRef}
    />
  )
}
