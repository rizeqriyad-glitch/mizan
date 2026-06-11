import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160/build/three.module.js'
import { Canvas3DIcon } from './Canvas3DIcon'

function createPrayerBeadsGeometry(scene) {
  const group = new THREE.Group()

  // Create 33 prayer beads in a circle (tasbih)
  const beadRadius = 0.08
  const circleRadius = 0.6

  const beadGeom = new THREE.SphereGeometry(beadRadius, 16, 16)
  const beadMatPurple = new THREE.MeshPhysicalMaterial({
    color: 0x6c47ff,
    metalness: 0.6,
    roughness: 0.3,
    transmission: 0.5,
  })
  const beadMatCyan = new THREE.MeshPhysicalMaterial({
    color: 0x00c9ff,
    metalness: 0.6,
    roughness: 0.3,
    transmission: 0.5,
  })

  for (let i = 0; i < 33; i++) {
    const angle = (i / 33) * Math.PI * 2
    const x = Math.cos(angle) * circleRadius
    const y = Math.sin(angle) * circleRadius

    const bead = new THREE.Mesh(
      beadGeom,
      i % 2 === 0 ? beadMatPurple : beadMatCyan
    )
    bead.position.set(x, y, 0)
    group.add(bead)
  }

  // Connection lines (tasbih string)
  const lineGeom = new THREE.BufferGeometry()
  const linePoints = []
  for (let i = 0; i <= 33; i++) {
    const angle = (i / 33) * Math.PI * 2
    linePoints.push(
      new THREE.Vector3(
        Math.cos(angle) * circleRadius,
        Math.sin(angle) * circleRadius,
        0.1
      )
    )
  }
  const lineGeom2 = new THREE.BufferGeometry().setFromPoints(linePoints)
  const lineMat = new THREE.LineBasicMaterial({ color: 0xc0c0c0, linewidth: 1 })
  const line = new THREE.Line(lineGeom2, lineMat)
  group.add(line)

  // Center sphere
  const centerGeom = new THREE.SphereGeometry(0.15, 16, 16)
  const centerMat = new THREE.MeshPhysicalMaterial({
    color: 0x6c47ff,
    metalness: 0.8,
    roughness: 0.2,
    transmission: 0.7,
  })
  const center = new THREE.Mesh(centerGeom, centerMat)
  group.add(center)

  return group
}

export function PrayerBeads3D({ size = 'md' }) {
  return (
    <Canvas3DIcon createGeometry={createPrayerBeadsGeometry} size={size} />
  )
}
