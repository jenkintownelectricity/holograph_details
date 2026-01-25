/**
 * AI Texture Generator
 * POLR Strategic Development - Phase A1.1
 * 
 * Uses Scenario AI or similar services to generate photorealistic PBR textures
 * from text descriptions of construction materials.
 * 
 * @module materials/ai-texture-generator
 * @version 1.0.0
 * @license Proprietary - Lefebvre Design Solutions
 */

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

/**
 * Complete PBR (Physically Based Rendering) texture set
 * All textures are seamlessly tileable for construction materials
 */
export interface PBRTextureSet {
  /** Base color/diffuse map - RGB color information */
  albedo: string;
  /** Normal map - Surface detail/bumpiness in tangent space */
  normal: string;
  /** Roughness map - Surface smoothness (0=glossy, 1=rough) */
  roughness: string;
  /** Metalness map - Metal vs non-metal (0=dielectric, 1=metal) */
  metalness: string;
  /** Ambient Occlusion - Contact shadows and crevices */
  ao: string;
  /** Height/Displacement map - Actual geometry displacement */
  height: string;
}

/**
 * Texture generation request configuration
 */
export interface TexturePrompt {
  /** Material type identifier */
  material: string;
  /** Detailed visual description for AI generation */
  description: string;
  /** Rendering style target */
  style: 'photorealistic' | 'technical' | 'stylized';
  /** Real-world tile size in millimeters */
  tileSize: number;
  /** Target resolution (256, 512, 1024, 2048, 4096) */
  resolution?: number;
}

/**
 * Generation result with metadata
 */
export interface TextureGenerationResult {
  /** Generated texture set */
  textures: PBRTextureSet;
  /** Generation metadata */
  metadata: {
    prompt: TexturePrompt;
    generatedAt: string;
    provider: string;
    modelVersion: string;
    cost: number;
  };
}

/**
 * API response structure from Scenario AI
 */
interface ScenarioAPIResponse {
  imageUrl: string;
  inference_id: string;
  status: 'success' | 'failed' | 'pending';
  model_id: string;
}

// =============================================================================
// MATERIAL PROMPTS LIBRARY
// =============================================================================

/**
 * Pre-defined prompts for common construction materials
 * These descriptions have been refined for optimal AI texture generation
 */
export const MATERIAL_PROMPTS: Record<string, TexturePrompt> = {
  // ---------------------------------------------------------------------------
  // WATERPROOFING MEMBRANES
  // ---------------------------------------------------------------------------
  
  'bituthene-3000': {
    material: 'SBS Rubberized Asphalt Membrane',
    description: 'Black self-adhered waterproofing membrane with subtle rubberized texture, slightly glossy surface showing minor undulations from field application, cross-laminated HDPE film backing visible at edges, characteristic matte-to-semi-gloss appearance of cured SBS modified asphalt',
    style: 'photorealistic',
    tileSize: 300
  },
  
  'perm-a-barrier': {
    material: 'Orange Air Barrier Membrane',
    description: 'Bright orange peel-and-stick membrane with matte finish, characteristic orange-peel texture from rubberized asphalt compound, showing typical field-applied appearance with occasional minor air bubbles trapped during installation, UV-resistant polyethylene film facer',
    style: 'photorealistic',
    tileSize: 300
  },
  
  'bituthene-low-temp': {
    material: 'Low Temperature Waterproofing Membrane',
    description: 'Dark gray to black self-adhered membrane optimized for cold weather application, slightly tackier surface appearance than standard membranes, showing characteristic low-temperature polymer modification with enhanced flexibility markers',
    style: 'photorealistic',
    tileSize: 300
  },

  // ---------------------------------------------------------------------------
  // ROOFING MEMBRANES
  // ---------------------------------------------------------------------------
  
  'tpo-white': {
    material: 'TPO Roofing Membrane',
    description: 'Bright white thermoplastic polyolefin single-ply roofing membrane, smooth semi-gloss surface with subtle grain texture, heat-welded seam visible as raised ridge approximately 50mm wide, showing typical weathered field appearance after UV exposure with slight yellowing at edges',
    style: 'photorealistic',
    tileSize: 500
  },
  
  'tpo-gray': {
    material: 'Gray TPO Roofing Membrane',
    description: 'Medium gray thermoplastic polyolefin single-ply membrane, smooth matte-to-semi-gloss finish, factory-applied fleece backing partially visible at cut edges, showing characteristic weld lines with slightly darker coloration',
    style: 'photorealistic',
    tileSize: 500
  },
  
  'epdm-black': {
    material: 'EPDM Rubber Membrane',
    description: 'Deep black ethylene propylene diene rubber roofing membrane, distinctive matte finish with subtle rubber texture, showing characteristic cured appearance with minor surface chalk from UV exposure, talc residue visible in protected areas',
    style: 'photorealistic',
    tileSize: 500
  },
  
  'pvc-white': {
    material: 'PVC Roofing Membrane',
    description: 'White polyvinyl chloride single-ply roofing membrane, smoother surface than TPO with higher gloss finish, heat-welded seams with characteristic PVC color consistency, showing typical plasticizer bloom in weathered areas',
    style: 'photorealistic',
    tileSize: 500
  },
  
  'mod-bit-cap': {
    material: 'Modified Bitumen Cap Sheet',
    description: 'Black SBS modified bitumen cap sheet with mineral granule surface, dense granule coverage in grays and blacks, showing characteristic torch-applied appearance with melted granule edges and slight surface undulation',
    style: 'photorealistic',
    tileSize: 400
  },

  // ---------------------------------------------------------------------------
  // CONCRETE & MASONRY
  // ---------------------------------------------------------------------------
  
  'concrete-formed': {
    material: 'Cast-in-Place Concrete',
    description: 'Gray form-finished concrete surface with visible form tie holes at regular intervals, bug holes and air voids scattered across surface, subtle color variation from aggregate and cement paste, form board marks visible as horizontal lines, typical below-grade foundation wall appearance',
    style: 'photorealistic',
    tileSize: 600
  },
  
  'concrete-poured': {
    material: 'Poured Concrete Slab',
    description: 'Light gray concrete with steel trowel finish, characteristic swirl marks from finishing operations, minor surface crazing visible, aggregate shadow showing through cement paste, typical elevated slab appearance',
    style: 'photorealistic',
    tileSize: 600
  },
  
  'cmu-block': {
    material: 'Concrete Masonry Unit',
    description: 'Gray concrete masonry block with characteristic hollow core pattern visible in section, coarse aggregate texture on face, mortar joints with tooled concave profile, typical unfinished backup wall appearance',
    style: 'photorealistic',
    tileSize: 400
  },
  
  'brick-face': {
    material: 'Face Brick',
    description: 'Red-brown clay brick with characteristic color variation, wire-cut texture on face with slight drag marks, 10mm mortar joints in gray cement mortar with tooled concave profile, running bond pattern',
    style: 'photorealistic',
    tileSize: 400
  },

  // ---------------------------------------------------------------------------
  // METAL COMPONENTS
  // ---------------------------------------------------------------------------
  
  'metal-coping': {
    material: 'Prefinished Metal Coping',
    description: 'Kynar-coated aluminum coping cap, semi-gloss finish in architectural bronze color, showing crisp brake metal edges with no visible scratches, typical parapet cap installation with slight oil-canning visible on larger flat areas',
    style: 'photorealistic',
    tileSize: 300
  },
  
  'galvanized-flashing': {
    material: 'Galvanized Steel Flashing',
    description: 'Hot-dip galvanized steel sheet metal, characteristic spangled zinc coating with crystalline pattern, matte to semi-gloss finish with minor surface oxidation, typical base flashing application',
    style: 'photorealistic',
    tileSize: 300
  },
  
  'stainless-flashing': {
    material: 'Stainless Steel Flashing',
    description: 'Type 304 stainless steel with 2B mill finish, subtle directional grain pattern, high reflectivity with minor fingerprints and handling marks, typical through-wall flashing application',
    style: 'photorealistic',
    tileSize: 300
  },
  
  'termination-bar': {
    material: 'Aluminum Termination Bar',
    description: 'Extruded aluminum termination bar with mill finish, pre-punched holes at 150mm centers showing pan-head screw fasteners, slight surface oxidation, butyl sealant bead visible along top edge',
    style: 'photorealistic',
    tileSize: 200
  },

  // ---------------------------------------------------------------------------
  // INSULATION
  // ---------------------------------------------------------------------------
  
  'xps-insulation': {
    material: 'Extruded Polystyrene Insulation',
    description: 'Pink extruded polystyrene rigid insulation board (Owens Corning Foamular style), closed-cell foam texture with characteristic skin surface, showing typical cut edge revealing cell structure, shiplap edge profile visible',
    style: 'photorealistic',
    tileSize: 600
  },
  
  'xps-blue': {
    material: 'Blue XPS Insulation',
    description: 'Blue extruded polystyrene board (DOW Styrofoam style), smooth skin surface with embossed manufacturer logo, closed-cell structure visible at cut edges, characteristic blue color with slight UV fading on exposed surfaces',
    style: 'photorealistic',
    tileSize: 600
  },
  
  'polyiso-foil': {
    material: 'Polyiso Insulation with Foil Facer',
    description: 'Polyisocyanurate insulation board with reflective aluminum foil facer, showing typical construction appearance with foil seams and tape at joints, golden/tan foam visible at cut edges, characteristic wrinkled foil from thermal cycling',
    style: 'photorealistic',
    tileSize: 600
  },
  
  'polyiso-coated': {
    material: 'Coated Glass Facer Polyiso',
    description: 'Polyisocyanurate board with coated glass mat facer, gray-tan surface with visible fiber texture, manufacturer printing partially visible, yellow-tan foam core at edges',
    style: 'photorealistic',
    tileSize: 600
  },
  
  'mineral-wool': {
    material: 'Mineral Wool Board Insulation',
    description: 'Dense mineral wool rigid board, characteristic fibrous texture with gray-brown color, showing typical compression resistance with spring-back after handling, cut edges revealing fiber orientation',
    style: 'photorealistic',
    tileSize: 500
  },

  // ---------------------------------------------------------------------------
  // DRAINAGE & PROTECTION
  // ---------------------------------------------------------------------------
  
  'drainage-composite': {
    material: 'Drainage Composite Mat',
    description: 'Black HDPE dimpled drainage board with white non-woven geotextile filter fabric bonded to face, 20mm dimple pattern clearly visible through translucent fabric, showing typical below-grade installation with soil staining at base',
    style: 'photorealistic',
    tileSize: 400
  },
  
  'protection-board': {
    material: 'Protection Board',
    description: 'Semi-rigid asphaltic protection board, black color with fiber reinforcement visible, showing typical vertical installation over waterproofing with minor abrasion marks from backfill',
    style: 'photorealistic',
    tileSize: 500
  },
  
  'root-barrier': {
    material: 'Root Barrier Membrane',
    description: 'High-density polyethylene root barrier sheet, smooth black surface with slight texture, heat-welded seams visible as raised lines, typical plaza deck application',
    style: 'photorealistic',
    tileSize: 500
  },

  // ---------------------------------------------------------------------------
  // SEALANTS & ADHESIVES
  // ---------------------------------------------------------------------------
  
  'sealant-bead': {
    material: 'Polyurethane Sealant',
    description: 'Gray polyurethane joint sealant with tooled concave profile, showing typical cured appearance with slight surface skin and minor dust accumulation, characteristic elastomeric sheen in expansion joint application',
    style: 'photorealistic',
    tileSize: 100
  },
  
  'sealant-silicone': {
    material: 'Silicone Sealant',
    description: 'Clear to translucent silicone sealant with tooled profile, characteristic high gloss finish when cured, showing slight translucency revealing backer rod behind, typical perimeter sealant joint',
    style: 'photorealistic',
    tileSize: 100
  },
  
  'mastic-trowel': {
    material: 'Trowel-Applied Mastic',
    description: 'Black fibered mastic coating with characteristic trowel marks and stippled texture, showing typical coverage over membrane terminations with 2-3mm thickness visible at edges',
    style: 'photorealistic',
    tileSize: 200
  },

  // ---------------------------------------------------------------------------
  // FASTENERS & HARDWARE
  // ---------------------------------------------------------------------------
  
  'expansion-anchor': {
    material: 'Concrete Expansion Anchor',
    description: 'Zinc-plated steel expansion anchor with hex head, showing typical installation flush with concrete surface, minor rust staining around anchor from water infiltration',
    style: 'photorealistic',
    tileSize: 50
  },
  
  'membrane-fastener': {
    material: 'Membrane Fastener Plate',
    description: 'Galvanized steel stress plate with countersunk screw, characteristic 75mm diameter with radial stiffening ribs, showing typical mechanically-attached membrane installation',
    style: 'photorealistic',
    tileSize: 100
  }
};

// =============================================================================
// AI TEXTURE GENERATOR CLASS
// =============================================================================

/**
 * AITextureGenerator
 * 
 * Generates photorealistic PBR texture sets from text descriptions
 * using AI image generation services (Scenario AI, Stability AI, etc.)
 */
export class AITextureGenerator {
  private apiKey: string;
  private baseUrl: string;
  private modelId: string;
  private rateLimiter: RateLimiter;
  
  /**
   * Create a new AI Texture Generator instance
   * 
   * @param config - Configuration options
   */
  constructor(config: {
    apiKey: string;
    provider?: 'scenario' | 'stability' | 'replicate';
    modelId?: string;
  }) {
    this.apiKey = config.apiKey;
    
    // Configure provider-specific settings
    switch (config.provider || 'scenario') {
      case 'scenario':
        this.baseUrl = 'https://api.scenario.com/v1';
        this.modelId = config.modelId || 'scenario-v1-texture';
        break;
      case 'stability':
        this.baseUrl = 'https://api.stability.ai/v1';
        this.modelId = config.modelId || 'stable-diffusion-xl-1024-v1-0';
        break;
      case 'replicate':
        this.baseUrl = 'https://api.replicate.com/v1';
        this.modelId = config.modelId || 'material-diffusion';
        break;
    }
    
    // Rate limiter to prevent API throttling
    this.rateLimiter = new RateLimiter({ maxRequests: 10, windowMs: 60000 });
  }
  
  /**
   * Generate a complete PBR texture set from a material prompt
   * 
   * @param prompt - Material description and parameters
   * @returns Promise resolving to generated texture URLs
   */
  async generateTextures(prompt: TexturePrompt): Promise<TextureGenerationResult> {
    const resolution = prompt.resolution || 1024;
    const startTime = Date.now();
    
    // Generate each map type with appropriate prompt modifications
    const [albedo, normal, roughness, metalness, ao, height] = await Promise.all([
      this.generateAlbedo(prompt, resolution),
      this.generateNormal(prompt, resolution),
      this.generateRoughness(prompt, resolution),
      this.generateMetalness(prompt, resolution),
      this.generateAO(prompt, resolution),
      this.generateHeight(prompt, resolution)
    ]);
    
    const generationTime = Date.now() - startTime;
    
    return {
      textures: {
        albedo,
        normal,
        roughness,
        metalness,
        ao,
        height
      },
      metadata: {
        prompt,
        generatedAt: new Date().toISOString(),
        provider: this.baseUrl.includes('scenario') ? 'Scenario AI' : 'Other',
        modelVersion: this.modelId,
        cost: this.estimateCost(6, resolution) // 6 textures generated
      }
    };
  }
  
  /**
   * Generate albedo/base color texture
   * Flat lighting, no shadows, pure color information
   */
  private async generateAlbedo(prompt: TexturePrompt, resolution: number): Promise<string> {
    const albedoPrompt = `${prompt.description}, albedo map, flat even lighting, no shadows, no highlights, diffuse color only, ${prompt.style} material texture, seamless tileable`;
    
    return this.generateSingleTexture(albedoPrompt, resolution, 'albedo');
  }
  
  /**
   * Generate normal map
   * RGB-encoded surface normals in tangent space
   */
  private async generateNormal(prompt: TexturePrompt, resolution: number): Promise<string> {
    const normalPrompt = `${prompt.material} surface detail, normal map, RGB tangent space, blue-tinted base color, surface bumps and micro-detail encoded as RGB values, seamless tileable normal map`;
    
    return this.generateSingleTexture(normalPrompt, resolution, 'normal');
  }
  
  /**
   * Generate roughness map
   * Grayscale - white = rough/matte, black = smooth/glossy
   */
  private async generateRoughness(prompt: TexturePrompt, resolution: number): Promise<string> {
    const roughnessPrompt = `${prompt.material} roughness map, grayscale image, white areas are rough matte surfaces, black areas are smooth glossy surfaces, seamless tileable`;
    
    return this.generateSingleTexture(roughnessPrompt, resolution, 'roughness');
  }
  
  /**
   * Generate metalness map
   * Grayscale - white = metallic, black = non-metallic (dielectric)
   */
  private async generateMetalness(prompt: TexturePrompt, resolution: number): Promise<string> {
    // Most construction materials are non-metallic
    const isMetallic = prompt.material.toLowerCase().includes('metal') || 
                       prompt.material.toLowerCase().includes('steel') ||
                       prompt.material.toLowerCase().includes('aluminum');
    
    if (!isMetallic) {
      // Return solid black for dielectric materials
      return this.generateSolidColor('#000000', resolution, 'metalness');
    }
    
    const metalnessPrompt = `${prompt.material} metalness map, grayscale image, white areas are pure metal, black areas are non-metallic, seamless tileable`;
    
    return this.generateSingleTexture(metalnessPrompt, resolution, 'metalness');
  }
  
  /**
   * Generate ambient occlusion map
   * Grayscale - white = fully lit, black = shadowed/occluded
   */
  private async generateAO(prompt: TexturePrompt, resolution: number): Promise<string> {
    const aoPrompt = `${prompt.material} ambient occlusion map, grayscale image, white areas are exposed, black areas are in crevices and corners, soft contact shadows, seamless tileable`;
    
    return this.generateSingleTexture(aoPrompt, resolution, 'ao');
  }
  
  /**
   * Generate height/displacement map
   * Grayscale - white = raised, black = lowered
   */
  private async generateHeight(prompt: TexturePrompt, resolution: number): Promise<string> {
    const heightPrompt = `${prompt.material} height map displacement map, grayscale image, white areas are raised bumps, black areas are recessed, medium gray is base level, seamless tileable`;
    
    return this.generateSingleTexture(heightPrompt, resolution, 'height');
  }
  
  /**
   * Generate a single texture image via API
   */
  private async generateSingleTexture(
    promptText: string, 
    resolution: number,
    mapType: string
  ): Promise<string> {
    await this.rateLimiter.waitForSlot();
    
    try {
      const response = await fetch(`${this.baseUrl}/generate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: promptText,
          width: resolution,
          height: resolution,
          seamless: true,
          num_samples: 1,
          guidance_scale: 7.5,
          model_id: this.modelId,
          output_format: 'png'
        })
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      const data: ScenarioAPIResponse = await response.json();
      
      if (data.status === 'failed') {
        throw new Error('Texture generation failed');
      }
      
      return data.imageUrl;
      
    } catch (error) {
      console.error(`Failed to generate ${mapType} texture:`, error);
      // Return placeholder on failure
      return `/textures/fallback/${mapType}-placeholder.png`;
    }
  }
  
  /**
   * Generate a solid color texture (for metalness of non-metallic materials)
   */
  private async generateSolidColor(
    hexColor: string, 
    resolution: number,
    mapType: string
  ): Promise<string> {
    // For solid colors, we can generate locally or return a pre-made asset
    return `/textures/solid/${hexColor.replace('#', '')}-${resolution}.png`;
  }
  
  /**
   * Estimate API cost for generation
   */
  private estimateCost(numTextures: number, resolution: number): number {
    // Scenario AI pricing estimate: ~$0.01 per 1024x1024 image
    const baseCost = 0.01;
    const resolutionMultiplier = (resolution / 1024) ** 2;
    return numTextures * baseCost * resolutionMultiplier;
  }
  
  /**
   * Get a pre-defined material prompt by ID
   */
  static getPrompt(materialId: string): TexturePrompt | undefined {
    return MATERIAL_PROMPTS[materialId];
  }
  
  /**
   * List all available pre-defined material prompts
   */
  static listAvailablePrompts(): string[] {
    return Object.keys(MATERIAL_PROMPTS);
  }
  
  /**
   * Batch generate textures for multiple materials
   */
  async batchGenerate(
    materialIds: string[], 
    options?: { resolution?: number; parallel?: number }
  ): Promise<Map<string, TextureGenerationResult>> {
    const results = new Map<string, TextureGenerationResult>();
    const parallel = options?.parallel || 3;
    
    // Process in batches to avoid overwhelming the API
    for (let i = 0; i < materialIds.length; i += parallel) {
      const batch = materialIds.slice(i, i + parallel);
      
      const batchResults = await Promise.all(
        batch.map(async (id) => {
          const prompt = MATERIAL_PROMPTS[id];
          if (!prompt) {
            console.warn(`Unknown material ID: ${id}`);
            return null;
          }
          
          if (options?.resolution) {
            prompt.resolution = options.resolution;
          }
          
          const result = await this.generateTextures(prompt);
          return { id, result };
        })
      );
      
      batchResults.forEach((item) => {
        if (item) {
          results.set(item.id, item.result);
        }
      });
    }
    
    return results;
  }
}

// =============================================================================
// RATE LIMITER UTILITY
// =============================================================================

/**
 * Simple rate limiter for API calls
 */
class RateLimiter {
  private requests: number[] = [];
  private maxRequests: number;
  private windowMs: number;
  
  constructor(config: { maxRequests: number; windowMs: number }) {
    this.maxRequests = config.maxRequests;
    this.windowMs = config.windowMs;
  }
  
  async waitForSlot(): Promise<void> {
    const now = Date.now();
    
    // Remove expired timestamps
    this.requests = this.requests.filter(t => now - t < this.windowMs);
    
    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = this.requests[0];
      const waitTime = this.windowMs - (now - oldestRequest);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.requests.push(Date.now());
  }
}

// =============================================================================
// FACTORY FUNCTION
// =============================================================================

/**
 * Create an AI Texture Generator with environment configuration
 */
export function createAITextureGenerator(): AITextureGenerator {
  const apiKey = process.env.SCENARIO_API_KEY || process.env.AI_TEXTURE_API_KEY || '';
  
  if (!apiKey) {
    console.warn('AI Texture Generator: No API key configured. Textures will use fallbacks.');
  }
  
  return new AITextureGenerator({
    apiKey,
    provider: 'scenario'
  });
}

// Default export for convenience
export const aiTextureGenerator = createAITextureGenerator();
