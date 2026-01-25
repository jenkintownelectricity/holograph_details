/**
 * Dual Scene Manager
 * L0-CMD-2026-0125-004 Phase A1
 *
 * Manages two independent Three.js scenes for side-by-side comparison rendering.
 * Each scene has its own renderer, camera, and controls, but cameras are synchronized.
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { SemanticToMeshConverter } from '../hologram/semantic-to-mesh';
import { SemanticDetail } from '../schemas/semantic-detail';
import { PRODUCT_EQUIVALENCIES } from '../features/or-equal-comparison';

export interface DualSceneOptions {
  /** Background color for scenes */
  backgroundColor?: number;
  /** Enable ambient light */
  ambientLightIntensity?: number;
  /** Enable directional light */
  directionalLightIntensity?: number;
  /** Sync cameras between scenes */
  syncCameras?: boolean;
}

const DEFAULT_OPTIONS: DualSceneOptions = {
  backgroundColor: 0x050510,
  ambientLightIntensity: 0.6,
  directionalLightIntensity: 1.0,
  syncCameras: true
};

export class DualSceneManager {
  private scenes: [THREE.Scene, THREE.Scene];
  private renderers: [THREE.WebGLRenderer, THREE.WebGLRenderer];
  private cameras: [THREE.PerspectiveCamera, THREE.PerspectiveCamera];
  private controls: [OrbitControls, OrbitControls];
  private animationId: number | null = null;
  private converters: [SemanticToMeshConverter, SemanticToMeshConverter];
  private detailGroups: [THREE.Group | null, THREE.Group | null] = [null, null];
  private options: DualSceneOptions;
  private isSyncing = false;

  constructor(
    private container1: HTMLDivElement,
    private container2: HTMLDivElement,
    options: DualSceneOptions = {}
  ) {
    this.options = { ...DEFAULT_OPTIONS, ...options };

    // Create two independent scenes
    this.scenes = [new THREE.Scene(), new THREE.Scene()];

    // Create renderers for each container
    this.renderers = [
      this.createRenderer(container1),
      this.createRenderer(container2)
    ];

    // Create cameras
    this.cameras = [
      this.createCamera(container1),
      this.createCamera(container2)
    ];

    // Create controls
    this.controls = [
      new OrbitControls(this.cameras[0], this.renderers[0].domElement),
      new OrbitControls(this.cameras[1], this.renderers[1].domElement)
    ];

    // Configure controls
    this.controls.forEach(control => {
      control.enableDamping = true;
      control.dampingFactor = 0.05;
      control.minDistance = 100;
      control.maxDistance = 2000;
    });

    // Create converters for each scene
    this.converters = [
      new SemanticToMeshConverter(),
      new SemanticToMeshConverter()
    ];

    // Setup scenes
    this.setupLighting();

    // Sync controls if enabled
    if (this.options.syncCameras) {
      this.syncControls();
    }

    // Start animation loop
    this.animate();

    // Handle resize
    window.addEventListener('resize', this.handleResize);
  }

  private createRenderer(container: HTMLDivElement): THREE.WebGLRenderer {
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    container.appendChild(renderer.domElement);
    return renderer;
  }

  private createCamera(container: HTMLDivElement): THREE.PerspectiveCamera {
    const aspect = container.clientWidth / container.clientHeight;
    const camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 5000);
    camera.position.set(400, 400, 600);
    return camera;
  }

  private syncControls(): void {
    // When scene 0 control changes, update scene 1
    this.controls[0].addEventListener('change', () => {
      if (this.isSyncing) return;
      this.isSyncing = true;

      this.cameras[1].position.copy(this.cameras[0].position);
      this.cameras[1].quaternion.copy(this.cameras[0].quaternion);
      this.controls[1].target.copy(this.controls[0].target);
      this.controls[1].update();

      this.isSyncing = false;
    });

    // When scene 1 control changes, update scene 0
    this.controls[1].addEventListener('change', () => {
      if (this.isSyncing) return;
      this.isSyncing = true;

      this.cameras[0].position.copy(this.cameras[1].position);
      this.cameras[0].quaternion.copy(this.cameras[1].quaternion);
      this.controls[0].target.copy(this.controls[1].target);
      this.controls[0].update();

      this.isSyncing = false;
    });
  }

  private setupLighting(): void {
    this.scenes.forEach(scene => {
      scene.background = new THREE.Color(this.options.backgroundColor!);

      // Fog for depth
      scene.fog = new THREE.FogExp2(this.options.backgroundColor!, 0.0008);

      // Ambient light
      const ambient = new THREE.AmbientLight(0xffffff, this.options.ambientLightIntensity);
      scene.add(ambient);

      // Key light
      const keyLight = new THREE.DirectionalLight(0xffffff, this.options.directionalLightIntensity);
      keyLight.position.set(500, 800, 500);
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.width = 2048;
      keyLight.shadow.mapSize.height = 2048;
      scene.add(keyLight);

      // Fill light
      const fillLight = new THREE.DirectionalLight(0x8888ff, 0.4);
      fillLight.position.set(-500, 300, -200);
      scene.add(fillLight);

      // Rim light for holographic effect
      const rimLight = new THREE.DirectionalLight(0x00ffff, 0.3);
      rimLight.position.set(0, -200, 500);
      scene.add(rimLight);

      // Ground grid for reference
      const gridHelper = new THREE.GridHelper(1000, 20, 0x00ffff, 0x003333);
      gridHelper.position.y = -50;
      (gridHelper.material as THREE.Material).opacity = 0.3;
      (gridHelper.material as THREE.Material).transparent = true;
      scene.add(gridHelper);
    });
  }

  /**
   * Load a semantic detail with a specific manufacturer's products into both scenes
   */
  loadDetails(
    detail: SemanticDetail,
    manufacturer1: string,
    manufacturer2: string
  ): void {
    // Clear existing detail groups
    this.clearDetails();

    // Create detail variant for manufacturer 1
    const detail1 = this.switchManufacturer(detail, manufacturer1);
    const mesh1 = this.converters[0].convert(detail1);
    mesh1.userData.manufacturer = manufacturer1;
    this.detailGroups[0] = mesh1;
    this.scenes[0].add(mesh1);

    // Create detail variant for manufacturer 2
    const detail2 = this.switchManufacturer(detail, manufacturer2);
    const mesh2 = this.converters[1].convert(detail2);
    mesh2.userData.manufacturer = manufacturer2;
    this.detailGroups[1] = mesh2;
    this.scenes[1].add(mesh2);

    // Center camera on models
    this.centerCamera(mesh1);

    console.log(`[DualSceneManager] Loaded details for ${manufacturer1} and ${manufacturer2}`);
  }

  /**
   * Switch products in a detail to a specific manufacturer
   */
  private switchManufacturer(detail: SemanticDetail, targetManufacturer: string): SemanticDetail {
    // Deep clone the detail
    const cloned: SemanticDetail = JSON.parse(JSON.stringify(detail));

    // Update products to use the target manufacturer
    cloned.products = cloned.products.map(productRef => {
      // Try to find equivalent product from target manufacturer
      for (const [key, data] of Object.entries(PRODUCT_EQUIVALENCIES)) {
        const targetProduct = data.products.find(p => p.manufacturer === targetManufacturer);
        if (targetProduct) {
          // Check if this product category matches the layer
          const layerMaterial = cloned.layers.find(l => l.id === productRef.layer)?.material;
          if (layerMaterial && this.materialMatchesCategory(layerMaterial, key)) {
            return {
              ...productRef,
              manufacturer: targetManufacturer,
              product: targetProduct.product
            };
          }
        }
      }
      return productRef;
    });

    return cloned;
  }

  /**
   * Check if a material type matches an equivalency category
   */
  private materialMatchesCategory(material: string, category: string): boolean {
    const mappings: Record<string, string[]> = {
      'membrane-tpo': ['membrane-sheet'],
      'membrane-epdm': ['membrane-sheet'],
      'membrane-pvc': ['membrane-sheet'],
      'membrane-self-adhered-waterproofing': ['membrane-sheet', 'membrane-fluid'],
      'membrane-air-barrier': ['air-barrier'],
      'insulation-polyiso': ['insulation-rigid'],
      'insulation-xps': ['insulation-rigid'],
      'sealant': ['sealant'],
      'drainage-composite': ['drainage-mat'],
      'flashing': ['flashing-metal'],
      'primer': ['primer'],
      'adhesive': ['adhesive']
    };

    const matchingMaterials = mappings[category] || [];
    return matchingMaterials.includes(material);
  }

  private clearDetails(): void {
    this.detailGroups.forEach((group, idx) => {
      if (group) {
        this.scenes[idx].remove(group);
        this.disposeObject(group);
      }
    });
    this.detailGroups = [null, null];
  }

  private centerCamera(mesh: THREE.Object3D): void {
    const box = new THREE.Box3().setFromObject(mesh);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);

    // Position camera to view the entire model
    const distance = maxDim * 2;

    this.cameras.forEach(camera => {
      camera.position.set(
        center.x + distance * 0.7,
        center.y + distance * 0.7,
        center.z + distance * 0.7
      );
      camera.lookAt(center);
    });

    this.controls.forEach(control => {
      control.target.copy(center);
      control.update();
    });
  }

  private handleResize = (): void => {
    [this.container1, this.container2].forEach((container, i) => {
      const width = container.clientWidth;
      const height = container.clientHeight;

      if (width > 0 && height > 0) {
        this.cameras[i].aspect = width / height;
        this.cameras[i].updateProjectionMatrix();
        this.renderers[i].setSize(width, height);
      }
    });
  };

  /**
   * Manually trigger resize (useful when container sizes change)
   */
  resize(): void {
    this.handleResize();
  }

  private animate = (): void => {
    this.animationId = requestAnimationFrame(this.animate);

    // Update controls
    this.controls.forEach(c => c.update());

    // Render both scenes
    this.renderers[0].render(this.scenes[0], this.cameras[0]);
    this.renderers[1].render(this.scenes[1], this.cameras[1]);
  };

  private disposeObject(obj: THREE.Object3D): void {
    if (obj instanceof THREE.Mesh) {
      obj.geometry.dispose();
      if (Array.isArray(obj.material)) {
        obj.material.forEach(m => m.dispose());
      } else {
        obj.material.dispose();
      }
    }
    obj.children.forEach(c => this.disposeObject(c));
  }

  /**
   * Get the current manufacturers being displayed
   */
  getManufacturers(): [string | null, string | null] {
    return [
      this.detailGroups[0]?.userData.manufacturer || null,
      this.detailGroups[1]?.userData.manufacturer || null
    ];
  }

  /**
   * Dispose of all resources
   */
  dispose(): void {
    window.removeEventListener('resize', this.handleResize);

    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }

    this.clearDetails();

    this.renderers.forEach((renderer, i) => {
      renderer.dispose();
      // Remove canvas from DOM
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    });

    this.controls.forEach(c => c.dispose());
    this.converters.forEach(c => c.dispose());

    console.log('[DualSceneManager] Disposed');
  }
}

/**
 * Slider Scene Manager
 * For slider-style comparison with clipping planes
 */
export class SliderSceneManager {
  private scene: THREE.Scene;
  private renderer: THREE.WebGLRenderer;
  private camera: THREE.PerspectiveCamera;
  private controls: OrbitControls;
  private animationId: number | null = null;
  private converter: SemanticToMeshConverter;
  private detailGroup1: THREE.Group | null = null;
  private detailGroup2: THREE.Group | null = null;
  private clipPlane1: THREE.Plane;
  private clipPlane2: THREE.Plane;
  private sliderPosition = 0.5;
  private modelBounds: THREE.Box3 | null = null;

  constructor(
    private container: HTMLDivElement,
    options: DualSceneOptions = {}
  ) {
    const opts = { ...DEFAULT_OPTIONS, ...options };

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(opts.backgroundColor!);
    this.scene.fog = new THREE.FogExp2(opts.backgroundColor!, 0.0008);

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.localClippingEnabled = true; // Enable clipping
    container.appendChild(this.renderer.domElement);

    const aspect = container.clientWidth / container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 5000);
    this.camera.position.set(400, 400, 600);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;

    this.converter = new SemanticToMeshConverter();

    // Create clipping planes
    // Plane 1 clips from the right (shows manufacturer 1 on left)
    this.clipPlane1 = new THREE.Plane(new THREE.Vector3(1, 0, 0), 0);
    // Plane 2 clips from the left (shows manufacturer 2 on right)
    this.clipPlane2 = new THREE.Plane(new THREE.Vector3(-1, 0, 0), 0);

    this.setupLighting();
    this.animate();

    window.addEventListener('resize', this.handleResize);
  }

  private setupLighting(): void {
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambient);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.0);
    keyLight.position.set(500, 800, 500);
    this.scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x8888ff, 0.4);
    fillLight.position.set(-500, 300, -200);
    this.scene.add(fillLight);

    const gridHelper = new THREE.GridHelper(1000, 20, 0x00ffff, 0x003333);
    gridHelper.position.y = -50;
    (gridHelper.material as THREE.Material).opacity = 0.3;
    (gridHelper.material as THREE.Material).transparent = true;
    this.scene.add(gridHelper);
  }

  loadDetails(
    detail: SemanticDetail,
    manufacturer1: string,
    manufacturer2: string
  ): void {
    this.clearDetails();

    // Create mesh for manufacturer 1
    const mesh1 = this.converter.convert(detail);
    this.applyClippingPlane(mesh1, this.clipPlane1);
    mesh1.userData.manufacturer = manufacturer1;
    this.detailGroup1 = mesh1;
    this.scene.add(mesh1);

    // Create mesh for manufacturer 2 (same detail for now, different products would be applied)
    const mesh2 = this.converter.convert(detail);
    this.applyClippingPlane(mesh2, this.clipPlane2);
    mesh2.userData.manufacturer = manufacturer2;
    this.detailGroup2 = mesh2;
    this.scene.add(mesh2);

    // Calculate bounds for clipping
    this.modelBounds = new THREE.Box3().setFromObject(mesh1);
    this.updateSliderPosition(this.sliderPosition);

    // Center camera
    this.centerCamera(mesh1);

    console.log(`[SliderSceneManager] Loaded details for ${manufacturer1} and ${manufacturer2}`);
  }

  private applyClippingPlane(obj: THREE.Object3D, plane: THREE.Plane): void {
    obj.traverse(child => {
      if (child instanceof THREE.Mesh && child.material) {
        // Clone material to avoid affecting other meshes
        const mat = (child.material as THREE.Material).clone();
        mat.clippingPlanes = [plane];
        mat.clipShadows = true;
        mat.needsUpdate = true;
        child.material = mat;
      }
    });
  }

  updateSliderPosition(position: number): void {
    this.sliderPosition = Math.max(0, Math.min(1, position));

    if (!this.modelBounds) return;

    const width = this.modelBounds.max.x - this.modelBounds.min.x;
    const sliderX = this.modelBounds.min.x + width * this.sliderPosition;

    // Update clipping planes
    this.clipPlane1.constant = sliderX;
    this.clipPlane2.constant = -sliderX;
  }

  private clearDetails(): void {
    if (this.detailGroup1) {
      this.scene.remove(this.detailGroup1);
      this.disposeObject(this.detailGroup1);
      this.detailGroup1 = null;
    }
    if (this.detailGroup2) {
      this.scene.remove(this.detailGroup2);
      this.disposeObject(this.detailGroup2);
      this.detailGroup2 = null;
    }
    this.modelBounds = null;
  }

  private centerCamera(mesh: THREE.Object3D): void {
    const box = new THREE.Box3().setFromObject(mesh);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);

    const distance = maxDim * 2;
    this.camera.position.set(
      center.x + distance * 0.7,
      center.y + distance * 0.7,
      center.z + distance * 0.7
    );
    this.camera.lookAt(center);

    this.controls.target.copy(center);
    this.controls.update();
  }

  private handleResize = (): void => {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    if (width > 0 && height > 0) {
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(width, height);
    }
  };

  private animate = (): void => {
    this.animationId = requestAnimationFrame(this.animate);
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  };

  private disposeObject(obj: THREE.Object3D): void {
    if (obj instanceof THREE.Mesh) {
      obj.geometry.dispose();
      if (Array.isArray(obj.material)) {
        obj.material.forEach(m => m.dispose());
      } else {
        obj.material.dispose();
      }
    }
    obj.children.forEach(c => this.disposeObject(c));
  }

  dispose(): void {
    window.removeEventListener('resize', this.handleResize);

    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }

    this.clearDetails();
    this.renderer.dispose();

    if (this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }

    this.controls.dispose();
    this.converter.dispose();

    console.log('[SliderSceneManager] Disposed');
  }
}

export default DualSceneManager;
