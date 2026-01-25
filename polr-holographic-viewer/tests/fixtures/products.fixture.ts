/**
 * Product Test Fixtures
 * L0-CMD-2026-0125-002 Phase 6
 *
 * 15 sample products covering various manufacturers and edge cases
 */

import type { Product } from '../../types/products';

// Standard TPO membrane products
export const tpoProducts: Product[] = [
  {
    id: 'jm-tpo-roofing',
    manufacturer: 'johns-manville',
    name: 'TPO Roofing Systems',
    productType: 'membrane-tpo',
    sourceUrl: 'https://www.jm.com/en/commercial-roofing/tpo-roofing-systems/',
    scrapedDate: '2025-12-27'
  },
  {
    id: 'versico-16ft-tpo',
    manufacturer: 'versico',
    name: 'Wider is Better - 16-foot TPO',
    productType: 'membrane-tpo',
    sourceUrl: 'https://www.versico.com/en/Roofing-Products/Membranes/TPO/16-Foot-TPO',
    scrapedDate: '2025-12-27'
  },
  {
    id: 'duro-last-duro-tech-tpo',
    manufacturer: 'duro-last',
    name: 'Duro-TECH TPO',
    productType: 'membrane-tpo',
    sourceUrl: 'https://duro-last.com/duro-tech-tpo/',
    scrapedDate: '2025-12-27'
  }
];

// EPDM membrane products
export const epdmProducts: Product[] = [
  {
    id: 'carlisle-epdm',
    manufacturer: 'carlisle',
    name: 'EPDM',
    productType: 'membrane-epdm',
    sourceUrl: 'https://www.carlislesyntec.com/en/Roofing-Products/Membranes/EPDM',
    scrapedDate: '2025-12-27'
  },
  {
    id: 'jm-epdm-roofing',
    manufacturer: 'johns-manville',
    name: 'EPDM Roofing Systems',
    productType: 'membrane-epdm',
    sourceUrl: 'https://www.jm.com/en/commercial-roofing/epdm-roofing-systems/',
    scrapedDate: '2025-12-27'
  }
];

// Insulation products
export const insulationProducts: Product[] = [
  {
    id: 'owens-corning-xps',
    manufacturer: 'owens-corning',
    name: 'XPS Insulation',
    productType: 'insulation-xps',
    sourceUrl: 'https://www.owenscorning.com/insulation/commercial/foamular-xps',
    scrapedDate: '2025-12-27'
  },
  {
    id: 'atlas-polyiso',
    manufacturer: 'atlas-roofing',
    name: 'Polyiso',
    productType: 'insulation-polyiso',
    sourceUrl: 'https://www.atlasrwi.com/',
    scrapedDate: '2025-12-27'
  },
  {
    id: 'jm-polyisocyanurate',
    manufacturer: 'johns-manville',
    name: 'Polyisocyanurate Insulation',
    productType: 'insulation-polyiso',
    sourceUrl: 'https://www.jm.com/content/jm/global/en/index/industrial-insulation/polyisocyanurate-insulation',
    scrapedDate: '2025-12-27'
  }
];

// Coating products
export const coatingProducts: Product[] = [
  {
    id: 'wr-meadows-silicone-roof-coatings',
    manufacturer: 'wr-meadows',
    name: 'Silicone Roof Coatings',
    productType: 'coating-silicone',
    sourceUrl: 'https://www.wrmeadows.com/knightshield/',
    scrapedDate: '2025-12-27'
  },
  {
    id: 'mule-hide-acrylic-coatings',
    manufacturer: 'mule-hide',
    name: 'Acrylic Coatings',
    productType: 'coating-acrylic',
    sourceUrl: 'https://www.mulehide.com/Products/c/AcrylicCoatings',
    scrapedDate: '2025-12-27'
  }
];

// Air barrier products
export const airBarrierProducts: Product[] = [
  {
    id: 'soprema-air-barriers',
    manufacturer: 'soprema',
    name: 'Air Barriers',
    productType: 'air-barrier',
    sourceUrl: 'https://www.soprema.us/products/market-segment/walls/air-barriers',
    scrapedDate: '2025-12-27'
  },
  {
    id: 'owens-corning-pinkwrap-air-barrier',
    manufacturer: 'owens-corning',
    name: 'PINKWRAP Air Barrier Products',
    productType: 'air-barrier',
    sourceUrl: 'https://www.owenscorning.com/en-us/roofing/pinkwrap',
    scrapedDate: '2025-12-27'
  }
];

// Edge case products
export const edgeCaseProducts: Product[] = [
  // Single manufacturer with unique product
  {
    id: 'hunter-panels-insulation',
    manufacturer: 'hunter-panels',
    name: 'Insulation Insights Blog',
    productType: 'insulation-polyiso',
    sourceUrl: 'https://www.hunterpanels.com/blog/',
    scrapedDate: '2025-12-27'
  },
  // Product with long name
  {
    id: 'wr-meadows-joint-sealants-expansion',
    manufacturer: 'wr-meadows',
    name: 'Joint Sealants & Expansion Joints',
    productType: 'sealant',
    sourceUrl: 'https://www.wrmeadows.com/tag/joint-sealant-expansion-joint-projects/',
    scrapedDate: '2025-12-27'
  },
  // Modified bitumen specific
  {
    id: 'soprema-sbs-mod-bit',
    manufacturer: 'soprema',
    name: 'SBS-Modified Bitumen',
    productType: 'membrane-mod-bit',
    sourceUrl: 'https://www.soprema.us/products/market-segment/roofing/sbs-modified-bitumen',
    scrapedDate: '2025-12-27'
  }
];

// All fixture products combined
export const allFixtureProducts: Product[] = [
  ...tpoProducts,
  ...epdmProducts,
  ...insulationProducts,
  ...coatingProducts,
  ...airBarrierProducts,
  ...edgeCaseProducts
];

// Product IDs by type for easy testing
export const productIdsByType = {
  tpo: tpoProducts.map(p => p.id),
  epdm: epdmProducts.map(p => p.id),
  insulation: insulationProducts.map(p => p.id),
  coating: coatingProducts.map(p => p.id),
  airBarrier: airBarrierProducts.map(p => p.id),
  edgeCase: edgeCaseProducts.map(p => p.id)
};

// Invalid product fixtures for error testing
export const invalidProducts = {
  missingId: {
    manufacturer: 'carlisle',
    name: 'Invalid Product',
    productType: 'membrane-tpo'
  },
  missingManufacturer: {
    id: 'invalid-001',
    name: 'Invalid Product',
    productType: 'membrane-tpo'
  },
  unknownManufacturer: {
    id: 'invalid-002',
    manufacturer: 'unknown-mfr',
    name: 'Unknown Manufacturer Product',
    productType: 'membrane-tpo',
    sourceUrl: 'https://example.com',
    scrapedDate: '2025-12-27'
  }
};
