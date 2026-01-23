/**
 * Manufacturer Product Mapping
 * Maps specific products to base materials
 *
 * This allows easy addition of any manufacturer's products
 * by simply mapping them to the universal base materials
 */

import { BASE_MATERIALS, BaseMaterial } from './base-materials';

export interface ManufacturerProduct {
  manufacturer: string;
  productName: string;
  productCode?: string;
  baseMaterial: string;           // References BASE_MATERIALS key

  // Overrides (if product differs from base material)
  overrides?: Partial<BaseMaterial>;

  // Product-specific info
  specSheet?: string;             // URL to spec sheet
  detailLibrary?: string;         // URL to CAD details
  color?: string;                 // If different from base

  // Technical data
  warrantyYears?: number;
  temperatureRange?: { min: number; max: number };
}

export interface Manufacturer {
  id: string;
  name: string;
  shortName: string;
  website: string;
  products: ManufacturerProduct[];
  brandColor: string;             // For UI display
}

// ============================================
// GCP APPLIED TECHNOLOGIES (now Sika)
// ============================================

export const GCP: Manufacturer = {
  id: 'gcp',
  name: 'GCP Applied Technologies',
  shortName: 'GCP',
  website: 'https://gcpat.com',
  brandColor: '#005BAA',
  products: [
    // BITUTHENE FAMILY (Waterproofing)
    {
      manufacturer: 'GCP',
      productName: 'BITUTHENE 3000',
      baseMaterial: 'sbs-rubberized-asphalt',
      specSheet: 'https://gcpat.com/en/solutions/products/bituthene-post-applied-waterproofing/bituthene-3000',
      overrides: {
        description: 'Self-adhered rubberized asphalt waterproofing membrane with cross-laminated HDPE film'
      }
    },
    {
      manufacturer: 'GCP',
      productName: 'BITUTHENE 4000',
      baseMaterial: 'sbs-rubberized-asphalt',
      specSheet: 'https://gcpat.com/en/solutions/products/bituthene-post-applied-waterproofing/bituthene-4000'
    },
    {
      manufacturer: 'GCP',
      productName: 'BITUTHENE LOW TEMPERATURE',
      baseMaterial: 'sbs-rubberized-asphalt',
      overrides: {
        visualNotes: 'Same appearance as standard BITUTHENE but formulated for cold weather application'
      }
    },

    // PERM-A-BARRIER FAMILY (Air Barriers)
    {
      manufacturer: 'GCP',
      productName: 'PERM-A-BARRIER NP',
      baseMaterial: 'sbs-rubberized-asphalt-orange',
      specSheet: 'https://gcpat.com/en/solutions/products/perm-barrier-air-barrier-system',
      overrides: {
        description: 'Self-adhered air and vapor barrier membrane - orange for visibility'
      }
    },
    {
      manufacturer: 'GCP',
      productName: 'PERM-A-BARRIER VPL 50',
      baseMaterial: 'fluid-applied-rubber',
      overrides: {
        color: '#2d2d2d',
        description: 'Fluid-applied vapor permeable air barrier'
      }
    },
    {
      manufacturer: 'GCP',
      productName: 'PERM-A-BARRIER Aluminum Flashing',
      baseMaterial: 'sbs-rubberized-asphalt',
      overrides: {
        color: '#c0c0c0',
        metalness: 0.6,
        description: 'Self-adhered flashing with aluminum facing'
      }
    },

    // PREPRUFE FAMILY (Pre-Applied)
    {
      manufacturer: 'GCP',
      productName: 'PREPRUFE 300R',
      baseMaterial: 'hdpe-film-composite',
      specSheet: 'https://gcpat.com/en/solutions/products/preprufe-pre-applied-waterproofing',
      overrides: {
        description: 'Pre-applied HDPE waterproofing for blindside applications'
      }
    },
    {
      manufacturer: 'GCP',
      productName: 'PREPRUFE 160R',
      baseMaterial: 'hdpe-film-composite'
    },
    {
      manufacturer: 'GCP',
      productName: 'PREPRUFE CJ',
      baseMaterial: 'hdpe-film-composite',
      overrides: {
        description: 'Pre-applied membrane for construction joints'
      }
    },

    // HYDRODUCT FAMILY (Drainage)
    {
      manufacturer: 'GCP',
      productName: 'HYDRODUCT 220',
      baseMaterial: 'drainage-composite',
      overrides: {
        thickness: { min: 6.0, max: 6.0, typical: 6.0 }
      }
    },
    {
      manufacturer: 'GCP',
      productName: 'HYDRODUCT 660',
      baseMaterial: 'drainage-composite',
      overrides: {
        thickness: { min: 16.0, max: 16.0, typical: 16.0 }
      }
    },

    // PROTECTION
    {
      manufacturer: 'GCP',
      productName: 'PROTECTION BOARD',
      baseMaterial: 'protection-board-hdpe'
    },

    // PRIMERS & ACCESSORIES
    {
      manufacturer: 'GCP',
      productName: 'BITUTHENE PRIMER B2',
      baseMaterial: 'primer-asphalt'
    },
    {
      manufacturer: 'GCP',
      productName: 'BITUTHENE LIQUID MEMBRANE',
      baseMaterial: 'fluid-applied-rubber'
    }
  ]
};

// ============================================
// CARLISLE COATINGS & WATERPROOFING (CCW)
// ============================================

export const CARLISLE: Manufacturer = {
  id: 'carlisle',
  name: 'Carlisle Coatings & Waterproofing',
  shortName: 'CCW',
  website: 'https://www.carlisleccw.com',
  brandColor: '#C41230',
  products: [
    // MIRADRI FAMILY
    {
      manufacturer: 'CCW',
      productName: 'CCW MiraDRI 860/861',
      baseMaterial: 'sbs-rubberized-asphalt',
      specSheet: 'https://www.carlisleccw.com/products/miradri-860-861'
    },
    {
      manufacturer: 'CCW',
      productName: 'CCW MiraDRI 860',
      baseMaterial: 'sbs-rubberized-asphalt'
    },

    // AIR BARRIERS
    {
      manufacturer: 'CCW',
      productName: 'Air-Bloc 31',
      baseMaterial: 'sbs-rubberized-asphalt-orange',
      overrides: { color: '#ff5500' }
    },
    {
      manufacturer: 'CCW',
      productName: 'Air-Bloc LF',
      baseMaterial: 'fluid-applied-rubber-gray'
    },

    // DRAINAGE
    {
      manufacturer: 'CCW',
      productName: 'CCW MiraDRAIN 6200',
      baseMaterial: 'drainage-composite'
    }
  ]
};

// ============================================
// SIKA (including acquired GCP products)
// ============================================

export const SIKA: Manufacturer = {
  id: 'sika',
  name: 'Sika Corporation',
  shortName: 'Sika',
  website: 'https://usa.sika.com',
  brandColor: '#E2001A',
  products: [
    // SIKALASTIC
    {
      manufacturer: 'Sika',
      productName: 'Sikalastic RoofPro',
      baseMaterial: 'fluid-applied-rubber'
    },

    // SARNAFIL
    {
      manufacturer: 'Sika',
      productName: 'Sarnafil G410',
      baseMaterial: 'tpo-membrane',
      overrides: {
        description: 'PVC roofing membrane'
      }
    },

    // SIKAFLEX SEALANTS
    {
      manufacturer: 'Sika',
      productName: 'Sikaflex-1a',
      baseMaterial: 'sealant-polyurethane'
    },
    {
      manufacturer: 'Sika',
      productName: 'Sikaflex-15 LM',
      baseMaterial: 'sealant-polyurethane'
    }
  ]
};

// ============================================
// TREMCO
// ============================================

export const TREMCO: Manufacturer = {
  id: 'tremco',
  name: 'Tremco Commercial Sealants & Waterproofing',
  shortName: 'Tremco',
  website: 'https://www.tremcosealants.com',
  brandColor: '#003366',
  products: [
    {
      manufacturer: 'Tremco',
      productName: 'TREMproof 250GC',
      baseMaterial: 'fluid-applied-rubber'
    },
    {
      manufacturer: 'Tremco',
      productName: 'Watchdog Waterproofing',
      baseMaterial: 'sbs-rubberized-asphalt'
    },
    {
      manufacturer: 'Tremco',
      productName: 'ExoAir 110',
      baseMaterial: 'fluid-applied-rubber-gray',
      overrides: {
        description: 'Fluid-applied air and water-resistive barrier'
      }
    },
    {
      manufacturer: 'Tremco',
      productName: 'Dymonic 100',
      baseMaterial: 'sealant-polyurethane'
    }
  ]
};

// ============================================
// W.R. MEADOWS
// ============================================

export const WR_MEADOWS: Manufacturer = {
  id: 'wr-meadows',
  name: 'W.R. Meadows',
  shortName: 'Meadows',
  website: 'https://www.wrmeadows.com',
  brandColor: '#006633',
  products: [
    {
      manufacturer: 'Meadows',
      productName: 'MEL-ROL',
      baseMaterial: 'sbs-rubberized-asphalt'
    },
    {
      manufacturer: 'Meadows',
      productName: 'AIR-SHIELD LM',
      baseMaterial: 'fluid-applied-rubber'
    },
    {
      manufacturer: 'Meadows',
      productName: 'DECK-O-SEAL',
      baseMaterial: 'sealant-polyurethane'
    }
  ]
};

// ============================================
// HENRY COMPANY
// ============================================

export const HENRY: Manufacturer = {
  id: 'henry',
  name: 'Henry Company',
  shortName: 'Henry',
  website: 'https://www.henry.com',
  brandColor: '#FFD100',
  products: [
    {
      manufacturer: 'Henry',
      productName: 'Blueskin VP100',
      baseMaterial: 'sbs-rubberized-asphalt',
      overrides: { color: '#1a3a6e' }
    },
    {
      manufacturer: 'Henry',
      productName: 'Air-Bloc All Weather',
      baseMaterial: 'sbs-rubberized-asphalt-orange'
    },
    {
      manufacturer: 'Henry',
      productName: 'Aqua-Bloc',
      baseMaterial: 'fluid-applied-rubber'
    }
  ]
};

// ============================================
// FIRESTONE BUILDING PRODUCTS
// ============================================

export const FIRESTONE: Manufacturer = {
  id: 'firestone',
  name: 'Firestone Building Products',
  shortName: 'Firestone',
  website: 'https://www.firestonebpco.com',
  brandColor: '#CC0000',
  products: [
    {
      manufacturer: 'Firestone',
      productName: 'RubberGard EPDM',
      baseMaterial: 'epdm-membrane'
    },
    {
      manufacturer: 'Firestone',
      productName: 'UltraPly TPO',
      baseMaterial: 'tpo-membrane'
    },
    {
      manufacturer: 'Firestone',
      productName: 'Secure Bond Adhesive',
      baseMaterial: 'primer-asphalt',
      overrides: {
        description: 'Bonding adhesive for EPDM and TPO'
      }
    }
  ]
};

// ============================================
// DOW / DUPONT
// ============================================

export const DOW: Manufacturer = {
  id: 'dow',
  name: 'Dow Building Solutions',
  shortName: 'Dow',
  website: 'https://www.dow.com',
  brandColor: '#E51937',
  products: [
    {
      manufacturer: 'Dow',
      productName: 'STYROFOAM XPS',
      baseMaterial: 'xps-insulation',
      overrides: { color: '#4da6ff' }  // Dow blue
    },
    {
      manufacturer: 'Dow',
      productName: 'THERMAX Polyiso',
      baseMaterial: 'polyiso-insulation'
    },
    {
      manufacturer: 'Dow',
      productName: 'FROTH-PAK Foam',
      baseMaterial: 'fluid-applied-rubber',
      overrides: {
        color: '#f5e6c8',
        description: 'Spray polyurethane foam insulation'
      }
    }
  ]
};

// ============================================
// MANUFACTURER REGISTRY
// ============================================

export const MANUFACTURERS: Record<string, Manufacturer> = {
  'gcp': GCP,
  'carlisle': CARLISLE,
  'sika': SIKA,
  'tremco': TREMCO,
  'wr-meadows': WR_MEADOWS,
  'henry': HENRY,
  'firestone': FIRESTONE,
  'dow': DOW
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get the resolved material for a manufacturer product
 * Merges base material with any product-specific overrides
 */
export function getProductMaterial(
  manufacturerId: string,
  productName: string
): BaseMaterial | null {
  const manufacturer = MANUFACTURERS[manufacturerId.toLowerCase()];
  if (!manufacturer) return null;

  const product = manufacturer.products.find(
    p => p.productName.toLowerCase() === productName.toLowerCase()
  );
  if (!product) return null;

  const baseMaterial = BASE_MATERIALS[product.baseMaterial];
  if (!baseMaterial) return null;

  // Merge base material with overrides
  if (product.overrides) {
    return {
      ...baseMaterial,
      ...product.overrides,
      texture: {
        ...baseMaterial.texture,
        ...(product.overrides.texture || {})
      },
      thickness: {
        ...baseMaterial.thickness,
        ...(product.overrides.thickness || {})
      }
    } as BaseMaterial;
  }

  return baseMaterial;
}

/**
 * Find all products that use a specific base material
 */
export function findProductsByBaseMaterial(baseMaterialId: string): ManufacturerProduct[] {
  const results: ManufacturerProduct[] = [];

  Object.values(MANUFACTURERS).forEach(manufacturer => {
    manufacturer.products.forEach(product => {
      if (product.baseMaterial === baseMaterialId) {
        results.push(product);
      }
    });
  });

  return results;
}

/**
 * Get all products from a manufacturer
 */
export function getManufacturerProducts(manufacturerId: string): ManufacturerProduct[] {
  return MANUFACTURERS[manufacturerId.toLowerCase()]?.products || [];
}

/**
 * Search products across all manufacturers
 */
export function searchProducts(query: string): ManufacturerProduct[] {
  const results: ManufacturerProduct[] = [];
  const lowerQuery = query.toLowerCase();

  Object.values(MANUFACTURERS).forEach(manufacturer => {
    manufacturer.products.forEach(product => {
      if (
        product.productName.toLowerCase().includes(lowerQuery) ||
        product.manufacturer.toLowerCase().includes(lowerQuery) ||
        product.baseMaterial.toLowerCase().includes(lowerQuery)
      ) {
        results.push(product);
      }
    });
  });

  return results;
}

/**
 * Get manufacturer by ID
 */
export function getManufacturer(id: string): Manufacturer | undefined {
  return MANUFACTURERS[id.toLowerCase()];
}

/**
 * Get all manufacturer names
 */
export function getAllManufacturerNames(): string[] {
  return Object.values(MANUFACTURERS).map(m => m.name);
}
