/**
 * Or Equal Comparison Feature
 * POLR Strategic Development - Phase B2.1
 * 
 * PATENTABLE INNOVATION: Real-time manufacturer equivalency visualization
 * @module features/or-equal-comparison
 * @version 1.0.0
 */

import * as THREE from 'three';

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
  'membrane-tpo-roofing': {
    baseType: 'TPO Roofing Membrane',
    products: [
      { manufacturer: 'Carlisle SynTec', product: 'Sure-Weld TPO', thickness: 1.5, confidenceScore: 1.0 },
      { manufacturer: 'GAF', product: 'EverGuard TPO', thickness: 1.5, confidenceScore: 0.96 },
      { manufacturer: 'Firestone', product: 'UltraPly TPO', thickness: 1.5, confidenceScore: 0.95 },
      { manufacturer: 'Johns Manville', product: 'TPO RB', thickness: 1.5, confidenceScore: 0.94 }
    ]
  },
  'insulation-xps': {
    baseType: 'Extruded Polystyrene Insulation',
    products: [
      { manufacturer: 'Owens Corning', product: 'FOAMULAR', confidenceScore: 1.0 },
      { manufacturer: 'DuPont (DOW)', product: 'STYROFOAM', confidenceScore: 0.98 },
      { manufacturer: 'Kingspan', product: 'GreenGuard XPS', confidenceScore: 0.95 }
    ]
  },
  'drainage-composite': {
    baseType: 'Drainage Composite Board',
    products: [
      { manufacturer: 'GCP Applied Technologies', product: 'HYDRODUCT', confidenceScore: 1.0 },
      { manufacturer: 'Carlisle CCW', product: 'CCW MIRADRAIN', confidenceScore: 0.95 },
      { manufacturer: 'W.R. Meadows', product: 'MEADOW-DRAIN', confidenceScore: 0.93 }
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
   */
  getDifferenceReport(detail: SemanticDetail, mfr1: string, mfr2: string): DifferenceReport {
    const productChanges: ProductChange[] = [];
    const warnings: string[] = [];

    detail.layers.forEach(layer => {
      const equivalents = PRODUCT_EQUIVALENCIES[layer.materialType];
      if (!equivalents) {
        warnings.push(`No equivalency data for: ${layer.materialType}`);
        return;
      }

      const p1 = equivalents.products.find(p => p.manufacturer === mfr1);
      const p2 = equivalents.products.find(p => p.manufacturer === mfr2);

      if (!p1) { warnings.push(`${mfr1} has no product for ${layer.materialType}`); return; }
      if (!p2) { warnings.push(`${mfr2} has no product for ${layer.materialType}`); return; }

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
