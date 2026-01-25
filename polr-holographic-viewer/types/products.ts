/**
 * Product Database Type Definitions
 * L0-CMD-2026-0125-002 - Roofing Product Integration
 */

// =============================================================================
// PRODUCT INTERFACES
// =============================================================================

export interface Product {
  /** Unique identifier in kebab-case: manufacturer-product */
  id: string;
  /** Manufacturer ID reference */
  manufacturer: string;
  /** Display name */
  name: string;
  /** Product type ID reference */
  productType: string;
  /** Original source URL */
  sourceUrl: string;
  /** Available thicknesses in mm */
  thickness?: number[];
  /** Available widths in meters */
  widths?: number[];
  /** Available colors */
  colors?: string[];
  /** ISO date when data was scraped */
  scrapedDate: string;
}

export interface ProductDatabase {
  version: string;
  generated: string;
  source: string;
  productCount: number;
  products: Product[];
}

// =============================================================================
// MANUFACTURER INTERFACES
// =============================================================================

export interface Manufacturer {
  /** Unique identifier in kebab-case */
  id: string;
  /** Short name */
  name: string;
  /** Full display name */
  displayName: string;
  /** Company website URL */
  website: string;
  /** Product categories offered */
  categories: string[];
}

export interface ManufacturerDatabase {
  version: string;
  generated: string;
  source: string;
  manufacturers: Record<string, Manufacturer>;
}

// =============================================================================
// PRODUCT TYPE INTERFACES
// =============================================================================

export interface ProductType {
  /** Unique identifier in kebab-case */
  id: string;
  /** Display name */
  name: string;
  /** Category grouping */
  category: string;
  /** CSI MasterFormat section */
  csiSection: string;
  /** Description of the product type */
  description: string;
  /** Default thickness in specified units */
  defaultThickness: number;
  /** Unit of measurement for thickness */
  thicknessUnit: string;
  /** Default hex color for rendering */
  color: string;
  /** R-value per inch (for insulation) */
  rValue?: number;
}

export interface ProductTypeDatabase {
  version: string;
  generated: string;
  productTypes: Record<string, ProductType>;
}

// =============================================================================
// EQUIVALENCY INTERFACES
// =============================================================================

export interface EquivalentProduct {
  manufacturer: string;
  product: string;
  thickness?: number;
  confidenceScore: number;
}

export interface ProductEquivalency {
  baseType: string;
  products: EquivalentProduct[];
}

export type ProductEquivalencies = Record<string, ProductEquivalency>;

// =============================================================================
// HELPER TYPES
// =============================================================================

export type ManufacturerId =
  | 'carlisle'
  | 'johns-manville'
  | 'soprema'
  | 'versico'
  | 'duro-last'
  | 'mule-hide'
  | 'polyglass'
  | 'pac-clad'
  | 'wr-meadows'
  | 'owens-corning'
  | 'atlas-roofing'
  | 'hunter-panels';

export type ProductTypeId =
  | 'membrane-tpo'
  | 'membrane-epdm'
  | 'membrane-pvc'
  | 'membrane-mod-bit'
  | 'membrane-fleece'
  | 'membrane-generic'
  | 'insulation-polyiso'
  | 'insulation-xps'
  | 'insulation-eps'
  | 'insulation-mineral-wool'
  | 'coating-silicone'
  | 'coating-acrylic'
  | 'coating-asphalt'
  | 'coating-liquid'
  | 'air-barrier'
  | 'vapor-barrier'
  | 'cover-board'
  | 'flashing'
  | 'fastener'
  | 'adhesive'
  | 'sealant'
  | 'primer';

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Generate a product ID from manufacturer and product name
 */
export function generateProductId(manufacturer: string, productName: string): string {
  const mfrKebab = manufacturer
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  const prodKebab = productName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  return `${mfrKebab}-${prodKebab}`;
}

/**
 * Map CSV type to product type ID
 */
export function mapCsvTypeToProductType(csvType: string): ProductTypeId {
  const typeMap: Record<string, ProductTypeId> = {
    'tpo': 'membrane-tpo',
    'epdm': 'membrane-epdm',
    'pvc': 'membrane-pvc',
    'modified bitumen': 'membrane-mod-bit',
    'fleece': 'membrane-fleece',
    'membrane': 'membrane-generic',
    'insulation': 'insulation-polyiso',
    'polyiso': 'insulation-polyiso',
    'coating': 'coating-silicone',
    'adhesive': 'adhesive',
    'fastener': 'fastener',
    'flashing': 'flashing',
    'sealant': 'sealant',
    'vapor': 'vapor-barrier',
    'barrier': 'air-barrier',
    'cover board': 'cover-board',
    'primer': 'primer',
    'liquid applied': 'coating-liquid',
    'base sheet': 'vapor-barrier',
  };

  const normalized = csvType.toLowerCase().trim();
  return typeMap[normalized] || 'membrane-generic';
}
