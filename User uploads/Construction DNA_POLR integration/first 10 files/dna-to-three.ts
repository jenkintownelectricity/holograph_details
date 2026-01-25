/**
 * DNA to Three.js Bridge
 * 
 * Converts MaterialDNA properties into Three.js materials
 */

import * as THREE from 'three';
import type { MaterialDNA, POLRMaterial } from '../types';
import { dnaMaterialToPOLR } from '../adapters/dna-adapter';

// ============================================================================
// SURFACE TREATMENT TO THREE.JS MAPPINGS
// ============================================================================

interface ThreeMaterialParams {
  roughness: number;
  metalness: number;
  opacity: number;
  transparent: boolean;
  side: THREE.Side;
}

const SURFACE_TREATMENT_PARAMS: Record<string, Partial<ThreeMaterialParams>> = {
  'smooth': { roughness: 0.2, metalness: 0.0 },
  'granule': { roughness: 0.9, metalness: 0.0 },
  'fleece': { roughness: 0.7, metalness: 0.0 },
  'foil': { roughness: 0.1, metalness: 0.7 },
  'coated': { roughness: 0.3, metalness: 0.1 },
  'reflective': { roughness: 0.1, metalness: 0.4 },
  'textured': { roughness: 0.6, metalness: 0.0 },
  'none': { roughness: 0.5, metalness: 0.0 }
};

const CHEMISTRY_PARAMS: Record<string, Partial<ThreeMaterialParams>> = {
  'TPO': { opacity: 1.0, transparent: false },
  'EPDM': { opacity: 1.0, transparent: false },
  'PVC': { opacity: 0.95, transparent: true },
  'SBS': { opacity: 1.0, transparent: false },
  'APP': { opacity: 1.0, transparent: false },
  'BUR': { opacity: 1.0, transparent: false },
  'SPF': { opacity: 0.98, transparent: true },
  'polyiso': { opacity: 1.0, transparent: false },
  'XPS': { opacity: 0.95, transparent: true },
  'EPS': { opacity: 0.9, transparent: true },
  'mineral_wool': { opacity: 0.85, transparent: true },
  'fiberglass': { opacity: 0.8, transparent: true },
  'gypsum': { opacity: 1.0, transparent: false },
  'silicone': { opacity: 0.7, transparent: true },
  'urethane': { opacity: 0.9, transparent: true },
  'acrylic': { opacity: 0.85, transparent: true },
  'butyl': { opacity: 1.0, transparent: false },
  'asphalt': { opacity: 1.0, transparent: false },
  'metal': { roughness: 0.3, metalness: 0.9, opacity: 1.0, transparent: false }
};

// ============================================================================
// MATERIAL CREATION FUNCTIONS
// ============================================================================

/**
 * Create a Three.js MeshStandardMaterial from MaterialDNA
 */
export function createThreeMaterialFromDNA(dna: MaterialDNA): THREE.MeshStandardMaterial {
  // Get base parameters from surface treatment
  const surfaceParams = SURFACE_TREATMENT_PARAMS[dna.surfaceTreatment] || SURFACE_TREATMENT_PARAMS['none'];
  
  // Get chemistry-specific parameters
  const chemParams = CHEMISTRY_PARAMS[dna.baseChemistry] || {};
  
  // Parse color
  const color = new THREE.Color(dna.color);
  
  // Merge parameters (surface treatment, then chemistry overrides)
  const params: ThreeMaterialParams = {
    roughness: 0.5,
    metalness: 0.0,
    opacity: 1.0,
    transparent: false,
    side: THREE.FrontSide,
    ...surfaceParams,
    ...chemParams
  };
  
  return new THREE.MeshStandardMaterial({
    color,
    roughness: params.roughness,
    metalness: params.metalness,
    opacity: params.opacity,
    transparent: params.transparent || params.opacity < 1.0,
    side: params.side,
    name: dna.id
  });
}

/**
 * Create a Three.js material from POLR Material
 */
export function createThreeMaterialFromPOLR(polr: POLRMaterial): THREE.MeshStandardMaterial {
  const color = new THREE.Color(polr.color);
  
  return new THREE.MeshStandardMaterial({
    color,
    roughness: polr.roughness,
    metalness: polr.metalness,
    opacity: polr.opacity,
    transparent: polr.opacity < 1.0,
    side: THREE.FrontSide,
    name: polr.id
  });
}

/**
 * Create material with emissive highlight (for selection/hover)
 */
export function createHighlightedMaterial(
  dna: MaterialDNA,
  highlightColor: string = '#44aaff',
  intensity: number = 0.3
): THREE.MeshStandardMaterial {
  const baseMaterial = createThreeMaterialFromDNA(dna);
  baseMaterial.emissive = new THREE.Color(highlightColor);
  baseMaterial.emissiveIntensity = intensity;
  return baseMaterial;
}

/**
 * Create wireframe material for compatibility warning visualization
 */
export function createWarningMaterial(severity: 'critical' | 'warning' | 'info'): THREE.LineBasicMaterial {
  const colors = {
    critical: '#ff0000',
    warning: '#ff8800',
    info: '#0088ff'
  };
  
  return new THREE.LineBasicMaterial({
    color: new THREE.Color(colors[severity]),
    linewidth: 2
  });
}

// ============================================================================
// GEOMETRY CREATION
// ============================================================================

/**
 * Create a layer mesh (rectangular solid) from DNA material
 */
export function createLayerMeshFromDNA(
  dna: MaterialDNA,
  width: number = 10,
  depth: number = 10,
  yOffset: number = 0
): THREE.Mesh {
  // Convert thickness from mils to scene units (1" = 1 unit, so 60 mils = 0.06 units)
  const height = dna.thicknessMil / 1000;
  
  const geometry = new THREE.BoxGeometry(width, height, depth);
  const material = createThreeMaterialFromDNA(dna);
  
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.y = yOffset + height / 2;
  mesh.name = `layer-${dna.id}`;
  mesh.userData = { dnaId: dna.id, dna };
  
  return mesh;
}

/**
 * Create a complete layer stack from multiple DNA materials
 */
export function createLayerStackFromDNA(
  materials: MaterialDNA[],
  width: number = 10,
  depth: number = 10
): THREE.Group {
  const group = new THREE.Group();
  group.name = 'layer-stack';
  
  let currentY = 0;
  
  for (const dna of materials) {
    const mesh = createLayerMeshFromDNA(dna, width, depth, currentY);
    group.add(mesh);
    
    // Move up for next layer
    currentY += dna.thicknessMil / 1000;
  }
  
  // Store total height
  group.userData = { 
    totalHeight: currentY,
    layerCount: materials.length 
  };
  
  return group;
}

/**
 * Create a section cut visualization
 */
export function createSectionCut(
  materials: MaterialDNA[],
  angle: number = 45
): THREE.Group {
  const group = new THREE.Group();
  group.name = 'section-cut';
  
  let currentY = 0;
  const sliceWidth = 0.5;
  
  for (const dna of materials) {
    const height = dna.thicknessMil / 1000;
    
    // Create angled slice geometry
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(sliceWidth, 0);
    shape.lineTo(sliceWidth + height * Math.tan(angle * Math.PI / 180), height);
    shape.lineTo(height * Math.tan(angle * Math.PI / 180), height);
    shape.closePath();
    
    const extrudeSettings = { depth: 2, bevelEnabled: false };
    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    const material = createThreeMaterialFromDNA(dna);
    
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.y = currentY;
    mesh.userData = { dnaId: dna.id, dna };
    
    group.add(mesh);
    currentY += height;
  }
  
  return group;
}

// ============================================================================
// COMPATIBILITY VISUALIZATION
// ============================================================================

/**
 * Create visual indicator for incompatible interface
 */
export function createIncompatibilityIndicator(
  position: THREE.Vector3,
  severity: 'critical' | 'warning' | 'info' = 'warning'
): THREE.Group {
  const group = new THREE.Group();
  group.name = 'incompatibility-indicator';
  
  // Warning plane
  const colors = {
    critical: 0xff0000,
    warning: 0xff8800,
    info: 0x0088ff
  };
  
  const planeGeometry = new THREE.PlaneGeometry(8, 0.05);
  const planeMaterial = new THREE.MeshBasicMaterial({
    color: colors[severity],
    transparent: true,
    opacity: 0.7,
    side: THREE.DoubleSide
  });
  
  const plane = new THREE.Mesh(planeGeometry, planeMaterial);
  plane.position.copy(position);
  plane.rotation.x = Math.PI / 2;
  
  group.add(plane);
  
  // Pulsing animation data
  group.userData = {
    severity,
    animationData: { phase: 0, speed: severity === 'critical' ? 4 : 2 }
  };
  
  return group;
}

// ============================================================================
// MATERIAL CACHE
// ============================================================================

const materialCache = new Map<string, THREE.MeshStandardMaterial>();

/**
 * Get or create a cached Three.js material
 */
export function getCachedThreeMaterial(dna: MaterialDNA): THREE.MeshStandardMaterial {
  if (materialCache.has(dna.id)) {
    return materialCache.get(dna.id)!;
  }
  
  const material = createThreeMaterialFromDNA(dna);
  materialCache.set(dna.id, material);
  return material;
}

/**
 * Clear the material cache
 */
export function clearMaterialCache(): void {
  materialCache.forEach(material => material.dispose());
  materialCache.clear();
}

/**
 * Dispose of all materials in a group
 */
export function disposeGroupMaterials(group: THREE.Group): void {
  group.traverse(child => {
    if (child instanceof THREE.Mesh) {
      if (Array.isArray(child.material)) {
        child.material.forEach(m => m.dispose());
      } else {
        child.material.dispose();
      }
      child.geometry.dispose();
    }
  });
}
