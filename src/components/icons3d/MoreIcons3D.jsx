import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160/build/three.module.js'
import { Canvas3DIcon } from './Canvas3DIcon'

// BookRead 3D
function createBookReadGeometry(scene) {
  const group = new THREE.Group()

  // Left page
  const pageGeom = new THREE.PlaneGeometry(0.4, 0.7)
  const pageMat = new THREE.MeshPhysicalMaterial({
    color: 0xf0f0f0,
    side: THREE.DoubleSide,
    transmission: 0.4,
  })
  const leftPage = new THREE.Mesh(pageGeom, pageMat)
  leftPage.position.set(-0.2, 0, 0)
  leftPage.rotation.y = 0.3
  group.add(leftPage)

  // Right page
  const rightPage = new THREE.Mesh(pageGeom, pageMat)
  rightPage.position.set(0.2, 0, 0)
  rightPage.rotation.y = -0.3
  group.add(rightPage)

  // Book spine
  const spineGeom = new THREE.BoxGeometry(0.08, 0.7, 0.1)
  const spineMat = new THREE.MeshPhysicalMaterial({
    color: 0x6c47ff,
    metalness: 0.4,
    roughness: 0.3,
  })
  const spine = new THREE.Mesh(spineGeom, spineMat)
  group.add(spine)

  // Text lines on pages (simplified)
  for (let i = 0; i < 5; i++) {
    const lineGeom = new THREE.PlaneGeometry(0.25, 0.03)
    const lineMat = new THREE.MeshBasicMaterial({
      color: 0xcccccc,
      side: THREE.DoubleSide,
    })
    const line = new THREE.Mesh(lineGeom, lineMat)
    line.position.set(-0.15, 0.2 - i * 0.1, 0.01)
    group.add(line)

    const line2 = new THREE.Mesh(lineGeom, lineMat)
    line2.position.set(0.15, 0.2 - i * 0.1, 0.01)
    group.add(line2)
  }

  return group
}

// Analytics 3D
function createAnalyticsGeometry(scene) {
  const group = new THREE.Group()

  // Create 3D bar chart
  const barGeom = new THREE.BoxGeometry(0.15, 1, 0.15)
  const colors = [0x6c47ff, 0x00c9ff, 0x4ade80]
  const heights = [0.5, 0.8, 0.6]

  for (let i = 0; i < 3; i++) {
    const barGeom2 = new THREE.BoxGeometry(0.12, heights[i], 0.12)
    const barMat = new THREE.MeshPhysicalMaterial({
      color: colors[i],
      metalness: 0.5,
      roughness: 0.3,
      transmission: 0.3,
    })
    const bar = new THREE.Mesh(barGeom2, barMat)
    bar.position.set((i - 1) * 0.25, (heights[i] - 0.5) / 2, 0)
    group.add(bar)
  }

  // Base line
  const baseGeom = new THREE.BoxGeometry(0.8, 0.05, 0.05)
  const baseMat = new THREE.MeshPhysicalMaterial({
    color: 0xc0c0c0,
    metalness: 0.6,
  })
  const base = new THREE.Mesh(baseGeom, baseMat)
  base.position.y = -0.5
  group.add(base)

  return group
}

// Focus Timer 3D
function createFocusTimerGeometry(scene) {
  const group = new THREE.Group()

  // Outer torus (timer ring)
  const torusGeom = new THREE.TorusGeometry(0.5, 0.08, 16, 32)
  const torusMat = new THREE.MeshPhysicalMaterial({
    color: 0x6c47ff,
    metalness: 0.7,
    roughness: 0.2,
    transmission: 0.6,
  })
  const torus = new THREE.Mesh(torusGeom, torusMat)
  group.add(torus)

  // Progress ring (partial)
  const progressGeom = new THREE.TorusGeometry(0.5, 0.04, 16, 128, 0, Math.PI * 1.5)
  const progressMat = new THREE.MeshPhysicalMaterial({
    color: 0x00c9ff,
    metalness: 0.8,
    roughness: 0.1,
    transmission: 0.8,
  })
  const progress = new THREE.Mesh(progressGeom, progressMat)
  progress.position.z = 0.05
  group.add(progress)

  // Center circle
  const centerGeom = new THREE.SphereGeometry(0.2, 32, 32)
  const centerMat = new THREE.MeshPhysicalMaterial({
    color: 0x6c47ff,
    transmission: 0.4,
    roughness: 0.15,
  })
  const center = new THREE.Mesh(centerGeom, centerMat)
  group.add(center)

  return group
}

export function BookRead3D({ size = 'md' }) {
  return (
    <Canvas3DIcon createGeometry={createBookReadGeometry} size={size} />
  )
}

export function Analytics3D({ size = 'md' }) {
  return (
    <Canvas3DIcon createGeometry={createAnalyticsGeometry} size={size} />
  )
}

export function FocusTimer3D({ size = 'md' }) {
  return (
    <Canvas3DIcon createGeometry={createFocusTimerGeometry} size={size} />
  )
}
