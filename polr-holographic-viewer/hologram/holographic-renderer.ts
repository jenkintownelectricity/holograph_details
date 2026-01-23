import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export type DisplayMode = 
  | 'standard-3d'      // Regular WebGL
  | 'looking-glass'    // Looking Glass Display
  | 'ar-webxr'         // WebXR AR Mode
  | 'vr-webxr'         // WebXR VR Mode
  | 'anaglyph'         // Red-Blue 3D glasses
  | 'side-by-side';    // For 3D monitors

export interface HolographicConfig {
  displayMode: DisplayMode;
  holographicEffect: boolean;
  wireframeOverlay: boolean;
  autoRotate: boolean;
  scanLines: boolean;
  glowIntensity: number;
  backgroundColor: string;
}

const DEFAULT_CONFIG: HolographicConfig = {
  displayMode: 'standard-3d',
  holographicEffect: true,
  wireframeOverlay: true,
  autoRotate: true,
  scanLines: true,
  glowIntensity: 0.15,
  backgroundColor: '#050510'
};

/**
 * Holographic Renderer
 * Displays 3D construction details with futuristic holographic effects
 */
export class HolographicRenderer {
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private controls!: OrbitControls;
  private config: HolographicConfig;
  private animationId: number | null = null;
  private detailGroup: THREE.Group | null = null;
  private clock: THREE.Clock;
  private scanLinesMesh: THREE.Mesh | null = null;
  
  constructor(container: HTMLElement, config: Partial<HolographicConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.clock = new THREE.Clock();
    
    this.initRenderer(container);
    this.initScene();
    this.initCamera(container);
    this.initControls(container);
    this.initLighting();
    
    if (this.config.scanLines) {
      this.initScanLines();
    }
    
    this.handleResize(container);
    this.animate();
  }
  
  private initRenderer(container: HTMLElement): void {
    this.renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
      powerPreference: 'high-performance'
    });
    
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.4;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    container.appendChild(this.renderer.domElement);
  }
  
  private initScene(): void {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(this.config.backgroundColor);
    
    // Add fog for depth
    this.scene.fog = new THREE.FogExp2(this.config.backgroundColor, 0.0008);
    
    // Holographic grid floor
    const gridSize = 2000;
    const gridDivisions = 60;
    const gridHelper = new THREE.GridHelper(
      gridSize, 
      gridDivisions, 
      0x00aaff, 
      0x003355
    );
    gridHelper.position.y = -200;
    (gridHelper.material as THREE.LineBasicMaterial).transparent = true;
    (gridHelper.material as THREE.LineBasicMaterial).opacity = 0.4;
    this.scene.add(gridHelper);
    
    // Secondary finer grid
    const fineGrid = new THREE.GridHelper(
      gridSize, 
      gridDivisions * 4, 
      0x001133, 
      0x001122
    );
    fineGrid.position.y = -199;
    (fineGrid.material as THREE.LineBasicMaterial).transparent = true;
    (fineGrid.material as THREE.LineBasicMaterial).opacity = 0.15;
    this.scene.add(fineGrid);
    
    // Ground plane with gradient
    const groundGeom = new THREE.PlaneGeometry(gridSize, gridSize);
    const groundMat = new THREE.MeshBasicMaterial({
      color: 0x000811,
      transparent: true,
      opacity: 0.8
    });
    const ground = new THREE.Mesh(groundGeom, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -201;
    this.scene.add(ground);
  }
  
  private initCamera(container: HTMLElement): void {
    const aspect = container.clientWidth / container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(50, aspect, 1, 10000);
    this.camera.position.set(400, 300, 500);
    this.camera.lookAt(0, 100, 0);
  }
  
  private initControls(_container: HTMLElement): void {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.autoRotate = this.config.autoRotate;
    this.controls.autoRotateSpeed = 0.3;
    this.controls.minDistance = 200;
    this.controls.maxDistance = 2000;
    this.controls.maxPolarAngle = Math.PI * 0.85;
    this.controls.target.set(0, 100, 0);
  }
  
  private initLighting(): void {
    // Ambient - cool blue tone
    const ambient = new THREE.AmbientLight(0x334466, 0.4);
    this.scene.add(ambient);
    
    // Key light - cyan holographic
    const keyLight = new THREE.DirectionalLight(0x00ccff, 0.8);
    keyLight.position.set(300, 500, 400);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    this.scene.add(keyLight);
    
    // Fill light - warm
    const fillLight = new THREE.DirectionalLight(0xffaa00, 0.3);
    fillLight.position.set(-300, 200, -200);
    this.scene.add(fillLight);
    
    // Rim light - blue edge highlight
    const rimLight = new THREE.DirectionalLight(0x0066ff, 0.5);
    rimLight.position.set(-200, 100, -400);
    this.scene.add(rimLight);
    
    // Bottom accent
    const bottomLight = new THREE.DirectionalLight(0x00ffff, 0.2);
    bottomLight.position.set(0, -300, 0);
    this.scene.add(bottomLight);
    
    // Point lights for sparkle
    const sparkle1 = new THREE.PointLight(0x00ffff, 0.5, 800);
    sparkle1.position.set(200, 400, 200);
    this.scene.add(sparkle1);
    
    const sparkle2 = new THREE.PointLight(0xff00ff, 0.3, 600);
    sparkle2.position.set(-300, 200, 100);
    this.scene.add(sparkle2);
  }
  
  private initScanLines(): void {
    // Create scan lines overlay effect
    const scanLinesGeom = new THREE.PlaneGeometry(4000, 4000);
    
    // Custom shader for scan lines
    const scanLinesMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: {
        time: { value: 0 },
        lineSpacing: { value: 3.0 },
        lineWidth: { value: 1.0 },
        opacity: { value: 0.03 }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform float lineSpacing;
        uniform float lineWidth;
        uniform float opacity;
        varying vec2 vUv;
        
        void main() {
          float y = vUv.y * 1000.0 + time * 50.0;
          float line = step(mod(y, lineSpacing), lineWidth);
          gl_FragColor = vec4(0.0, 1.0, 1.0, line * opacity);
        }
      `
    });
    
    this.scanLinesMesh = new THREE.Mesh(scanLinesGeom, scanLinesMat);
    this.scanLinesMesh.position.z = -1000;
    this.scanLinesMesh.renderOrder = 999;
    this.scene.add(this.scanLinesMesh);
  }
  
  private handleResize(container: HTMLElement): void {
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
      }
    });
    resizeObserver.observe(container);
  }
  
  /**
   * Load a detail group into the scene
   */
  loadDetail(detailGroup: THREE.Group): void {
    // Remove existing detail
    if (this.detailGroup) {
      this.scene.remove(this.detailGroup);
      this.disposeGroup(this.detailGroup);
    }
    
    this.detailGroup = detailGroup;
    
    // Apply holographic effects
    if (this.config.holographicEffect) {
      this.applyHolographicEffects(detailGroup);
    }
    
    // Center and scale
    this.centerAndScale(detailGroup);
    
    this.scene.add(detailGroup);
  }
  
  private applyHolographicEffects(group: THREE.Group): void {
    group.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const material = child.material as THREE.MeshPhysicalMaterial;
        
        // Enhance emissive for glow
        if (!material.emissive) {
          material.emissive = new THREE.Color(material.color);
        }
        material.emissiveIntensity = this.config.glowIntensity;
        
        // Add slight transparency
        material.transparent = true;
        material.opacity = Math.min(material.opacity, 0.92);
        
        // Wireframe overlay
        if (this.config.wireframeOverlay) {
          const wireframeMat = new THREE.MeshBasicMaterial({
            color: 0x00ffff,
            wireframe: true,
            transparent: true,
            opacity: 0.08,
            depthTest: true
          });
          const wireframe = new THREE.Mesh(child.geometry.clone(), wireframeMat);
          wireframe.renderOrder = 1;
          child.add(wireframe);
        }
      }
    });
  }
  
  private centerAndScale(group: THREE.Group): void {
    const box = new THREE.Box3().setFromObject(group);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    
    // Center the group
    group.position.sub(center);
    group.position.y += size.y / 2;
    
    // Scale to fit nicely in view
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = 300 / maxDim;
    group.scale.setScalar(scale);
    
    // Update controls target
    this.controls.target.set(0, size.y * scale / 2, 0);
  }
  
  private animate = (): void => {
    this.animationId = requestAnimationFrame(this.animate);
    
    const elapsed = this.clock.getElapsedTime();
    
    // Update controls
    this.controls.update();
    
    // Holographic effects
    if (this.config.holographicEffect && this.detailGroup) {
      // Subtle flicker
      const flicker = 0.96 + Math.random() * 0.08;
      
      this.detailGroup.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          const mat = child.material as THREE.MeshPhysicalMaterial;
          if (mat.emissiveIntensity !== undefined) {
            mat.emissiveIntensity = this.config.glowIntensity * flicker;
          }
        }
      });
      
      // Gentle floating animation
      this.detailGroup.position.y += Math.sin(elapsed * 0.5) * 0.05;
    }
    
    // Update scan lines
    if (this.scanLinesMesh) {
      const mat = this.scanLinesMesh.material as THREE.ShaderMaterial;
      mat.uniforms.time.value = elapsed;
      
      // Keep scan lines facing camera
      this.scanLinesMesh.quaternion.copy(this.camera.quaternion);
      this.scanLinesMesh.position.copy(this.camera.position);
      this.scanLinesMesh.translateZ(-900);
    }
    
    this.renderer.render(this.scene, this.camera);
  };
  
  /**
   * Update configuration
   */
  setConfig(config: Partial<HolographicConfig>): void {
    this.config = { ...this.config, ...config };
    
    this.controls.autoRotate = this.config.autoRotate;
    
    if (this.scanLinesMesh) {
      this.scanLinesMesh.visible = this.config.scanLines;
    }
    
    // Re-apply effects if detail exists
    if (this.detailGroup && this.config.holographicEffect) {
      this.applyHolographicEffects(this.detailGroup);
    }
  }
  
  /**
   * Set display mode (for different hardware)
   */
  async setDisplayMode(mode: DisplayMode): Promise<void> {
    this.config.displayMode = mode;
    
    switch (mode) {
      case 'ar-webxr':
        await this.initWebXR('immersive-ar');
        break;
      case 'vr-webxr':
        await this.initWebXR('immersive-vr');
        break;
      case 'looking-glass':
        console.log('Looking Glass mode - requires Looking Glass hardware');
        break;
      default:
        // Standard 3D mode
        break;
    }
  }
  
  private async initWebXR(mode: 'immersive-ar' | 'immersive-vr'): Promise<boolean> {
    if (!navigator.xr) {
      console.warn('WebXR not supported');
      return false;
    }
    
    try {
      const supported = await navigator.xr.isSessionSupported(mode);
      if (!supported) {
        console.warn(`${mode} not supported on this device`);
        return false;
      }
      
      this.renderer.xr.enabled = true;
      const session = await navigator.xr.requestSession(mode, {
        optionalFeatures: ['local-floor', 'bounded-floor']
      });
      
      await this.renderer.xr.setSession(session);
      return true;
    } catch (error) {
      console.error('WebXR initialization failed:', error);
      return false;
    }
  }
  
  /**
   * Check WebXR support
   */
  async checkXRSupport(): Promise<{ ar: boolean; vr: boolean }> {
    if (!navigator.xr) {
      return { ar: false, vr: false };
    }
    
    const [ar, vr] = await Promise.all([
      navigator.xr.isSessionSupported('immersive-ar').catch(() => false),
      navigator.xr.isSessionSupported('immersive-vr').catch(() => false)
    ]);
    
    return { ar, vr };
  }
  
  /**
   * Get current camera position for UI
   */
  getCameraInfo(): { distance: number; angle: number } {
    const distance = this.camera.position.length();
    const angle = Math.atan2(this.camera.position.x, this.camera.position.z) * (180 / Math.PI);
    return { distance, angle };
  }
  
  /**
   * Reset camera to default position
   */
  resetCamera(): void {
    this.camera.position.set(400, 300, 500);
    this.controls.target.set(0, 100, 0);
    this.controls.update();
  }
  
  private disposeGroup(group: THREE.Group): void {
    group.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        if (Array.isArray(child.material)) {
          child.material.forEach(m => m.dispose());
        } else {
          child.material.dispose();
        }
      }
    });
  }
  
  dispose(): void {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
    }
    
    if (this.detailGroup) {
      this.disposeGroup(this.detailGroup);
    }
    
    this.controls.dispose();
    this.renderer.dispose();
  }
}
