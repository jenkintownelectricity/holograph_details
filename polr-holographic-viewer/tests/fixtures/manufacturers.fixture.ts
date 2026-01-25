/**
 * Manufacturer Test Fixtures
 * L0-CMD-2026-0125-002 Phase 6
 *
 * Manufacturer fixtures for testing product database operations
 */

import type { Manufacturer } from '../../types/products';

// Major roofing manufacturers
export const majorManufacturers: Manufacturer[] = [
  {
    id: 'carlisle',
    name: 'Carlisle',
    displayName: 'Carlisle SynTec Systems',
    website: 'https://www.carlislesyntec.com',
    categories: ['roofing', 'membranes', 'insulation', 'coatings']
  },
  {
    id: 'johns-manville',
    name: 'Johns Manville',
    displayName: 'Johns Manville',
    website: 'https://www.jm.com',
    categories: ['roofing', 'insulation', 'membranes', 'tpo', 'pvc', 'epdm']
  },
  {
    id: 'soprema',
    name: 'SOPREMA',
    displayName: 'SOPREMA Inc.',
    website: 'https://www.soprema.us',
    categories: ['roofing', 'modified-bitumen', 'air-barriers', 'waterproofing']
  }
];

// Specialty manufacturers
export const specialtyManufacturers: Manufacturer[] = [
  {
    id: 'wr-meadows',
    name: 'W.R. Meadows',
    displayName: 'W.R. Meadows Inc.',
    website: 'https://www.wrmeadows.com',
    categories: ['sealants', 'vapor-barriers', 'air-barriers', 'coatings']
  },
  {
    id: 'owens-corning',
    name: 'Owens Corning',
    displayName: 'Owens Corning',
    website: 'https://www.owenscorning.com',
    categories: ['insulation', 'xps', 'air-barriers', 'fiberglass']
  }
];

// Single-product manufacturers (edge cases)
export const singleProductManufacturers: Manufacturer[] = [
  {
    id: 'hunter-panels',
    name: 'Hunter Panels',
    displayName: 'Hunter Panels LLC',
    website: 'https://www.hunterpanels.com',
    categories: ['insulation', 'polyiso']
  }
];

// All fixture manufacturers
export const allFixtureManufacturers: Manufacturer[] = [
  ...majorManufacturers,
  ...specialtyManufacturers,
  ...singleProductManufacturers
];

// Manufacturer IDs for quick access
export const manufacturerIds = {
  major: majorManufacturers.map(m => m.id),
  specialty: specialtyManufacturers.map(m => m.id),
  singleProduct: singleProductManufacturers.map(m => m.id),
  all: allFixtureManufacturers.map(m => m.id)
};

// Manufacturer lookup map
export const manufacturerMap = new Map<string, Manufacturer>(
  allFixtureManufacturers.map(m => [m.id, m])
);

// Invalid manufacturer fixtures
export const invalidManufacturers = {
  missingId: {
    name: 'Invalid Manufacturer',
    displayName: 'Invalid MFR Inc.',
    website: 'https://invalid.com',
    categories: ['roofing']
  },
  emptyCategories: {
    id: 'empty-cats',
    name: 'Empty Categories',
    displayName: 'Empty Categories Inc.',
    website: 'https://empty.com',
    categories: []
  },
  invalidWebsite: {
    id: 'bad-url',
    name: 'Bad URL',
    displayName: 'Bad URL Inc.',
    website: 'not-a-valid-url',
    categories: ['roofing']
  }
};

// Manufacturer category groupings
export const manufacturersByCategory = {
  roofing: ['carlisle', 'johns-manville', 'soprema'],
  insulation: ['carlisle', 'johns-manville', 'owens-corning', 'hunter-panels'],
  coatings: ['carlisle', 'wr-meadows'],
  airBarriers: ['soprema', 'wr-meadows', 'owens-corning'],
  sealants: ['wr-meadows']
};
