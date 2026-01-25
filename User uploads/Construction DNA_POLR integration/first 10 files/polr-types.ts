/**
 * POLR Holographic Viewer Types
 * 
 * Types specific to the 3D semantic detail viewer
 */

import type { MaterialDNA, BaseChemistry } from './construction-dna';

// ============================================================================
// SEMANTIC DETAIL TYPES
// ============================================================================

/**
 * A layer in a roofing assembly detail
 */
export interface Layer {
  id: string;
  name: string;
  materialType: string;        // General type (e.g., "TPO Membrane", "Polyiso Insulation")
  thickness: number;           // Thickness in inches
  color: string;               // Hex color for 3D rendering
  order: number;               // Stack order (0 = bottom)
  
  // DNA Integration (Phase 4)
  dnaId?: string;              // Reference to MaterialDNA.id
  dnaMaterial?: MaterialDNA;   // Resolved DNA data (populated at runtime)
}

/**
 * A complete roofing assembly detail
 */
export interface SemanticDetail {
  id: string;
  name: string;                // e.g., "TPO Mechanically Attached"
  description: string;
  category: 'roof' | 'wall' | 'foundation' | 'other';
  
  // Manufacturer info
  manufacturer: string;
  productLine?: string;
  
  // Assembly data
  layers: Layer[];
  
  // Metadata
  totalThickness?: number;     // Calculated from layers
  rValue?: number;             // Total R-value
  warrantyYears?: number;
  
  // DNA Integration
  compatibilityWarnings?: CompatibilityWarning[];
}

/**
 * Warning about incompatible adjacent materials
 */
export interface CompatibilityWarning {
  layerId1: string;
  layerId2: string;
  layer1Name: string;
  layer2Name: string;
  reason: string;
  severity: 'critical' | 'warning' | 'info';
}

// ============================================================================
// POLR MATERIAL (For Three.js rendering)
// ============================================================================

/**
 * Material properties for 3D rendering
 * Derived from MaterialDNA when available
 */
export interface POLRMaterial {
  id: string;
  name: string;
  
  // Visual properties
  color: string;               // Hex color
  roughness: number;           // 0-1 (derived from surfaceTreatment)
  metalness: number;           // 0-1
  opacity: number;             // 0-1
  
  // Physical properties
  thicknessInches: number;     // Thickness for 3D geometry
  
  // DNA reference
  dnaId?: string;
  dnaMaterial?: MaterialDNA;
  
  // Spec sheet
  specSheetUrl?: string;
}

// ============================================================================
// COMPARISON VIEW TYPES
// ============================================================================

/**
 * Comparison between two manufacturer details
 */
export interface DetailComparison {
  detail1: SemanticDetail;
  detail2: SemanticDetail;
  
  // Differences
  thicknessDelta: number;
  rValueDelta?: number;
  layerCountDelta: number;
  
  // DNA comparison
  compatibilityScore1: number;  // 0-100
  compatibilityScore2: number;
  
  // Winning metrics
  winner: {
    thickness: 'detail1' | 'detail2' | 'tie';
    rValue: 'detail1' | 'detail2' | 'tie';
    compatibility: 'detail1' | 'detail2' | 'tie';
  };
}

// ============================================================================
// STORE TYPES
// ============================================================================

/**
 * DNA Material Store state
 */
export interface DNAMaterialStoreState {
  materials: Map<string, MaterialDNA>;
  isLoading: boolean;
  error: string | null;
  lastImportedAt: Date | null;
}

/**
 * Import result from DNA file
 */
export interface DNAImportResult {
  success: boolean;
  materialsImported: number;
  materialsSkipped: number;
  errors: string[];
  warnings: string[];
}

// ============================================================================
// UI STATE TYPES
// ============================================================================

/**
 * Layer panel display state
 */
export interface LayerPanelState {
  selectedLayerId: string | null;
  expandedTierGroups: ('1-6' | '7-12' | '13-16' | '17-20')[];
  showDNADetails: boolean;
  showFailureModes: boolean;
  showCompatibility: boolean;
}

/**
 * DNA tier groupings for UI display
 */
export interface DNATierGroup {
  name: string;
  range: string;
  description: string;
  fields: (keyof MaterialDNA)[];
}

export const DNA_TIER_GROUPS: DNATierGroup[] = [
  {
    name: 'Classification',
    range: '1-6',
    description: 'What is it?',
    fields: ['id', 'division', 'category', 'assemblyType', 'manufacturer', 'product']
  },
  {
    name: 'Material Science',
    range: '7-12',
    description: "What's it made of?",
    fields: ['baseChemistry', 'reinforcement', 'surfaceTreatment', 'thicknessMil', 'color', 'sri']
  },
  {
    name: 'Performance',
    range: '13-16',
    description: 'How does it perform?',
    fields: ['fireRating', 'permRating', 'tensileStrength', 'elongation', 'tempRangeMin', 'tempRangeMax']
  },
  {
    name: 'Metadata',
    range: '17-20',
    description: 'Documentation & References',
    fields: ['failureModes', 'compatibilityNotes', 'applicationConstraints', 'codeReferences']
  }
];

// ============================================================================
// SURFACE TREATMENT TO ROUGHNESS MAPPING
// ============================================================================

/**
 * Maps DNA surface treatment to Three.js roughness value
 */
export const SURFACE_TREATMENT_ROUGHNESS: Record<string, number> = {
  'smooth': 0.2,
  'granule': 0.9,
  'fleece': 0.7,
  'foil': 0.1,
  'coated': 0.3,
  'reflective': 0.1,
  'textured': 0.6,
  'none': 0.5
};

/**
 * Maps base chemistry to default opacity
 */
export const CHEMISTRY_OPACITY: Record<BaseChemistry | string, number> = {
  'TPO': 1.0,
  'EPDM': 1.0,
  'PVC': 0.95,
  'SBS': 1.0,
  'APP': 1.0,
  'BUR': 1.0,
  'SPF': 0.98,
  'polyiso': 1.0,
  'XPS': 0.95,
  'EPS': 0.9,
  'mineral_wool': 0.85,
  'fiberglass': 0.8,
  'gypsum': 1.0,
  'silicone': 0.7,
  'urethane': 0.9,
  'acrylic': 0.85,
  'butyl': 1.0,
  'asphalt': 1.0,
  'metal': 1.0,
  'other': 1.0
};

// Re-export everything
export * from './construction-dna';
