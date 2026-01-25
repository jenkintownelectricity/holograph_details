/**
 * Texture Library System
 * POLR Strategic Development - Phase A2.1
 * 
 * Hybrid texture system supporting:
 * - Procedural textures (fallback, always available)
 * - AI-generated textures (high quality)
 * - Photo-sourced textures (manufacturer-specific, most accurate)
 * 
 * @module materials/texture-library
 * @version 1.0.0
 * @license Proprietary - Lefebvre Design Solutions
 */

import * as THREE from 'three';
import { PBRTextureSet, TexturePrompt, MATERIAL_PROMPTS } from './ai-texture-generator';

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

/**
 * Source type for texture assets
 */
export type TextureSource = 'procedural' | 'ai-generated' | 'photo-sourced';

/**
 * Quality levels for texture loading
 */
export type TextureQuality = 'low' | 'medium' | 'high' | 'ultra';

/**
 * Complete material texture definition
 */
export interface MaterialTexture {
  /** Unique identifier for this texture set */
  id: string;
  
  /** Base material type (for equivalency mapping) */
  materialType: string;
  
  /** How this texture was created */
  source: TextureSource;
  
  /** Texture file URLs (CDN or local paths) */
  textures: Partial<PBRTextureSet>;
  
  /** Fallback procedural parameters (always available) */
  procedural: {
    color: string;
    roughness: number;
    metalness: number;
    bumpScale: number;
    pattern: ProceduralPattern;
  };
  
  /** Texture resolution in pixels */
  resolution: number;
  
  /** Real-world tile size in millimeters */
  tileSizeMM: number;
  
  /** Manufacturer if brand-specific */
  manufacturer?: string;
  
  /** Product name if specific product */
  productName?: string;
  
  /** Display name for UI */
  displayName: string;
  
  /** Category for organization */
  category: MaterialCategory;
  
  /** Tags for search */
  tags: string[];
}

/**
 * Procedural pattern types
 */
export type ProceduralPattern = 
  | 'solid'
  | 'rubberized'
  | 'granular'
  | 'fibrous'
  | 'cellular'
  | 'woven'
  | 'dimpled'
  | 'corrugated'
  | 'brushed'
  | 'hammered';

/**
 * Material categories
 */
export type MaterialCategory = 
  | 'membrane-waterproofing'
  | 'membrane-roofing'
  | 'membrane-air-barrier'
  | 'insulation'
  | 'concrete-masonry'
  | 'metal'
  | 'sealant'
  | 'drainage'
  | 'protection'
  | 'fastener';

/**
 * Texture loading options
 */
export interface TextureLoadOptions {
  /** Target quality level */
  quality?: TextureQuality;
  /** Preferred source (will fallback if unavailable) */
  preferredSource?: TextureSource;
  /** Specific manufacturer preference */
  manufacturer?: string;
  /** Anisotropic filtering level */
  anisotropy?: number;
  /** Color space (for proper rendering) */
  colorSpace?: THREE.ColorSpace;
}

// =============================================================================
// TEXTURE LIBRARY CLASS
// =============================================================================

/**
 * TextureLibrary
 * 
 * Central repository for all material textures with intelligent
 * fallback system and caching.
 */
export class TextureLibrary {
  private textures: Map<string, MaterialTexture> = new Map();
  private textureLoader: THREE.TextureLoader;
  private loadedTextures: Map<string, THREE.Texture> = new Map();
  private materialCache: Map<string, THREE.MeshStandardMaterial> = new Map();
  
  // CDN base URL for texture assets
  private cdnBaseUrl: string = '/textures';
  
  constructor(options?: { cdnBaseUrl?: string }) {
    if (options?.cdnBaseUrl) {
      this.cdnBaseUrl = options.cdnBaseUrl;
    }
    
    this.textureLoader = new THREE.TextureLoader();
    this.initializeLibrary();
  }
  
  /**
   * Initialize the texture library with all available materials
   */
  private initializeLibrary(): void {
    // Register built-in textures
    this.registerWaterproofingMembranes();
    this.registerRoofingMembranes();
    this.registerInsulationMaterials();
    this.registerConcreteMasonry();
    this.registerMetalComponents();
    this.registerSealants();
    this.registerDrainageProtection();
  }
  
  // ---------------------------------------------------------------------------
  // REGISTRATION: WATERPROOFING MEMBRANES
  // ---------------------------------------------------------------------------
  
  private registerWaterproofingMembranes(): void {
    // GCP BITUTHENE 3000 - Procedural Fallback
    this.textures.set('bituthene-3000', {
      id: 'bituthene-3000',
      materialType: 'membrane-self-adhered',
      source: 'procedural',
      textures: {},
      procedural: {
        color: '#1a1a1a',
        roughness: 0.7,
        metalness: 0.0,
        bumpScale: 0.3,
        pattern: 'rubberized'
      },
      resolution: 1024,
      tileSizeMM: 300,
      manufacturer: 'GCP Applied Technologies',
      productName: 'BITUTHENE 3000',
      displayName: 'BITUTHENE® 3000',
      category: 'membrane-waterproofing',
      tags: ['waterproofing', 'self-adhered', 'below-grade', 'sbs', 'rubberized']
    });
    
    // GCP BITUTHENE 3000 - AI Generated
    this.textures.set('bituthene-3000-ai', {
      id: 'bituthene-3000-ai',
      materialType: 'membrane-self-adhered',
      source: 'ai-generated',
      textures: {
        albedo: `${this.cdnBaseUrl}/ai/gcp-bituthene-3000-albedo.jpg`,
        normal: `${this.cdnBaseUrl}/ai/gcp-bituthene-3000-normal.jpg`,
        roughness: `${this.cdnBaseUrl}/ai/gcp-bituthene-3000-roughness.jpg`,
        ao: `${this.cdnBaseUrl}/ai/gcp-bituthene-3000-ao.jpg`
      },
      procedural: {
        color: '#1a1a1a',
        roughness: 0.7,
        metalness: 0.0,
        bumpScale: 0.3,
        pattern: 'rubberized'
      },
      resolution: 2048,
      tileSizeMM: 300,
      manufacturer: 'GCP Applied Technologies',
      productName: 'BITUTHENE 3000',
      displayName: 'BITUTHENE® 3000',
      category: 'membrane-waterproofing',
      tags: ['waterproofing', 'self-adhered', 'below-grade', 'sbs', 'rubberized']
    });
    
    // GCP PERM-A-BARRIER (Orange Air Barrier)
    this.textures.set('perm-a-barrier', {
      id: 'perm-a-barrier',
      materialType: 'membrane-air-barrier',
      source: 'procedural',
      textures: {},
      procedural: {
        color: '#ff6b00',
        roughness: 0.6,
        metalness: 0.0,
        bumpScale: 0.25,
        pattern: 'rubberized'
      },
      resolution: 1024,
      tileSizeMM: 300,
      manufacturer: 'GCP Applied Technologies',
      productName: 'PERM-A-BARRIER',
      displayName: 'PERM-A-BARRIER®',
      category: 'membrane-air-barrier',
      tags: ['air-barrier', 'self-adhered', 'orange', 'vapor-permeable']
    });
    
    // Carlisle CCW MiraDRI
    this.textures.set('miradri-860', {
      id: 'miradri-860',
      materialType: 'membrane-self-adhered',
      source: 'procedural',
      textures: {},
      procedural: {
        color: '#1f1f1f',
        roughness: 0.65,
        metalness: 0.0,
        bumpScale: 0.28,
        pattern: 'rubberized'
      },
      resolution: 1024,
      tileSizeMM: 300,
      manufacturer: 'Carlisle CCW',
      productName: 'MiraDRI 860',
      displayName: 'MiraDRI® 860',
      category: 'membrane-waterproofing',
      tags: ['waterproofing', 'self-adhered', 'below-grade']
    });
    
    // Tremco TREMproof 250GC
    this.textures.set('tremproof-250gc', {
      id: 'tremproof-250gc',
      materialType: 'membrane-self-adhered',
      source: 'procedural',
      textures: {},
      procedural: {
        color: '#2a2a2a',
        roughness: 0.72,
        metalness: 0.0,
        bumpScale: 0.32,
        pattern: 'rubberized'
      },
      resolution: 1024,
      tileSizeMM: 300,
      manufacturer: 'Tremco',
      productName: 'TREMproof 250GC',
      displayName: 'TREMproof® 250GC',
      category: 'membrane-waterproofing',
      tags: ['waterproofing', 'self-adhered', 'below-grade']
    });
  }
  
  // ---------------------------------------------------------------------------
  // REGISTRATION: ROOFING MEMBRANES
  // ---------------------------------------------------------------------------
  
  private registerRoofingMembranes(): void {
    // TPO White
    this.textures.set('tpo-white', {
      id: 'tpo-white',
      materialType: 'membrane-tpo',
      source: 'procedural',
      textures: {},
      procedural: {
        color: '#f5f5f5',
        roughness: 0.35,
        metalness: 0.0,
        bumpScale: 0.1,
        pattern: 'solid'
      },
      resolution: 1024,
      tileSizeMM: 500,
      displayName: 'TPO Membrane (White)',
      category: 'membrane-roofing',
      tags: ['roofing', 'single-ply', 'tpo', 'white', 'reflective']
    });
    
    // TPO Gray
    this.textures.set('tpo-gray', {
      id: 'tpo-gray',
      materialType: 'membrane-tpo',
      source: 'procedural',
      textures: {},
      procedural: {
        color: '#808080',
        roughness: 0.38,
        metalness: 0.0,
        bumpScale: 0.1,
        pattern: 'solid'
      },
      resolution: 1024,
      tileSizeMM: 500,
      displayName: 'TPO Membrane (Gray)',
      category: 'membrane-roofing',
      tags: ['roofing', 'single-ply', 'tpo', 'gray']
    });
    
    // EPDM Black
    this.textures.set('epdm-black', {
      id: 'epdm-black',
      materialType: 'membrane-epdm',
      source: 'procedural',
      textures: {},
      procedural: {
        color: '#0d0d0d',
        roughness: 0.8,
        metalness: 0.0,
        bumpScale: 0.15,
        pattern: 'rubberized'
      },
      resolution: 1024,
      tileSizeMM: 500,
      displayName: 'EPDM Membrane (Black)',
      category: 'membrane-roofing',
      tags: ['roofing', 'single-ply', 'epdm', 'rubber', 'black']
    });
    
    // PVC White
    this.textures.set('pvc-white', {
      id: 'pvc-white',
      materialType: 'membrane-pvc',
      source: 'procedural',
      textures: {},
      procedural: {
        color: '#fafafa',
        roughness: 0.25,
        metalness: 0.0,
        bumpScale: 0.05,
        pattern: 'solid'
      },
      resolution: 1024,
      tileSizeMM: 500,
      displayName: 'PVC Membrane (White)',
      category: 'membrane-roofing',
      tags: ['roofing', 'single-ply', 'pvc', 'white', 'reflective']
    });
    
    // Modified Bitumen Cap Sheet
    this.textures.set('mod-bit-cap', {
      id: 'mod-bit-cap',
      materialType: 'membrane-mod-bit',
      source: 'procedural',
      textures: {},
      procedural: {
        color: '#2d2d2d',
        roughness: 0.85,
        metalness: 0.0,
        bumpScale: 0.5,
        pattern: 'granular'
      },
      resolution: 1024,
      tileSizeMM: 400,
      displayName: 'Modified Bitumen Cap Sheet',
      category: 'membrane-roofing',
      tags: ['roofing', 'modified-bitumen', 'cap-sheet', 'granular']
    });
  }
  
  // ---------------------------------------------------------------------------
  // REGISTRATION: INSULATION MATERIALS
  // ---------------------------------------------------------------------------
  
  private registerInsulationMaterials(): void {
    // XPS Pink (Owens Corning Foamular)
    this.textures.set('xps-pink', {
      id: 'xps-pink',
      materialType: 'insulation-xps',
      source: 'procedural',
      textures: {},
      procedural: {
        color: '#ffb6c1',
        roughness: 0.9,
        metalness: 0.0,
        bumpScale: 0.2,
        pattern: 'cellular'
      },
      resolution: 1024,
      tileSizeMM: 600,
      manufacturer: 'Owens Corning',
      productName: 'FOAMULAR',
      displayName: 'XPS Insulation (Pink)',
      category: 'insulation',
      tags: ['insulation', 'xps', 'rigid', 'pink', 'below-grade']
    });
    
    // XPS Blue (DOW Styrofoam)
    this.textures.set('xps-blue', {
      id: 'xps-blue',
      materialType: 'insulation-xps',
      source: 'procedural',
      textures: {},
      procedural: {
        color: '#4a90d9',
        roughness: 0.88,
        metalness: 0.0,
        bumpScale: 0.18,
        pattern: 'cellular'
      },
      resolution: 1024,
      tileSizeMM: 600,
      manufacturer: 'DuPont (DOW)',
      productName: 'STYROFOAM',
      displayName: 'XPS Insulation (Blue)',
      category: 'insulation',
      tags: ['insulation', 'xps', 'rigid', 'blue', 'below-grade']
    });
    
    // Polyiso Foil Faced
    this.textures.set('polyiso-foil', {
      id: 'polyiso-foil',
      materialType: 'insulation-polyiso',
      source: 'procedural',
      textures: {},
      procedural: {
        color: '#d4af37',
        roughness: 0.3,
        metalness: 0.7,
        bumpScale: 0.05,
        pattern: 'solid'
      },
      resolution: 1024,
      tileSizeMM: 600,
      displayName: 'Polyiso (Foil Faced)',
      category: 'insulation',
      tags: ['insulation', 'polyiso', 'rigid', 'foil', 'reflective']
    });
    
    // Polyiso Coated Glass Facer
    this.textures.set('polyiso-cgf', {
      id: 'polyiso-cgf',
      materialType: 'insulation-polyiso',
      source: 'procedural',
      textures: {},
      procedural: {
        color: '#a89078',
        roughness: 0.75,
        metalness: 0.0,
        bumpScale: 0.25,
        pattern: 'fibrous'
      },
      resolution: 1024,
      tileSizeMM: 600,
      displayName: 'Polyiso (Coated Glass Facer)',
      category: 'insulation',
      tags: ['insulation', 'polyiso', 'rigid', 'cgf']
    });
    
    // Mineral Wool
    this.textures.set('mineral-wool', {
      id: 'mineral-wool',
      materialType: 'insulation-mineral-wool',
      source: 'procedural',
      textures: {},
      procedural: {
        color: '#7a6e5d',
        roughness: 0.95,
        metalness: 0.0,
        bumpScale: 0.4,
        pattern: 'fibrous'
      },
      resolution: 1024,
      tileSizeMM: 500,
      displayName: 'Mineral Wool Board',
      category: 'insulation',
      tags: ['insulation', 'mineral-wool', 'rigid', 'fire-resistant']
    });
  }
  
  // ---------------------------------------------------------------------------
  // REGISTRATION: CONCRETE & MASONRY
  // ---------------------------------------------------------------------------
  
  private registerConcreteMasonry(): void {
    // Cast-in-Place Concrete
    this.textures.set('concrete-formed', {
      id: 'concrete-formed',
      materialType: 'concrete-cip',
      source: 'procedural',
      textures: {},
      procedural: {
        color: '#808080',
        roughness: 0.85,
        metalness: 0.0,
        bumpScale: 0.35,
        pattern: 'solid'
      },
      resolution: 1024,
      tileSizeMM: 600,
      displayName: 'Cast-in-Place Concrete',
      category: 'concrete-masonry',
      tags: ['concrete', 'formed', 'foundation', 'structural']
    });
    
    // Concrete Slab
    this.textures.set('concrete-slab', {
      id: 'concrete-slab',
      materialType: 'concrete-slab',
      source: 'procedural',
      textures: {},
      procedural: {
        color: '#909090',
        roughness: 0.7,
        metalness: 0.0,
        bumpScale: 0.2,
        pattern: 'solid'
      },
      resolution: 1024,
      tileSizeMM: 600,
      displayName: 'Concrete Slab',
      category: 'concrete-masonry',
      tags: ['concrete', 'slab', 'floor', 'structural']
    });
    
    // CMU Block
    this.textures.set('cmu-block', {
      id: 'cmu-block',
      materialType: 'masonry-cmu',
      source: 'procedural',
      textures: {},
      procedural: {
        color: '#6e6e6e',
        roughness: 0.9,
        metalness: 0.0,
        bumpScale: 0.3,
        pattern: 'solid'
      },
      resolution: 1024,
      tileSizeMM: 400,
      displayName: 'Concrete Masonry Unit',
      category: 'concrete-masonry',
      tags: ['masonry', 'cmu', 'block', 'backup']
    });
  }
  
  // ---------------------------------------------------------------------------
  // REGISTRATION: METAL COMPONENTS
  // ---------------------------------------------------------------------------
  
  private registerMetalComponents(): void {
    // Galvanized Steel
    this.textures.set('galvanized-steel', {
      id: 'galvanized-steel',
      materialType: 'metal-galvanized',
      source: 'procedural',
      textures: {},
      procedural: {
        color: '#b8b8b8',
        roughness: 0.4,
        metalness: 0.85,
        bumpScale: 0.1,
        pattern: 'hammered'
      },
      resolution: 1024,
      tileSizeMM: 300,
      displayName: 'Galvanized Steel',
      category: 'metal',
      tags: ['metal', 'steel', 'galvanized', 'flashing']
    });
    
    // Stainless Steel
    this.textures.set('stainless-steel', {
      id: 'stainless-steel',
      materialType: 'metal-stainless',
      source: 'procedural',
      textures: {},
      procedural: {
        color: '#c0c0c0',
        roughness: 0.25,
        metalness: 0.9,
        bumpScale: 0.05,
        pattern: 'brushed'
      },
      resolution: 1024,
      tileSizeMM: 300,
      displayName: 'Stainless Steel',
      category: 'metal',
      tags: ['metal', 'steel', 'stainless', 'flashing']
    });
    
    // Aluminum Mill Finish
    this.textures.set('aluminum-mill', {
      id: 'aluminum-mill',
      materialType: 'metal-aluminum',
      source: 'procedural',
      textures: {},
      procedural: {
        color: '#d0d0d0',
        roughness: 0.35,
        metalness: 0.88,
        bumpScale: 0.08,
        pattern: 'brushed'
      },
      resolution: 1024,
      tileSizeMM: 300,
      displayName: 'Aluminum (Mill Finish)',
      category: 'metal',
      tags: ['metal', 'aluminum', 'termination-bar', 'coping']
    });
    
    // Kynar Coated Aluminum
    this.textures.set('aluminum-kynar', {
      id: 'aluminum-kynar',
      materialType: 'metal-aluminum-coated',
      source: 'procedural',
      textures: {},
      procedural: {
        color: '#5d4e37',
        roughness: 0.3,
        metalness: 0.2,
        bumpScale: 0.02,
        pattern: 'solid'
      },
      resolution: 1024,
      tileSizeMM: 300,
      displayName: 'Kynar Coated Aluminum',
      category: 'metal',
      tags: ['metal', 'aluminum', 'kynar', 'coping', 'coated']
    });
  }
  
  // ---------------------------------------------------------------------------
  // REGISTRATION: SEALANTS
  // ---------------------------------------------------------------------------
  
  private registerSealants(): void {
    // Polyurethane Sealant (Gray)
    this.textures.set('sealant-pu-gray', {
      id: 'sealant-pu-gray',
      materialType: 'sealant-polyurethane',
      source: 'procedural',
      textures: {},
      procedural: {
        color: '#5a5a5a',
        roughness: 0.5,
        metalness: 0.0,
        bumpScale: 0.1,
        pattern: 'solid'
      },
      resolution: 512,
      tileSizeMM: 100,
      displayName: 'Polyurethane Sealant (Gray)',
      category: 'sealant',
      tags: ['sealant', 'polyurethane', 'joint', 'gray']
    });
    
    // Silicone Sealant (Clear)
    this.textures.set('sealant-silicone', {
      id: 'sealant-silicone',
      materialType: 'sealant-silicone',
      source: 'procedural',
      textures: {},
      procedural: {
        color: '#e8e8e8',
        roughness: 0.15,
        metalness: 0.0,
        bumpScale: 0.02,
        pattern: 'solid'
      },
      resolution: 512,
      tileSizeMM: 100,
      displayName: 'Silicone Sealant (Clear)',
      category: 'sealant',
      tags: ['sealant', 'silicone', 'joint', 'clear']
    });
    
    // Mastic (Black)
    this.textures.set('mastic-black', {
      id: 'mastic-black',
      materialType: 'sealant-mastic',
      source: 'procedural',
      textures: {},
      procedural: {
        color: '#1a1a1a',
        roughness: 0.75,
        metalness: 0.0,
        bumpScale: 0.3,
        pattern: 'fibrous'
      },
      resolution: 512,
      tileSizeMM: 200,
      displayName: 'Fibered Mastic (Black)',
      category: 'sealant',
      tags: ['mastic', 'fibered', 'termination', 'black']
    });
  }
  
  // ---------------------------------------------------------------------------
  // REGISTRATION: DRAINAGE & PROTECTION
  // ---------------------------------------------------------------------------
  
  private registerDrainageProtection(): void {
    // Drainage Composite
    this.textures.set('drainage-composite', {
      id: 'drainage-composite',
      materialType: 'drainage-composite',
      source: 'procedural',
      textures: {},
      procedural: {
        color: '#1a1a1a',
        roughness: 0.8,
        metalness: 0.0,
        bumpScale: 0.6,
        pattern: 'dimpled'
      },
      resolution: 1024,
      tileSizeMM: 400,
      displayName: 'Drainage Composite Board',
      category: 'drainage',
      tags: ['drainage', 'composite', 'dimpled', 'below-grade']
    });
    
    // Protection Board
    this.textures.set('protection-board', {
      id: 'protection-board',
      materialType: 'protection-board',
      source: 'procedural',
      textures: {},
      procedural: {
        color: '#2a2a2a',
        roughness: 0.85,
        metalness: 0.0,
        bumpScale: 0.25,
        pattern: 'fibrous'
      },
      resolution: 1024,
      tileSizeMM: 500,
      displayName: 'Protection Board',
      category: 'protection',
      tags: ['protection', 'board', 'below-grade', 'asphaltic']
    });
    
    // Filter Fabric
    this.textures.set('filter-fabric', {
      id: 'filter-fabric',
      materialType: 'geotextile',
      source: 'procedural',
      textures: {},
      procedural: {
        color: '#f0f0f0',
        roughness: 0.9,
        metalness: 0.0,
        bumpScale: 0.15,
        pattern: 'woven'
      },
      resolution: 1024,
      tileSizeMM: 300,
      displayName: 'Non-Woven Filter Fabric',
      category: 'drainage',
      tags: ['geotextile', 'filter', 'fabric', 'drainage']
    });
  }
  
  // ===========================================================================
  // PUBLIC API
  // ===========================================================================
  
  /**
   * Get a Three.js material with the best available textures
   */
  async getMaterial(
    materialId: string,
    options: TextureLoadOptions = {}
  ): Promise<THREE.MeshStandardMaterial> {
    const quality = options.quality || 'high';
    const cacheKey = `${materialId}-${quality}-${options.manufacturer || 'any'}`;
    
    // Check cache first
    if (this.materialCache.has(cacheKey)) {
      return this.materialCache.get(cacheKey)!.clone();
    }
    
    // Find the best available texture variant
    const texture = this.findBestTexture(materialId, options);
    
    if (!texture) {
      // Return default gray material if nothing found
      console.warn(`Material not found: ${materialId}`);
      return new THREE.MeshStandardMaterial({ color: 0x808080 });
    }
    
    // Create the material
    const material = await this.createMaterial(texture, options);
    
    // Cache it
    this.materialCache.set(cacheKey, material);
    
    return material.clone();
  }
  
  /**
   * Find the best available texture for a material
   */
  private findBestTexture(
    materialId: string,
    options: TextureLoadOptions
  ): MaterialTexture | undefined {
    // Priority order for texture sources
    const sourcePreference: TextureSource[] = 
      options.preferredSource 
        ? [options.preferredSource, 'photo-sourced', 'ai-generated', 'procedural']
        : ['photo-sourced', 'ai-generated', 'procedural'];
    
    // Try manufacturer-specific variants first
    if (options.manufacturer) {
      for (const source of sourcePreference) {
        const key = `${materialId}-${options.manufacturer.toLowerCase()}-${source}`;
        if (this.textures.has(key)) {
          return this.textures.get(key);
        }
      }
    }
    
    // Try source-suffixed variants
    for (const source of sourcePreference) {
      const key = `${materialId}-${source === 'ai-generated' ? 'ai' : source}`;
      if (this.textures.has(key)) {
        return this.textures.get(key);
      }
    }
    
    // Fall back to base material
    return this.textures.get(materialId);
  }
  
  /**
   * Create a Three.js material from a texture definition
   */
  private async createMaterial(
    texture: MaterialTexture,
    options: TextureLoadOptions
  ): Promise<THREE.MeshStandardMaterial> {
    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color(texture.procedural.color),
      roughness: texture.procedural.roughness,
      metalness: texture.procedural.metalness,
      side: THREE.DoubleSide
    });
    
    // Load texture maps if available
    const loadPromises: Promise<void>[] = [];
    
    if (texture.textures.albedo) {
      loadPromises.push(
        this.loadTexture(texture.textures.albedo, texture.tileSizeMM, options)
          .then(tex => { 
            material.map = tex; 
            material.map.colorSpace = THREE.SRGBColorSpace;
          })
      );
    }
    
    if (texture.textures.normal) {
      loadPromises.push(
        this.loadTexture(texture.textures.normal, texture.tileSizeMM, options)
          .then(tex => {
            material.normalMap = tex;
            material.normalScale = new THREE.Vector2(
              texture.procedural.bumpScale,
              texture.procedural.bumpScale
            );
          })
      );
    }
    
    if (texture.textures.roughness) {
      loadPromises.push(
        this.loadTexture(texture.textures.roughness, texture.tileSizeMM, options)
          .then(tex => { material.roughnessMap = tex; })
      );
    }
    
    if (texture.textures.metalness) {
      loadPromises.push(
        this.loadTexture(texture.textures.metalness, texture.tileSizeMM, options)
          .then(tex => { material.metalnessMap = tex; })
      );
    }
    
    if (texture.textures.ao) {
      loadPromises.push(
        this.loadTexture(texture.textures.ao, texture.tileSizeMM, options)
          .then(tex => { material.aoMap = tex; })
      );
    }
    
    await Promise.all(loadPromises);
    
    material.needsUpdate = true;
    return material;
  }
  
  /**
   * Load a texture with caching
   */
  private loadTexture(
    url: string,
    tileSizeMM: number,
    options: TextureLoadOptions
  ): Promise<THREE.Texture> {
    return new Promise((resolve, reject) => {
      // Check cache
      if (this.loadedTextures.has(url)) {
        const cached = this.loadedTextures.get(url)!.clone();
        resolve(cached);
        return;
      }
      
      this.textureLoader.load(
        url,
        (texture) => {
          // Configure texture
          texture.wrapS = THREE.RepeatWrapping;
          texture.wrapT = THREE.RepeatWrapping;
          
          // Calculate repeat based on real-world size
          // Assuming model units are millimeters
          const repeatScale = 1000 / tileSizeMM;
          texture.repeat.set(repeatScale, repeatScale);
          
          // Anisotropic filtering for quality
          if (options.anisotropy) {
            texture.anisotropy = options.anisotropy;
          }
          
          // Cache and return
          this.loadedTextures.set(url, texture);
          resolve(texture.clone());
        },
        undefined,
        (error) => {
          console.error(`Failed to load texture: ${url}`, error);
          reject(error);
        }
      );
    });
  }
  
  /**
   * Get all materials in a category
   */
  getMaterialsByCategory(category: MaterialCategory): MaterialTexture[] {
    return Array.from(this.textures.values())
      .filter(t => t.category === category);
  }
  
  /**
   * Get all materials by manufacturer
   */
  getMaterialsByManufacturer(manufacturer: string): MaterialTexture[] {
    return Array.from(this.textures.values())
      .filter(t => t.manufacturer?.toLowerCase() === manufacturer.toLowerCase());
  }
  
  /**
   * Search materials by tags
   */
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
  
  /**
   * Get material by ID
   */
  getTextureDefinition(id: string): MaterialTexture | undefined {
    return this.textures.get(id);
  }
  
  /**
   * List all available material IDs
   */
  listAllMaterials(): string[] {
    return Array.from(this.textures.keys());
  }
  
  /**
   * Clear all caches (for memory management)
   */
  clearCache(): void {
    this.loadedTextures.forEach(tex => tex.dispose());
    this.loadedTextures.clear();
    
    this.materialCache.forEach(mat => mat.dispose());
    this.materialCache.clear();
  }
  
  /**
   * Register a custom texture
   */
  registerTexture(texture: MaterialTexture): void {
    this.textures.set(texture.id, texture);
  }
}

// =============================================================================
// SINGLETON EXPORT
// =============================================================================

/**
 * Global texture library instance
 */
export const textureLibrary = new TextureLibrary();
