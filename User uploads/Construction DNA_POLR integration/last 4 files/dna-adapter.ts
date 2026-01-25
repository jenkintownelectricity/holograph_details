/**
 * DNA Adapter
 * Converts between Construction DNA MaterialDNA and POLR formats
 */

import {
  MaterialDNA,
  BaseChemistry,
  getDefaultColor,
  checkCompatibility,
  CompatibilityResult
} from '../types/construction-dna';

// ============================================================================
// POLR MATERIAL FORMAT
// ============================================================================

export interface POLRMaterial {
  id: string;
  dnaId: string;
  
  // Display
  name: string;
  manufacturer: string;
  product: string;
  category: string;
  
  // Visual (for Three.js)
  color: string;
  roughness: number;
  metalness: number;
  opacity: number;
  textureHint: 'smooth' | 'granule' | 'ribbed' | 'matte' | 'reflective';
  
  // Physical
  thicknessMm: number;
  chemistry: string;
  
  // Links
  specSheetUrl?: string;
  
  // Full DNA reference
  dna: MaterialDNA;
}

// ============================================================================
// DNA → POLR CONVERSION
// ============================================================================

/**
 * Convert a MaterialDNA object to POLR format for 3D rendering
 */
export function dnaMaterialToPOLR(dna: MaterialDNA): POLRMaterial {
  return {
    id: `polr-${dna.id}`,
    dnaId: dna.id,
    
    // Display info
    name: dna.product || dna.baseChemistry || 'Unknown Material',
    manufacturer: dna.manufacturer || 'Generic',
    product: dna.product || '',
    category: dna.category || 'Uncategorized',
    
    // Visual properties derived from DNA
    color: dna.color || getDefaultColor(dna.baseChemistry),
    roughness: getRoughnessFromSurface(dna.surfaceTreatment),
    metalness: getMetalnessFromChemistry(dna.baseChemistry),
    opacity: 1.0,
    textureHint: mapTextureHint(dna.surfaceTreatment),
    
    // Physical
    thicknessMm: dna.thicknessMil ? milToMm(dna.thicknessMil) : 1.5,
    chemistry: dna.baseChemistry,
    
    // Links
    specSheetUrl: dna.specSheetUrl,
    
    // Full DNA reference
    dna
  };
}

/**
 * Convert POLR material back to DNA format
 */
export function polrMaterialToDNA(polr: POLRMaterial): MaterialDNA {
  // If we have the original DNA, return it
  if (polr.dna) {
    return polr.dna;
  }
  
  // Otherwise reconstruct from POLR data
  return {
    id: polr.dnaId || polr.id.replace('polr-', ''),
    baseChemistry: polr.chemistry as BaseChemistry || 'unknown',
    manufacturer: polr.manufacturer,
    product: polr.product,
    category: polr.category,
    color: polr.color,
    thicknessMil: mmToMil(polr.thicknessMm),
    specSheetUrl: polr.specSheetUrl
  };
}

/**
 * Batch convert DNA materials to POLR format
 */
export function convertDNAMaterials(dnaMaterials: MaterialDNA[]): POLRMaterial[] {
  return dnaMaterials.map(dnaMaterialToPOLR);
}

// ============================================================================
// DNA MATCHING / LOOKUP
// ============================================================================

/**
 * Find a matching DNA material from a list based on criteria
 */
export function findMatchingDNA(
  materials: MaterialDNA[],
  criteria: {
    chemistry?: string;
    manufacturer?: string;
    product?: string;
    category?: string;
  }
): MaterialDNA | undefined {
  return materials.find(m => {
    if (criteria.chemistry && m.baseChemistry.toLowerCase() !== criteria.chemistry.toLowerCase()) {
      return false;
    }
    if (criteria.manufacturer && !m.manufacturer?.toLowerCase().includes(criteria.manufacturer.toLowerCase())) {
      return false;
    }
    if (criteria.product && !m.product?.toLowerCase().includes(criteria.product.toLowerCase())) {
      return false;
    }
    if (criteria.category && m.category?.toLowerCase() !== criteria.category.toLowerCase()) {
      return false;
    }
    return true;
  });
}

/**
 * Find all DNA materials matching a chemistry type
 */
export function findByChemistry(
  materials: MaterialDNA[],
  chemistry: string
): MaterialDNA[] {
  return materials.filter(m => 
    m.baseChemistry.toLowerCase() === chemistry.toLowerCase()
  );
}

/**
 * Find all DNA materials from a manufacturer
 */
export function findByManufacturer(
  materials: MaterialDNA[],
  manufacturer: string
): MaterialDNA[] {
  return materials.filter(m => 
    m.manufacturer?.toLowerCase().includes(manufacturer.toLowerCase())
  );
}

// ============================================================================
// CHEMISTRY GUESSING
// ============================================================================

/**
 * Guess the base chemistry from a material type string
 * Used when we have a POLR materialType but no DNA match
 */
export function guessChemistryFromType(materialType: string): BaseChemistry {
  const type = materialType.toLowerCase();
  
  // Direct matches
  if (type.includes('tpo')) return 'TPO';
  if (type.includes('epdm')) return 'EPDM';
  if (type.includes('pvc')) return 'PVC';
  if (type.includes('kee')) return 'KEE';
  if (type.includes('sbs') || type.includes('mod-bit') || type.includes('modified-bitumen')) return 'SBS';
  if (type.includes('app')) return 'APP';
  if (type.includes('bur') || type.includes('built-up') || type.includes('asphalt')) return 'asphalt';
  
  // Insulation
  if (type.includes('polyiso') || type.includes('iso')) return 'polyiso';
  if (type.includes('xps') || type.includes('extruded')) return 'XPS';
  if (type.includes('eps') || type.includes('expanded')) return 'EPS';
  if (type.includes('mineral') || type.includes('rock-wool')) return 'mineral-wool';
  if (type.includes('fiberglass') || type.includes('glass-fiber')) return 'fiberglass';
  
  // Coatings/Sealants
  if (type.includes('silicone')) return 'silicone';
  if (type.includes('acrylic')) return 'acrylic';
  if (type.includes('polyurethane') || type.includes('pu')) return 'polyurethane';
  if (type.includes('butyl')) return 'butyl';
  if (type.includes('neoprene')) return 'neoprene';
  
  // Metals
  if (type.includes('aluminum') || type.includes('aluminium')) return 'aluminum';
  if (type.includes('steel') || type.includes('metal')) return 'steel';
  
  // Substrates
  if (type.includes('concrete') || type.includes('cmu')) return 'concrete';
  if (type.includes('gypsum') || type.includes('drywall')) return 'gypsum';
  if (type.includes('wood') || type.includes('plywood') || type.includes('osb')) return 'wood';
  
  return 'unknown';
}

/**
 * Guess material type from layer ID
 */
export function guessChemistryFromLayerId(layerId: string): BaseChemistry {
  const id = layerId.toLowerCase();
  
  if (id.includes('membrane') || id.includes('roof-membrane')) return 'TPO';
  if (id.includes('insulation') || id.includes('iso')) return 'polyiso';
  if (id.includes('vapor') || id.includes('barrier')) return 'polyurethane';
  if (id.includes('deck') || id.includes('slab') || id.includes('concrete')) return 'concrete';
  if (id.includes('sheathing') || id.includes('gypsum')) return 'gypsum';
  if (id.includes('flashing') || id.includes('coping') || id.includes('metal')) return 'aluminum';
  if (id.includes('sealant')) return 'silicone';
  if (id.includes('coating')) return 'acrylic';
  
  return 'unknown';
}

// ============================================================================
// VALUE FORMATTING
// ============================================================================

/**
 * Format a DNA value for display
 */
export function formatDNAValue(
  value: unknown,
  type: 'thickness' | 'temperature' | 'percentage' | 'psi' | 'perm' | 'rvalue' | 'default'
): string {
  if (value === undefined || value === null) {
    return '—';
  }
  
  switch (type) {
    case 'thickness':
      return `${value} mil`;
    case 'temperature':
      return `${value}°F`;
    case 'percentage':
      return `${value}%`;
    case 'psi':
      return `${value} psi`;
    case 'perm':
      return `${value} perms`;
    case 'rvalue':
      return `R-${value}`;
    default:
      return String(value);
  }
}

/**
 * Format temperature range
 */
export function formatTempRange(min?: number, max?: number): string {
  if (min === undefined && max === undefined) return '—';
  if (min === undefined) return `Up to ${max}°F`;
  if (max === undefined) return `${min}°F and above`;
  return `${min}°F to ${max}°F`;
}

// ============================================================================
// UNIT CONVERSIONS
// ============================================================================

/**
 * Convert mils to millimeters
 * 1 mil = 0.0254 mm
 */
export function milToMm(mils: number): number {
  return mils * 0.0254;
}

/**
 * Convert millimeters to mils
 */
export function mmToMil(mm: number): number {
  return mm / 0.0254;
}

/**
 * Convert mils to inches
 */
export function milToInches(mils: number): number {
  return mils / 1000;
}

// ============================================================================
// VISUAL PROPERTY HELPERS
// ============================================================================

/**
 * Get roughness value from surface treatment
 */
function getRoughnessFromSurface(surface?: string): number {
  const roughnessMap: Record<string, number> = {
    'smooth': 0.2,
    'film': 0.15,
    'foil': 0.1,
    'coated': 0.3,
    'fleece': 0.6,
    'sand': 0.7,
    'granule': 0.9
  };
  return roughnessMap[surface || ''] || 0.5;
}

/**
 * Get metalness value from chemistry
 */
function getMetalnessFromChemistry(chemistry: string): number {
  const metallicChemistries = ['aluminum', 'steel'];
  return metallicChemistries.includes(chemistry.toLowerCase()) ? 0.9 : 0.0;
}

/**
 * Map surface treatment to texture hint
 */
function mapTextureHint(surface?: string): 'smooth' | 'granule' | 'ribbed' | 'matte' | 'reflective' {
  if (!surface) return 'matte';
  
  switch (surface.toLowerCase()) {
    case 'smooth':
    case 'film':
      return 'smooth';
    case 'granule':
    case 'sand':
      return 'granule';
    case 'foil':
      return 'reflective';
    default:
      return 'matte';
  }
}

// ============================================================================
// COMPATIBILITY HELPERS
// ============================================================================

/**
 * Check if two POLR materials are compatible
 */
export function checkPOLRCompatibility(
  material1: POLRMaterial,
  material2: POLRMaterial
): CompatibilityResult {
  return checkCompatibility(material1.chemistry, material2.chemistry);
}

/**
 * Get compatibility status color for UI
 */
export function getCompatibilityColor(status: string): string {
  switch (status) {
    case 'compatible': return '#22c55e';     // Green
    case 'incompatible': return '#ef4444';   // Red
    case 'conditional': return '#f59e0b';    // Amber
    default: return '#6b7280';               // Gray
  }
}
