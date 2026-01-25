/**
 * Features Module Tests
 * Tests for OR-Equal comparison and specification integration
 */

import { describe, it, expect } from 'vitest';
import {
  PRODUCT_EQUIVALENCIES,
  findEquivalentProducts,
  getManufacturersForMaterialType
} from '../features/or-equal-comparison';

describe('OR-Equal Comparison', () => {
  describe('PRODUCT_EQUIVALENCIES', () => {
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
  });
});
