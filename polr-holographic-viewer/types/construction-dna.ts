/**
 * Construction DNA Types
 * L0-CMD-2026-0125-004 Phase C1
 *
 * Adapted from @construction-dna/kernel for POLR material taxonomy
 * and compatibility checking.
 */

// =============================================================================
// TIER 7: BASE CHEMISTRY
// =============================================================================

export type BaseChemistry =
  | 'SBS'          // Styrene-Butadiene-Styrene (modified bitumen)
  | 'APP'          // Atactic Polypropylene (modified bitumen)
  | 'TPO'          // Thermoplastic Polyolefin
  | 'EPDM'         // Ethylene Propylene Diene Monomer
  | 'PVC'          // Polyvinyl Chloride
  | 'KEE'          // Ketone Ethylene Ester (PVC variant)
  | 'polyurethane' // Polyurethane-based
  | 'silicone'     // Silicone-based
  | 'acrylic'      // Acrylic-based
  | 'asphalt'      // Asphalt-based
  | 'butyl'        // Butyl rubber
  | 'neoprene'     // Neoprene rubber
  | 'polyiso'      // Polyisocyanurate
  | 'xps'          // Extruded Polystyrene
  | 'eps'          // Expanded Polystyrene
  | 'mineral-wool' // Mineral wool insulation
  | 'fiberglass';  // Fiberglass insulation

// =============================================================================
// TIER 8: REINFORCEMENT
// =============================================================================

export type Reinforcement =
  | 'polyester'    // Polyester mat/scrim
  | 'fiberglass'   // Fiberglass mat/scrim
  | 'scrim'        // Generic scrim reinforcement
  | 'none';        // Unreinforced

// =============================================================================
// TIER 9: SURFACE TREATMENT
// =============================================================================

export type SurfaceTreatment =
  | 'granule'      // Granule surface (mineral)
  | 'smooth'       // Smooth surface
  | 'film'         // Film-faced
  | 'foil'         // Foil-faced (typically aluminum)
  | 'coated';      // Factory-coated surface

// =============================================================================
// TIER 17: FAILURE MODES
// =============================================================================

export type FailureSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface FailureMode {
  id: string;
  name: string;
  description: string;
  causes: string[];
  prevention: string[];
  severity: FailureSeverity;
}

// =============================================================================
// TIER 18: COMPATIBILITY
// =============================================================================

export type CompatibilityStatus =
  | 'compatible'    // Materials can be used together safely
  | 'incompatible'  // Materials should NEVER be used together
  | 'conditional'   // Compatible with specific conditions/barriers
  | 'unknown';      // No data available

export interface CompatibilityResult {
  status: CompatibilityStatus;
  reason?: string;
  conditions?: string[];
  recommendation?: string;
}

// =============================================================================
// FULL MATERIAL DNA (20-TIER SYSTEM)
// =============================================================================

export interface MaterialDNA {
  // Identity
  id: string;               // Unique identifier for this material

  // Tiers 1-6: Classification
  division: string;         // CSI MasterFormat division
  category: string;         // Product category
  assemblyType?: string;    // Assembly type (roofing, waterproofing, etc.)
  condition?: string;       // Application condition (new, reroofing, etc.)
  manufacturer?: string;    // Manufacturer name
  product?: string;         // Product name
  specSheetUrl?: string;    // Link to spec sheet

  // Tiers 7-12: Physical Properties
  baseChemistry: BaseChemistry;
  reinforcement?: Reinforcement;
  surfaceTreatment?: SurfaceTreatment;
  thicknessMil?: number;    // Thickness in mils
  color?: string;           // Product color
  sri?: number;             // Solar Reflectance Index
  fireRating?: 'A' | 'B' | 'C' | 'unrated';

  // Tiers 13-16: Performance
  permRating?: number;      // Permeance (perms)
  tensileStrength?: number; // Tensile strength (psi)
  elongation?: number;      // Elongation at break (%)
  tempRangeMin?: number;    // Min service temp (F)
  tempRangeMax?: number;    // Max service temp (F)

  // Tiers 17-20: Engineering DNA
  failureModes?: FailureMode[];
  compatibilityNotes?: string[];
  applicationConstraints?: string[];
  codeReferences?: string[];
}

// =============================================================================
// COMMON FAILURE MODES (Predefined)
// =============================================================================

export const COMMON_FAILURE_MODES: Record<string, FailureMode> = {
  'uv-degradation': {
    id: 'uv-degradation',
    name: 'UV Degradation',
    description: 'Material breakdown from ultraviolet radiation exposure',
    causes: ['Direct sunlight', 'No UV stabilizers', 'Exposed application'],
    prevention: ['Use UV-stable materials', 'Apply protective coating', 'Cover exposed areas'],
    severity: 'high'
  },
  'plasticizer-migration': {
    id: 'plasticizer-migration',
    name: 'Plasticizer Migration',
    description: 'Plasticizers leach out causing embrittlement',
    causes: ['Incompatible contact materials', 'High heat', 'Age'],
    prevention: ['Use compatible materials', 'Install barriers', 'Specify non-migratory'],
    severity: 'high'
  },
  'ponding-water': {
    id: 'ponding-water',
    name: 'Ponding Water',
    description: 'Standing water accelerates deterioration',
    causes: ['Inadequate slope', 'Blocked drains', 'Deflection'],
    prevention: ['Minimum 1/4" per foot slope', 'Regular drain maintenance'],
    severity: 'medium'
  },
  'seam-failure': {
    id: 'seam-failure',
    name: 'Seam Failure',
    description: 'Separation at membrane seams',
    causes: ['Poor welding', 'Contamination', 'Stress concentration'],
    prevention: ['Proper weld temps', 'Clean surfaces', 'Adequate overlap'],
    severity: 'critical'
  },
  'puncture': {
    id: 'puncture',
    name: 'Mechanical Puncture',
    description: 'Physical damage from foot traffic or debris',
    causes: ['Foot traffic', 'Dropped tools', 'Hail'],
    prevention: ['Walk pads', 'Protection board', 'Thicker membrane'],
    severity: 'medium'
  },
  'thermal-shock': {
    id: 'thermal-shock',
    name: 'Thermal Shock',
    description: 'Damage from rapid temperature changes',
    causes: ['HVAC condensate', 'Storm fronts', 'Improper design'],
    prevention: ['Adequate insulation', 'Proper expansion joints'],
    severity: 'medium'
  },
  'chemical-attack': {
    id: 'chemical-attack',
    name: 'Chemical Attack',
    description: 'Degradation from chemical exposure',
    causes: ['Oil spills', 'Acids', 'Solvents', 'Grease'],
    prevention: ['Chemical-resistant materials', 'Containment systems'],
    severity: 'high'
  }
};

// =============================================================================
// COMPATIBILITY MATRIX
// =============================================================================

export const COMPATIBILITY_MATRIX: Record<string, Record<string, CompatibilityResult>> = {
  'EPDM': {
    'asphalt': {
      status: 'incompatible',
      reason: 'Asphalt oils migrate into EPDM causing swelling and degradation'
    },
    'TPO': {
      status: 'conditional',
      reason: 'Requires separation layer',
      conditions: ['Install polyester fabric separation']
    },
    'PVC': {
      status: 'incompatible',
      reason: 'Plasticizer migration from PVC attacks EPDM'
    },
    'silicone': {
      status: 'compatible'
    },
    'butyl': {
      status: 'compatible'
    },
    'polyiso': {
      status: 'compatible'
    },
    'SBS': {
      status: 'incompatible',
      reason: 'Asphalt in SBS is incompatible with EPDM'
    }
  },
  'TPO': {
    'asphalt': {
      status: 'incompatible',
      reason: 'Asphalt oils degrade TPO membrane'
    },
    'PVC': {
      status: 'conditional',
      reason: 'Different weld temperatures, not recommended to mix',
      conditions: ['Use mechanical termination between materials']
    },
    'EPDM': {
      status: 'conditional',
      reason: 'Requires separation layer',
      conditions: ['Install polyester fabric separation']
    },
    'polyiso': {
      status: 'compatible'
    },
    'SBS': {
      status: 'incompatible',
      reason: 'Asphalt in SBS is incompatible with TPO'
    },
    'silicone': {
      status: 'compatible'
    }
  },
  'PVC': {
    'asphalt': {
      status: 'incompatible',
      reason: 'Asphalt attacks PVC causing degradation'
    },
    'eps': {
      status: 'incompatible',
      reason: 'Plasticizer migration destroys EPS',
      recommendation: 'Use XPS or polyiso instead'
    },
    'xps': {
      status: 'incompatible',
      reason: 'Plasticizer migration destroys XPS',
      recommendation: 'Use polyiso instead'
    },
    'EPDM': {
      status: 'incompatible',
      reason: 'Plasticizer migration degrades EPDM'
    },
    'polyiso': {
      status: 'compatible'
    },
    'SBS': {
      status: 'incompatible',
      reason: 'Asphalt in SBS attacks PVC'
    },
    'butyl': {
      status: 'conditional',
      reason: 'May cause staining',
      conditions: ['Use separation sheet']
    }
  },
  'SBS': {
    'EPDM': {
      status: 'incompatible',
      reason: 'Asphalt oils attack EPDM'
    },
    'TPO': {
      status: 'incompatible',
      reason: 'Asphalt oils attack TPO'
    },
    'PVC': {
      status: 'incompatible',
      reason: 'Asphalt oils attack PVC'
    },
    'polyiso': {
      status: 'compatible'
    },
    'silicone': {
      status: 'compatible'
    },
    'acrylic': {
      status: 'compatible'
    }
  },
  'polyiso': {
    'EPDM': {
      status: 'compatible'
    },
    'TPO': {
      status: 'compatible'
    },
    'PVC': {
      status: 'compatible'
    },
    'SBS': {
      status: 'compatible'
    }
  }
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Check compatibility between two materials by their base chemistry.
 *
 * @param material1 - First material's base chemistry
 * @param material2 - Second material's base chemistry
 * @returns CompatibilityResult with status and details
 */
export function checkCompatibility(
  material1: string,
  material2: string
): CompatibilityResult {
  // Normalize input
  const m1 = material1.toUpperCase();
  const m2 = material2.toLowerCase();

  // Check forward direction
  if (COMPATIBILITY_MATRIX[m1]?.[m2]) {
    return COMPATIBILITY_MATRIX[m1][m2];
  }

  // Check reverse direction
  const m1Lower = material1.toLowerCase();
  const m2Upper = material2.toUpperCase();
  if (COMPATIBILITY_MATRIX[m2Upper]?.[m1Lower]) {
    return COMPATIBILITY_MATRIX[m2Upper][m1Lower];
  }

  return {
    status: 'unknown',
    reason: 'No compatibility data available for this material combination'
  };
}

/**
 * Get all failure modes that apply to a material type.
 *
 * @param chemistry - The base chemistry
 * @returns Array of applicable failure modes
 */
export function getFailureModesForMaterial(chemistry: BaseChemistry): FailureMode[] {
  const applicableModes: string[] = [];

  // All materials susceptible to these
  applicableModes.push('puncture', 'thermal-shock');

  // Material-specific failure modes
  switch (chemistry) {
    case 'EPDM':
      applicableModes.push('uv-degradation', 'seam-failure');
      break;
    case 'TPO':
      applicableModes.push('seam-failure');
      break;
    case 'PVC':
      applicableModes.push('plasticizer-migration', 'uv-degradation');
      break;
    case 'SBS':
    case 'APP':
      applicableModes.push('ponding-water', 'seam-failure');
      break;
    case 'silicone':
    case 'acrylic':
      applicableModes.push('chemical-attack');
      break;
    default:
      break;
  }

  return applicableModes
    .filter(id => COMMON_FAILURE_MODES[id])
    .map(id => COMMON_FAILURE_MODES[id]);
}

/**
 * Get compatibility status color for UI display.
 *
 * @param status - The compatibility status
 * @returns CSS color value
 */
export function getCompatibilityColor(status: CompatibilityStatus): string {
  switch (status) {
    case 'compatible':
      return '#00ff88';
    case 'incompatible':
      return '#ff4444';
    case 'conditional':
      return '#ffaa00';
    case 'unknown':
    default:
      return '#888888';
  }
}

/**
 * Get severity color for UI display.
 *
 * @param severity - The failure severity
 * @returns CSS color value
 */
export function getSeverityColor(severity: FailureSeverity): string {
  switch (severity) {
    case 'critical':
      return '#ff0000';
    case 'high':
      return '#ff4444';
    case 'medium':
      return '#ffaa00';
    case 'low':
      return '#00ff88';
    default:
      return '#888888';
  }
}

export default {
  COMMON_FAILURE_MODES,
  COMPATIBILITY_MATRIX,
  checkCompatibility,
  getFailureModesForMaterial,
  getCompatibilityColor,
  getSeverityColor
};
