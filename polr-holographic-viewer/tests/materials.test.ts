/**
 * Materials Module Tests
 * Tests for texture library and material definitions
 * Updated for L0-CMD-2026-0125-003 with actual texture-library exports
 */

import { describe, it, expect, beforeEach } from 'vitest';

// Three.js is mocked via vitest.config.ts alias to tests/__mocks__/three.ts

import { TextureLibrary, textureLibrary } from '../materials/texture-library';

describe('Texture Library', () => {
  describe('textureLibrary singleton', () => {
    it('should be defined', () => {
      expect(textureLibrary).toBeDefined();
    });

    it('should be an instance of TextureLibrary', () => {
      expect(textureLibrary).toBeInstanceOf(TextureLibrary);
    });
  });

  describe('TextureLibrary class', () => {
    let library: TextureLibrary;

    beforeEach(() => {
      library = new TextureLibrary();
    });

    it('should instantiate without errors', () => {
      expect(library).toBeDefined();
    });

    it('should accept custom CDN base URL', () => {
      const customLibrary = new TextureLibrary({ cdnBaseUrl: '/custom-textures' });
      expect(customLibrary).toBeDefined();
    });
  });

  describe('getMaterial method', () => {
    it('should return a material for bituthene-3000', async () => {
      const material = await textureLibrary.getMaterial('bituthene-3000');
      expect(material).toBeDefined();
    });

    it('should return a material for tpo-white', async () => {
      const material = await textureLibrary.getMaterial('tpo-white');
      expect(material).toBeDefined();
    });

    it('should return a material for epdm-black', async () => {
      const material = await textureLibrary.getMaterial('epdm-black');
      expect(material).toBeDefined();
    });

    it('should return a fallback material for unknown material type', async () => {
      const material = await textureLibrary.getMaterial('unknown-material-type');
      expect(material).toBeDefined();
    });

    it('should handle quality options', async () => {
      const material = await textureLibrary.getMaterial('bituthene-3000', {
        quality: 'high'
      });
      expect(material).toBeDefined();
    });
  });

  describe('getMaterialsByCategory method', () => {
    it('should return materials for membrane-waterproofing category', () => {
      const materials = textureLibrary.getMaterialsByCategory('membrane-waterproofing');
      expect(materials).toBeDefined();
      expect(Array.isArray(materials)).toBe(true);
      expect(materials.length).toBeGreaterThan(0);
    });

    it('should return materials for membrane-roofing category', () => {
      const materials = textureLibrary.getMaterialsByCategory('membrane-roofing');
      expect(materials).toBeDefined();
      expect(Array.isArray(materials)).toBe(true);
    });

    it('should return materials for insulation category', () => {
      const materials = textureLibrary.getMaterialsByCategory('insulation');
      expect(materials).toBeDefined();
      expect(Array.isArray(materials)).toBe(true);
    });
  });

  describe('getMaterialsByManufacturer method', () => {
    it('should return materials for GCP Applied Technologies', () => {
      const materials = textureLibrary.getMaterialsByManufacturer('GCP Applied Technologies');
      expect(materials).toBeDefined();
      expect(Array.isArray(materials)).toBe(true);
      expect(materials.length).toBeGreaterThan(0);
    });

    it('should return materials for Carlisle CCW', () => {
      const materials = textureLibrary.getMaterialsByManufacturer('Carlisle CCW');
      expect(materials).toBeDefined();
      expect(Array.isArray(materials)).toBe(true);
    });

    it('should return empty array for unknown manufacturer', () => {
      const materials = textureLibrary.getMaterialsByManufacturer('Unknown Manufacturer XYZ');
      expect(materials).toBeDefined();
      expect(Array.isArray(materials)).toBe(true);
      expect(materials.length).toBe(0);
    });
  });

  describe('searchMaterials method', () => {
    it('should find materials by search term', () => {
      const results = textureLibrary.searchMaterials('waterproofing');
      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
    });

    it('should find materials for TPO search', () => {
      const results = textureLibrary.searchMaterials('tpo');
      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
    });

    it('should find materials for insulation search', () => {
      const results = textureLibrary.searchMaterials('insulation');
      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
    });
  });

  describe('getTextureDefinition method', () => {
    it('should return texture definition for valid ID', () => {
      const definition = textureLibrary.getTextureDefinition('bituthene-3000');
      expect(definition).toBeDefined();
      expect(definition?.id).toBe('bituthene-3000');
    });

    it('should return undefined for invalid ID', () => {
      const definition = textureLibrary.getTextureDefinition('non-existent-id');
      expect(definition).toBeUndefined();
    });
  });

  describe('listAllMaterials method', () => {
    it('should return array of material IDs', () => {
      const ids = textureLibrary.listAllMaterials();
      expect(ids).toBeDefined();
      expect(Array.isArray(ids)).toBe(true);
      expect(ids.length).toBeGreaterThan(0);
    });

    it('should include expected materials', () => {
      const ids = textureLibrary.listAllMaterials();
      expect(ids).toContain('bituthene-3000');
      expect(ids).toContain('tpo-white');
      expect(ids).toContain('epdm-black');
    });
  });

  describe('clearCache method', () => {
    it('should not throw when called', () => {
      expect(() => textureLibrary.clearCache()).not.toThrow();
    });
  });

  describe('registerTexture method', () => {
    it('should register custom texture', () => {
      const customTexture = {
        id: 'custom-test-texture',
        materialType: 'membrane-custom',
        source: 'procedural' as const,
        textures: {},
        procedural: {
          color: '#ff0000',
          roughness: 0.5,
          metalness: 0.0,
          bumpScale: 0.1,
          pattern: 'solid' as const
        },
        resolution: 1024,
        tileSizeMM: 300,
        displayName: 'Custom Test Texture',
        category: 'membrane-waterproofing' as const,
        tags: ['test', 'custom']
      };

      textureLibrary.registerTexture(customTexture);
      const retrieved = textureLibrary.getTextureDefinition('custom-test-texture');
      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe('custom-test-texture');
    });
  });
});
