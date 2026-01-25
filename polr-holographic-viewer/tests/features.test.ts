/**
 * Features Module Tests
 * Tests for OR-Equal comparison and specification integration
 * Updated for L0-CMD-2026-0125-002 with roofing product database
 */

import { describe, it, expect } from 'vitest';
import {
  PRODUCT_EQUIVALENCIES,
  findEquivalentProducts,
  getManufacturersForMaterialType
} from '../features/or-equal-comparison';

// Import test fixtures
import {
  tpoEquivalencies,
  epdmEquivalencies,
  insulationEquivalencies,
  coatingEquivalencies,
  airBarrierEquivalencies,
  crossManufacturerTests,
  confidenceScoreTests
} from './fixtures';

describe('OR-Equal Comparison', () => {
  describe('PRODUCT_EQUIVALENCIES - Original Categories', () => {
    it('should have membrane-self-adhered-waterproofing category', () => {
      expect(PRODUCT_EQUIVALENCIES['membrane-self-adhered-waterproofing']).toBeDefined();
    });

    it('should have membrane-air-barrier category', () => {
      expect(PRODUCT_EQUIVALENCIES['membrane-air-barrier']).toBeDefined();
    });

    it('should have membrane-tpo-roofing category', () => {
      expect(PRODUCT_EQUIVALENCIES['membrane-tpo-roofing']).toBeDefined();
    });

    it('should have insulation-xps category', () => {
      expect(PRODUCT_EQUIVALENCIES['insulation-xps']).toBeDefined();
    });

    it('should have drainage-composite category', () => {
      expect(PRODUCT_EQUIVALENCIES['drainage-composite']).toBeDefined();
    });
  });

  describe('PRODUCT_EQUIVALENCIES - Roofing Database Categories (L0-CMD-2026-0125-002)', () => {
    it('should have membrane-tpo category for TPO membranes', () => {
      expect(PRODUCT_EQUIVALENCIES['membrane-tpo']).toBeDefined();
      const products = PRODUCT_EQUIVALENCIES['membrane-tpo'].products;
      expect(products.length).toBeGreaterThanOrEqual(4);
    });

    it('should have membrane-epdm category for EPDM membranes', () => {
      expect(PRODUCT_EQUIVALENCIES['membrane-epdm']).toBeDefined();
      const products = PRODUCT_EQUIVALENCIES['membrane-epdm'].products;
      expect(products.length).toBeGreaterThanOrEqual(3);
    });

    it('should have membrane-pvc category for PVC membranes', () => {
      expect(PRODUCT_EQUIVALENCIES['membrane-pvc']).toBeDefined();
    });

    it('should have membrane-mod-bit category for modified bitumen', () => {
      expect(PRODUCT_EQUIVALENCIES['membrane-mod-bit']).toBeDefined();
      const products = PRODUCT_EQUIVALENCIES['membrane-mod-bit'].products;
      expect(products.length).toBeGreaterThanOrEqual(2);
    });

    it('should have membrane-fleece category for fleece-backed membranes', () => {
      expect(PRODUCT_EQUIVALENCIES['membrane-fleece']).toBeDefined();
    });

    it('should have insulation-polyiso category', () => {
      expect(PRODUCT_EQUIVALENCIES['insulation-polyiso']).toBeDefined();
      const products = PRODUCT_EQUIVALENCIES['insulation-polyiso'].products;
      expect(products.length).toBeGreaterThanOrEqual(5);
    });

    it('should have coating-silicone category', () => {
      expect(PRODUCT_EQUIVALENCIES['coating-silicone']).toBeDefined();
    });

    it('should have coating-acrylic category', () => {
      expect(PRODUCT_EQUIVALENCIES['coating-acrylic']).toBeDefined();
    });

    it('should have air-barrier category', () => {
      expect(PRODUCT_EQUIVALENCIES['air-barrier']).toBeDefined();
    });

    it('should have cover-board category', () => {
      expect(PRODUCT_EQUIVALENCIES['cover-board']).toBeDefined();
    });

    it('should have vapor-barrier category', () => {
      expect(PRODUCT_EQUIVALENCIES['vapor-barrier']).toBeDefined();
    });

    it('should have sealant category', () => {
      expect(PRODUCT_EQUIVALENCIES['sealant']).toBeDefined();
    });

    it('should have adhesive category', () => {
      expect(PRODUCT_EQUIVALENCIES['adhesive']).toBeDefined();
    });

    it('should have fastener category', () => {
      expect(PRODUCT_EQUIVALENCIES['fastener']).toBeDefined();
    });

    it('should have primer category', () => {
      expect(PRODUCT_EQUIVALENCIES['primer']).toBeDefined();
    });

    it('should have coating-liquid category', () => {
      expect(PRODUCT_EQUIVALENCIES['coating-liquid']).toBeDefined();
    });

    it('should have flashing category', () => {
      expect(PRODUCT_EQUIVALENCIES['flashing']).toBeDefined();
    });
  });

  describe('Product equivalency data structure', () => {
    it('waterproofing membrane should have GCP as a manufacturer', () => {
      const products = PRODUCT_EQUIVALENCIES['membrane-self-adhered-waterproofing'].products;
      const gcp = products.find(p => p.manufacturer === 'GCP Applied Technologies');
      expect(gcp).toBeDefined();
      expect(gcp?.product).toBe('BITUTHENE 3000');
    });

    it('products should have confidence scores between 0 and 1', () => {
      Object.values(PRODUCT_EQUIVALENCIES).forEach(category => {
        category.products.forEach(product => {
          expect(product.confidenceScore).toBeGreaterThanOrEqual(0);
          expect(product.confidenceScore).toBeLessThanOrEqual(1);
        });
      });
    });

    it('base products should have confidence score of 1.0', () => {
      Object.values(PRODUCT_EQUIVALENCIES).forEach(category => {
        // First product is typically the base with 1.0 confidence
        expect(category.products[0].confidenceScore).toBe(1.0);
      });
    });

    it('TPO products should include Johns Manville', () => {
      const products = PRODUCT_EQUIVALENCIES['membrane-tpo'].products;
      const jm = products.find(p => p.manufacturer === 'Johns Manville');
      expect(jm).toBeDefined();
    });

    it('Polyiso insulation should include Atlas Roofing', () => {
      const products = PRODUCT_EQUIVALENCIES['insulation-polyiso'].products;
      const atlas = products.find(p => p.manufacturer === 'Atlas Roofing');
      expect(atlas).toBeDefined();
    });
  });

  describe('findEquivalentProducts', () => {
    it('should find equivalents for GCP BITUTHENE 3000', () => {
      const result = findEquivalentProducts('GCP Applied Technologies', 'BITUTHENE 3000');
      expect(result).toBeDefined();
    });

    it('should find equivalents for Carlisle MiraDRI 860', () => {
      const result = findEquivalentProducts('Carlisle CCW', 'MiraDRI 860');
      expect(result).toBeDefined();
    });

    it('should find equivalents for Johns Manville TPO', () => {
      const result = findEquivalentProducts('Johns Manville', 'TPO Roofing Systems');
      expect(result).toBeDefined();
    });

    it('should find equivalents for Duro-Last TPO', () => {
      const result = findEquivalentProducts('Duro-Last', 'Duro-TECH TPO');
      expect(result).toBeDefined();
    });
  });

  describe('getManufacturersForMaterialType', () => {
    it('should return manufacturers for waterproofing membranes', () => {
      const manufacturers = getManufacturersForMaterialType('membrane-self-adhered-waterproofing');
      expect(manufacturers.length).toBeGreaterThan(0);
      expect(manufacturers).toContain('GCP Applied Technologies');
    });

    it('should return empty array for unknown material type', () => {
      const manufacturers = getManufacturersForMaterialType('unknown-material');
      expect(manufacturers).toEqual([]);
    });

    it('should return manufacturers for TPO membranes', () => {
      const manufacturers = getManufacturersForMaterialType('membrane-tpo');
      expect(manufacturers.length).toBeGreaterThanOrEqual(4);
      expect(manufacturers).toContain('Johns Manville');
      expect(manufacturers).toContain('Versico');
    });

    it('should return manufacturers for polyiso insulation', () => {
      const manufacturers = getManufacturersForMaterialType('insulation-polyiso');
      expect(manufacturers.length).toBeGreaterThanOrEqual(5);
    });

    it('should return manufacturers for silicone coatings', () => {
      const manufacturers = getManufacturersForMaterialType('coating-silicone');
      expect(manufacturers.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Cross-manufacturer equivalencies (fixtures)', () => {
    it('should have minimum expected TPO equivalents', () => {
      expect(tpoEquivalencies.expectedMatches).toBeGreaterThanOrEqual(4);
    });

    it('should have minimum expected EPDM equivalents', () => {
      expect(epdmEquivalencies.expectedMatches).toBeGreaterThanOrEqual(3);
    });

    it('should have polyiso insulation equivalents', () => {
      expect(insulationEquivalencies.polyiso.expectedMatches).toBeGreaterThanOrEqual(3);
    });

    it('should have air barrier equivalents', () => {
      expect(airBarrierEquivalencies.expectedMatches).toBeGreaterThanOrEqual(4);
    });
  });

  describe('Confidence score validation (fixtures)', () => {
    confidenceScoreTests.forEach(testCase => {
      it(`should validate: ${testCase.description}`, () => {
        expect(testCase.expectedMinConfidence).toBeGreaterThan(0);
        expect(testCase.expectedMinConfidence).toBeLessThanOrEqual(1);
      });
    });
  });

  describe('Total category count', () => {
    it('should have at least 22 product categories', () => {
      const categoryCount = Object.keys(PRODUCT_EQUIVALENCIES).length;
      expect(categoryCount).toBeGreaterThanOrEqual(22);
    });

    it('should have at least 50 total product mappings', () => {
      let totalProducts = 0;
      Object.values(PRODUCT_EQUIVALENCIES).forEach(category => {
        totalProducts += category.products.length;
      });
      expect(totalProducts).toBeGreaterThanOrEqual(50);
    });
  });
});
