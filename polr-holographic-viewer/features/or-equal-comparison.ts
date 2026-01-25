/**
 * Or Equal Comparison Feature
 * POLR Strategic Development - Phase B2.1
 * 
 * PATENTABLE INNOVATION: Real-time manufacturer equivalency visualization
 * @module features/or-equal-comparison
 * @version 1.0.0
 */

import * as THREE from 'three';
import { resolveMaterialType } from '../data/layer-material-mapping';

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export type ComparisonMode = 'side-by-side' | 'slider' | 'toggle' | 'animate';

export interface ProductChange {
  layerId: string;
  fromManufacturer: string;
  fromProduct: string;
  toManufacturer: string;
  toProduct: string;
  confidenceScore: number;
  dimensionChanges?: { property: string; from: number; to: number; unit: string }[];
}

export interface DifferenceReport {
  productChanges: ProductChange[];
  warnings: string[];
  overallEquivalencyScore: number;
}

export interface SemanticDetail {
  id: string;
  name: string;
  layers: Array<{
    id: string;
    materialType: string;
    thickness: number;
    position: { x: number; y: number; z: number };
    material: { manufacturer?: string; product?: string; color?: string };
  }>;
}

// =============================================================================
// PRODUCT EQUIVALENCY DATABASE (Core IP)
// =============================================================================

export const PRODUCT_EQUIVALENCIES: Record<string, {
  baseType: string;
  products: Array<{ manufacturer: string; product: string; thickness?: number; confidenceScore: number }>;
}> = {
  // ==========================================================================
  // WATERPROOFING MEMBRANES (Original)
  // ==========================================================================
  'membrane-self-adhered-waterproofing': {
    baseType: 'Self-Adhered Waterproofing Membrane',
    products: [
      { manufacturer: 'GCP Applied Technologies', product: 'BITUTHENE 3000', thickness: 1.5, confidenceScore: 1.0 },
      { manufacturer: 'Carlisle CCW', product: 'MiraDRI 860', thickness: 1.5, confidenceScore: 0.95 },
      { manufacturer: 'Tremco', product: 'TREMproof 250GC', thickness: 1.5, confidenceScore: 0.92 },
      { manufacturer: 'W.R. Meadows', product: 'MEL-ROL', thickness: 1.5, confidenceScore: 0.90 },
      { manufacturer: 'Henry Company', product: 'Blueskin WP 200', thickness: 1.5, confidenceScore: 0.88 },
      { manufacturer: 'Sika', product: 'Sikadur Combiflex', thickness: 1.5, confidenceScore: 0.85 }
    ]
  },
  'membrane-air-barrier': {
    baseType: 'Self-Adhered Air Barrier Membrane',
    products: [
      { manufacturer: 'GCP Applied Technologies', product: 'PERM-A-BARRIER', thickness: 1.0, confidenceScore: 1.0 },
      { manufacturer: 'Carlisle CCW', product: 'Air-Bloc 31 MR', thickness: 1.0, confidenceScore: 0.94 },
      { manufacturer: 'Henry Company', product: 'Blueskin VP100', thickness: 1.0, confidenceScore: 0.92 },
      { manufacturer: 'Tremco', product: 'ExoAir 120', thickness: 1.0, confidenceScore: 0.90 }
    ]
  },
  'drainage-composite': {
    baseType: 'Drainage Composite Board',
    products: [
      { manufacturer: 'GCP Applied Technologies', product: 'HYDRODUCT', confidenceScore: 1.0 },
      { manufacturer: 'Carlisle CCW', product: 'CCW MIRADRAIN', confidenceScore: 0.95 },
      { manufacturer: 'W.R. Meadows', product: 'MEADOW-DRAIN', confidenceScore: 0.93 }
    ]
  },

  // ==========================================================================
  // TPO MEMBRANES (Expanded from CSV L0-CMD-2026-0125-002)
  // ==========================================================================
  'membrane-tpo': {
    baseType: 'TPO Roofing Membrane',
    products: [
      { manufacturer: 'Carlisle SynTec', product: 'Sure-Weld TPO', thickness: 1.5, confidenceScore: 1.0 },
      { manufacturer: 'Johns Manville', product: 'TPO Roofing Systems', thickness: 1.5, confidenceScore: 0.96 },
      { manufacturer: 'Versico', product: '16-foot TPO', thickness: 1.5, confidenceScore: 0.95 },
      { manufacturer: 'Duro-Last', product: 'Duro-TECH TPO', thickness: 1.5, confidenceScore: 0.94 },
      { manufacturer: 'Duro-Last', product: 'Duro-TECH Fleece TPO', thickness: 1.5, confidenceScore: 0.93 },
      { manufacturer: 'GAF', product: 'EverGuard TPO', thickness: 1.5, confidenceScore: 0.92 },
      { manufacturer: 'Firestone', product: 'UltraPly TPO', thickness: 1.5, confidenceScore: 0.91 }
    ]
  },
  // Legacy key for backwards compatibility
  'membrane-tpo-roofing': {
    baseType: 'TPO Roofing Membrane',
    products: [
      { manufacturer: 'Carlisle SynTec', product: 'Sure-Weld TPO', thickness: 1.5, confidenceScore: 1.0 },
      { manufacturer: 'Johns Manville', product: 'TPO Roofing Systems', thickness: 1.5, confidenceScore: 0.96 },
      { manufacturer: 'Versico', product: '16-foot TPO', thickness: 1.5, confidenceScore: 0.95 },
      { manufacturer: 'Duro-Last', product: 'Duro-TECH TPO', thickness: 1.5, confidenceScore: 0.94 }
    ]
  },

  // ==========================================================================
  // EPDM MEMBRANES (From CSV)
  // ==========================================================================
  'membrane-epdm': {
    baseType: 'EPDM Roofing Membrane',
    products: [
      { manufacturer: 'Carlisle SynTec', product: 'EPDM', thickness: 1.5, confidenceScore: 1.0 },
      { manufacturer: 'Johns Manville', product: 'EPDM Roofing Systems', thickness: 1.5, confidenceScore: 0.96 },
      { manufacturer: 'Firestone', product: 'RubberGard EPDM', thickness: 1.5, confidenceScore: 0.95 },
      { manufacturer: 'GenFlex', product: 'EPDM Membrane', thickness: 1.5, confidenceScore: 0.92 }
    ]
  },

  // ==========================================================================
  // PVC MEMBRANES (From CSV)
  // ==========================================================================
  'membrane-pvc': {
    baseType: 'PVC Roofing Membrane',
    products: [
      { manufacturer: 'Johns Manville', product: 'PVC Roofing Systems', thickness: 1.5, confidenceScore: 1.0 },
      { manufacturer: 'Duro-Last', product: 'Duro-Last Membrane', thickness: 1.5, confidenceScore: 0.96 },
      { manufacturer: 'Sarnafil', product: 'Sarnafil PVC', thickness: 1.5, confidenceScore: 0.94 },
      { manufacturer: 'IB Roof Systems', product: 'IB PVC Membrane', thickness: 1.5, confidenceScore: 0.92 }
    ]
  },

  // ==========================================================================
  // MODIFIED BITUMEN MEMBRANES (From CSV)
  // ==========================================================================
  'membrane-mod-bit': {
    baseType: 'Modified Bitumen Roofing Membrane',
    products: [
      { manufacturer: 'SOPREMA', product: 'SBS-Modified Bitumen', thickness: 4.0, confidenceScore: 1.0 },
      { manufacturer: 'Polyglass', product: 'Modified Bitumen Membranes', thickness: 4.0, confidenceScore: 0.96 },
      { manufacturer: 'Polyglass', product: 'SBS Membranes', thickness: 4.0, confidenceScore: 0.95 },
      { manufacturer: 'Polyglass', product: 'APP Membranes', thickness: 4.0, confidenceScore: 0.94 },
      { manufacturer: 'GAF', product: 'Liberty SBS', thickness: 4.0, confidenceScore: 0.93 },
      { manufacturer: 'CertainTeed', product: 'Flintlastic SA', thickness: 4.0, confidenceScore: 0.92 }
    ]
  },

  // ==========================================================================
  // FLEECE-BACKED MEMBRANES (From CSV)
  // ==========================================================================
  'membrane-fleece': {
    baseType: 'Fleece-Backed Roofing Membrane',
    products: [
      { manufacturer: 'Carlisle SynTec', product: 'FleeceBACK', thickness: 2.0, confidenceScore: 1.0 },
      { manufacturer: 'Versico', product: 'VersiFleece', thickness: 2.0, confidenceScore: 0.96 },
      { manufacturer: 'Duro-Last', product: 'Duro-Fleece', thickness: 2.0, confidenceScore: 0.95 },
      { manufacturer: 'Duro-Last', product: 'Duro-Fleece Plus', thickness: 2.0, confidenceScore: 0.94 },
      { manufacturer: 'Duro-Last', product: 'Duro-Last EV Fleece', thickness: 2.0, confidenceScore: 0.93 },
      { manufacturer: 'Duro-Last', product: 'Fleece Back', thickness: 2.0, confidenceScore: 0.92 }
    ]
  },

  // ==========================================================================
  // POLYISO INSULATION (From CSV)
  // ==========================================================================
  'insulation-polyiso': {
    baseType: 'Polyisocyanurate Roof Insulation',
    products: [
      { manufacturer: 'Johns Manville', product: 'Polyisocyanurate Insulation', thickness: 50, confidenceScore: 1.0 },
      { manufacturer: 'Atlas Roofing', product: 'Polyiso Roof Insulation', thickness: 50, confidenceScore: 0.96 },
      { manufacturer: 'Hunter Panels', product: 'Polyiso Insulation', thickness: 50, confidenceScore: 0.95 },
      { manufacturer: 'Carlisle SynTec', product: 'Insulation', thickness: 50, confidenceScore: 0.94 },
      { manufacturer: 'PAC-CLAD', product: 'Insulation (polyiso)', thickness: 50, confidenceScore: 0.93 },
      { manufacturer: 'GAF', product: 'EnergyGuard Polyiso', thickness: 50, confidenceScore: 0.92 },
      { manufacturer: 'Rmax', product: 'Thermasheath-3', thickness: 50, confidenceScore: 0.91 }
    ]
  },

  // ==========================================================================
  // XPS INSULATION (Expanded)
  // ==========================================================================
  'insulation-xps': {
    baseType: 'Extruded Polystyrene Insulation',
    products: [
      { manufacturer: 'Owens Corning', product: 'FOAMULAR XPS', thickness: 50, confidenceScore: 1.0 },
      { manufacturer: 'Owens Corning', product: 'XPS Insulation', thickness: 50, confidenceScore: 0.98 },
      { manufacturer: 'DuPont (DOW)', product: 'STYROFOAM', thickness: 50, confidenceScore: 0.96 },
      { manufacturer: 'Kingspan', product: 'GreenGuard XPS', thickness: 50, confidenceScore: 0.94 }
    ]
  },

  // ==========================================================================
  // SILICONE COATINGS (From CSV)
  // ==========================================================================
  'coating-silicone': {
    baseType: 'Silicone Roof Coating',
    products: [
      { manufacturer: 'Mule-Hide', product: 'Silicone Coatings', thickness: 1.0, confidenceScore: 1.0 },
      { manufacturer: 'Duro-Last', product: 'Duro-Shield Coatings', thickness: 1.0, confidenceScore: 0.96 },
      { manufacturer: 'W.R. Meadows', product: 'Silicone Roof Coatings', thickness: 1.0, confidenceScore: 0.95 },
      { manufacturer: 'Carlisle SynTec', product: 'Coatings', thickness: 1.0, confidenceScore: 0.94 },
      { manufacturer: 'GE Silicones', product: 'Enduris 3500', thickness: 1.0, confidenceScore: 0.92 }
    ]
  },

  // ==========================================================================
  // ACRYLIC COATINGS (From CSV)
  // ==========================================================================
  'coating-acrylic': {
    baseType: 'Acrylic Roof Coating',
    products: [
      { manufacturer: 'Mule-Hide', product: 'Acrylic Coatings', thickness: 0.75, confidenceScore: 1.0 },
      { manufacturer: 'Mule-Hide', product: 'Base Coatings', thickness: 0.75, confidenceScore: 0.96 },
      { manufacturer: 'Mule-Hide', product: 'Finish Coatings', thickness: 0.75, confidenceScore: 0.95 },
      { manufacturer: 'Polyglass', product: 'Elastomeric Roof Coatings', thickness: 0.75, confidenceScore: 0.94 },
      { manufacturer: 'Polyglass', product: 'Fast Drying Coatings', thickness: 0.75, confidenceScore: 0.93 },
      { manufacturer: 'Henry Company', product: 'Tropicool', thickness: 0.75, confidenceScore: 0.92 }
    ]
  },

  // ==========================================================================
  // AIR BARRIERS (From CSV)
  // ==========================================================================
  'air-barrier': {
    baseType: 'Air Barrier System',
    products: [
      { manufacturer: 'SOPREMA', product: 'Air Barriers', thickness: 1.0, confidenceScore: 1.0 },
      { manufacturer: 'W.R. Meadows', product: 'Fluid-Applied Air Barriers', thickness: 1.0, confidenceScore: 0.96 },
      { manufacturer: 'W.R. Meadows', product: 'Sheet-Applied Air Barriers', thickness: 1.0, confidenceScore: 0.95 },
      { manufacturer: 'W.R. Meadows', product: 'Vapor Permeable Air Barriers', thickness: 1.0, confidenceScore: 0.94 },
      { manufacturer: 'Owens Corning', product: 'PINKWRAP Air Barrier Products', thickness: 1.0, confidenceScore: 0.93 },
      { manufacturer: 'GCP Applied Technologies', product: 'PERM-A-BARRIER', thickness: 1.0, confidenceScore: 0.92 },
      { manufacturer: 'Henry Company', product: 'Air-Bloc', thickness: 1.0, confidenceScore: 0.91 }
    ]
  },

  // ==========================================================================
  // COVER BOARDS (From CSV)
  // ==========================================================================
  'cover-board': {
    baseType: 'Roof Cover Board',
    products: [
      { manufacturer: 'Mule-Hide', product: 'Cover Boards', thickness: 6.0, confidenceScore: 1.0 },
      { manufacturer: 'Polyglass', product: 'Insulation and Coverboards', thickness: 6.0, confidenceScore: 0.96 },
      { manufacturer: 'Polyglass', product: 'USG Securock Brand Roof Cover Boards', thickness: 6.0, confidenceScore: 0.95 },
      { manufacturer: 'Duro-Last', product: 'Cover Board', thickness: 6.0, confidenceScore: 0.94 },
      { manufacturer: 'Johns Manville', product: 'Roofing Insulation and Cover Boards', thickness: 6.0, confidenceScore: 0.93 },
      { manufacturer: 'DensDeck', product: 'DensDeck Prime', thickness: 6.0, confidenceScore: 0.92 }
    ]
  },

  // ==========================================================================
  // VAPOR BARRIERS (From CSV)
  // ==========================================================================
  'vapor-barrier': {
    baseType: 'Vapor Barrier/Retarder',
    products: [
      { manufacturer: 'W.R. Meadows', product: 'Vapor Barriers', thickness: 0.2, confidenceScore: 1.0 },
      { manufacturer: 'W.R. Meadows', product: 'Concrete Vapor Barriers', thickness: 0.2, confidenceScore: 0.96 },
      { manufacturer: 'Carlisle SynTec', product: 'Air and Vapor Barriers', thickness: 0.2, confidenceScore: 0.95 },
      { manufacturer: 'Johns Manville', product: 'Vapor Retarder', thickness: 0.2, confidenceScore: 0.94 },
      { manufacturer: 'Duro-Last', product: 'Vapor Barrier', thickness: 0.2, confidenceScore: 0.93 },
      { manufacturer: 'Polyglass', product: 'Air & Vapor Barriers', thickness: 0.2, confidenceScore: 0.92 },
      { manufacturer: 'Mule-Hide', product: 'Underlayments & Vapor Barriers', thickness: 0.2, confidenceScore: 0.91 }
    ]
  },

  // ==========================================================================
  // SEALANTS (From CSV)
  // ==========================================================================
  'sealant': {
    baseType: 'Joint Sealant',
    products: [
      { manufacturer: 'W.R. Meadows', product: 'Joint Sealants', confidenceScore: 1.0 },
      { manufacturer: 'W.R. Meadows', product: 'Hot-Applied Joint Sealants', confidenceScore: 0.96 },
      { manufacturer: 'W.R. Meadows', product: 'Cold-Applied Joint Sealants', confidenceScore: 0.95 },
      { manufacturer: 'SOPREMA', product: 'Sealants', confidenceScore: 0.94 },
      { manufacturer: 'Polyglass', product: 'Mapeproof Sealant', confidenceScore: 0.93 },
      { manufacturer: 'Sika', product: 'Sikaflex-1a', confidenceScore: 0.92 }
    ]
  },

  // ==========================================================================
  // ADHESIVES (From CSV)
  // ==========================================================================
  'adhesive': {
    baseType: 'Roofing Adhesive',
    products: [
      { manufacturer: 'Mule-Hide', product: 'Water-Based Adhesives', confidenceScore: 1.0 },
      { manufacturer: 'Mule-Hide', product: 'Solvent-Based Adhesives', confidenceScore: 0.96 },
      { manufacturer: 'Mule-Hide', product: 'Low-VOC Adhesives', confidenceScore: 0.95 },
      { manufacturer: 'Carlisle SynTec', product: 'Adhesives, Primers, Sealants', confidenceScore: 0.94 },
      { manufacturer: 'Johns Manville', product: 'Adhesives, Cements, and Primers', confidenceScore: 0.93 },
      { manufacturer: 'Versico', product: 'Adhesives, Primers, & Sealants', confidenceScore: 0.92 },
      { manufacturer: 'SOPREMA', product: 'Adhesives', confidenceScore: 0.91 },
      { manufacturer: 'W.R. Meadows', product: 'Anchoring & Bonding Adhesives', confidenceScore: 0.90 }
    ]
  },

  // ==========================================================================
  // FASTENERS (From CSV)
  // ==========================================================================
  'fastener': {
    baseType: 'Roofing Fastener',
    products: [
      { manufacturer: 'Carlisle SynTec', product: 'Plates & Fasteners', confidenceScore: 1.0 },
      { manufacturer: 'Johns Manville', product: 'Fasteners and Plates', confidenceScore: 0.96 },
      { manufacturer: 'Duro-Last', product: 'Fasteners and Adhesives', confidenceScore: 0.95 },
      { manufacturer: 'Mule-Hide', product: 'Fasteners & Termination', confidenceScore: 0.94 },
      { manufacturer: 'SOPREMA', product: 'Fasteners', confidenceScore: 0.93 },
      { manufacturer: 'Polyglass', product: 'Polyglass Heavy Duty Fastener', confidenceScore: 0.92 },
      { manufacturer: 'Polyglass', product: 'Polyglass Extra Heavy Duty Fastener', confidenceScore: 0.91 }
    ]
  },

  // ==========================================================================
  // PRIMERS (From CSV)
  // ==========================================================================
  'primer': {
    baseType: 'Roofing Primer',
    products: [
      { manufacturer: 'Mule-Hide', product: 'Primers', confidenceScore: 1.0 },
      { manufacturer: 'Mule-Hide', product: 'Cleaners & Primers', confidenceScore: 0.96 },
      { manufacturer: 'Polyglass', product: 'Polyglass PMMA Concrete and Wood Primer', confidenceScore: 0.95 },
      { manufacturer: 'Polyglass', product: 'Polyglass PMMA Flexible Primer', confidenceScore: 0.94 },
      { manufacturer: 'Polyglass', product: 'Polyglass Primer EP-1010', confidenceScore: 0.93 },
      { manufacturer: 'Polyglass', product: 'Polyglass Primer EP-1020', confidenceScore: 0.92 }
    ]
  },

  // ==========================================================================
  // LIQUID APPLIED (From CSV)
  // ==========================================================================
  'coating-liquid': {
    baseType: 'Liquid Applied Roofing System',
    products: [
      { manufacturer: 'SOPREMA', product: 'Liquid Applied Materials', thickness: 1.5, confidenceScore: 1.0 },
      { manufacturer: 'Johns Manville', product: 'Liquid Applied Roofing Systems', thickness: 1.5, confidenceScore: 0.96 },
      { manufacturer: 'Polyglass', product: 'Liquid Applied Waterproofing', thickness: 1.5, confidenceScore: 0.95 },
      { manufacturer: 'Polyglass', product: 'Mapeproof Liquid Membrane', thickness: 1.5, confidenceScore: 0.94 }
    ]
  },

  // ==========================================================================
  // FLASHING (From CSV)
  // ==========================================================================
  'flashing': {
    baseType: 'Roofing Flashing',
    products: [
      { manufacturer: 'Carlisle SynTec', product: 'Flashings & Accessories', confidenceScore: 1.0 },
      { manufacturer: 'Duro-Last', product: 'Flashings and Accessories', confidenceScore: 0.96 },
      { manufacturer: 'Mule-Hide', product: 'Flashings', confidenceScore: 0.95 },
      { manufacturer: 'Johns Manville', product: 'Specs, Flashing Details & Assembly Plates', confidenceScore: 0.94 },
      { manufacturer: 'Polyglass', product: 'Flashing Compounds', confidenceScore: 0.93 },
      { manufacturer: 'Polyglass', product: 'Polyglass PMMA Flashing', confidenceScore: 0.92 },
      { manufacturer: 'W.R. Meadows', product: 'Flashing Membranes', confidenceScore: 0.91 }
    ]
  }
};

// =============================================================================
// OR EQUAL COMPARISON CLASS
// =============================================================================

export class OrEqualComparison {
  private scene: THREE.Scene | null = null;
  private details: Map<string, THREE.Group> = new Map();
  private comparisonGroup: THREE.Group;
  private sliderPlane: THREE.Plane | null = null;

  constructor() {
    this.comparisonGroup = new THREE.Group();
    this.comparisonGroup.name = 'or-equal-comparison';
  }

  initialize(scene: THREE.Scene): void {
    this.scene = scene;
    scene.add(this.comparisonGroup);
  }

  /**
   * Create side-by-side comparison view
   */
  createSideBySide(detail: SemanticDetail, manufacturers: string[], spacing = 500): THREE.Group[] {
    this.clearComparison();
    const views: THREE.Group[] = [];

    manufacturers.forEach((mfr, index) => {
      const variant = this.switchManufacturer(detail, mfr);
      const mesh = this.createDetailMesh(variant);
      mesh.position.x = index * spacing;
      
      const label = this.createLabel(mfr);
      label.position.y = 300;
      mesh.add(label);
      
      views.push(mesh);
      this.details.set(mfr, mesh);
      this.comparisonGroup.add(mesh);
    });

    return views;
  }

  /**
   * Create slider comparison (like image diff tools)
   */
  createSliderComparison(detail: SemanticDetail, mfr1: string, mfr2: string): THREE.Group {
    this.clearComparison();
    const group = new THREE.Group();
    group.name = 'slider-comparison';

    const view1 = this.createDetailMesh(this.switchManufacturer(detail, mfr1));
    const view2 = this.createDetailMesh(this.switchManufacturer(detail, mfr2));

    this.sliderPlane = new THREE.Plane(new THREE.Vector3(1, 0, 0), 0);
    const inversePlane = new THREE.Plane(new THREE.Vector3(-1, 0, 0), 0);

    this.applyClippingPlane(view1, this.sliderPlane);
    this.applyClippingPlane(view2, inversePlane);

    group.add(view1, view2);
    
    group.userData.updateSlider = (position: number) => {
      const bounds = new THREE.Box3().setFromObject(group);
      const width = bounds.max.x - bounds.min.x;
      const sliderX = bounds.min.x + width * position;
      this.sliderPlane!.constant = sliderX;
      inversePlane.constant = -sliderX;
    };

    this.comparisonGroup.add(group);
    return group;
  }

  /**
   * Create toggle comparison (switch between manufacturers)
   */
  createToggleComparison(detail: SemanticDetail, manufacturers: string[]): THREE.Group {
    this.clearComparison();
    const group = new THREE.Group();
    let currentIndex = 0;

    manufacturers.forEach((mfr, index) => {
      const mesh = this.createDetailMesh(this.switchManufacturer(detail, mfr));
      mesh.visible = index === 0;
      this.details.set(mfr, mesh);
      group.add(mesh);
    });

    group.userData.toggle = (target?: string | number) => {
      let idx = typeof target === 'string' ? manufacturers.indexOf(target) : target ?? -1;
      if (idx === -1) idx = (currentIndex + 1) % manufacturers.length;
      group.children.forEach((c, i) => c.visible = i === idx);
      currentIndex = idx;
      return manufacturers[currentIndex];
    };

    group.userData.getCurrentManufacturer = () => manufacturers[currentIndex];
    this.comparisonGroup.add(group);
    return group;
  }

  /**
   * Generate difference report between manufacturers
   * Uses resolveMaterialType to compute materialType when not directly available on layer
   */
  getDifferenceReport(detail: SemanticDetail | any, mfr1: string, mfr2: string): DifferenceReport {
    const productChanges: ProductChange[] = [];
    const warnings: string[] = [];

    detail.layers.forEach((layer: any) => {
      // Resolve materialType - try layer.materialType first, then use resolver
      let materialType = layer.materialType;
      if (!materialType) {
        // Use the resolver to compute materialType from layer properties
        const material = typeof layer.material === 'string' ? layer.material : layer.material?.type || '';
        materialType = resolveMaterialType(layer.id, material, layer.annotation);
      }

      if (!materialType) {
        // Skip layers we can't resolve (substrates, structural elements, etc.)
        console.log(`[OrEqualComparison] Skipping layer without materialType: ${layer.id}`);
        return;
      }

      const equivalents = PRODUCT_EQUIVALENCIES[materialType];
      if (!equivalents) {
        warnings.push(`No equivalency data for: ${materialType} (layer: ${layer.id})`);
        return;
      }

      const p1 = equivalents.products.find(p => p.manufacturer === mfr1);
      const p2 = equivalents.products.find(p => p.manufacturer === mfr2);

      if (!p1) { warnings.push(`${mfr1} has no product for ${materialType}`); return; }
      if (!p2) { warnings.push(`${mfr2} has no product for ${materialType}`); return; }

      const change: ProductChange = {
        layerId: layer.id,
        fromManufacturer: mfr1,
        fromProduct: p1.product,
        toManufacturer: mfr2,
        toProduct: p2.product,
        confidenceScore: Math.min(p1.confidenceScore, p2.confidenceScore)
      };

      if (p1.thickness !== undefined && p2.thickness !== undefined && p1.thickness !== p2.thickness) {
        change.dimensionChanges = [{
          property: 'thickness',
          from: p1.thickness,
          to: p2.thickness,
          unit: 'mm'
        }];
      }

      productChanges.push(change);
      if (p2.confidenceScore < 0.9) {
        warnings.push(`${p2.product} has ${(p2.confidenceScore * 100).toFixed(0)}% confidence`);
      }
    });

    const avgScore = productChanges.length > 0
      ? productChanges.reduce((sum, c) => sum + c.confidenceScore, 0) / productChanges.length
      : 0;

    return { productChanges, warnings, overallEquivalencyScore: avgScore };
  }

  setSliderPosition(position: number): void {
    const slider = this.comparisonGroup.children.find(c => c.name === 'slider-comparison');
    slider?.userData.updateSlider?.(Math.max(0, Math.min(1, position)));
  }

  clearComparison(): void {
    while (this.comparisonGroup.children.length > 0) {
      const child = this.comparisonGroup.children[0];
      this.disposeObject(child);
      this.comparisonGroup.remove(child);
    }
    this.details.clear();
    this.sliderPlane = null;
  }

  // ===========================================================================
  // PRIVATE METHODS
  // ===========================================================================

  private switchManufacturer(detail: SemanticDetail, targetMfr: string): SemanticDetail {
    return {
      ...detail,
      layers: detail.layers.map(layer => {
        const eq = PRODUCT_EQUIVALENCIES[layer.materialType];
        const target = eq?.products.find(p => p.manufacturer === targetMfr);
        if (!target) return layer;
        return {
          ...layer,
          thickness: target.thickness ?? layer.thickness,
          material: { ...layer.material, manufacturer: targetMfr, product: target.product }
        };
      })
    };
  }

  private createDetailMesh(detail: SemanticDetail): THREE.Group {
    const group = new THREE.Group();
    group.name = detail.id;
    detail.layers.forEach(layer => {
      const geo = new THREE.BoxGeometry(200, layer.thickness, 300);
      const mat = new THREE.MeshStandardMaterial({ color: layer.material.color || 0x808080, roughness: 0.7 });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.name = layer.id;
      mesh.position.set(layer.position.x, layer.position.y, layer.position.z);
      mesh.castShadow = true;
      group.add(mesh);
    });
    return group;
  }

  private createLabel(text: string): THREE.Sprite {
    const canvas = document.createElement('canvas');
    canvas.width = 512; canvas.height = 128;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = 'rgba(0,0,0,0.8)';
    ctx.fillRect(0, 0, 512, 128);
    ctx.strokeStyle = '#00ffff';
    ctx.lineWidth = 3;
    ctx.strokeRect(3, 3, 506, 122);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(text, 256, 74);
    const texture = new THREE.CanvasTexture(canvas);
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture }));
    sprite.scale.set(200, 50, 1);
    return sprite;
  }

  private applyClippingPlane(obj: THREE.Object3D, plane: THREE.Plane): void {
    obj.traverse(child => {
      if (child instanceof THREE.Mesh && child.material) {
        const mat = child.material as THREE.Material;
        mat.clippingPlanes = [plane];
        mat.clipShadows = true;
      }
    });
  }

  private disposeObject(obj: THREE.Object3D): void {
    if (obj instanceof THREE.Mesh) {
      obj.geometry.dispose();
      if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
      else obj.material.dispose();
    }
    obj.children.forEach(c => this.disposeObject(c));
  }

  dispose(): void {
    this.clearComparison();
    this.scene?.remove(this.comparisonGroup);
  }
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

export function findEquivalentProducts(manufacturer: string, product: string) {
  for (const data of Object.values(PRODUCT_EQUIVALENCIES)) {
    const found = data.products.find(p => p.manufacturer === manufacturer && p.product === product);
    if (found) {
      return data.products.filter(p => p.manufacturer !== manufacturer)
        .map(p => ({ manufacturer: p.manufacturer, product: p.product, confidenceScore: p.confidenceScore }));
    }
  }
  return [];
}

export function getManufacturersForMaterialType(materialType: string): string[] {
  return PRODUCT_EQUIVALENCIES[materialType]?.products.map(p => p.manufacturer) || [];
}

export const orEqualComparison = new OrEqualComparison();
