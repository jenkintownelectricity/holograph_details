/**
 * Layer Material Type Mapping
 * L0-CMD-2026-0125-004 Phase B1
 *
 * Maps semantic detail layer IDs and materials to PRODUCT_EQUIVALENCIES keys.
 * This enables the equivalency scoring to work correctly.
 */

import { MaterialType } from '../schemas/semantic-detail';

/**
 * Map of layer IDs to their product equivalency materialType keys.
 * These keys correspond to entries in PRODUCT_EQUIVALENCIES.
 */
export const LAYER_ID_TO_MATERIAL_TYPE: Record<string, string> = {
  // ==============================
  // Roofing Layers (RF-002)
  // ==============================
  'deck': 'substrate-concrete',
  'parapet': 'substrate-cmu',
  'parapet-wall': 'substrate-cmu',
  'vapor-barrier': 'vapor-barrier',
  'insulation': 'insulation-polyiso',
  'cover-board': 'cover-board',
  'roof-membrane': 'membrane-tpo',
  'cant-strip': 'insulation-polyiso',
  'base-flashing': 'flashing',
  'termination-bar': 'fastener',
  'metal-coping': 'flashing',

  // ==============================
  // Foundation Layers (FD-001)
  // ==============================
  'foundation-wall': 'substrate-concrete',
  'footing': 'substrate-concrete',
  'gravel-base': 'drainage-composite',
  'slab': 'substrate-concrete',
  'wall-membrane': 'membrane-self-adhered-waterproofing',
  'protection-board': 'cover-board',
  'drainage-mat': 'drainage-composite',

  // ==============================
  // Air Barrier Layers (AB-001)
  // ==============================
  'stud': 'substrate-wood',
  'sheathing': 'substrate-wood',
  'air-barrier': 'membrane-air-barrier',
  'flashing-membrane': 'membrane-self-adhered-waterproofing',
  'window-frame': 'substrate-aluminum',

  // ==============================
  // Expansion Joint Layers (WP-003)
  // ==============================
  'substrate-left': 'substrate-concrete',
  'substrate-right': 'substrate-concrete',
  'primer': 'primer',
  'membrane': 'membrane-self-adhered-waterproofing',
  'backer-rod': 'sealant',
  'sealant': 'sealant',

  // ==============================
  // Penetration Layers (PN-001)
  // ==============================
  'substrate': 'substrate-concrete',
  'pipe': 'substrate-steel',
  'collar': 'flashing',
  'clamp': 'fastener',
};

/**
 * Map of MaterialType values to product equivalency keys.
 * Used as a fallback when layer ID isn't in the ID map.
 */
export const MATERIAL_TO_EQUIVALENCY_KEY: Record<MaterialType | string, string> = {
  // Substrates
  'concrete': 'substrate-concrete',
  'cmu': 'substrate-cmu',
  'steel': 'substrate-steel',
  'wood': 'substrate-wood',

  // Membranes
  'membrane-sheet': 'membrane-tpo',
  'membrane-fluid': 'coating-liquid',

  // Air and Vapor Barriers
  'air-barrier': 'membrane-air-barrier',
  'vapor-barrier': 'vapor-barrier',

  // Insulation
  'insulation-rigid': 'insulation-polyiso',
  'insulation-spray': 'coating-liquid',

  // Protection and Drainage
  'protection-board': 'cover-board',
  'drainage-mat': 'drainage-composite',

  // Metals and Flashing
  'flashing-metal': 'flashing',
  'termination-bar': 'fastener',
  'reglet': 'flashing',

  // Sealants and Accessories
  'sealant': 'sealant',
  'backer-rod': 'sealant',
  'primer': 'primer',
  'adhesive': 'adhesive',
  'cant-strip': 'insulation-polyiso',
};

/**
 * Keywords to product equivalency key mapping.
 * Used as a final fallback for fuzzy matching.
 */
export const KEYWORD_TO_EQUIVALENCY_KEY: Record<string, string> = {
  // Membranes
  'tpo': 'membrane-tpo',
  'epdm': 'membrane-epdm',
  'pvc': 'membrane-pvc',
  'mod-bit': 'membrane-mod-bit',
  'modified bitumen': 'membrane-mod-bit',
  'waterproof': 'membrane-self-adhered-waterproofing',
  'bituthene': 'membrane-self-adhered-waterproofing',
  'fleece': 'membrane-fleece',

  // Air barriers
  'air barrier': 'membrane-air-barrier',
  'air-barrier': 'membrane-air-barrier',
  'perm-a-barrier': 'membrane-air-barrier',

  // Insulation
  'polyiso': 'insulation-polyiso',
  'polyisocyanurate': 'insulation-polyiso',
  'xps': 'insulation-xps',
  'extruded polystyrene': 'insulation-xps',

  // Coatings
  'silicone': 'coating-silicone',
  'acrylic': 'coating-acrylic',
  'liquid': 'coating-liquid',

  // Drainage
  'drainage': 'drainage-composite',
  'drain': 'drainage-composite',

  // Vapor barriers
  'vapor': 'vapor-barrier',
  'vapour': 'vapor-barrier',

  // Accessories
  'sealant': 'sealant',
  'flashing': 'flashing',
  'fastener': 'fastener',
  'adhesive': 'adhesive',
  'primer': 'primer',
  'cover board': 'cover-board',
  'coverboard': 'cover-board',
};

/**
 * Resolve the materialType for a layer based on its ID, material, and annotation.
 *
 * @param layerId - The layer's id field
 * @param material - The layer's material field (MaterialType)
 * @param annotation - Optional annotation text for keyword matching
 * @returns The product equivalency key, or undefined if no match found
 */
export function resolveMaterialType(
  layerId: string,
  material: string,
  annotation?: string
): string | undefined {
  // 1. Try direct layer ID lookup
  const byId = LAYER_ID_TO_MATERIAL_TYPE[layerId.toLowerCase()];
  if (byId) return byId;

  // 2. Try material type lookup
  const byMaterial = MATERIAL_TO_EQUIVALENCY_KEY[material];
  if (byMaterial) return byMaterial;

  // 3. Try keyword matching in layer ID
  const idLower = layerId.toLowerCase();
  for (const [keyword, key] of Object.entries(KEYWORD_TO_EQUIVALENCY_KEY)) {
    if (idLower.includes(keyword.toLowerCase())) {
      return key;
    }
  }

  // 4. Try keyword matching in annotation
  if (annotation) {
    const annotationLower = annotation.toLowerCase();
    for (const [keyword, key] of Object.entries(KEYWORD_TO_EQUIVALENCY_KEY)) {
      if (annotationLower.includes(keyword.toLowerCase())) {
        return key;
      }
    }
  }

  // 5. No match found
  return undefined;
}

/**
 * Get all available manufacturers for a given material type.
 * Convenience wrapper that imports from or-equal-comparison.
 */
export function getAvailableManufacturers(materialType: string): string[] {
  // Dynamically import to avoid circular dependencies
  try {
    const { PRODUCT_EQUIVALENCIES } = require('../features/or-equal-comparison');
    const data = PRODUCT_EQUIVALENCIES[materialType];
    if (!data) return [];
    return [...new Set(data.products.map((p: { manufacturer: string }) => p.manufacturer))];
  } catch {
    return [];
  }
}

export default {
  LAYER_ID_TO_MATERIAL_TYPE,
  MATERIAL_TO_EQUIVALENCY_KEY,
  KEYWORD_TO_EQUIVALENCY_KEY,
  resolveMaterialType,
  getAvailableManufacturers,
};
