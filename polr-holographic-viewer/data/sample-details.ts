import { SemanticDetail } from '../schemas/semantic-detail';

/**
 * Sample Construction Details Library
 * Demonstrates semantic compression for various detail types
 */

export const SAMPLE_DETAILS: SemanticDetail[] = [
  // ==========================================
  // WP-003: Expansion Joint at Foundation Wall
  // ==========================================
  {
    id: "WP-003",
    category: "expansion-joint",
    name: "Expansion Joint at Foundation Wall",
    description: "Waterproofing continuity across expansion joint with backer rod and sealant",
    parameters: {
      jointWidth: 25,            // mm - gap width
      jointDepth: 20,            // mm - sealant depth
      wallThickness: 300,        // mm
      membraneOverlap: 150,      // mm - each side
      backerRodDiameter: 32,     // mm - 25% larger than gap
    },
    viewport: {
      width: 500,
      height: 400,
      depth: 150,
      cameraAngle: 'isometric'
    },
    layers: [
      {
        id: "substrate-left",
        material: "concrete",
        thickness: 300,
        position: "substrate",
        properties: { 
          color: "#7a7a7a", 
          opacity: 1, 
          pattern: "solid",
          roughness: 0.9
        },
        annotation: "CONCRETE FOUNDATION WALL"
      },
      {
        id: "substrate-right",
        material: "concrete",
        thickness: 300,
        position: "substrate",
        properties: { 
          color: "#7a7a7a", 
          opacity: 1, 
          pattern: "solid",
          roughness: 0.9
        }
      },
      {
        id: "primer",
        material: "primer",
        thickness: 0.5,
        position: "primer",
        properties: { 
          color: "#1a1a1a", 
          opacity: 0.8, 
          pattern: "solid" 
        },
        annotation: "PRIMER"
      },
      {
        id: "membrane",
        material: "membrane-sheet",
        thickness: 1.5,
        position: "membrane",
        properties: { 
          color: "#0a0a0a", 
          opacity: 1, 
          pattern: "solid",
          metallic: 0.1
        },
        profile: 'curved',
        annotation: "BITUTHENE 3000"
      },
      {
        id: "backer-rod",
        material: "backer-rod",
        thickness: 32,
        position: "finish",
        properties: { 
          color: "#e8e8e8", 
          opacity: 0.9, 
          pattern: "solid" 
        },
        profile: 'curved',
        annotation: "CLOSED-CELL BACKER ROD"
      },
      {
        id: "sealant",
        material: "sealant",
        thickness: 20,
        position: "finish",
        properties: { 
          color: "#4a4a4a", 
          opacity: 0.95, 
          pattern: "solid" 
        },
        profile: 'curved',
        annotation: "POLYURETHANE SEALANT"
      }
    ],
    connections: [
      { type: "seal", from: "primer", to: "substrate-left", method: "roller-applied" },
      { type: "seal", from: "primer", to: "substrate-right", method: "roller-applied" },
      { type: "overlap", from: "membrane", to: "substrate-left", method: "adhesive", dimension: 150 },
      { type: "overlap", from: "membrane", to: "substrate-right", method: "adhesive", dimension: 150 },
      { type: "bridge", from: "membrane", to: "backer-rod", method: "loop-over" },
      { type: "terminate", from: "sealant", to: "membrane", method: "tooled-joint" }
    ],
    products: [
      { manufacturer: "GCP", product: "BITUTHENE PRIMER B2", layer: "primer" },
      { manufacturer: "GCP", product: "BITUTHENE 3000", layer: "membrane" },
      { manufacturer: "DOW", product: "BACKER ROD", layer: "backer-rod" },
      { manufacturer: "SIKA", product: "SIKAFLEX-1A", layer: "sealant" }
    ],
    version: "1.0",
    source: {
      standard: "ASTM C1193",
      drawingRef: "Detail WP-003/A201"
    }
  },

  // ==========================================
  // AB-001: Air Barrier at Window Head
  // ==========================================
  {
    id: "AB-001",
    category: "air-barrier",
    name: "Air Barrier at Window Head",
    description: "Fluid-applied air barrier transition at window rough opening",
    parameters: {
      openingWidth: 900,
      studsSpacing: 406,         // 16" OC
      sheathing: 12.7,           // 1/2" plywood
      airBarrierThickness: 1.5,
      flashingWidth: 150,
    },
    viewport: {
      width: 400,
      height: 350,
      depth: 200,
      cameraAngle: 'section'
    },
    layers: [
      {
        id: "stud",
        material: "wood",
        thickness: 38,
        position: "substrate",
        properties: { 
          color: "#c4a574", 
          opacity: 1, 
          pattern: "solid",
          roughness: 0.7
        },
        annotation: "2x6 WOOD STUD"
      },
      {
        id: "sheathing",
        material: "wood",
        thickness: 12.7,
        position: "substrate",
        properties: { 
          color: "#d4b896", 
          opacity: 1, 
          pattern: "crosshatch" 
        },
        annotation: "1/2\" PLYWOOD SHEATHING"
      },
      {
        id: "air-barrier",
        material: "air-barrier",
        thickness: 1.5,
        position: "membrane",
        properties: { 
          color: "#ff6b00", 
          opacity: 0.9, 
          pattern: "solid",
          emissive: "#ff6b00"
        },
        annotation: "FLUID-APPLIED AIR BARRIER"
      },
      {
        id: "flashing-membrane",
        material: "membrane-sheet",
        thickness: 1,
        position: "membrane",
        properties: { 
          color: "#2a2a2a", 
          opacity: 1, 
          pattern: "solid" 
        },
        profile: 'stepped',
        annotation: "SELF-ADHERED FLASHING"
      },
      {
        id: "window-frame",
        material: "steel",
        thickness: 50,
        position: "finish",
        properties: { 
          color: "#333333", 
          opacity: 1, 
          pattern: "solid",
          metallic: 0.8,
          roughness: 0.2
        },
        annotation: "WINDOW FRAME"
      }
    ],
    connections: [
      { type: "seal", from: "air-barrier", to: "sheathing", method: "spray-applied" },
      { type: "overlap", from: "flashing-membrane", to: "air-barrier", method: "shingled", dimension: 75 },
      { type: "seal", from: "flashing-membrane", to: "window-frame", method: "sealant-bed" }
    ],
    products: [
      { manufacturer: "PROSOCO", product: "R-GUARD FASTFLASH", layer: "air-barrier", color: "#ff6b00" },
      { manufacturer: "GCP", product: "VYCOR PLUS", layer: "flashing-membrane" }
    ],
    version: "1.0"
  },

  // ==========================================
  // RF-002: Roof Edge Termination
  // ==========================================
  {
    id: "RF-002",
    category: "roofing",
    name: "Roof Edge Termination with Metal Coping",
    description: "Built-up roofing termination at parapet with metal coping",
    parameters: {
      parapetHeight: 450,
      parapetThickness: 200,
      copingWidth: 300,
      membranePlies: 3,
      insulationThickness: 100,
    },
    viewport: {
      width: 500,
      height: 500,
      depth: 200,
      cameraAngle: 'isometric'
    },
    layers: [
      {
        id: "deck",
        material: "concrete",
        thickness: 150,
        position: "substrate",
        properties: { 
          color: "#808080", 
          opacity: 1, 
          pattern: "solid" 
        },
        annotation: "CONCRETE DECK"
      },
      {
        id: "parapet-wall",
        material: "cmu",
        thickness: 200,
        position: "substrate",
        properties: { 
          color: "#9a9a9a", 
          opacity: 1, 
          pattern: "hatch" 
        },
        annotation: "CMU PARAPET"
      },
      {
        id: "vapor-barrier",
        material: "vapor-barrier",
        thickness: 0.15,
        position: "primer",
        properties: { 
          color: "#222222", 
          opacity: 0.7, 
          pattern: "solid" 
        },
        annotation: "VAPOR RETARDER"
      },
      {
        id: "insulation",
        material: "insulation-rigid",
        thickness: 100,
        position: "insulation",
        properties: { 
          color: "#ffd700", 
          opacity: 0.9, 
          pattern: "crosshatch" 
        },
        annotation: "POLYISO INSULATION"
      },
      {
        id: "cover-board",
        material: "protection-board",
        thickness: 6,
        position: "protection",
        properties: { 
          color: "#d4d4d4", 
          opacity: 1, 
          pattern: "solid" 
        },
        annotation: "COVER BOARD"
      },
      {
        id: "roof-membrane",
        material: "membrane-sheet",
        thickness: 4.5,
        position: "membrane",
        properties: { 
          color: "#1a1a1a", 
          opacity: 1, 
          pattern: "solid" 
        },
        annotation: "EPDM MEMBRANE"
      },
      {
        id: "cant-strip",
        material: "cant-strip",
        thickness: 100,
        position: "protection",
        properties: { 
          color: "#ffcc00", 
          opacity: 0.9, 
          pattern: "diagonal" 
        },
        profile: 'tapered',
        annotation: "CANT STRIP"
      },
      {
        id: "base-flashing",
        material: "membrane-sheet",
        thickness: 1.5,
        position: "membrane",
        properties: { 
          color: "#0a0a0a", 
          opacity: 1, 
          pattern: "solid" 
        },
        annotation: "BASE FLASHING"
      },
      {
        id: "termination-bar",
        material: "termination-bar",
        thickness: 3,
        position: "finish",
        properties: { 
          color: "#c0c0c0", 
          opacity: 1, 
          pattern: "solid",
          metallic: 0.7
        },
        annotation: "TERMINATION BAR"
      },
      {
        id: "metal-coping",
        material: "flashing-metal",
        thickness: 1.2,
        position: "finish",
        properties: { 
          color: "#a8a8a8", 
          opacity: 1, 
          pattern: "solid",
          metallic: 0.9,
          roughness: 0.3
        },
        annotation: "METAL COPING"
      }
    ],
    connections: [
      { type: "seal", from: "vapor-barrier", to: "deck", method: "fully-adhered" },
      { type: "fasten", from: "insulation", to: "deck", method: "mechanical" },
      { type: "overlap", from: "roof-membrane", to: "cover-board", method: "fully-adhered" },
      { type: "wrap", from: "base-flashing", to: "cant-strip", method: "shingled", dimension: 100 },
      { type: "terminate", from: "base-flashing", to: "termination-bar", method: "mechanical" },
      { type: "seal", from: "termination-bar", to: "parapet-wall", method: "sealant" },
      { type: "fasten", from: "metal-coping", to: "parapet-wall", method: "cleats" }
    ],
    products: [
      { manufacturer: "FIRESTONE", product: "RUBBERGARD EPDM", layer: "roof-membrane" },
      { manufacturer: "CARLISLE", product: "INSULFOAM", layer: "insulation" },
      { manufacturer: "FIRESTONE", product: "QUICKSEAM SA FLASHING", layer: "base-flashing" }
    ],
    version: "1.0"
  },

  // ==========================================
  // FD-001: Foundation to Slab Transition
  // ==========================================
  {
    id: "FD-001",
    category: "foundation",
    name: "Foundation Wall to Slab-on-Grade",
    description: "Below-grade waterproofing transition from wall to slab",
    parameters: {
      wallHeight: 3000,
      wallThickness: 250,
      slabThickness: 150,
      gravelBase: 150,
      membraneOverlap: 200,
    },
    viewport: {
      width: 600,
      height: 500,
      depth: 200,
      cameraAngle: 'section'
    },
    layers: [
      {
        id: "foundation-wall",
        material: "concrete",
        thickness: 250,
        position: "substrate",
        properties: { 
          color: "#7a7a7a", 
          opacity: 1, 
          pattern: "solid" 
        },
        annotation: "FOUNDATION WALL"
      },
      {
        id: "footing",
        material: "concrete",
        thickness: 300,
        position: "substrate",
        properties: { 
          color: "#6a6a6a", 
          opacity: 1, 
          pattern: "solid" 
        },
        annotation: "STRIP FOOTING"
      },
      {
        id: "gravel-base",
        material: "drainage-mat",
        thickness: 150,
        position: "drainage",
        properties: { 
          color: "#a89078", 
          opacity: 0.8, 
          pattern: "stipple" 
        },
        annotation: "COMPACTED GRAVEL"
      },
      {
        id: "under-slab-membrane",
        material: "membrane-sheet",
        thickness: 0.25,
        position: "membrane",
        properties: { 
          color: "#1a1a1a", 
          opacity: 0.9, 
          pattern: "solid" 
        },
        annotation: "VAPOR BARRIER"
      },
      {
        id: "slab",
        material: "concrete",
        thickness: 150,
        position: "substrate",
        properties: { 
          color: "#888888", 
          opacity: 1, 
          pattern: "solid" 
        },
        annotation: "CONCRETE SLAB"
      },
      {
        id: "wall-membrane",
        material: "membrane-sheet",
        thickness: 1.5,
        position: "membrane",
        properties: { 
          color: "#0a0a0a", 
          opacity: 1, 
          pattern: "solid" 
        },
        annotation: "WALL WATERPROOFING"
      },
      {
        id: "protection-board",
        material: "protection-board",
        thickness: 6,
        position: "protection",
        properties: { 
          color: "#d4d4d4", 
          opacity: 0.9, 
          pattern: "solid" 
        },
        annotation: "PROTECTION BOARD"
      },
      {
        id: "drainage-mat",
        material: "drainage-mat",
        thickness: 8,
        position: "drainage",
        properties: { 
          color: "#2a5a2a", 
          opacity: 0.85, 
          pattern: "dots" 
        },
        annotation: "DRAINAGE MAT"
      }
    ],
    connections: [
      { type: "seal", from: "wall-membrane", to: "foundation-wall", method: "fully-adhered" },
      { type: "overlap", from: "wall-membrane", to: "under-slab-membrane", method: "shingled", dimension: 200 },
      { type: "seal", from: "wall-membrane", to: "footing", method: "fillet" }
    ],
    products: [
      { manufacturer: "GCP", product: "BITUTHENE 3000", layer: "wall-membrane" },
      { manufacturer: "GCP", product: "HYDRODUCT 220", layer: "drainage-mat" },
      { manufacturer: "STEGO", product: "STEGO WRAP 15-MIL", layer: "under-slab-membrane" }
    ],
    version: "1.0"
  },

  // ==========================================
  // PN-001: Pipe Penetration Through Membrane
  // ==========================================
  {
    id: "PN-001",
    category: "penetration",
    name: "Pipe Penetration Through Waterproofing",
    description: "Round pipe penetration with collar and sealant",
    parameters: {
      pipeDiameter: 100,
      collarHeight: 150,
      membraneThickness: 1.5,
      sealantWidth: 25,
    },
    viewport: {
      width: 350,
      height: 350,
      depth: 350,
      cameraAngle: 'isometric'
    },
    layers: [
      {
        id: "substrate",
        material: "concrete",
        thickness: 200,
        position: "substrate",
        properties: { 
          color: "#7a7a7a", 
          opacity: 1, 
          pattern: "solid" 
        },
        annotation: "CONCRETE SUBSTRATE"
      },
      {
        id: "pipe",
        material: "steel",
        thickness: 100,
        position: "substrate",
        properties: { 
          color: "#505050", 
          opacity: 1, 
          pattern: "solid",
          metallic: 0.6
        },
        profile: 'curved',
        annotation: "4\" STEEL PIPE"
      },
      {
        id: "membrane",
        material: "membrane-sheet",
        thickness: 1.5,
        position: "membrane",
        properties: { 
          color: "#0a0a0a", 
          opacity: 1, 
          pattern: "solid" 
        },
        annotation: "WATERPROOFING MEMBRANE"
      },
      {
        id: "collar",
        material: "membrane-sheet",
        thickness: 1.5,
        position: "membrane",
        properties: { 
          color: "#1a1a1a", 
          opacity: 1, 
          pattern: "solid" 
        },
        profile: 'curved',
        annotation: "PIPE COLLAR"
      },
      {
        id: "clamp",
        material: "steel",
        thickness: 25,
        position: "finish",
        properties: { 
          color: "#a0a0a0", 
          opacity: 1, 
          pattern: "solid",
          metallic: 0.8
        },
        profile: 'curved',
        annotation: "STAINLESS CLAMP"
      },
      {
        id: "sealant",
        material: "sealant",
        thickness: 10,
        position: "finish",
        properties: { 
          color: "#4a4a4a", 
          opacity: 0.9, 
          pattern: "solid" 
        },
        annotation: "POLYURETHANE SEALANT"
      }
    ],
    connections: [
      { type: "seal", from: "membrane", to: "substrate", method: "fully-adhered" },
      { type: "wrap", from: "collar", to: "pipe", method: "prefabricated" },
      { type: "overlap", from: "collar", to: "membrane", method: "shingled", dimension: 100 },
      { type: "fasten", from: "clamp", to: "pipe", method: "mechanical" },
      { type: "seal", from: "sealant", to: "pipe", method: "gun-applied" }
    ],
    products: [
      { manufacturer: "GCP", product: "BITUTHENE 3000", layer: "membrane" },
      { manufacturer: "PORTALS PLUS", product: "PIPE COLLAR", layer: "collar" },
      { manufacturer: "SIKA", product: "SIKAFLEX-1A", layer: "sealant" }
    ],
    version: "1.0"
  }
];

/**
 * Get detail by ID
 */
export function getDetailById(id: string): SemanticDetail | undefined {
  return SAMPLE_DETAILS.find(d => d.id === id);
}

/**
 * Get details by category
 */
export function getDetailsByCategory(category: SemanticDetail['category']): SemanticDetail[] {
  return SAMPLE_DETAILS.filter(d => d.category === category);
}

/**
 * Get all unique manufacturers from details
 */
export function getAllManufacturers(): string[] {
  const manufacturers = new Set<string>();
  SAMPLE_DETAILS.forEach(detail => {
    detail.products.forEach(product => {
      manufacturers.add(product.manufacturer);
    });
  });
  return Array.from(manufacturers).sort();
}
