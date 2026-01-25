/**
 * Construction Detail Test Fixtures
 * L0-CMD-2026-0125-002 Phase 6
 *
 * Test fixtures for semantic construction detail data
 */

import type { SemanticDetail, LayerDefinition, ConnectionDefinition, ProductReference } from '../../schemas/semantic-detail';

// Sample layer definitions
export const sampleLayers: Record<string, LayerDefinition> = {
  tpoMembrane: {
    id: 'layer-tpo-membrane',
    name: 'TPO Roofing Membrane',
    material: 'tpo',
    thickness: 60,
    unit: 'mil',
    color: 0xf5f5f5
  },
  epdmMembrane: {
    id: 'layer-epdm-membrane',
    name: 'EPDM Roofing Membrane',
    material: 'epdm',
    thickness: 60,
    unit: 'mil',
    color: 0x333333
  },
  polyisoInsulation: {
    id: 'layer-polyiso',
    name: 'Polyiso Roof Insulation',
    material: 'polyiso',
    thickness: 2,
    unit: 'inch',
    rValue: 12.1
  },
  coverBoard: {
    id: 'layer-cover-board',
    name: 'High-Density Cover Board',
    material: 'gypsum',
    thickness: 0.5,
    unit: 'inch'
  },
  vaporBarrier: {
    id: 'layer-vapor-barrier',
    name: 'Vapor Retarder',
    material: 'polyethylene',
    thickness: 6,
    unit: 'mil',
    permRating: 0.06
  },
  metalDeck: {
    id: 'layer-metal-deck',
    name: 'Steel Roof Deck',
    material: 'steel',
    thickness: 22,
    unit: 'gauge',
    color: 0x888888
  }
};

// Sample connection definitions
export const sampleConnections: Record<string, ConnectionDefinition> = {
  adheredMembrane: {
    id: 'conn-adhered',
    type: 'adhered',
    components: ['layer-tpo-membrane', 'layer-cover-board'],
    adhesive: 'low-rise-adhesive'
  },
  mechanicalFastener: {
    id: 'conn-mechanical',
    type: 'fastened',
    components: ['layer-polyiso', 'layer-metal-deck'],
    fastenerType: 'screw',
    spacing: 12
  },
  sealantJoint: {
    id: 'conn-sealant',
    type: 'sealed',
    components: ['layer-tpo-membrane', 'flashing'],
    sealant: 'urethane-sealant'
  }
};

// Sample product references
export const sampleProductRefs: ProductReference[] = [
  {
    productId: 'jm-tpo-roofing',
    manufacturer: 'johns-manville',
    role: 'primary-membrane',
    layer: 'layer-tpo-membrane'
  },
  {
    productId: 'atlas-polyiso',
    manufacturer: 'atlas-roofing',
    role: 'insulation',
    layer: 'layer-polyiso'
  },
  {
    productId: 'mule-hide-cover-boards',
    manufacturer: 'mule-hide',
    role: 'cover-board',
    layer: 'layer-cover-board'
  }
];

// Complete semantic detail fixtures
export const roofAssemblyDetail: SemanticDetail = {
  id: 'RF-TEST-001',
  name: 'Adhered TPO Roof Assembly',
  category: 'roofing',
  version: '1.0.0',
  layers: [
    sampleLayers.tpoMembrane,
    sampleLayers.coverBoard,
    sampleLayers.polyisoInsulation,
    sampleLayers.vaporBarrier,
    sampleLayers.metalDeck
  ],
  connections: [
    sampleConnections.adheredMembrane,
    sampleConnections.mechanicalFastener
  ],
  products: sampleProductRefs,
  dimensions: {
    width: 48,
    height: 6,
    depth: 48,
    unit: 'inch'
  }
};

export const expansionJointDetail: SemanticDetail = {
  id: 'EJ-TEST-001',
  name: 'Roof Expansion Joint',
  category: 'expansion-joint',
  version: '1.0.0',
  layers: [
    {
      id: 'layer-joint-cover',
      name: 'Expansion Joint Cover',
      material: 'epdm',
      thickness: 60,
      unit: 'mil',
      color: 0x333333
    },
    {
      id: 'layer-backer-rod',
      name: 'Backer Rod',
      material: 'foam',
      thickness: 1,
      unit: 'inch'
    }
  ],
  connections: [
    {
      id: 'conn-joint-seal',
      type: 'sealed',
      components: ['layer-joint-cover', 'layer-tpo-membrane'],
      sealant: 'sikaflex-1a'
    }
  ],
  products: [
    {
      productId: 'carlisle-epdm',
      manufacturer: 'carlisle',
      role: 'joint-cover',
      layer: 'layer-joint-cover'
    }
  ],
  dimensions: {
    width: 12,
    height: 4,
    depth: 120,
    unit: 'inch'
  }
};

export const airBarrierDetail: SemanticDetail = {
  id: 'AB-TEST-001',
  name: 'Fluid-Applied Air Barrier at CMU',
  category: 'air-barrier',
  version: '1.0.0',
  layers: [
    {
      id: 'layer-air-barrier',
      name: 'Fluid-Applied Air Barrier',
      material: 'fluid-applied',
      thickness: 40,
      unit: 'mil',
      color: 0x4a90d9
    },
    {
      id: 'layer-cmu',
      name: 'CMU Wall',
      material: 'cmu',
      thickness: 8,
      unit: 'inch',
      color: 0xaaaaaa
    }
  ],
  connections: [
    {
      id: 'conn-ab-applied',
      type: 'adhered',
      components: ['layer-air-barrier', 'layer-cmu']
    }
  ],
  products: [
    {
      productId: 'wr-meadows-fluid-air-barriers',
      manufacturer: 'wr-meadows',
      role: 'air-barrier',
      layer: 'layer-air-barrier'
    }
  ],
  dimensions: {
    width: 48,
    height: 96,
    depth: 8,
    unit: 'inch'
  }
};

// All test details
export const allTestDetails: SemanticDetail[] = [
  roofAssemblyDetail,
  expansionJointDetail,
  airBarrierDetail
];

// Detail IDs by category
export const detailIdsByCategory = {
  roofing: ['RF-TEST-001'],
  expansionJoint: ['EJ-TEST-001'],
  airBarrier: ['AB-TEST-001']
};

// Invalid detail fixtures for error testing
export const invalidDetails = {
  missingLayers: {
    id: 'INVALID-001',
    name: 'Detail Without Layers',
    category: 'roofing',
    version: '1.0.0',
    layers: [],
    connections: [],
    products: []
  },
  invalidCategory: {
    id: 'INVALID-002',
    name: 'Invalid Category Detail',
    category: 'not-a-real-category',
    version: '1.0.0',
    layers: [sampleLayers.tpoMembrane],
    connections: [],
    products: []
  }
};
