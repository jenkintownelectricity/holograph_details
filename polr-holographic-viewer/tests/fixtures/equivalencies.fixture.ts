/**
 * Equivalency Test Fixtures
 * L0-CMD-2026-0125-002 Phase 6
 *
 * Test fixtures for OR-Equal product comparison functionality
 */

// TPO membrane equivalency test cases
export const tpoEquivalencies = {
  category: 'membrane-tpo',
  products: [
    { manufacturer: 'johns-manville', productId: 'jm-tpo-roofing' },
    { manufacturer: 'versico', productId: 'versico-16ft-tpo' },
    { manufacturer: 'duro-last', productId: 'duro-last-duro-tech-tpo' },
    { manufacturer: 'carlisle', productId: 'carlisle-tpo' }
  ],
  expectedMatches: 4
};

// EPDM membrane equivalency test cases
export const epdmEquivalencies = {
  category: 'membrane-epdm',
  products: [
    { manufacturer: 'carlisle', productId: 'carlisle-epdm' },
    { manufacturer: 'johns-manville', productId: 'jm-epdm-roofing' },
    { manufacturer: 'firestone', productId: 'firestone-rubbergard' }
  ],
  expectedMatches: 3
};

// Insulation equivalency test cases
export const insulationEquivalencies = {
  polyiso: {
    category: 'insulation-polyiso',
    products: [
      { manufacturer: 'atlas-roofing', productId: 'atlas-polyiso' },
      { manufacturer: 'johns-manville', productId: 'jm-polyisocyanurate' },
      { manufacturer: 'hunter-panels', productId: 'hunter-panels-insulation' }
    ],
    expectedMatches: 3
  },
  xps: {
    category: 'insulation-xps',
    products: [
      { manufacturer: 'owens-corning', productId: 'owens-corning-xps' },
      { manufacturer: 'dow', productId: 'dow-styrofoam' }
    ],
    expectedMatches: 2
  }
};

// Coating equivalency test cases
export const coatingEquivalencies = {
  silicone: {
    category: 'coating-silicone',
    products: [
      { manufacturer: 'carlisle', productId: 'carlisle-coatings' },
      { manufacturer: 'duro-last', productId: 'duro-last-duro-shield-coatings' },
      { manufacturer: 'wr-meadows', productId: 'wr-meadows-silicone-roof-coatings' }
    ],
    expectedMatches: 3
  },
  acrylic: {
    category: 'coating-acrylic',
    products: [
      { manufacturer: 'mule-hide', productId: 'mule-hide-acrylic-coatings' },
      { manufacturer: 'polyglass', productId: 'polyglass-elastomeric-coatings' }
    ],
    expectedMatches: 2
  }
};

// Air barrier equivalency test cases
export const airBarrierEquivalencies = {
  category: 'air-barrier',
  products: [
    { manufacturer: 'soprema', productId: 'soprema-air-barriers' },
    { manufacturer: 'wr-meadows', productId: 'wr-meadows-fluid-air-barriers' },
    { manufacturer: 'owens-corning', productId: 'owens-corning-pinkwrap-air-barrier' },
    { manufacturer: 'gcp', productId: 'gcp-perm-a-barrier' }
  ],
  expectedMatches: 4
};

// Cross-manufacturer comparison test cases
export const crossManufacturerTests = [
  {
    description: 'TPO membrane from different manufacturers',
    baseProduct: { manufacturer: 'johns-manville', productId: 'jm-tpo-roofing' },
    expectedEquivalents: ['versico-16ft-tpo', 'duro-last-duro-tech-tpo'],
    minConfidence: 0.8
  },
  {
    description: 'Polyiso insulation cross-manufacturer',
    baseProduct: { manufacturer: 'atlas-roofing', productId: 'atlas-polyiso' },
    expectedEquivalents: ['jm-polyisocyanurate', 'hunter-panels-insulation'],
    minConfidence: 0.85
  },
  {
    description: 'Silicone coating alternatives',
    baseProduct: { manufacturer: 'carlisle', productId: 'carlisle-coatings' },
    expectedEquivalents: ['duro-last-duro-shield-coatings', 'wr-meadows-silicone-roof-coatings'],
    minConfidence: 0.75
  }
];

// Edge case equivalencies
export const edgeCaseEquivalencies = {
  // No equivalents available
  noEquivalents: {
    productId: 'unique-product-no-matches',
    productType: 'specialty-unique',
    expectedMatches: 0
  },
  // Single equivalent
  singleEquivalent: {
    productId: 'limited-market-product',
    productType: 'niche-category',
    expectedMatches: 1
  },
  // Many equivalents (>10)
  manyEquivalents: {
    productId: 'common-adhesive',
    productType: 'adhesive',
    expectedMatches: 10
  }
};

// Confidence score test cases
export const confidenceScoreTests = [
  {
    description: 'High confidence - same product type, similar specs',
    product1: 'jm-tpo-roofing',
    product2: 'versico-16ft-tpo',
    expectedMinConfidence: 0.9
  },
  {
    description: 'Medium confidence - same category, different specs',
    product1: 'carlisle-epdm',
    product2: 'jm-epdm-roofing',
    expectedMinConfidence: 0.7
  },
  {
    description: 'Low confidence - related but different categories',
    product1: 'mule-hide-acrylic-coatings',
    product2: 'polyglass-protective-coatings',
    expectedMinConfidence: 0.5
  }
];

// Specification comparison data
export const specComparisonData = {
  tpo60mil: {
    products: ['jm-tpo-60', 'versico-tpo-60', 'duro-last-tpo-60'],
    thickness: 60,
    unit: 'mil',
    reinforcement: 'polyester'
  },
  polyiso2inch: {
    products: ['atlas-polyiso-2', 'jm-polyiso-2', 'hunter-polyiso-2'],
    thickness: 2,
    unit: 'inch',
    rValue: 12.1
  }
};
