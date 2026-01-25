/**
 * DNA Adapter
 * L0-CMD-2026-0125-005 Phase 2
 *
 * Converts Construction DNA materials to POLR format for 3D visualization.
 * Extracts visual properties (color, texture, thickness) and preserves DNA data.
 */

import { MaterialDNA, BaseChemistry, SurfaceTreatment } from '../types/construction-dna';

// =============================================================================
// POLR MATERIAL FORMAT
// =============================================================================

export interface POLRMaterial {
  /** Unique ID in POLR format */
  id: string;
  /** Reference to original DNA record */
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
  textureHint: TextureHint;

  // Physical
  thicknessMm: number;
  chemistry: string;

  // Links
  specSheetUrl?: string;

  // Full DNA (for detail panel)
  dna: MaterialDNA;
}

export type TextureHint = 'smooth' | 'granule' | 'ribbed' | 'matte' | 'foil';

// =============================================================================
// COLOR MAPPING BY CHEMISTRY
// =============================================================================

const CHEMISTRY_COLORS: Record<string, string> = {
  'TPO': '#F5F5F5',        // White/light gray
  'EPDM': '#1A1A1A',       // Black
  'PVC': '#E8E8E8',        // Light gray
  'SBS': '#2D2D2D',        // Dark gray
  'APP': '#3D3D3D',        // Dark gray
  'polyiso': '#D4A574',    // Tan/brown
  'xps': '#FF9ECF',        // Pink (Owens Corning style)
  'eps': '#FFFFFF',        // White
  'silicone': '#E0E0E0',   // Silver
  'acrylic': '#CCCCCC',    // Light gray
  'polyurethane': '#4A4A4A', // Dark gray
  'asphalt': '#1F1F1F',    // Near black
  'butyl': '#333333',      // Dark gray
  'neoprene': '#2A2A2A',   // Dark gray
  'mineral-wool': '#FFE4B5', // Tan
  'fiberglass': '#FFE4E1', // Light pink
  'KEE': '#E8E8E8',        // Light gray (like PVC)
};

function getDefaultColor(chemistry?: string): string {
  if (!chemistry) return '#808080';
  return CHEMISTRY_COLORS[chemistry] || '#808080';
}

// =============================================================================
// ROUGHNESS MAPPING BY SURFACE TREATMENT
// =============================================================================

const SURFACE_ROUGHNESS: Record<string, number> = {
  'smooth': 0.3,
  'granule': 0.9,
  'film': 0.2,
  'foil': 0.1,
  'coated': 0.4,
};

function getRoughness(surface?: string): number {
  if (!surface) return 0.5;
  return SURFACE_ROUGHNESS[surface] || 0.5;
}

// =============================================================================
// METALNESS MAPPING
// =============================================================================

function getMetalness(chemistry?: string, surface?: string): number {
  // Foil-faced materials have high metalness
  if (surface === 'foil') return 0.8;
  // Metal chemistries
  if (chemistry === 'aluminum' || chemistry === 'steel') return 0.9;
  // Most roofing materials are non-metallic
  return 0.0;
}

// =============================================================================
// TEXTURE HINT MAPPING
// =============================================================================

function mapTextureHint(surface?: string): TextureHint {
  if (surface === 'granule') return 'granule';
  if (surface === 'smooth' || surface === 'film') return 'smooth';
  if (surface === 'foil') return 'foil';
  if (surface === 'ribbed') return 'ribbed';
  return 'matte';
}

// =============================================================================
// MAIN CONVERSION FUNCTION
// =============================================================================

/**
 * Convert a Construction DNA material to POLR format.
 *
 * @param dna - The MaterialDNA object from Construction DNA
 * @returns POLRMaterial ready for 3D rendering and UI display
 */
export function dnaMaterialToPOLR(dna: MaterialDNA): POLRMaterial {
  const chemistry = dna.baseChemistry || '';

  return {
    id: `polr-${dna.id}`,
    dnaId: dna.id,

    // Display info
    name: dna.product || dna.baseChemistry || 'Unknown Material',
    manufacturer: dna.manufacturer || 'Generic',
    product: dna.product || '',
    category: dna.category || 'Uncategorized',

    // Visual properties derived from DNA
    color: dna.color || getDefaultColor(chemistry),
    roughness: getRoughness(dna.surfaceTreatment),
    metalness: getMetalness(chemistry, dna.surfaceTreatment),
    opacity: 1.0,
    textureHint: mapTextureHint(dna.surfaceTreatment),

    // Physical properties
    // Convert mils to mm (1 mil = 0.0254 mm)
    thicknessMm: dna.thicknessMil ? dna.thicknessMil * 0.0254 : 1.5,
    chemistry: chemistry,

    // Links
    specSheetUrl: dna.specSheetUrl,

    // Full DNA reference for detail panel
    dna: dna
  };
}

/**
 * Convert multiple DNA materials to POLR format.
 *
 * @param dnaMaterials - Array of MaterialDNA objects
 * @returns Array of POLRMaterial objects
 */
export function convertDNAMaterials(dnaMaterials: MaterialDNA[]): POLRMaterial[] {
  return dnaMaterials.map(dnaMaterialToPOLR);
}

/**
 * Create a POLR material from minimal DNA data.
 * Useful for quick material creation without full DNA.
 *
 * @param id - Unique identifier
 * @param chemistry - Base chemistry type
 * @param options - Optional overrides
 */
export function createQuickPOLRMaterial(
  id: string,
  chemistry: string,
  options: Partial<{
    name: string;
    manufacturer: string;
    product: string;
    color: string;
    thicknessMm: number;
    specSheetUrl: string;
  }> = {}
): POLRMaterial {
  const dna: MaterialDNA = {
    id: id,
    division: '07',
    category: 'Roofing',
    baseChemistry: chemistry as BaseChemistry,
    manufacturer: options.manufacturer,
    product: options.product || options.name,
    color: options.color,
    thicknessMil: options.thicknessMm ? options.thicknessMm / 0.0254 : undefined,
    specSheetUrl: options.specSheetUrl,
  };

  const polr = dnaMaterialToPOLR(dna);

  // Apply overrides
  if (options.name) polr.name = options.name;
  if (options.manufacturer) polr.manufacturer = options.manufacturer;
  if (options.product) polr.product = options.product;
  if (options.color) polr.color = options.color;
  if (options.thicknessMm) polr.thicknessMm = options.thicknessMm;

  return polr;
}

export default {
  dnaMaterialToPOLR,
  convertDNAMaterials,
  createQuickPOLRMaterial,
};
