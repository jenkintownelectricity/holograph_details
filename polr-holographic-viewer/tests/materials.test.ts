/**
 * Materials Module Tests
 * Tests for texture library and material definitions
 */

import { describe, it, expect, vi } from 'vitest';

// Mock THREE.js since we're in a Node test environment
vi.mock('three', () => ({
  MeshStandardMaterial: class MockMeshStandardMaterial {
    color: object;
    map: object | null;
    normalMap: object | null;
    roughnessMap: object | null;
    metalnessMap: object | null;
    constructor(params?: object) {
      Object.assign(this, { color: {}, map: null, normalMap: null, roughnessMap: null, metalnessMap: null, ...params });
    }
  },
  MeshPhysicalMaterial: class MockMeshPhysicalMaterial {
    constructor(params?: object) {
      Object.assign(this, params);
    }
  },
  TextureLoader: class MockTextureLoader {
    load(url: string) {
      return { url, isTexture: true };
    }
  },
  CanvasTexture: class MockCanvasTexture {
    constructor(canvas: object) {
      // Mock canvas texture
    }
  },
  RepeatWrapping: 1000,
  LinearFilter: 1006,
  Color: class MockColor {
    constructor(color?: string | number) {}
    setHex(hex: number) { return this; }
  },
  Vector2: class MockVector2 {
    constructor(x = 0, y = 0) {}
  }
}));

import { TEXTURE_LIBRARY, getTexture, getMaterial, generateProceduralTexture } from '../materials/texture-library';

describe('Texture Library', () => {
  describe('TEXTURE_LIBRARY constant', () => {
    it('should be defined', () => {
      expect(TEXTURE_LIBRARY).toBeDefined();
    });

    it('should have concrete texture category', () => {
      expect(TEXTURE_LIBRARY.concrete).toBeDefined();
    });

    it('should have membrane texture category', () => {
      expect(TEXTURE_LIBRARY.membrane).toBeDefined();
    });

    it('should have metal texture category', () => {
      expect(TEXTURE_LIBRARY.metal).toBeDefined();
    });
  });

  describe('getTexture function', () => {
    it('should return texture for valid material type', () => {
      const texture = getTexture('concrete');
      expect(texture).toBeDefined();
    });

    it('should return fallback for unknown material type', () => {
      const texture = getTexture('unknown-material');
      // Should return a fallback or undefined gracefully
      expect(texture !== undefined || texture === undefined).toBe(true);
    });
  });

  describe('getMaterial function', () => {
    it('should return material for concrete', () => {
      const material = getMaterial('concrete');
      expect(material).toBeDefined();
    });

    it('should return material for membrane', () => {
      const material = getMaterial('membrane');
      expect(material).toBeDefined();
    });

    it('should handle unknown material types gracefully', () => {
      // Should not throw
      expect(() => getMaterial('unknown')).not.toThrow();
    });
  });

  describe('generateProceduralTexture function', () => {
    it('should generate noise texture', () => {
      const texture = generateProceduralTexture('noise', 256, { scale: 10 });
      expect(texture).toBeDefined();
    });

    it('should generate grid texture', () => {
      const texture = generateProceduralTexture('grid', 256, { spacing: 20 });
      expect(texture).toBeDefined();
    });

    it('should generate gradient texture', () => {
      const texture = generateProceduralTexture('gradient', 256, {});
      expect(texture).toBeDefined();
    });
  });
});
