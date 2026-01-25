/**
 * DNA to Three.js Material Converter
 * L0-CMD-2026-0125-005 Phase 5
 *
 * Converts Construction DNA material properties to Three.js material parameters.
 * Uses chemistry, SRI, color, and surface treatment to create realistic 3D materials.
 */

import * as THREE from 'three';
import { POLRMaterial, TextureHint } from '../adapters/dna-adapter';
import { BaseChemistry, SurfaceTreatment } from '../types/construction-dna';

// =============================================================================
// TYPES
// =============================================================================

export interface ThreeMaterialParams {
  color: THREE.Color;
  roughness: number;
  metalness: number;
  opacity: number;
  transparent: boolean;
  side: THREE.Side;
  emissive?: THREE.Color;
  emissiveIntensity?: number;
}

export interface LayerVisualization {
  /** Material parameters for Three.js */
  material: ThreeMaterialParams;
  /** Thickness in scene units (mm scaled) */
  thickness: number;
  /** Whether to add edge highlighting */
  showEdges: boolean;
  /** Edge color if showing edges */
  edgeColor?: THREE.Color;
}

// =============================================================================
// CHEMISTRY TO VISUAL MAPPING
// =============================================================================

/**
 * Base color palettes by chemistry type.
 * These represent typical appearance of each material chemistry.
 */
const CHEMISTRY_COLORS: Record<BaseChemistry, string> = {
  'TPO': '#F5F5F5',      // White/light gray
  'EPDM': '#2D2D2D',     // Black rubber
  'PVC': '#E8E8E8',      // White/off-white
  'SBS': '#3D3D3D',      // Dark gray/black
  'APP': '#4D4D4D',      // Dark gray
  'polyiso': '#F5E6C8',  // Tan/beige (foam)
  'xps': '#FFB6C1',      // Pink (foam)
  'eps': '#FFFFFF',      // White (foam)
  'silicone': '#C0C0C0', // Silver/gray
  'acrylic': '#FFFAF0',  // Off-white
  'polyurethane': '#D4A574', // Tan/amber
  'asphalt': '#1A1A1A',  // Near black
  'butyl': '#4A4A4A',    // Dark gray
};

/**
 * Roughness values by chemistry (0 = mirror, 1 = completely diffuse).
 */
const CHEMISTRY_ROUGHNESS: Record<BaseChemistry, number> = {
  'TPO': 0.4,       // Smooth thermoplastic
  'EPDM': 0.7,      // Rubber texture
  'PVC': 0.35,      // Smooth plastic
  'SBS': 0.65,      // Modified bitumen
  'APP': 0.6,       // Modified bitumen
  'polyiso': 0.9,   // Foam texture
  'xps': 0.85,      // Foam texture
  'eps': 0.95,      // Foam beads
  'silicone': 0.3,  // Smooth coating
  'acrylic': 0.25,  // Glossy coating
  'polyurethane': 0.5, // Semi-matte
  'asphalt': 0.75,  // Granular surface
  'butyl': 0.6,     // Rubber
};

/**
 * Surface treatment adjustments to roughness.
 */
const SURFACE_ROUGHNESS_MODIFIER: Record<SurfaceTreatment, number> = {
  'smooth': 0,
  'granule': 0.3,
  'foil': -0.2,
  'film': -0.1,
  'fleece': 0.25,
  'coated': -0.15,
};

// =============================================================================
// CONVERSION FUNCTIONS
// =============================================================================

/**
 * Convert a POLR material to Three.js material parameters.
 *
 * @param polrMaterial - The POLR material from the store
 * @returns ThreeMaterialParams for creating a MeshStandardMaterial
 */
export function polrToThreeMaterial(polrMaterial: POLRMaterial): ThreeMaterialParams {
  // Start with the pre-computed POLR values
  let color = new THREE.Color(polrMaterial.color);
  let roughness = polrMaterial.roughness;
  let metalness = polrMaterial.metalness;
  let opacity = polrMaterial.opacity;

  // Adjust based on texture hint
  if (polrMaterial.textureHint === 'metal') {
    metalness = Math.max(metalness, 0.3);
    roughness = Math.min(roughness, 0.4);
  } else if (polrMaterial.textureHint === 'foam') {
    roughness = Math.max(roughness, 0.8);
    metalness = 0;
  }

  return {
    color,
    roughness: clamp(roughness, 0, 1),
    metalness: clamp(metalness, 0, 1),
    opacity: clamp(opacity, 0, 1),
    transparent: opacity < 1,
    side: THREE.DoubleSide,
  };
}

/**
 * Convert DNA chemistry to Three.js material parameters.
 * Use this when you only have chemistry info, not full POLR material.
 *
 * @param chemistry - The base chemistry type
 * @param surfaceTreatment - Optional surface treatment modifier
 * @param customColor - Optional color override
 * @returns ThreeMaterialParams
 */
export function chemistryToThreeMaterial(
  chemistry: BaseChemistry,
  surfaceTreatment?: SurfaceTreatment,
  customColor?: string
): ThreeMaterialParams {
  // Base color from chemistry
  const colorHex = customColor || CHEMISTRY_COLORS[chemistry] || '#808080';
  const color = new THREE.Color(colorHex);

  // Base roughness from chemistry
  let roughness = CHEMISTRY_ROUGHNESS[chemistry] ?? 0.5;

  // Adjust for surface treatment
  if (surfaceTreatment) {
    const modifier = SURFACE_ROUGHNESS_MODIFIER[surfaceTreatment] ?? 0;
    roughness = clamp(roughness + modifier, 0, 1);
  }

  // Most roofing materials are non-metallic
  const metalness = chemistry === 'silicone' ? 0.1 : 0;

  return {
    color,
    roughness,
    metalness,
    opacity: 1,
    transparent: false,
    side: THREE.DoubleSide,
  };
}

/**
 * Create a complete layer visualization from POLR material.
 *
 * @param polrMaterial - The POLR material
 * @param showEdges - Whether to add edge highlighting
 * @returns LayerVisualization with material and geometry hints
 */
export function createLayerVisualization(
  polrMaterial: POLRMaterial,
  showEdges = true
): LayerVisualization {
  const material = polrToThreeMaterial(polrMaterial);

  // Convert thickness to scene units (assuming 1 unit = 1mm)
  const thickness = polrMaterial.thicknessMm;

  // Edge color based on material brightness
  const luminance = material.color.getHSL({ h: 0, s: 0, l: 0 }).l;
  const edgeColor = luminance > 0.5
    ? new THREE.Color('#333333')
    : new THREE.Color('#CCCCCC');

  return {
    material,
    thickness,
    showEdges,
    edgeColor,
  };
}

/**
 * Create a Three.js MeshStandardMaterial from parameters.
 *
 * @param params - Material parameters from conversion
 * @returns Three.js MeshStandardMaterial
 */
export function createThreeMaterial(params: ThreeMaterialParams): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: params.color,
    roughness: params.roughness,
    metalness: params.metalness,
    opacity: params.opacity,
    transparent: params.transparent,
    side: params.side,
    emissive: params.emissive,
    emissiveIntensity: params.emissiveIntensity,
  });
}

/**
 * Create a layer mesh with proper thickness.
 *
 * @param width - Width of the layer
 * @param height - Height/length of the layer
 * @param visualization - Layer visualization params
 * @returns THREE.Group containing the layer mesh and optional edges
 */
export function createLayerMesh(
  width: number,
  height: number,
  visualization: LayerVisualization
): THREE.Group {
  const group = new THREE.Group();

  // Create geometry with proper thickness
  const geometry = new THREE.BoxGeometry(
    width,
    visualization.thickness,
    height
  );

  // Create material
  const material = createThreeMaterial(visualization.material);

  // Create mesh
  const mesh = new THREE.Mesh(geometry, material);
  group.add(mesh);

  // Add edges if requested
  if (visualization.showEdges && visualization.edgeColor) {
    const edges = new THREE.EdgesGeometry(geometry);
    const lineMaterial = new THREE.LineBasicMaterial({
      color: visualization.edgeColor,
    });
    const wireframe = new THREE.LineSegments(edges, lineMaterial);
    group.add(wireframe);
  }

  return group;
}

/**
 * Create an SRI (Solar Reflectance Index) visualization color.
 * Higher SRI = more reflective = whiter color.
 *
 * @param sri - Solar Reflectance Index (0-150+)
 * @returns THREE.Color representing the SRI visually
 */
export function sriToColor(sri: number): THREE.Color {
  // SRI typically ranges from 0 (absorbs all) to 150+ (highly reflective)
  // Map to a white-to-dark gradient
  const normalized = clamp(sri / 120, 0, 1);
  const gray = Math.round(normalized * 255);
  return new THREE.Color(`rgb(${gray}, ${gray}, ${gray})`);
}

/**
 * Create a temperature range visualization.
 * Cold range = blue, hot range = red.
 *
 * @param tempMin - Minimum temperature (°F)
 * @param tempMax - Maximum temperature (°F)
 * @returns Object with cold and hot colors
 */
export function tempRangeToColors(
  tempMin: number,
  tempMax: number
): { coldColor: THREE.Color; hotColor: THREE.Color } {
  // Normalize temps to typical roofing ranges
  const coldNorm = clamp((tempMin + 65) / 130, 0, 1); // -65 to 65
  const hotNorm = clamp((tempMax - 100) / 200, 0, 1); // 100 to 300

  // Blue for cold, red for hot
  const coldColor = new THREE.Color().setHSL(0.6, 1 - coldNorm, 0.5);
  const hotColor = new THREE.Color().setHSL(0, hotNorm, 0.5);

  return { coldColor, hotColor };
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Get a contrasting edge color for a given material color.
 */
export function getContrastingEdgeColor(materialColor: THREE.Color): THREE.Color {
  const luminance = materialColor.getHSL({ h: 0, s: 0, l: 0 }).l;
  return luminance > 0.5
    ? new THREE.Color('#333333')
    : new THREE.Color('#CCCCCC');
}

/**
 * Apply compatibility warning highlighting to a material.
 * Used to show incompatible layer pairs.
 */
export function applyWarningHighlight(
  material: THREE.MeshStandardMaterial,
  severity: 'incompatible' | 'conditional' | 'compatible'
): void {
  switch (severity) {
    case 'incompatible':
      material.emissive = new THREE.Color('#FF0000');
      material.emissiveIntensity = 0.3;
      break;
    case 'conditional':
      material.emissive = new THREE.Color('#FFA500');
      material.emissiveIntensity = 0.2;
      break;
    case 'compatible':
      material.emissive = new THREE.Color('#000000');
      material.emissiveIntensity = 0;
      break;
  }
}

export default {
  polrToThreeMaterial,
  chemistryToThreeMaterial,
  createLayerVisualization,
  createThreeMaterial,
  createLayerMesh,
  sriToColor,
  tempRangeToColors,
  getContrastingEdgeColor,
  applyWarningHighlight,
};
