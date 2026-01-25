/**
 * Construction DNA Type System
 * 20-Tier Material Taxonomy for Construction Materials
 */

// ============================================================================
// TIER 7: BASE CHEMISTRY
// ============================================================================

export type BaseChemistry =
  | 'TPO'           // Thermoplastic Polyolefin
  | 'EPDM'          // Ethylene Propylene Diene Monomer
  | 'PVC'           // Polyvinyl Chloride
  | 'KEE'           // Ketone Ethylene Ester
  | 'SBS'           // Styrene-Butadiene-Styrene (modified bitumen)
  | 'APP'           // Atactic Polypropylene (modified bitumen)
  | 'asphalt'       // Built-up roofing
  | 'polyiso'       // Polyisocyanurate insulation
  | 'XPS'           // Extruded Polystyrene
  | 'EPS'           // Expanded Polystyrene
  | 'mineral-wool'  // Rock wool / slag wool
  | 'fiberglass'    // Glass fiber
  | 'polyurethane'  // PU coatings/sealants
  | 'silicone'      // Silicone coatings/sealants
  | 'acrylic'       // Acrylic coatings
  | 'butyl'         // Butyl rubber
  | 'neoprene'      // Polychloroprene
  | 'aluminum'      // Metal flashing
  | 'steel'         // Galvanized/stainless
  | 'concrete'      // Substrate
  | 'gypsum'        // Sheathing/cover board
  | 'wood'          // Substrate
  | 'unknown';

// ============================================================================
// TIER 8: REINFORCEMENT
// ============================================================================

export type Reinforcement = 
  | 'polyester' 
  | 'fiberglass' 
  | 'scrim' 
  | 'felt'
  | 'none';

// ============================================================================
// TIER 9: SURFACE TREATMENT
// ============================================================================

export type SurfaceTreatment = 
  | 'smooth' 
  | 'granule' 
  | 'film' 
  | 'foil' 
  | 'coated'
  | 'fleece'
  | 'sand';

// ============================================================================
// TIER 12: FIRE RATING
// ============================================================================

export type FireRating = 'A' | 'B' | 'C' | 'unrated';

// ============================================================================
// TIER 17: FAILURE MODES
// ============================================================================

export type FailureSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface FailureMode {
  id: string;
  name: string;
  description: string;
  causes: string[];
  prevention: string[];
  severity: FailureSeverity;
}

// ============================================================================
// TIER 18: COMPATIBILITY
// ============================================================================

export type CompatibilityStatus = 
  | 'compatible' 
  | 'incompatible' 
  | 'conditional' 
  | 'unknown';

export interface CompatibilityResult {
  status: CompatibilityStatus;
  reason?: string;
  conditions?: string[];
  recommendation?: string;
}

// ============================================================================
// FULL 20-TIER MATERIAL DNA
// ============================================================================

export interface MaterialDNA {
  // Identity
  id: string;
  
  // Tiers 1-6: Classification
  division?: string;           // CSI division (e.g., "07")
  category?: string;           // "Roofing", "Waterproofing", etc.
  assemblyType?: string;       // "Edge", "Field", "Penetration"
  condition?: string;          // "Parapet", "Curb", "Wall"
  manufacturer?: string;       // "Carlisle", "Firestone", etc.
  product?: string;            // Specific product name
  specSheetUrl?: string;       // Link to spec sheet PDF
  
  // Tiers 7-12: Physical Properties
  baseChemistry: BaseChemistry;
  reinforcement?: Reinforcement;
  surfaceTreatment?: SurfaceTreatment;
  thicknessMil?: number;       // Thickness in mils (1 mil = 0.001")
  color?: string;              // Hex color code
  sri?: number;                // Solar Reflectance Index
  fireRating?: FireRating;
  
  // Tiers 13-16: Performance Metrics
  permRating?: number;         // Vapor permeance (perms)
  tensileStrength?: number;    // PSI
  elongation?: number;         // Percentage
  tempRangeMin?: number;       // °F
  tempRangeMax?: number;       // °F
  rValue?: number;             // Thermal resistance (per inch)
  
  // Tiers 17-20: Engineering DNA
  failureModes?: FailureMode[];
  compatibilityNotes?: string[];
  applicationConstraints?: string[];
  codeReferences?: string[];
}

// ============================================================================
// PREDEFINED FAILURE MODES
// ============================================================================

export const COMMON_FAILURE_MODES: Record<string, FailureMode> = {
  'uv-degradation': {
    id: 'uv-degradation',
    name: 'UV Degradation',
    description: 'Material breakdown from ultraviolet radiation exposure',
    causes: ['Direct sunlight exposure', 'Lack of UV stabilizers', 'Exposed application without protection'],
    prevention: ['Use UV-stable materials', 'Apply protective coatings', 'Cover exposed areas with ballast or pavers'],
    severity: 'high'
  },
  'plasticizer-migration': {
    id: 'plasticizer-migration',
    name: 'Plasticizer Migration',
    description: 'Plasticizers leach from PVC into adjacent materials causing embrittlement',
    causes: ['Direct contact with incompatible materials', 'High temperatures', 'Age'],
    prevention: ['Use separator sheets', 'Specify non-migratory formulations', 'Avoid PVC contact with polystyrene'],
    severity: 'high'
  },
  'ponding-water': {
    id: 'ponding-water',
    name: 'Ponding Water',
    description: 'Standing water accelerates membrane deterioration and causes leaks',
    causes: ['Inadequate slope', 'Blocked drains', 'Structural deflection'],
    prevention: ['Design minimum 1/4" per foot slope', 'Regular drain maintenance', 'Use tapered insulation'],
    severity: 'medium'
  },
  'seam-failure': {
    id: 'seam-failure',
    name: 'Seam Failure',
    description: 'Separation at membrane seams allowing water infiltration',
    causes: ['Improper weld temperature', 'Contaminated surfaces', 'Insufficient overlap', 'Stress concentration'],
    prevention: ['Maintain proper weld temps (TPO: 900-1000°F)', 'Clean surfaces before welding', 'Minimum 3" overlap'],
    severity: 'critical'
  },
  'puncture': {
    id: 'puncture',
    name: 'Mechanical Puncture',
    description: 'Physical damage from foot traffic, dropped tools, or debris impact',
    causes: ['Foot traffic without walk pads', 'Dropped tools or equipment', 'Hail damage', 'Animal damage'],
    prevention: ['Install walk pads in traffic areas', 'Use protection board', 'Specify heavier membrane (60+ mil)'],
    severity: 'medium'
  },
  'blistering': {
    id: 'blistering',
    name: 'Blistering',
    description: 'Air or moisture pockets forming between membrane plies or at substrate',
    causes: ['Moisture in substrate', 'Poor adhesion', 'Vapor drive from interior', 'Entrapped air during installation'],
    prevention: ['Ensure dry substrate', 'Proper adhesive application', 'Install vapor retarder', 'Roll out air pockets'],
    severity: 'high'
  },
  'oil-degradation': {
    id: 'oil-degradation',
    name: 'Oil/Grease Degradation',
    description: 'EPDM and some materials swell and degrade when exposed to oils',
    causes: ['Kitchen exhaust discharge', 'HVAC condensate', 'Petroleum-based products', 'Incompatible sealants'],
    prevention: ['Use oil-resistant membrane near exhausts', 'Install grease containment', 'Specify compatible products'],
    severity: 'high'
  }
};

// ============================================================================
// COMPATIBILITY MATRIX
// ============================================================================

const COMPATIBILITY_MATRIX: Record<string, Record<string, CompatibilityResult>> = {
  'TPO': {
    'asphalt': { 
      status: 'incompatible', 
      reason: 'Asphalt oils degrade TPO membrane' 
    },
    'SBS': { 
      status: 'incompatible', 
      reason: 'Asphalt-based products incompatible with TPO' 
    },
    'APP': { 
      status: 'incompatible', 
      reason: 'Asphalt-based products incompatible with TPO' 
    },
    'EPDM': { 
      status: 'conditional', 
      reason: 'Different chemistries require separation',
      conditions: ['Install polyester fabric separator', 'Mechanical termination only']
    },
    'PVC': { 
      status: 'conditional', 
      reason: 'Different weld temperatures, mixing not recommended',
      conditions: ['Use mechanical termination between materials']
    },
    'polyiso': { status: 'compatible' },
    'XPS': { status: 'compatible' },
    'EPS': { status: 'compatible' },
    'gypsum': { status: 'compatible' },
    'concrete': { status: 'compatible' },
    'silicone': { status: 'compatible' }
  },
  'EPDM': {
    'asphalt': { 
      status: 'incompatible', 
      reason: 'Asphalt oils migrate into EPDM causing swelling and degradation' 
    },
    'SBS': { 
      status: 'incompatible', 
      reason: 'Asphalt-based, oils attack EPDM' 
    },
    'APP': { 
      status: 'incompatible', 
      reason: 'Asphalt-based, oils attack EPDM' 
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
    'polyiso': { status: 'compatible' },
    'silicone': { status: 'compatible' },
    'butyl': { status: 'compatible' },
    'neoprene': { status: 'compatible' }
  },
  'PVC': {
    'asphalt': { 
      status: 'incompatible', 
      reason: 'Asphalt attacks PVC membrane' 
    },
    'SBS': { 
      status: 'incompatible', 
      reason: 'Asphalt-based products attack PVC' 
    },
    'XPS': { 
      status: 'incompatible', 
      reason: 'Plasticizer migration destroys XPS (polystyrene)' 
    },
    'EPS': { 
      status: 'incompatible', 
      reason: 'Plasticizer migration destroys EPS (polystyrene)' 
    },
    'EPDM': { 
      status: 'incompatible', 
      reason: 'Plasticizer migration damages EPDM' 
    },
    'TPO': { 
      status: 'conditional', 
      reason: 'Different chemistries',
      conditions: ['Use mechanical termination']
    },
    'polyiso': { status: 'compatible' },
    'gypsum': { status: 'compatible' },
    'concrete': { status: 'compatible' }
  },
  'SBS': {
    'TPO': { status: 'incompatible', reason: 'Asphalt incompatible with TPO' },
    'EPDM': { status: 'incompatible', reason: 'Asphalt incompatible with EPDM' },
    'PVC': { status: 'incompatible', reason: 'Asphalt incompatible with PVC' },
    'APP': { status: 'compatible' },
    'asphalt': { status: 'compatible' },
    'polyiso': { status: 'compatible' },
    'concrete': { status: 'compatible' }
  },
  'polyiso': {
    'TPO': { status: 'compatible' },
    'EPDM': { status: 'compatible' },
    'PVC': { status: 'compatible' },
    'SBS': { status: 'compatible' },
    'asphalt': { status: 'compatible' }
  }
};

// ============================================================================
// COMPATIBILITY CHECKING FUNCTION
// ============================================================================

/**
 * Check compatibility between two materials based on their chemistry
 */
export function checkCompatibility(
  chemistry1: string | BaseChemistry,
  chemistry2: string | BaseChemistry
): CompatibilityResult {
  const c1 = chemistry1.toUpperCase();
  const c2 = chemistry2.toLowerCase();
  
  // Check direct match
  if (COMPATIBILITY_MATRIX[c1]?.[c2]) {
    return COMPATIBILITY_MATRIX[c1][c2];
  }
  
  // Check reverse (matrix may only define one direction)
  const c1Lower = chemistry1.toLowerCase();
  const c2Upper = chemistry2.toUpperCase();
  if (COMPATIBILITY_MATRIX[c2Upper]?.[c1Lower]) {
    return COMPATIBILITY_MATRIX[c2Upper][c1Lower];
  }
  
  // Same chemistry is always compatible
  if (c1.toLowerCase() === c2.toLowerCase()) {
    return { status: 'compatible', reason: 'Same material chemistry' };
  }
  
  // Unknown combination
  return { 
    status: 'unknown', 
    reason: `No compatibility data for ${chemistry1} + ${chemistry2}` 
  };
}

/**
 * Check compatibility between two MaterialDNA objects
 */
export function checkDNACompatibility(
  dna1: MaterialDNA,
  dna2: MaterialDNA
): CompatibilityResult {
  return checkCompatibility(dna1.baseChemistry, dna2.baseChemistry);
}

// ============================================================================
// DEFAULT COLORS BY CHEMISTRY
// ============================================================================

export const DEFAULT_COLORS: Record<BaseChemistry, string> = {
  'TPO': '#F5F5F5',        // White/light gray
  'EPDM': '#1A1A1A',       // Black
  'PVC': '#E8E8E8',        // Light gray
  'KEE': '#E0E0E0',        // Light gray
  'SBS': '#2D2D2D',        // Dark gray (granule surface)
  'APP': '#3D3D3D',        // Dark gray
  'asphalt': '#1A1A1A',    // Black
  'polyiso': '#D4A574',    // Tan/brown
  'XPS': '#FF9ECF',        // Pink (Owens Corning FOAMULAR)
  'EPS': '#FFFFFF',        // White
  'mineral-wool': '#8B7355', // Brown
  'fiberglass': '#FFE4B5', // Light yellow/tan
  'polyurethane': '#FFD700', // Yellow/amber
  'silicone': '#E0E0E0',   // Silver/gray
  'acrylic': '#FFFFFF',    // White
  'butyl': '#2D2D2D',      // Dark gray
  'neoprene': '#1A1A1A',   // Black
  'aluminum': '#A8A8A8',   // Silver
  'steel': '#708090',      // Slate gray
  'concrete': '#808080',   // Gray
  'gypsum': '#F5F5DC',     // Off-white
  'wood': '#8B4513',       // Brown
  'unknown': '#808080'     // Gray
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get the default color for a chemistry type
 */
export function getDefaultColor(chemistry: BaseChemistry | string): string {
  return DEFAULT_COLORS[chemistry as BaseChemistry] || DEFAULT_COLORS.unknown;
}

/**
 * Validate a MaterialDNA object
 */
export function validateMaterialDNA(dna: Partial<MaterialDNA>): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (!dna.id) {
    errors.push('Missing required field: id');
  }
  
  if (!dna.baseChemistry) {
    errors.push('Missing required field: baseChemistry');
  }
  
  if (!dna.manufacturer && !dna.product) {
    warnings.push('No manufacturer or product specified');
  }
  
  if (!dna.specSheetUrl) {
    warnings.push('No spec sheet URL provided');
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

// ============================================================================
// EXPORT ALL
// ============================================================================

export type {
  BaseChemistry,
  Reinforcement,
  SurfaceTreatment,
  FireRating,
  FailureSeverity,
  FailureMode,
  CompatibilityStatus,
  CompatibilityResult,
  MaterialDNA
};
