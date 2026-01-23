/**
 * Universal Construction Material Library
 * Base material types with accurate PBR properties
 *
 * These represent the ACTUAL materials used across all manufacturers
 */

export interface BaseMaterial {
  id: string;
  name: string;
  category: MaterialCategory;

  // Visual Properties (PBR)
  color: string;                    // Base color hex
  roughness: number;                // 0 = mirror, 1 = matte
  metalness: number;                // 0 = dielectric, 1 = metal
  opacity: number;                  // 0-1

  // Texture Properties
  texture: {
    type: TextureType;
    scale: number;                  // UV scale
    bumpStrength: number;           // Normal map intensity
  };

  // Physical Properties (for accurate rendering)
  thickness: {                      // Typical thickness range
    min: number;                    // mm
    max: number;                    // mm
    typical: number;                // mm
  };

  // Construction Properties
  application: ApplicationMethod[];
  substrates: SubstrateType[];

  // Visual Reference
  description: string;
  visualNotes: string;              // How it actually looks in the field
}

export type MaterialCategory =
  | 'membrane-sheet'        // Pre-formed sheet membranes
  | 'membrane-fluid'        // Fluid-applied membranes
  | 'membrane-self-adhered' // Peel-and-stick
  | 'insulation'            // Thermal insulation
  | 'protection'            // Protection boards/mats
  | 'drainage'              // Drainage composites
  | 'flashing'              // Metal/membrane flashings
  | 'sealant'               // Joint sealants
  | 'substrate'             // Concrete, CMU, wood, steel
  | 'fastener'              // Mechanical fasteners
  | 'adhesive'              // Bonding agents
  | 'primer'                // Surface primers
  | 'vapor-barrier'         // Vapor retarders
  | 'air-barrier';          // Air barrier systems

export type TextureType =
  | 'smooth'                // Smooth HDPE film
  | 'granular'              // Mineral granule surface
  | 'rubberized'            // Rubberized asphalt texture
  | 'fabric'                // Polyester/fiberglass reinforced
  | 'grid'                  // Grid/waffle pattern
  | 'orange-peel'           // Spray-applied texture
  | 'concrete-formed'       // Form-finished concrete
  | 'concrete-broom'        // Broom-finished concrete
  | 'metal-mill'            // Mill-finish metal
  | 'metal-painted'         // Painted/coated metal
  | 'foam-closed'           // Closed-cell foam
  | 'foam-open'             // Open-cell foam
  | 'woven'                 // Woven geotextile
  | 'dimpled';              // Dimpled drainage board

export type ApplicationMethod =
  | 'self-adhered'
  | 'torch-applied'
  | 'hot-mopped'
  | 'cold-adhered'
  | 'mechanically-fastened'
  | 'spray-applied'
  | 'roller-applied'
  | 'trowel-applied'
  | 'pour-and-spread';

export type SubstrateType =
  | 'concrete-cast'
  | 'concrete-precast'
  | 'cmu'
  | 'plywood'
  | 'osb'
  | 'gypsum'
  | 'metal-deck'
  | 'steel'
  | 'masonry'
  | 'existing-membrane';

// ============================================
// BASE MATERIAL DEFINITIONS
// ============================================

export const BASE_MATERIALS: Record<string, BaseMaterial> = {

  // ==========================================
  // SELF-ADHERED MEMBRANES (Peel & Stick)
  // ==========================================

  'sbs-rubberized-asphalt': {
    id: 'sbs-rubberized-asphalt',
    name: 'SBS Rubberized Asphalt Membrane',
    category: 'membrane-self-adhered',
    color: '#1a1a1a',
    roughness: 0.7,
    metalness: 0.0,
    opacity: 1.0,
    texture: {
      type: 'rubberized',
      scale: 1.0,
      bumpStrength: 0.3
    },
    thickness: { min: 1.0, max: 2.0, typical: 1.5 },
    application: ['self-adhered'],
    substrates: ['concrete-cast', 'concrete-precast', 'cmu', 'plywood', 'osb', 'gypsum'],
    description: 'Self-adhered SBS modified bitumen membrane',
    visualNotes: 'Black, slightly tacky surface with subtle texture. Often has release liner pattern visible after application.'
  },

  'sbs-rubberized-asphalt-orange': {
    id: 'sbs-rubberized-asphalt-orange',
    name: 'SBS Rubberized Asphalt (High-Visibility)',
    category: 'membrane-self-adhered',
    color: '#ff6600',
    roughness: 0.65,
    metalness: 0.0,
    opacity: 1.0,
    texture: {
      type: 'rubberized',
      scale: 1.0,
      bumpStrength: 0.25
    },
    thickness: { min: 1.0, max: 1.5, typical: 1.0 },
    application: ['self-adhered'],
    substrates: ['concrete-cast', 'concrete-precast', 'cmu', 'plywood', 'osb', 'gypsum'],
    description: 'Orange-colored SBS membrane for air barrier visibility',
    visualNotes: 'Bright orange, matte finish. Color ensures complete coverage verification during inspection.'
  },

  'hdpe-film-composite': {
    id: 'hdpe-film-composite',
    name: 'HDPE Film Composite Membrane',
    category: 'membrane-self-adhered',
    color: '#2d2d2d',
    roughness: 0.2,
    metalness: 0.1,
    opacity: 1.0,
    texture: {
      type: 'grid',
      scale: 0.5,
      bumpStrength: 0.1
    },
    thickness: { min: 0.5, max: 1.2, typical: 0.8 },
    application: ['self-adhered'],
    substrates: ['concrete-cast', 'concrete-precast'],
    description: 'Pre-applied HDPE waterproofing with pressure-sensitive adhesive',
    visualNotes: 'Dark gray/black with visible grid pattern. Smooth, almost plastic appearance.'
  },

  // ==========================================
  // FLUID-APPLIED MEMBRANES
  // ==========================================

  'fluid-applied-rubber': {
    id: 'fluid-applied-rubber',
    name: 'Fluid-Applied Rubber Membrane',
    category: 'membrane-fluid',
    color: '#1f1f1f',
    roughness: 0.6,
    metalness: 0.0,
    opacity: 1.0,
    texture: {
      type: 'orange-peel',
      scale: 2.0,
      bumpStrength: 0.4
    },
    thickness: { min: 1.5, max: 3.0, typical: 2.0 },
    application: ['spray-applied', 'roller-applied', 'trowel-applied'],
    substrates: ['concrete-cast', 'concrete-precast', 'cmu', 'masonry'],
    description: 'Spray or roller-applied elastomeric membrane',
    visualNotes: 'Black with orange-peel texture from spray application. Edges show brush/roller marks.'
  },

  'fluid-applied-rubber-gray': {
    id: 'fluid-applied-rubber-gray',
    name: 'Fluid-Applied Rubber (Gray)',
    category: 'membrane-fluid',
    color: '#4a4a4a',
    roughness: 0.6,
    metalness: 0.0,
    opacity: 1.0,
    texture: {
      type: 'orange-peel',
      scale: 2.0,
      bumpStrength: 0.4
    },
    thickness: { min: 1.5, max: 3.0, typical: 2.0 },
    application: ['spray-applied', 'roller-applied'],
    substrates: ['concrete-cast', 'concrete-precast', 'cmu'],
    description: 'Gray fluid-applied membrane (often vapor permeable)',
    visualNotes: 'Medium gray, slightly textured. Used where vapor permeability needed.'
  },

  // ==========================================
  // ROOFING MEMBRANES
  // ==========================================

  'tpo-membrane': {
    id: 'tpo-membrane',
    name: 'TPO Roofing Membrane',
    category: 'membrane-sheet',
    color: '#f5f5f5',
    roughness: 0.3,
    metalness: 0.0,
    opacity: 1.0,
    texture: {
      type: 'smooth',
      scale: 1.0,
      bumpStrength: 0.05
    },
    thickness: { min: 1.1, max: 2.0, typical: 1.5 },
    application: ['mechanically-fastened', 'cold-adhered'],
    substrates: ['plywood', 'osb', 'gypsum', 'metal-deck'],
    description: 'Thermoplastic Polyolefin single-ply membrane',
    visualNotes: 'White/light gray, smooth and slightly reflective. Heat-welded seams visible as raised lines.'
  },

  'epdm-membrane': {
    id: 'epdm-membrane',
    name: 'EPDM Roofing Membrane',
    category: 'membrane-sheet',
    color: '#1a1a1a',
    roughness: 0.8,
    metalness: 0.0,
    opacity: 1.0,
    texture: {
      type: 'rubberized',
      scale: 1.0,
      bumpStrength: 0.2
    },
    thickness: { min: 1.1, max: 2.3, typical: 1.5 },
    application: ['mechanically-fastened', 'cold-adhered'],
    substrates: ['plywood', 'osb', 'gypsum', 'metal-deck'],
    description: 'Ethylene Propylene Diene Monomer rubber membrane',
    visualNotes: 'Black, matte rubber appearance. Seams are taped or adhered (no heat welding).'
  },

  'mod-bit-sbs-cap': {
    id: 'mod-bit-sbs-cap',
    name: 'Modified Bitumen Cap Sheet (Granulated)',
    category: 'membrane-sheet',
    color: '#3d3d3d',
    roughness: 0.9,
    metalness: 0.0,
    opacity: 1.0,
    texture: {
      type: 'granular',
      scale: 0.3,
      bumpStrength: 0.6
    },
    thickness: { min: 3.0, max: 5.0, typical: 4.0 },
    application: ['torch-applied', 'hot-mopped', 'cold-adhered'],
    substrates: ['plywood', 'osb', 'concrete-cast', 'existing-membrane'],
    description: 'SBS modified bitumen with mineral granule surface',
    visualNotes: 'Dark gray/black with visible mineral granules. Very rough, sandpaper-like texture.'
  },

  // ==========================================
  // PROTECTION & DRAINAGE
  // ==========================================

  'protection-board-hdpe': {
    id: 'protection-board-hdpe',
    name: 'HDPE Protection Board',
    category: 'protection',
    color: '#2a2a2a',
    roughness: 0.4,
    metalness: 0.0,
    opacity: 1.0,
    texture: {
      type: 'smooth',
      scale: 1.0,
      bumpStrength: 0.1
    },
    thickness: { min: 3.0, max: 6.0, typical: 3.0 },
    application: ['mechanically-fastened', 'cold-adhered'],
    substrates: ['existing-membrane'],
    description: 'High-density polyethylene protection board',
    visualNotes: 'Dark gray/black, smooth semi-rigid board. Protects membrane from backfill damage.'
  },

  'drainage-composite': {
    id: 'drainage-composite',
    name: 'Drainage Composite Mat',
    category: 'drainage',
    color: '#1f1f1f',
    roughness: 0.5,
    metalness: 0.0,
    opacity: 1.0,
    texture: {
      type: 'dimpled',
      scale: 0.2,
      bumpStrength: 0.8
    },
    thickness: { min: 6.0, max: 25.0, typical: 10.0 },
    application: ['mechanically-fastened'],
    substrates: ['existing-membrane'],
    description: 'Dimpled HDPE drainage core with geotextile filter fabric',
    visualNotes: 'Black dimpled core visible through white/tan filter fabric. Dimples ~20mm diameter.'
  },

  'xps-insulation': {
    id: 'xps-insulation',
    name: 'Extruded Polystyrene Insulation',
    category: 'insulation',
    color: '#e8a0c8',
    roughness: 0.7,
    metalness: 0.0,
    opacity: 1.0,
    texture: {
      type: 'foam-closed',
      scale: 0.5,
      bumpStrength: 0.3
    },
    thickness: { min: 25.0, max: 100.0, typical: 50.0 },
    application: ['cold-adhered', 'mechanically-fastened'],
    substrates: ['existing-membrane', 'concrete-cast'],
    description: 'Closed-cell extruded polystyrene rigid insulation',
    visualNotes: 'Pink, blue, or green depending on manufacturer. Smooth with slight foam texture.'
  },

  'polyiso-insulation': {
    id: 'polyiso-insulation',
    name: 'Polyisocyanurate Insulation',
    category: 'insulation',
    color: '#c9a227',
    roughness: 0.3,
    metalness: 0.3,
    opacity: 1.0,
    texture: {
      type: 'smooth',
      scale: 1.0,
      bumpStrength: 0.1
    },
    thickness: { min: 25.0, max: 150.0, typical: 75.0 },
    application: ['cold-adhered', 'mechanically-fastened'],
    substrates: ['metal-deck', 'plywood', 'osb', 'concrete-cast'],
    description: 'Polyiso rigid insulation with foil facer',
    visualNotes: 'Tan/gold foil facing (reflective). Edges show yellow foam core.'
  },

  // ==========================================
  // SUBSTRATES
  // ==========================================

  'concrete-formed': {
    id: 'concrete-formed',
    name: 'Cast-in-Place Concrete',
    category: 'substrate',
    color: '#808080',
    roughness: 0.85,
    metalness: 0.0,
    opacity: 1.0,
    texture: {
      type: 'concrete-formed',
      scale: 1.0,
      bumpStrength: 0.5
    },
    thickness: { min: 150.0, max: 400.0, typical: 200.0 },
    application: [],
    substrates: [],
    description: 'Form-finished cast-in-place concrete',
    visualNotes: 'Gray with form tie holes, bug holes, and slight form marks. Color varies with mix.'
  },

  'cmu-block': {
    id: 'cmu-block',
    name: 'Concrete Masonry Unit',
    category: 'substrate',
    color: '#9a9a9a',
    roughness: 0.9,
    metalness: 0.0,
    opacity: 1.0,
    texture: {
      type: 'concrete-broom',
      scale: 0.8,
      bumpStrength: 0.6
    },
    thickness: { min: 150.0, max: 300.0, typical: 200.0 },
    application: [],
    substrates: [],
    description: 'Standard gray concrete masonry block',
    visualNotes: 'Light gray, coarse texture with visible aggregate. Mortar joints every ~200mm.'
  },

  'steel-structural': {
    id: 'steel-structural',
    name: 'Structural Steel',
    category: 'substrate',
    color: '#5a5a6a',
    roughness: 0.4,
    metalness: 0.8,
    opacity: 1.0,
    texture: {
      type: 'metal-mill',
      scale: 1.0,
      bumpStrength: 0.2
    },
    thickness: { min: 6.0, max: 25.0, typical: 12.0 },
    application: [],
    substrates: [],
    description: 'Structural steel with mill scale or primer',
    visualNotes: 'Blue-gray mill scale or red/gray primer. Often shows weld marks.'
  },

  'wood-framing': {
    id: 'wood-framing',
    name: 'Wood Framing Lumber',
    category: 'substrate',
    color: '#c4a574',
    roughness: 0.7,
    metalness: 0.0,
    opacity: 1.0,
    texture: {
      type: 'fabric',
      scale: 0.5,
      bumpStrength: 0.4
    },
    thickness: { min: 38.0, max: 140.0, typical: 38.0 },
    application: [],
    substrates: [],
    description: 'Dimensional lumber framing',
    visualNotes: 'Natural wood grain, tan/brown color. Shows knots and grain patterns.'
  },

  'plywood-sheathing': {
    id: 'plywood-sheathing',
    name: 'Plywood Sheathing',
    category: 'substrate',
    color: '#d4b896',
    roughness: 0.6,
    metalness: 0.0,
    opacity: 1.0,
    texture: {
      type: 'fabric',
      scale: 0.8,
      bumpStrength: 0.3
    },
    thickness: { min: 9.5, max: 19.0, typical: 12.7 },
    application: [],
    substrates: [],
    description: 'Structural plywood sheathing',
    visualNotes: 'Light tan with visible veneer grain. May show stamps and grade marks.'
  },

  // ==========================================
  // SEALANTS & ACCESSORIES
  // ==========================================

  'sealant-polyurethane': {
    id: 'sealant-polyurethane',
    name: 'Polyurethane Sealant',
    category: 'sealant',
    color: '#4a4a4a',
    roughness: 0.5,
    metalness: 0.0,
    opacity: 1.0,
    texture: {
      type: 'smooth',
      scale: 1.0,
      bumpStrength: 0.1
    },
    thickness: { min: 6.0, max: 25.0, typical: 12.0 },
    application: ['trowel-applied'],
    substrates: ['concrete-cast', 'steel', 'masonry'],
    description: 'Elastomeric polyurethane joint sealant',
    visualNotes: 'Gray, smooth with slight sheen. Often tooled with concave profile.'
  },

  'sealant-silicone': {
    id: 'sealant-silicone',
    name: 'Silicone Sealant',
    category: 'sealant',
    color: '#d0d0d0',
    roughness: 0.3,
    metalness: 0.0,
    opacity: 0.9,
    texture: {
      type: 'smooth',
      scale: 1.0,
      bumpStrength: 0.05
    },
    thickness: { min: 6.0, max: 20.0, typical: 10.0 },
    application: ['trowel-applied'],
    substrates: ['steel', 'concrete-cast'],
    description: 'Silicone joint sealant',
    visualNotes: 'Clear, white, or gray. Very smooth, slightly glossy. Translucent when clear.'
  },

  'backer-rod': {
    id: 'backer-rod',
    name: 'Closed-Cell Backer Rod',
    category: 'sealant',
    color: '#e8e8e8',
    roughness: 0.7,
    metalness: 0.0,
    opacity: 1.0,
    texture: {
      type: 'foam-closed',
      scale: 0.3,
      bumpStrength: 0.2
    },
    thickness: { min: 6.0, max: 50.0, typical: 12.0 },
    application: [],
    substrates: [],
    description: 'Polyethylene foam backer rod for sealant joints',
    visualNotes: 'Gray or white cylindrical foam. Compresses to control sealant depth.'
  },

  'metal-flashing': {
    id: 'metal-flashing',
    name: 'Sheet Metal Flashing',
    category: 'flashing',
    color: '#8a8a8a',
    roughness: 0.3,
    metalness: 0.7,
    opacity: 1.0,
    texture: {
      type: 'metal-mill',
      scale: 1.0,
      bumpStrength: 0.1
    },
    thickness: { min: 0.5, max: 1.5, typical: 0.8 },
    application: ['mechanically-fastened'],
    substrates: ['plywood', 'osb', 'concrete-cast', 'cmu'],
    description: 'Galvanized or aluminum sheet metal flashing',
    visualNotes: 'Silver/gray metallic. May show bends, hems, and fastener dimples.'
  },

  'termination-bar': {
    id: 'termination-bar',
    name: 'Aluminum Termination Bar',
    category: 'flashing',
    color: '#c0c0c0',
    roughness: 0.25,
    metalness: 0.8,
    opacity: 1.0,
    texture: {
      type: 'metal-mill',
      scale: 1.0,
      bumpStrength: 0.1
    },
    thickness: { min: 1.5, max: 3.0, typical: 2.0 },
    application: ['mechanically-fastened'],
    substrates: ['concrete-cast', 'cmu', 'masonry'],
    description: 'Extruded aluminum termination bar with pre-drilled holes',
    visualNotes: 'Silver aluminum, extruded profile. Fastener holes every ~150mm.'
  },

  // ==========================================
  // PRIMERS
  // ==========================================

  'primer-asphalt': {
    id: 'primer-asphalt',
    name: 'Asphalt Primer',
    category: 'primer',
    color: '#1a1a1a',
    roughness: 0.5,
    metalness: 0.0,
    opacity: 0.8,
    texture: {
      type: 'smooth',
      scale: 1.0,
      bumpStrength: 0.1
    },
    thickness: { min: 0.1, max: 0.3, typical: 0.2 },
    application: ['roller-applied', 'spray-applied'],
    substrates: ['concrete-cast', 'cmu', 'masonry'],
    description: 'Solvent-based asphalt primer for membrane adhesion',
    visualNotes: 'Thin black coating, slightly glossy when wet, matte when dry. Shows substrate texture through.'
  }
};

/**
 * Get a base material by ID
 */
export function getBaseMaterial(id: string): BaseMaterial | undefined {
  return BASE_MATERIALS[id];
}

/**
 * Get all materials in a category
 */
export function getMaterialsByCategory(category: MaterialCategory): BaseMaterial[] {
  return Object.values(BASE_MATERIALS).filter(m => m.category === category);
}

/**
 * Search materials by name or description
 */
export function searchMaterials(query: string): BaseMaterial[] {
  const lowerQuery = query.toLowerCase();
  return Object.values(BASE_MATERIALS).filter(m =>
    m.name.toLowerCase().includes(lowerQuery) ||
    m.description.toLowerCase().includes(lowerQuery) ||
    m.visualNotes.toLowerCase().includes(lowerQuery)
  );
}
