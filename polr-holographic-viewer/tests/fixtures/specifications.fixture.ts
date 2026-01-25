/**
 * Specification Test Fixtures
 * L0-CMD-2026-0125-002 Phase 6
 *
 * Test fixtures for CSI 3-part specification generation
 */

// CSI Division references
export const csiDivisions = {
  roofing: {
    division: '07',
    title: 'Thermal and Moisture Protection',
    sections: {
      tpo: '07 54 23',
      epdm: '07 53 23',
      pvc: '07 54 19',
      modBit: '07 52 13',
      insulation: '07 22 16',
      vaporBarrier: '07 26 00',
      airBarrier: '07 27 00',
      flashing: '07 62 00'
    }
  },
  sealants: {
    division: '07',
    title: 'Thermal and Moisture Protection',
    sections: {
      jointSealants: '07 92 00',
      elastomericSealants: '07 92 13'
    }
  },
  coatings: {
    division: '07',
    title: 'Thermal and Moisture Protection',
    sections: {
      roofCoatings: '07 56 00',
      elastomericCoatings: '07 56 23'
    }
  }
};

// Sample 3-part specification structure
export const sampleTPOSpec = {
  section: '07 54 23',
  title: 'Thermoplastic Polyolefin (TPO) Roofing',

  part1_general: {
    summary: {
      sectionIncludes: [
        'TPO roofing membrane',
        'Insulation',
        'Fasteners and plates',
        'Flashings and accessories'
      ],
      relatedSections: [
        '07 22 16 - Roof Insulation',
        '07 62 00 - Sheet Metal Flashing',
        '07 92 00 - Joint Sealants'
      ]
    },
    submittals: {
      productData: true,
      shopDrawings: true,
      samples: ['6-inch square membrane sample', 'Color samples'],
      certificates: ['Manufacturer certification', 'Installer certification']
    },
    qualityAssurance: {
      manufacturerQualifications: '10 years minimum experience',
      installerQualifications: 'Factory-trained and certified',
      mockups: 'Required for first 100 SF'
    },
    warranty: {
      manufacturer: '20-year NDL warranty',
      installer: '2-year workmanship warranty'
    }
  },

  part2_products: {
    manufacturers: [
      { name: 'Johns Manville', product: 'TPO Roofing Systems', basis: true },
      { name: 'Versico', product: '16-foot TPO', basis: false },
      { name: 'Duro-Last', product: 'Duro-TECH TPO', basis: false },
      { name: 'Carlisle', product: 'Sure-Weld TPO', basis: false }
    ],
    materials: {
      membrane: {
        type: 'TPO',
        thickness: '60 mil minimum',
        width: 'As required for minimum seams',
        color: 'White, reflective',
        reinforcement: 'Polyester scrim'
      },
      insulation: {
        type: 'Polyisocyanurate',
        thickness: 'As required for R-value',
        rValue: 'R-30 minimum'
      },
      fasteners: {
        type: 'Corrosion-resistant steel',
        length: 'As required for substrate penetration'
      }
    }
  },

  part3_execution: {
    examination: {
      substrateSurface: 'Verify smooth, clean, dry',
      slopes: 'Verify minimum 1/4" per foot'
    },
    preparation: {
      cleaning: 'Remove debris and contaminants',
      priming: 'As recommended by manufacturer'
    },
    installation: {
      generalRequirements: 'Per manufacturer written instructions',
      temperature: 'Minimum 40°F ambient',
      seaming: 'Hot-air welded, minimum 1.5" width'
    },
    fieldQualityControl: {
      inspections: ['Daily visual inspection', 'Final punch list'],
      testing: ['Cut test at seams', 'Flood test if specified']
    }
  }
};

// Sample air barrier specification
export const sampleAirBarrierSpec = {
  section: '07 27 00',
  title: 'Air Barriers',

  part1_general: {
    summary: {
      sectionIncludes: [
        'Fluid-applied air barrier membrane',
        'Primers and accessories',
        'Transition membranes'
      ]
    },
    qualityAssurance: {
      airLeakageRate: '0.04 CFM/SF at 75 Pa maximum',
      testMethod: 'ASTM E2178'
    }
  },

  part2_products: {
    manufacturers: [
      { name: 'W.R. Meadows', product: 'Air-Shield LM', basis: true },
      { name: 'SOPREMA', product: 'SOPRASEAL LM 202 VP', basis: false },
      { name: 'Owens Corning', product: 'PINKWRAP', basis: false }
    ],
    materials: {
      membrane: {
        type: 'Fluid-applied',
        thickness: '40 mil DFT minimum',
        color: 'As selected'
      }
    }
  },

  part3_execution: {
    installation: {
      applicationMethod: 'Spray or roller applied',
      coats: 'Multiple coats to achieve DFT',
      curing: 'Per manufacturer requirements'
    }
  }
};

// Specification generation test cases
export const specGenerationTests = [
  {
    description: 'Generate TPO specification from detail',
    detailId: 'RF-TEST-001',
    expectedSection: '07 54 23',
    expectedManufacturers: ['johns-manville', 'versico', 'duro-last']
  },
  {
    description: 'Generate air barrier specification',
    detailId: 'AB-TEST-001',
    expectedSection: '07 27 00',
    expectedManufacturers: ['wr-meadows', 'soprema', 'owens-corning']
  },
  {
    description: 'Generate insulation specification',
    detailId: 'INS-TEST-001',
    expectedSection: '07 22 16',
    expectedManufacturers: ['atlas-roofing', 'johns-manville', 'hunter-panels']
  }
];

// OR-Equal specification substitution tests
export const orEqualSubstitutionTests = [
  {
    description: 'Substitute TPO manufacturer',
    basisOfDesign: { manufacturer: 'johns-manville', product: 'jm-tpo-roofing' },
    substitution: { manufacturer: 'versico', product: 'versico-16ft-tpo' },
    expectedApproval: 'pre-approved',
    reason: 'Listed in specification as acceptable'
  },
  {
    description: 'Substitute unlisted manufacturer',
    basisOfDesign: { manufacturer: 'johns-manville', product: 'jm-tpo-roofing' },
    substitution: { manufacturer: 'unlisted-mfr', product: 'generic-tpo' },
    expectedApproval: 'requires-review',
    reason: 'Not listed in specification'
  }
];

// Product data sheet references
export const productDataSheets = {
  'jm-tpo-roofing': {
    url: 'https://www.jm.com/content/dam/jm/global/en/commercial-roofing/tpo/TPO-Product-Data.pdf',
    thickness: [45, 60, 80],
    widths: [6, 8, 10, 12],
    colors: ['white', 'tan', 'gray']
  },
  'atlas-polyiso': {
    url: 'https://www.atlasrwi.com/docs/polyiso-data-sheet.pdf',
    thickness: [1, 1.5, 2, 2.5, 3, 4],
    rValues: [6.0, 9.0, 12.1, 15.1, 18.2, 24.3],
    facers: ['glass', 'coated-glass', 'foil']
  }
};
