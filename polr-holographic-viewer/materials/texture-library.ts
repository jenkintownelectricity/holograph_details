/**
 * Texture Library System
 * POLR Strategic Development - Phase A2.1
 *
 * Hybrid texture system supporting:
 * - Procedural textures (fallback, always available)
 * - AI-generated textures (high quality) - pending API key
 * - Photo-sourced textures (manufacturer-specific)
 *
 * @module materials/texture-library
 * @version 1.0.0
 */

import * as THREE from 'three';

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export type TextureSource = 'procedural' | 'ai-generated' | 'photo-sourced';
export type TextureQuality = 'low' | 'medium' | 'high' | 'ultra';
export type ProceduralPattern =
  | 'solid' | 'rubberized' | 'granular' | 'fibrous'
  | 'cellular' | 'woven' | 'dimpled' | 'corrugated' | 'brushed' | 'hammered';
export type MaterialCategory =
  | 'membrane-waterproofing' | 'membrane-roofing' | 'membrane-air-barrier'
  | 'insulation' | 'concrete-masonry' | 'metal' | 'sealant' | 'drainage' | 'protection' | 'fastener';

export interface MaterialTexture {
  id: string;
  materialType: string;
  source: TextureSource;
  procedural: {
    color: string;
    roughness: number;
    metalness: number;
    bumpScale: number;
    pattern: ProceduralPattern;
  };
  resolution: number;
  tileSizeMM: number;
  manufacturer?: string;
  productName?: string;
  displayName: string;
  category: MaterialCategory;
  tags: string[];
}

export interface TextureLoadOptions {
  quality?: TextureQuality;
  preferredSource?: TextureSource;
  manufacturer?: string;
  anisotropy?: number;
}

// =============================================================================
// TEXTURE LIBRARY CLASS
// =============================================================================

export class TextureLibrary {
  private textures: Map<string, MaterialTexture> = new Map();
  private materialCache: Map<string, THREE.MeshStandardMaterial> = new Map();

  constructor() {
    this.initializeLibrary();
  }

  private initializeLibrary(): void {
    this.registerWaterproofingMembranes();
    this.registerRoofingMembranes();
    this.registerInsulationMaterials();
    this.registerConcreteMasonry();
    this.registerMetalComponents();
    this.registerSealants();
    this.registerDrainageProtection();
  }

  private registerWaterproofingMembranes(): void {
    this.textures.set('bituthene-3000', {
      id: 'bituthene-3000',
      materialType: 'membrane-self-adhered',
      source: 'procedural',
      procedural: { color: '#1a1a1a', roughness: 0.7, metalness: 0.0, bumpScale: 0.3, pattern: 'rubberized' },
      resolution: 1024, tileSizeMM: 300,
      manufacturer: 'GCP Applied Technologies', productName: 'BITUTHENE 3000',
      displayName: 'BITUTHENE 3000', category: 'membrane-waterproofing',
      tags: ['waterproofing', 'self-adhered', 'below-grade', 'sbs', 'rubberized']
    });

    this.textures.set('perm-a-barrier', {
      id: 'perm-a-barrier',
      materialType: 'membrane-air-barrier',
      source: 'procedural',
      procedural: { color: '#ff6b00', roughness: 0.6, metalness: 0.0, bumpScale: 0.25, pattern: 'rubberized' },
      resolution: 1024, tileSizeMM: 300,
      manufacturer: 'GCP Applied Technologies', productName: 'PERM-A-BARRIER',
      displayName: 'PERM-A-BARRIER', category: 'membrane-air-barrier',
      tags: ['air-barrier', 'self-adhered', 'orange', 'vapor-permeable']
    });

    this.textures.set('miradri-860', {
      id: 'miradri-860',
      materialType: 'membrane-self-adhered',
      source: 'procedural',
      procedural: { color: '#1f1f1f', roughness: 0.65, metalness: 0.0, bumpScale: 0.28, pattern: 'rubberized' },
      resolution: 1024, tileSizeMM: 300,
      manufacturer: 'Carlisle CCW', productName: 'MiraDRI 860',
      displayName: 'MiraDRI 860', category: 'membrane-waterproofing',
      tags: ['waterproofing', 'self-adhered', 'below-grade']
    });

    this.textures.set('tremproof-250gc', {
      id: 'tremproof-250gc',
      materialType: 'membrane-self-adhered',
      source: 'procedural',
      procedural: { color: '#2a2a2a', roughness: 0.72, metalness: 0.0, bumpScale: 0.32, pattern: 'rubberized' },
      resolution: 1024, tileSizeMM: 300,
      manufacturer: 'Tremco', productName: 'TREMproof 250GC',
      displayName: 'TREMproof 250GC', category: 'membrane-waterproofing',
      tags: ['waterproofing', 'self-adhered', 'below-grade']
    });
  }

  private registerRoofingMembranes(): void {
    this.textures.set('tpo-white', {
      id: 'tpo-white',
      materialType: 'membrane-tpo',
      source: 'procedural',
      procedural: { color: '#f5f5f5', roughness: 0.35, metalness: 0.0, bumpScale: 0.1, pattern: 'solid' },
      resolution: 1024, tileSizeMM: 500,
      displayName: 'TPO Membrane (White)', category: 'membrane-roofing',
      tags: ['roofing', 'single-ply', 'tpo', 'white', 'reflective']
    });

    this.textures.set('epdm-black', {
      id: 'epdm-black',
      materialType: 'membrane-epdm',
      source: 'procedural',
      procedural: { color: '#0d0d0d', roughness: 0.8, metalness: 0.0, bumpScale: 0.15, pattern: 'rubberized' },
      resolution: 1024, tileSizeMM: 500,
      displayName: 'EPDM Membrane (Black)', category: 'membrane-roofing',
      tags: ['roofing', 'single-ply', 'epdm', 'rubber', 'black']
    });

    this.textures.set('mod-bit-cap', {
      id: 'mod-bit-cap',
      materialType: 'membrane-mod-bit',
      source: 'procedural',
      procedural: { color: '#2d2d2d', roughness: 0.85, metalness: 0.0, bumpScale: 0.5, pattern: 'granular' },
      resolution: 1024, tileSizeMM: 400,
      displayName: 'Modified Bitumen Cap Sheet', category: 'membrane-roofing',
      tags: ['roofing', 'modified-bitumen', 'cap-sheet', 'granular']
    });
  }

  private registerInsulationMaterials(): void {
    this.textures.set('xps-pink', {
      id: 'xps-pink',
      materialType: 'insulation-xps',
      source: 'procedural',
      procedural: { color: '#ffb6c1', roughness: 0.9, metalness: 0.0, bumpScale: 0.2, pattern: 'cellular' },
      resolution: 1024, tileSizeMM: 600,
      manufacturer: 'Owens Corning', productName: 'FOAMULAR',
      displayName: 'XPS Insulation (Pink)', category: 'insulation',
      tags: ['insulation', 'xps', 'rigid', 'pink', 'below-grade']
    });

    this.textures.set('xps-blue', {
      id: 'xps-blue',
      materialType: 'insulation-xps',
      source: 'procedural',
      procedural: { color: '#4a90d9', roughness: 0.88, metalness: 0.0, bumpScale: 0.18, pattern: 'cellular' },
      resolution: 1024, tileSizeMM: 600,
      manufacturer: 'DuPont (DOW)', productName: 'STYROFOAM',
      displayName: 'XPS Insulation (Blue)', category: 'insulation',
      tags: ['insulation', 'xps', 'rigid', 'blue', 'below-grade']
    });

    this.textures.set('polyiso-foil', {
      id: 'polyiso-foil',
      materialType: 'insulation-polyiso',
      source: 'procedural',
      procedural: { color: '#d4af37', roughness: 0.3, metalness: 0.7, bumpScale: 0.05, pattern: 'solid' },
      resolution: 1024, tileSizeMM: 600,
      displayName: 'Polyiso (Foil Faced)', category: 'insulation',
      tags: ['insulation', 'polyiso', 'rigid', 'foil', 'reflective']
    });

    this.textures.set('mineral-wool', {
      id: 'mineral-wool',
      materialType: 'insulation-mineral-wool',
      source: 'procedural',
      procedural: { color: '#7a6e5d', roughness: 0.95, metalness: 0.0, bumpScale: 0.4, pattern: 'fibrous' },
      resolution: 1024, tileSizeMM: 500,
      displayName: 'Mineral Wool Board', category: 'insulation',
      tags: ['insulation', 'mineral-wool', 'rigid', 'fire-resistant']
    });
  }

  private registerConcreteMasonry(): void {
    this.textures.set('concrete-formed', {
      id: 'concrete-formed',
      materialType: 'concrete-cip',
      source: 'procedural',
      procedural: { color: '#808080', roughness: 0.85, metalness: 0.0, bumpScale: 0.35, pattern: 'solid' },
      resolution: 1024, tileSizeMM: 600,
      displayName: 'Cast-in-Place Concrete', category: 'concrete-masonry',
      tags: ['concrete', 'formed', 'foundation', 'structural']
    });

    this.textures.set('cmu-block', {
      id: 'cmu-block',
      materialType: 'masonry-cmu',
      source: 'procedural',
      procedural: { color: '#6e6e6e', roughness: 0.9, metalness: 0.0, bumpScale: 0.3, pattern: 'solid' },
      resolution: 1024, tileSizeMM: 400,
      displayName: 'Concrete Masonry Unit', category: 'concrete-masonry',
      tags: ['masonry', 'cmu', 'block', 'backup']
    });
  }

  private registerMetalComponents(): void {
    this.textures.set('galvanized-steel', {
      id: 'galvanized-steel',
      materialType: 'metal-galvanized',
      source: 'procedural',
      procedural: { color: '#b8b8b8', roughness: 0.4, metalness: 0.85, bumpScale: 0.1, pattern: 'hammered' },
      resolution: 1024, tileSizeMM: 300,
      displayName: 'Galvanized Steel', category: 'metal',
      tags: ['metal', 'steel', 'galvanized', 'flashing']
    });

    this.textures.set('stainless-steel', {
      id: 'stainless-steel',
      materialType: 'metal-stainless',
      source: 'procedural',
      procedural: { color: '#c0c0c0', roughness: 0.25, metalness: 0.9, bumpScale: 0.05, pattern: 'brushed' },
      resolution: 1024, tileSizeMM: 300,
      displayName: 'Stainless Steel', category: 'metal',
      tags: ['metal', 'steel', 'stainless', 'flashing']
    });

    this.textures.set('aluminum-mill', {
      id: 'aluminum-mill',
      materialType: 'metal-aluminum',
      source: 'procedural',
      procedural: { color: '#d0d0d0', roughness: 0.35, metalness: 0.88, bumpScale: 0.08, pattern: 'brushed' },
      resolution: 1024, tileSizeMM: 300,
      displayName: 'Aluminum (Mill Finish)', category: 'metal',
      tags: ['metal', 'aluminum', 'termination-bar', 'coping']
    });
  }

  private registerSealants(): void {
    this.textures.set('sealant-pu-gray', {
      id: 'sealant-pu-gray',
      materialType: 'sealant-polyurethane',
      source: 'procedural',
      procedural: { color: '#5a5a5a', roughness: 0.5, metalness: 0.0, bumpScale: 0.1, pattern: 'solid' },
      resolution: 512, tileSizeMM: 100,
      displayName: 'Polyurethane Sealant (Gray)', category: 'sealant',
      tags: ['sealant', 'polyurethane', 'joint', 'gray']
    });

    this.textures.set('mastic-black', {
      id: 'mastic-black',
      materialType: 'sealant-mastic',
      source: 'procedural',
      procedural: { color: '#1a1a1a', roughness: 0.75, metalness: 0.0, bumpScale: 0.3, pattern: 'fibrous' },
      resolution: 512, tileSizeMM: 200,
      displayName: 'Fibered Mastic (Black)', category: 'sealant',
      tags: ['mastic', 'fibered', 'termination', 'black']
    });
  }

  private registerDrainageProtection(): void {
    this.textures.set('drainage-composite', {
      id: 'drainage-composite',
      materialType: 'drainage-composite',
      source: 'procedural',
      procedural: { color: '#1a1a1a', roughness: 0.8, metalness: 0.0, bumpScale: 0.6, pattern: 'dimpled' },
      resolution: 1024, tileSizeMM: 400,
      displayName: 'Drainage Composite Board', category: 'drainage',
      tags: ['drainage', 'composite', 'dimpled', 'below-grade']
    });

    this.textures.set('protection-board', {
      id: 'protection-board',
      materialType: 'protection-board',
      source: 'procedural',
      procedural: { color: '#2a2a2a', roughness: 0.85, metalness: 0.0, bumpScale: 0.25, pattern: 'fibrous' },
      resolution: 1024, tileSizeMM: 500,
      displayName: 'Protection Board', category: 'protection',
      tags: ['protection', 'board', 'below-grade', 'asphaltic']
    });

    this.textures.set('filter-fabric', {
      id: 'filter-fabric',
      materialType: 'geotextile',
      source: 'procedural',
      procedural: { color: '#f0f0f0', roughness: 0.9, metalness: 0.0, bumpScale: 0.15, pattern: 'woven' },
      resolution: 1024, tileSizeMM: 300,
      displayName: 'Non-Woven Filter Fabric', category: 'drainage',
      tags: ['geotextile', 'filter', 'fabric', 'drainage']
    });
  }

  // ===========================================================================
  // PUBLIC API
  // ===========================================================================

  async getMaterial(materialId: string, options: TextureLoadOptions = {}): Promise<THREE.MeshStandardMaterial> {
    const quality = options.quality || 'high';
    const cacheKey = `${materialId}-${quality}-${options.manufacturer || 'any'}`;

    if (this.materialCache.has(cacheKey)) {
      return this.materialCache.get(cacheKey)!.clone();
    }

    const texture = this.textures.get(materialId);

    if (!texture) {
      console.warn(`Material not found: ${materialId}`);
      return new THREE.MeshStandardMaterial({ color: 0x808080 });
    }

    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color(texture.procedural.color),
      roughness: texture.procedural.roughness,
      metalness: texture.procedural.metalness,
      side: THREE.DoubleSide
    });

    this.materialCache.set(cacheKey, material);
    return material.clone();
  }

  getMaterialsByCategory(category: MaterialCategory): MaterialTexture[] {
    return Array.from(this.textures.values()).filter(t => t.category === category);
  }

  getMaterialsByManufacturer(manufacturer: string): MaterialTexture[] {
    return Array.from(this.textures.values())
      .filter(t => t.manufacturer?.toLowerCase() === manufacturer.toLowerCase());
  }

  searchMaterials(query: string): MaterialTexture[] {
    const terms = query.toLowerCase().split(/\s+/);
    return Array.from(this.textures.values())
      .filter(t =>
        terms.every(term =>
          t.tags.some(tag => tag.includes(term)) ||
          t.displayName.toLowerCase().includes(term) ||
          t.materialType.toLowerCase().includes(term)
        )
      );
  }

  getTextureDefinition(id: string): MaterialTexture | undefined {
    return this.textures.get(id);
  }

  listAllMaterials(): string[] {
    return Array.from(this.textures.keys());
  }

  clearCache(): void {
    this.materialCache.forEach(mat => mat.dispose());
    this.materialCache.clear();
  }
}

export const textureLibrary = new TextureLibrary();
