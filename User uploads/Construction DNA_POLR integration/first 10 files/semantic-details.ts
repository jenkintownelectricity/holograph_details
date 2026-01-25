/**
 * Sample Semantic Details
 * 
 * Example roofing assembly details with DNA material links
 */

import type { SemanticDetail, Layer } from '../types';

// ============================================================================
// TPO MECHANICALLY ATTACHED ASSEMBLY
// ============================================================================

export const tpoMechanicallyAttached: SemanticDetail = {
  id: 'tpo-mech-attached-001',
  name: 'TPO Mechanically Attached',
  description: 'Single-ply TPO membrane mechanically fastened over polyiso insulation with gypsum cover board',
  category: 'roof',
  manufacturer: 'Carlisle SynTec',
  productLine: 'Sure-Weld',
  layers: [
    {
      id: 'layer-1-deck',
      name: 'Steel Deck',
      materialType: 'Metal Deck',
      thickness: 0.0625, // 1/16" = 22 gauge
      color: '#808080',
      order: 0
    },
    {
      id: 'layer-2-vapor',
      name: 'Vapor Retarder',
      materialType: 'Self-Adhered Membrane',
      thickness: 0.060, // 60 mil
      color: '#2D2D2D',
      order: 1
    },
    {
      id: 'layer-3-insulation',
      name: 'Polyiso Insulation',
      materialType: 'Polyiso Insulation',
      thickness: 2.5, // 2.5"
      color: '#D4A574',
      order: 2,
      dnaId: 'polyiso-atlas-r30' // Link to DNA material
    },
    {
      id: 'layer-4-coverboard',
      name: 'Gypsum Cover Board',
      materialType: 'Gypsum Cover Board',
      thickness: 0.5, // 1/2"
      color: '#E8E4D9',
      order: 3
    },
    {
      id: 'layer-5-membrane',
      name: 'TPO Membrane',
      materialType: 'TPO Membrane',
      thickness: 0.060, // 60 mil
      color: '#F5F5F5',
      order: 4,
      dnaId: 'tpo-carlisle-60' // Link to DNA material
    }
  ],
  totalThickness: 3.182,
  rValue: 15.0,
  warrantyYears: 20
};

// ============================================================================
// EPDM FULLY ADHERED ASSEMBLY
// ============================================================================

export const epdmFullyAdhered: SemanticDetail = {
  id: 'epdm-adhered-001',
  name: 'EPDM Fully Adhered',
  description: 'Single-ply EPDM membrane fully adhered over polyiso insulation',
  category: 'roof',
  manufacturer: 'Firestone Building Products',
  productLine: 'RubberGard',
  layers: [
    {
      id: 'layer-1-deck',
      name: 'Steel Deck',
      materialType: 'Metal Deck',
      thickness: 0.0625,
      color: '#808080',
      order: 0
    },
    {
      id: 'layer-2-vapor',
      name: 'Vapor Retarder',
      materialType: 'Self-Adhered Membrane',
      thickness: 0.040,
      color: '#1A1A1A',
      order: 1
    },
    {
      id: 'layer-3-insulation-1',
      name: 'Polyiso Base Layer',
      materialType: 'Polyiso Insulation',
      thickness: 2.0,
      color: '#D4A574',
      order: 2,
      dnaId: 'polyiso-atlas-r30'
    },
    {
      id: 'layer-4-insulation-2',
      name: 'Polyiso Top Layer',
      materialType: 'Polyiso Insulation',
      thickness: 2.0,
      color: '#D4A574',
      order: 3,
      dnaId: 'polyiso-atlas-r30'
    },
    {
      id: 'layer-5-coverboard',
      name: 'HD Polyiso Cover Board',
      materialType: 'Polyiso Cover Board',
      thickness: 0.5,
      color: '#C4A060',
      order: 4
    },
    {
      id: 'layer-6-membrane',
      name: 'EPDM Membrane',
      materialType: 'EPDM Membrane',
      thickness: 0.090, // 90 mil
      color: '#1A1A1A',
      order: 5,
      dnaId: 'epdm-firestone-90' // Link to DNA material
    }
  ],
  totalThickness: 4.693,
  rValue: 24.0,
  warrantyYears: 30
};

// ============================================================================
// SBS MODIFIED BITUMEN (2-PLY)
// ============================================================================

export const sbsModifiedBitumen: SemanticDetail = {
  id: 'sbs-mod-bit-001',
  name: 'SBS Modified Bitumen 2-Ply',
  description: 'Two-ply SBS modified bitumen system with granule cap sheet',
  category: 'roof',
  manufacturer: 'SOPREMA',
  productLine: 'SOPRALENE',
  layers: [
    {
      id: 'layer-1-deck',
      name: 'Concrete Deck',
      materialType: 'Concrete',
      thickness: 4.0,
      color: '#9CA3AF',
      order: 0
    },
    {
      id: 'layer-2-primer',
      name: 'Asphalt Primer',
      materialType: 'Asphalt Primer',
      thickness: 0.005,
      color: '#1F2937',
      order: 1
    },
    {
      id: 'layer-3-insulation',
      name: 'Polyiso Insulation',
      materialType: 'Polyiso Insulation',
      thickness: 3.0,
      color: '#D4A574',
      order: 2,
      dnaId: 'polyiso-atlas-r30'
    },
    {
      id: 'layer-4-base',
      name: 'SBS Base Sheet',
      materialType: 'SBS Base Sheet',
      thickness: 0.120, // 120 mil
      color: '#374151',
      order: 3
    },
    {
      id: 'layer-5-cap',
      name: 'SBS Cap Sheet',
      materialType: 'SBS Cap Sheet',
      thickness: 0.180, // 180 mil
      color: '#2D2D2D',
      order: 4,
      dnaId: 'sbs-soprema-cap' // Link to DNA material
    }
  ],
  totalThickness: 7.305,
  rValue: 18.0,
  warrantyYears: 25
};

// ============================================================================
// INCOMPATIBLE ASSEMBLY (FOR TESTING WARNINGS)
// ============================================================================

export const incompatibleAssembly: SemanticDetail = {
  id: 'incompatible-001',
  name: 'INCOMPATIBLE DEMO (DO NOT USE)',
  description: 'This assembly has intentionally incompatible materials for testing compatibility warnings',
  category: 'roof',
  manufacturer: 'Test',
  layers: [
    {
      id: 'layer-1-deck',
      name: 'Steel Deck',
      materialType: 'Metal Deck',
      thickness: 0.0625,
      color: '#808080',
      order: 0
    },
    {
      id: 'layer-2-insulation',
      name: 'Polyiso Insulation',
      materialType: 'Polyiso Insulation',
      thickness: 2.5,
      color: '#D4A574',
      order: 1,
      dnaId: 'polyiso-atlas-r30'
    },
    {
      id: 'layer-3-epdm',
      name: 'EPDM (WRONG PLACEMENT)',
      materialType: 'EPDM Membrane',
      thickness: 0.090,
      color: '#1A1A1A',
      order: 2,
      dnaId: 'epdm-firestone-90'
    },
    {
      id: 'layer-4-sbs',
      name: 'SBS CAP (INCOMPATIBLE WITH EPDM!)',
      materialType: 'SBS Cap Sheet',
      thickness: 0.180,
      color: '#2D2D2D',
      order: 3,
      dnaId: 'sbs-soprema-cap' // SBS is incompatible with EPDM!
    }
  ],
  totalThickness: 2.833,
  rValue: 15.0,
  warrantyYears: 0 // No warranty for incompatible assembly!
};

// ============================================================================
// EXPORTS
// ============================================================================

export const SAMPLE_DETAILS: SemanticDetail[] = [
  tpoMechanicallyAttached,
  epdmFullyAdhered,
  sbsModifiedBitumen,
  incompatibleAssembly
];

export function getDetailById(id: string): SemanticDetail | undefined {
  return SAMPLE_DETAILS.find(d => d.id === id);
}

export function getDetailsByManufacturer(manufacturer: string): SemanticDetail[] {
  return SAMPLE_DETAILS.filter(
    d => d.manufacturer.toLowerCase().includes(manufacturer.toLowerCase())
  );
}

export function getDetailsByCategory(category: string): SemanticDetail[] {
  return SAMPLE_DETAILS.filter(d => d.category === category);
}
