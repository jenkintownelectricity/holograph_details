/**
 * Test Fixtures Barrel Export
 * L0-CMD-2026-0125-002 Phase 6
 *
 * Central export for all test fixtures
 */

// Product fixtures
export {
  tpoProducts,
  epdmProducts,
  insulationProducts,
  coatingProducts,
  airBarrierProducts,
  edgeCaseProducts,
  allFixtureProducts,
  productIdsByType,
  invalidProducts
} from './products.fixture';

// Manufacturer fixtures
export {
  majorManufacturers,
  specialtyManufacturers,
  singleProductManufacturers,
  allFixtureManufacturers,
  manufacturerIds,
  manufacturerMap,
  invalidManufacturers,
  manufacturersByCategory
} from './manufacturers.fixture';

// Equivalency fixtures
export {
  tpoEquivalencies,
  epdmEquivalencies,
  insulationEquivalencies,
  coatingEquivalencies,
  airBarrierEquivalencies,
  crossManufacturerTests,
  edgeCaseEquivalencies,
  confidenceScoreTests,
  specComparisonData
} from './equivalencies.fixture';

// Construction detail fixtures
export {
  sampleLayers,
  sampleConnections,
  sampleProductRefs,
  roofAssemblyDetail,
  expansionJointDetail,
  airBarrierDetail,
  allTestDetails,
  detailIdsByCategory,
  invalidDetails
} from './details.fixture';

// Specification fixtures
export {
  csiDivisions,
  sampleTPOSpec,
  sampleAirBarrierSpec,
  specGenerationTests,
  orEqualSubstitutionTests,
  productDataSheets
} from './specifications.fixture';

// Type re-exports for convenience
export type { Product, Manufacturer, ProductType } from '../../types/products';
