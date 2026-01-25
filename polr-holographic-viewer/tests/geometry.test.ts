/**
 * Geometry Module Tests
 * Tests for realistic detail geometry generation
 */

import { describe, it, expect, vi } from 'vitest';

// Mock THREE.js since we're in a Node test environment
vi.mock('three', () => ({
  Mesh: class MockMesh {
    geometry: object;
    material: object;
    position = { x: 0, y: 0, z: 0 };
    constructor(geometry?: object, material?: object) {
      this.geometry = geometry || {};
      this.material = material || {};
    }
  },
  Group: class MockGroup {
    children: object[] = [];
    add(child: object) {
      this.children.push(child);
      return this;
    }
  },
  CylinderGeometry: class MockCylinderGeometry {
    parameters: object;
    constructor(...args: number[]) {
      this.parameters = { args };
    }
  },
  BoxGeometry: class MockBoxGeometry {
    parameters: object;
    constructor(width?: number, height?: number, depth?: number) {
      this.parameters = { width, height, depth };
    }
  },
  TubeGeometry: class MockTubeGeometry {
    parameters: object;
    constructor(...args: unknown[]) {
      this.parameters = { args };
    }
  },
  PlaneGeometry: class MockPlaneGeometry {
    parameters: object;
    constructor(width?: number, height?: number) {
      this.parameters = { width, height };
    }
  },
  MeshStandardMaterial: class MockMeshStandardMaterial {
    color: object;
    metalness: number;
    roughness: number;
    constructor(params?: object) {
      Object.assign(this, params);
    }
  },
  CatmullRomCurve3: class MockCatmullRomCurve3 {
    points: object[];
    constructor(points?: object[]) {
      this.points = points || [];
    }
  },
  Vector3: class MockVector3 {
    x: number;
    y: number;
    z: number;
    constructor(x = 0, y = 0, z = 0) {
      this.x = x;
      this.y = y;
      this.z = z;
    }
  },
  Color: class MockColor {
    r: number;
    g: number;
    b: number;
    constructor(color?: string | number) {
      this.r = 0;
      this.g = 0;
      this.b = 0;
    }
    setHex(hex: number) {
      return this;
    }
  }
}));

import {
  createFastener,
  createSealantBead,
  createTerminationBar,
  createStressPlate,
  RealisticDetails
} from '../geometry/realistic-details';

describe('Geometry - Realistic Details', () => {
  describe('createFastener', () => {
    it('should create a screw fastener mesh', () => {
      const fastener = createFastener('screw');
      expect(fastener).toBeDefined();
      expect(fastener.geometry).toBeDefined();
      expect(fastener.material).toBeDefined();
    });

    it('should create a rivet fastener mesh', () => {
      const fastener = createFastener('rivet');
      expect(fastener).toBeDefined();
    });

    it('should create a bolt fastener mesh', () => {
      const fastener = createFastener('bolt');
      expect(fastener).toBeDefined();
    });
  });

  describe('createSealantBead', () => {
    it('should create a sealant bead of specified length', () => {
      const bead = createSealantBead(100, {
        diameter: 10,
        color: 0x333333,
        waviness: 0.1
      });
      expect(bead).toBeDefined();
    });

    it('should create bead with default config', () => {
      const bead = createSealantBead(50, {
        diameter: 8,
        color: 0x000000,
        waviness: 0
      });
      expect(bead).toBeDefined();
    });
  });

  describe('createTerminationBar', () => {
    it('should create a termination bar group', () => {
      const bar = createTerminationBar(200);
      expect(bar).toBeDefined();
      expect(bar.children).toBeDefined();
    });

    it('should create bar with custom config', () => {
      const bar = createTerminationBar(150, {
        width: 30,
        thickness: 3,
        fastenerSpacing: 100
      });
      expect(bar).toBeDefined();
    });
  });

  describe('createStressPlate', () => {
    it('should create a stress plate with default diameter', () => {
      const plate = createStressPlate();
      expect(plate).toBeDefined();
    });

    it('should create a stress plate with custom diameter', () => {
      const plate = createStressPlate(100);
      expect(plate).toBeDefined();
    });
  });

  describe('RealisticDetails export object', () => {
    it('should export all creation functions', () => {
      expect(RealisticDetails.createFastener).toBeDefined();
      expect(RealisticDetails.createSealantBead).toBeDefined();
      expect(RealisticDetails.createTerminationBar).toBeDefined();
      expect(RealisticDetails.createStressPlate).toBeDefined();
    });
  });
});
