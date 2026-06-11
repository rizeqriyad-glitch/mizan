import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160/build/three.module.js'
import { Canvas3DIcon } from './Canvas3DIcon'

function createTaskCheckmarkGeometry(scene) {
  const group = new THREE.Group()

  // Glass cube
  const cubeGeom = new THREE.BoxGeometry(0.8, 0.8, 0.8, 16, 16, 16)
  const cubeMat = new THREE.MeshPhysicalMaterial({
    color: 0x6c47ff,
    transmission: 0.9,
    thickness: 0.5,
    roughness: 0.1,
    clearcoat: 1,
    clearcoatRoughness: 0.1,
    ior: 1.5,
  })
  const cube = new THREE.Mesh(cubeGeom, cubeMat)
  group.add(cube)

  // Checkmark (SVG-like path converted to geometry)
  const points = [
    new THREE.Vector3(-0.3, 0, 0),
    new THREE.Vector3(-0.1, -0.2, 0.1),
    new THREE.Vector3(0.3, 0.2, 0.1),
  ]

  const checkGeom = new THREE.BufferGeometry().setFromPoints(points)
  const checkMat = new THREE.LineBasicMaterial({
    color: 0x4ade80,
    linewidth: 3,
  })
  const checkmark = new THREE.Line(checkGeom, checkMat)
  group.add(checkmark)

  // Glow sphere behind
  const glowGeom = new THREE.SphereGeometry(1.2, 32, 32)
  const glowMat = new THREE.MeshBasicMaterial({
    color: 0x6c47ff,
    transparent: true,
    opacity: 0.1,
  })
  const glow = new THREE.Mesh(glowGeom, glowMat)
  group.add(glow)

  return group
}

export function TaskCheckmark3D({ size = 'md' }) {
  return (
    <Canvas3DIcon createGeometry={createTaskCheckmarkGeometry} size={size} />
  )
}
