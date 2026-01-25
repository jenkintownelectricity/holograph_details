/**
 * Realistic Geometry Enhancements
 * POLR Strategic Development - Phase A3
 * 
 * @module geometry/realistic-details
 * @version 1.0.0
 */

import * as THREE from 'three';

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export type FastenerType = 'screw-hex' | 'screw-pan' | 'screw-flat' | 'nail-round' | 'rivet-dome' | 'expansion-anchor';
export type SealantProfile = 'concave' | 'flat' | 'convex' | 'v-groove';

export interface LapConfig {
  width: number;
  thickness: number;
  position: 'leading' | 'trailing';
  rolloverRadius?: number;
}

export interface FastenerPatternConfig {
  spacing: number;
  edgeDistance: number;
  type: FastenerType;
  headDiameter: number;
  headHeight: number;
  material?: THREE.Material;
}

export interface SealantBeadConfig {
  jointWidth: number;
  jointDepth: number;
  profile: SealantProfile;
  color: string;
  hasSkin?: boolean;
}

// =============================================================================
// FASTENER GEOMETRY
// =============================================================================

export function createFastener(type: FastenerType, config?: Partial<FastenerPatternConfig>): THREE.Mesh {
  const cfg = {
    headDiameter: config?.headDiameter || 8,
    headHeight: config?.headHeight || 3,
    material: config?.material || new THREE.MeshStandardMaterial({
      color: 0x888888,
      roughness: 0.4,
      metalness: 0.85
    })
  };

  let geometry: THREE.BufferGeometry;
  
  switch (type) {
    case 'screw-hex':
      geometry = new THREE.CylinderGeometry(cfg.headDiameter / 2, cfg.headDiameter / 2, cfg.headHeight, 6);
      break;
    case 'screw-pan':
      const points: THREE.Vector2[] = [];
      const r = cfg.headDiameter / 2;
      points.push(new THREE.Vector2(0, 0));
      points.push(new THREE.Vector2(r, 0));
      for (let i = 0; i <= 8; i++) {
        const t = i / 8;
        const angle = t * Math.PI / 2;
        points.push(new THREE.Vector2(r * Math.cos(angle), cfg.headHeight * 0.3 + cfg.headHeight * 0.7 * Math.sin(angle)));
      }
      geometry = new THREE.LatheGeometry(points, 16);
      break;
    case 'rivet-dome':
      geometry = new THREE.SphereGeometry(cfg.headDiameter / 2, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2);
      break;
    default:
      geometry = new THREE.CylinderGeometry(cfg.headDiameter / 2, cfg.headDiameter / 2, cfg.headHeight, 16);
  }

  geometry.rotateX(Math.PI / 2);
  const mesh = new THREE.Mesh(geometry, cfg.material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

export function addFastenerPattern(targetGroup: THREE.Group, length: number, config: FastenerPatternConfig): THREE.Group {
  const fastenersGroup = new THREE.Group();
  fastenersGroup.name = 'fasteners';
  
  const numFasteners = Math.floor((length - 2 * config.edgeDistance) / config.spacing) + 1;
  
  for (let i = 0; i < numFasteners; i++) {
    const fastener = createFastener(config.type, config);
    fastener.position.x = config.edgeDistance + (i * config.spacing);
    fastener.position.y = config.headHeight / 2;
    fastenersGroup.add(fastener);
  }
  
  targetGroup.add(fastenersGroup);
  return fastenersGroup;
}

// =============================================================================
// MEMBRANE LAP GEOMETRY
// =============================================================================

export function createMembraneLap(baseWidth: number, baseLength: number, config: LapConfig): THREE.Mesh {
  const shape = new THREE.Shape();
  const rollover = config.rolloverRadius || config.thickness * 0.5;
  
  shape.moveTo(0, 0);
  shape.lineTo(config.width, 0);
  shape.lineTo(config.width, config.thickness);
  shape.quadraticCurveTo(
    config.width + rollover * 0.5,
    config.thickness + rollover * 0.3,
    config.width - rollover,
    config.thickness + rollover * 0.1
  );
  shape.lineTo(0, config.thickness + rollover * 0.1);
  shape.closePath();
  
  const geometry = new THREE.ExtrudeGeometry(shape, { depth: baseLength, bevelEnabled: false });
  const material = new THREE.MeshStandardMaterial({
    color: 0x1a1a1a,
    roughness: 0.7,
    metalness: 0.0,
    side: THREE.DoubleSide
  });
  
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = 'membrane-lap';
  mesh.castShadow = true;
  return mesh;
}

// =============================================================================
// SEALANT GEOMETRY
// =============================================================================

export function createSealantBead(length: number, config: SealantBeadConfig): THREE.Mesh {
  const shape = new THREE.Shape();
  const hw = config.jointWidth / 2;
  const depth = config.jointDepth * 0.6;
  
  switch (config.profile) {
    case 'concave':
      shape.moveTo(-hw, 0);
      shape.quadraticCurveTo(-hw * 0.5, -depth * 0.3, 0, -depth * 0.5);
      shape.quadraticCurveTo(hw * 0.5, -depth * 0.3, hw, 0);
      shape.lineTo(hw, depth * 0.4);
      shape.lineTo(-hw, depth * 0.4);
      shape.closePath();
      break;
    case 'convex':
      shape.moveTo(-hw, depth * 0.2);
      shape.quadraticCurveTo(-hw, -depth * 0.3, 0, -depth * 0.4);
      shape.quadraticCurveTo(hw, -depth * 0.3, hw, depth * 0.2);
      shape.lineTo(hw, depth * 0.4);
      shape.lineTo(-hw, depth * 0.4);
      shape.closePath();
      break;
    default:
      shape.moveTo(-hw, 0);
      shape.lineTo(hw, 0);
      shape.lineTo(hw, depth * 0.4);
      shape.lineTo(-hw, depth * 0.4);
      shape.closePath();
  }
  
  const geometry = new THREE.ExtrudeGeometry(shape, { depth: length, bevelEnabled: false });
  const material = new THREE.MeshStandardMaterial({
    color: new THREE.Color(config.color),
    roughness: config.hasSkin ? 0.4 : 0.6,
    metalness: 0.0
  });
  
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = 'sealant-bead';
  mesh.castShadow = true;
  return mesh;
}

// =============================================================================
// TERMINATION BAR
// =============================================================================

export function createTerminationBar(length: number, config?: { width?: number; thickness?: number; fastenerSpacing?: number }): THREE.Group {
  const cfg = { width: 25, thickness: 3, fastenerSpacing: 150, ...config };
  const group = new THREE.Group();
  group.name = 'termination-bar';
  
  const barGeometry = new THREE.BoxGeometry(length, cfg.thickness, cfg.width);
  const barMaterial = new THREE.MeshStandardMaterial({
    color: 0xd0d0d0,
    roughness: 0.35,
    metalness: 0.88
  });
  
  const bar = new THREE.Mesh(barGeometry, barMaterial);
  bar.position.y = cfg.thickness / 2;
  bar.castShadow = true;
  group.add(bar);
  
  addFastenerPattern(group, length, {
    spacing: cfg.fastenerSpacing,
    edgeDistance: cfg.fastenerSpacing / 2,
    type: 'screw-pan',
    headDiameter: 8,
    headHeight: 3
  });
  
  const fasteners = group.getObjectByName('fasteners');
  if (fasteners) fasteners.position.y = cfg.thickness;
  
  return group;
}

// =============================================================================
// SURFACE IMPERFECTIONS
// =============================================================================

export function addSurfaceImperfections(mesh: THREE.Mesh, config: { type: string; intensity: number; seed?: number }): void {
  const geometry = mesh.geometry;
  if (!geometry.attributes.position) return;
  
  const positions = geometry.attributes.position;
  const normals = geometry.attributes.normal;
  const random = seededRandom(config.seed || 12345);
  
  for (let i = 0; i < positions.count; i++) {
    let displacement = 0;
    const x = positions.getX(i);
    const z = positions.getZ(i);
    
    switch (config.type) {
      case 'wrinkle':
        displacement = Math.sin(x * 0.1) * Math.cos(z * 0.15) * config.intensity * 2;
        break;
      case 'bubble':
        if (random() < 0.02) displacement = config.intensity * 3 * random();
        break;
    }
    
    if (normals && displacement !== 0) {
      const nx = normals.getX(i);
      const ny = normals.getY(i);
      const nz = normals.getZ(i);
      positions.setXYZ(i, x + nx * displacement, positions.getY(i) + ny * displacement, z + nz * displacement);
    }
  }
  
  positions.needsUpdate = true;
  geometry.computeVertexNormals();
}

function seededRandom(seed: number): () => number {
  return () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
}

// =============================================================================
// COMPLETE ASSEMBLIES
// =============================================================================

export function createRealisticBaseFlashing(length: number, height: number): THREE.Group {
  const group = new THREE.Group();
  group.name = 'realistic-base-flashing';
  
  const membraneMaterial = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.7, metalness: 0 });
  const membraneGeometry = new THREE.BoxGeometry(length, 1.5, height);
  const membrane = new THREE.Mesh(membraneGeometry, membraneMaterial);
  membrane.position.y = 0.75;
  membrane.castShadow = true;
  group.add(membrane);
  
  const lap = createMembraneLap(length, height * 0.3, { width: 75, thickness: 1.5, position: 'trailing' });
  lap.position.y = 1.5;
  lap.position.z = height - 75;
  lap.rotation.x = -Math.PI / 2;
  group.add(lap);
  
  const termBar = createTerminationBar(length, { fastenerSpacing: 150 });
  termBar.position.y = 1.5;
  termBar.position.z = height - 15;
  termBar.rotation.y = Math.PI / 2;
  group.add(termBar);
  
  const sealant = createSealantBead(length, { jointWidth: 10, jointDepth: 10, profile: 'concave', color: '#4a4a4a', hasSkin: true });
  sealant.position.y = 26.5;
  sealant.position.z = height - 12;
  sealant.rotation.y = Math.PI / 2;
  group.add(sealant);
  
  addSurfaceImperfections(membrane, { type: 'wrinkle', intensity: 0.3, seed: 42 });
  
  return group;
}

export function createStressPlate(diameter: number = 75): THREE.Group {
  const group = new THREE.Group();
  group.name = 'stress-plate';
  
  const material = new THREE.MeshStandardMaterial({ color: 0xc0c0c0, roughness: 0.4, metalness: 0.85 });
  const plateGeometry = new THREE.CylinderGeometry(diameter / 2, diameter / 2, 1, 24);
  const plate = new THREE.Mesh(plateGeometry, material);
  plate.position.y = 0.5;
  plate.castShadow = true;
  group.add(plate);
  
  const fastener = createFastener('screw-pan', { headDiameter: 10, headHeight: 4 });
  fastener.position.y = 1;
  group.add(fastener);
  
  return group;
}

export const RealisticDetails = {
  createFastener,
  addFastenerPattern,
  createMembraneLap,
  createSealantBead,
  createTerminationBar,
  addSurfaceImperfections,
  createRealisticBaseFlashing,
  createStressPlate
};
