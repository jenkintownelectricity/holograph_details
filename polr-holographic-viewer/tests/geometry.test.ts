/**
 * Geometry Module Tests
 * Tests for realistic detail geometry generation
 * Updated for L0-CMD-2026-0125-003 with complete Three.js mocks
 */

import { describe, it, expect } from 'vitest';

// Three.js is mocked via vitest.config.ts alias to tests/__mocks__/three.ts

import {
  createFastener,
  createSealantBead,
  createTerminationBar,
  createStressPlate,
  RealisticDetails
} from '../geometry/realistic-details';

describe('Geometry - Realistic Details', () => {
  describe('createFastener', () => {
    it('should create a screw fastener mesh', () => {
      const fastener = createFastener('screw');
      expect(fastener).toBeDefined();
      expect(fastener.geometry).toBeDefined();
      expect(fastener.material).toBeDefined();
    });

    it('should create a rivet fastener mesh', () => {
      const fastener = createFastener('rivet');
      expect(fastener).toBeDefined();
    });

    it('should create a bolt fastener mesh', () => {
      const fastener = createFastener('bolt');
      expect(fastener).toBeDefined();
    });
  });

  describe('createSealantBead', () => {
    it('should create a sealant bead of specified length', () => {
      const bead = createSealantBead(100, {
        diameter: 10,
        color: 0x333333,
        waviness: 0.1
      });
      expect(bead).toBeDefined();
    });

    it('should create bead with default config', () => {
      const bead = createSealantBead(50, {
        diameter: 8,
        color: 0x000000,
        waviness: 0
      });
      expect(bead).toBeDefined();
    });
  });

  describe('createTerminationBar', () => {
    it('should create a termination bar group', () => {
      const bar = createTerminationBar(200);
      expect(bar).toBeDefined();
      expect(bar.children).toBeDefined();
    });

    it('should create bar with custom config', () => {
      const bar = createTerminationBar(150, {
        width: 30,
        thickness: 3,
        fastenerSpacing: 100
      });
      expect(bar).toBeDefined();
    });
  });

  describe('createStressPlate', () => {
    it('should create a stress plate with default diameter', () => {
      const plate = createStressPlate();
      expect(plate).toBeDefined();
    });

    it('should create a stress plate with custom diameter', () => {
      const plate = createStressPlate(100);
      expect(plate).toBeDefined();
    });
  });

  describe('RealisticDetails export object', () => {
    it('should export all creation functions', () => {
      expect(RealisticDetails.createFastener).toBeDefined();
      expect(RealisticDetails.createSealantBead).toBeDefined();
      expect(RealisticDetails.createTerminationBar).toBeDefined();
      expect(RealisticDetails.createStressPlate).toBeDefined();
    });
  });
});
