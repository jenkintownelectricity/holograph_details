/**
 * DNA Materials Data
 * L0-CMD-2026-0125-004 Phase C2
 *
 * Pre-loaded Construction DNA material definitions for POLR products.
 * Maps product equivalency keys to DNA profiles.
 */

import {
  MaterialDNA,
  BaseChemistry,
  Reinforcement,
  SurfaceTreatment,
  FailureMode,
  COMMON_FAILURE_MODES
} from '../types/construction-dna';

/**
 * Map from product equivalency material types to their base chemistry.
 * This enables compatibility checking using the DNA system.
 */
export const MATERIAL_TYPE_TO_CHEMISTRY: Record<string, BaseChemistry> = {
  // Membranes
  'membrane-tpo': 'TPO',
  'membrane-epdm': 'EPDM',
  'membrane-pvc': 'PVC',
  'membrane-mod-bit': 'SBS',
  'membrane-self-adhered-waterproofing': 'SBS',
  'membrane-air-barrier': 'SBS',
  'membrane-fleece': 'TPO',

  // Insulation
  'insulation-polyiso': 'polyiso',
  'insulation-xps': 'xps',
  'insulation-eps': 'eps',

  // Coatings
  'coating-silicone': 'silicone',
  'coating-acrylic': 'acrylic',
  'coating-liquid': 'polyurethane',

  // Barriers
  'vapor-barrier': 'polyurethane',
  'air-barrier': 'SBS',

  // Accessories
  'sealant': 'polyurethane',
  'adhesive': 'asphalt',
  'primer': 'asphalt',
};

/**
 * Full DNA profiles for common roofing and waterproofing materials.
 */
export const DNA_MATERIAL_PROFILES: Record<string, MaterialDNA> = {
  // ==============================
  // TPO MEMBRANES
  // ==============================
  'membrane-tpo': {
    division: '07 54 00',
    category: 'Thermoplastic Polyolefin (TPO) Roofing',
    assemblyType: 'roofing',
    baseChemistry: 'TPO',
    reinforcement: 'polyester',
    surfaceTreatment: 'smooth',
    thicknessMil: 60,
    color: 'white',
    sri: 108,
    fireRating: 'A',
    tensileStrength: 1200,
    elongation: 450,
    tempRangeMin: -40,
    tempRangeMax: 180,
    failureModes: [
      COMMON_FAILURE_MODES['seam-failure'],
      COMMON_FAILURE_MODES['puncture'],
      COMMON_FAILURE_MODES['thermal-shock']
    ],
    compatibilityNotes: [
      'Incompatible with asphalt-based products',
      'Compatible with polyiso insulation',
      'Requires separation from EPDM'
    ],
    applicationConstraints: [
      'Hot-air weld seams only',
      'Minimum 25°F application temp',
      'Store rolls on end'
    ]
  },

  // ==============================
  // EPDM MEMBRANES
  // ==============================
  'membrane-epdm': {
    division: '07 53 00',
    category: 'EPDM Roofing',
    assemblyType: 'roofing',
    baseChemistry: 'EPDM',
    reinforcement: 'none',
    surfaceTreatment: 'smooth',
    thicknessMil: 60,
    color: 'black',
    sri: 6,
    fireRating: 'A',
    tensileStrength: 1300,
    elongation: 300,
    tempRangeMin: -65,
    tempRangeMax: 250,
    failureModes: [
      COMMON_FAILURE_MODES['uv-degradation'],
      COMMON_FAILURE_MODES['seam-failure'],
      COMMON_FAILURE_MODES['puncture']
    ],
    compatibilityNotes: [
      'INCOMPATIBLE with asphalt and bitumen products',
      'INCOMPATIBLE with PVC - plasticizer migration',
      'Compatible with silicone and butyl',
      'Compatible with polyiso insulation'
    ],
    applicationConstraints: [
      'Adhesive or tape seams',
      'Requires primer on most substrates',
      'Not recommended for recover over asphalt'
    ]
  },

  // ==============================
  // PVC MEMBRANES
  // ==============================
  'membrane-pvc': {
    division: '07 54 00',
    category: 'PVC Roofing',
    assemblyType: 'roofing',
    baseChemistry: 'PVC',
    reinforcement: 'polyester',
    surfaceTreatment: 'smooth',
    thicknessMil: 60,
    color: 'white',
    sri: 107,
    fireRating: 'A',
    tensileStrength: 2000,
    elongation: 200,
    tempRangeMin: -20,
    tempRangeMax: 160,
    failureModes: [
      COMMON_FAILURE_MODES['plasticizer-migration'],
      COMMON_FAILURE_MODES['uv-degradation'],
      COMMON_FAILURE_MODES['puncture']
    ],
    compatibilityNotes: [
      'INCOMPATIBLE with asphalt - causes degradation',
      'INCOMPATIBLE with EPS and XPS - plasticizer destroys foam',
      'INCOMPATIBLE with EPDM',
      'Use polyiso insulation ONLY',
      'Requires barrier from bituminous materials'
    ],
    applicationConstraints: [
      'Hot-air weld seams only',
      'Must use PVC-compatible accessories',
      'No contact with tar or asphalt'
    ]
  },

  // ==============================
  // MODIFIED BITUMEN (SBS)
  // ==============================
  'membrane-mod-bit': {
    division: '07 52 00',
    category: 'Modified Bituminous Membrane Roofing',
    assemblyType: 'roofing',
    baseChemistry: 'SBS',
    reinforcement: 'polyester',
    surfaceTreatment: 'granule',
    thicknessMil: 160,
    color: 'varies',
    fireRating: 'A',
    tensileStrength: 400,
    elongation: 40,
    tempRangeMin: -20,
    tempRangeMax: 280,
    failureModes: [
      COMMON_FAILURE_MODES['ponding-water'],
      COMMON_FAILURE_MODES['seam-failure'],
      COMMON_FAILURE_MODES['thermal-shock']
    ],
    compatibilityNotes: [
      'INCOMPATIBLE with EPDM, TPO, PVC',
      'Compatible with asphalt products',
      'Compatible with polyiso and silicone coatings'
    ],
    applicationConstraints: [
      'Torch or cold-applied',
      'Minimum 2-ply system',
      'Requires proper slope for drainage'
    ]
  },

  // ==============================
  // SELF-ADHERED WATERPROOFING
  // ==============================
  'membrane-self-adhered-waterproofing': {
    division: '07 13 00',
    category: 'Sheet Waterproofing',
    assemblyType: 'waterproofing',
    baseChemistry: 'SBS',
    reinforcement: 'polyester',
    surfaceTreatment: 'film',
    thicknessMil: 60,
    color: 'black',
    permRating: 0.05,
    tempRangeMin: 25,
    tempRangeMax: 140,
    failureModes: [
      COMMON_FAILURE_MODES['puncture']
    ],
    compatibilityNotes: [
      'Requires protection board in backfill applications',
      'Prime concrete surfaces before application'
    ],
    applicationConstraints: [
      'Self-adhered - no torch',
      'Minimum 40°F application temp',
      'Apply to dry surfaces only'
    ]
  },

  // ==============================
  // POLYISO INSULATION
  // ==============================
  'insulation-polyiso': {
    division: '07 22 00',
    category: 'Roof Insulation',
    assemblyType: 'roofing',
    baseChemistry: 'polyiso',
    surfaceTreatment: 'foil',
    tempRangeMin: -100,
    tempRangeMax: 250,
    failureModes: [],
    compatibilityNotes: [
      'Compatible with all membrane types',
      'Recommended for PVC applications',
      'Best R-value per inch'
    ],
    applicationConstraints: [
      'Store flat and dry',
      'Stagger joints in multiple layers'
    ]
  },

  // ==============================
  // XPS INSULATION
  // ==============================
  'insulation-xps': {
    division: '07 22 00',
    category: 'Roof Insulation',
    assemblyType: 'roofing',
    baseChemistry: 'xps',
    surfaceTreatment: 'smooth',
    tempRangeMin: -100,
    tempRangeMax: 165,
    failureModes: [],
    compatibilityNotes: [
      'INCOMPATIBLE with PVC - plasticizer destroys XPS',
      'Compatible with EPDM, TPO, SBS',
      'Good for below-grade and plaza decks'
    ],
    applicationConstraints: [
      'Do not use with PVC roofing',
      'Protect from prolonged UV exposure'
    ]
  }
};

/**
 * Get DNA profile for a material type.
 *
 * @param materialType - The product equivalency material type key
 * @returns MaterialDNA profile or undefined
 */
export function getDNAProfile(materialType: string): MaterialDNA | undefined {
  return DNA_MATERIAL_PROFILES[materialType];
}

/**
 * Get base chemistry for a material type.
 *
 * @param materialType - The product equivalency material type key
 * @returns BaseChemistry or undefined
 */
export function getBaseChemistry(materialType: string): BaseChemistry | undefined {
  return MATERIAL_TYPE_TO_CHEMISTRY[materialType];
}

/**
 * Check if a material type has DNA data available.
 *
 * @param materialType - The product equivalency material type key
 * @returns True if DNA data is available
 */
export function hasDNAData(materialType: string): boolean {
  return materialType in MATERIAL_TYPE_TO_CHEMISTRY || materialType in DNA_MATERIAL_PROFILES;
}

export default {
  MATERIAL_TYPE_TO_CHEMISTRY,
  DNA_MATERIAL_PROFILES,
  getDNAProfile,
  getBaseChemistry,
  hasDNAData
};
