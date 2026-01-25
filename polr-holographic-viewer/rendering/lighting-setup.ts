/**
 * Lighting Setup for Photorealistic Rendering
 * POLR Strategic Development - Phase A4.1
 * 
 * Professional lighting configurations for construction detail visualization
 * 
 * @module rendering/lighting-setup
 * @version 1.0.0
 */

import * as THREE from 'three';

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export type LightingPreset = 
  | 'studio'        // Professional studio lighting
  | 'outdoor'       // Construction site / outdoor
  | 'overcast'      // Soft diffuse outdoor
  | 'technical'     // Even lighting for technical review
  | 'dramatic';     // High contrast for presentations

export interface LightingConfig {
  preset: LightingPreset;
  intensity?: number;
  shadowQuality?: 'low' | 'medium' | 'high' | 'ultra';
  environmentMap?: string;
}

export interface LightingSetup {
  lights: THREE.Light[];
  helpers?: THREE.Object3D[];
  environment?: THREE.Texture;
  dispose: () => void;
}

// =============================================================================
// STUDIO LIGHTING
// =============================================================================

/**
 * Create professional studio lighting setup
 * Three-point lighting with key, fill, and rim lights
 */
export function createStudioLighting(
  scene: THREE.Scene,
  config?: Partial<LightingConfig>
): LightingSetup {
  const intensity = config?.intensity ?? 1.0;
  const lights: THREE.Light[] = [];
  
  // Key Light - Main directional light (warm)
  const keyLight = new THREE.DirectionalLight(0xfff8f0, intensity * 1.2);
  keyLight.position.set(5, 10, 7);
  keyLight.castShadow = true;
  configureShadow(keyLight, config?.shadowQuality || 'high');
  lights.push(keyLight);
  scene.add(keyLight);
  
  // Fill Light - Softer, cooler, opposite side
  const fillLight = new THREE.DirectionalLight(0xf0f8ff, intensity * 0.4);
  fillLight.position.set(-5, 5, -5);
  fillLight.castShadow = false;
  lights.push(fillLight);
  scene.add(fillLight);
  
  // Rim Light - Edge definition from behind
  const rimLight = new THREE.DirectionalLight(0xffffff, intensity * 0.3);
  rimLight.position.set(0, -5, -10);
  rimLight.castShadow = false;
  lights.push(rimLight);
  scene.add(rimLight);
  
  // Ambient - Soft fill for shadows
  const ambient = new THREE.AmbientLight(0x404040, intensity * 0.5);
  lights.push(ambient);
  scene.add(ambient);
  
  // Ground bounce simulation
  const groundBounce = new THREE.HemisphereLight(
    0xffffff,  // Sky color
    0x444444,  // Ground color
    intensity * 0.3
  );
  lights.push(groundBounce);
  scene.add(groundBounce);
  
  return {
    lights,
    dispose: () => disposeLights(lights, scene)
  };
}

// =============================================================================
// OUTDOOR/CONSTRUCTION SITE LIGHTING
// =============================================================================

/**
 * Create outdoor construction site lighting
 * Simulates natural daylight with sky dome
 */
export function createOutdoorLighting(
  scene: THREE.Scene,
  config?: Partial<LightingConfig>
): LightingSetup {
  const intensity = config?.intensity ?? 1.0;
  const lights: THREE.Light[] = [];
  
  // Sun light
  const sunLight = new THREE.DirectionalLight(0xfffaf0, intensity * 1.5);
  sunLight.position.set(10, 20, 5);
  sunLight.castShadow = true;
  configureShadow(sunLight, config?.shadowQuality || 'high');
  lights.push(sunLight);
  scene.add(sunLight);
  
  // Sky hemisphere
  const skyLight = new THREE.HemisphereLight(
    0x87ceeb,  // Sky blue
    0x8b7355,  // Ground brown (dirt/concrete)
    intensity * 0.8
  );
  lights.push(skyLight);
  scene.add(skyLight);
  
  // Bounce light from surroundings
  const bounceLight = new THREE.DirectionalLight(0xe8e0d8, intensity * 0.2);
  bounceLight.position.set(-5, 2, -5);
  bounceLight.castShadow = false;
  lights.push(bounceLight);
  scene.add(bounceLight);
  
  return {
    lights,
    dispose: () => disposeLights(lights, scene)
  };
}

// =============================================================================
// OVERCAST LIGHTING
// =============================================================================

/**
 * Create soft overcast lighting
 * Even, diffuse lighting ideal for material comparison
 */
export function createOvercastLighting(
  scene: THREE.Scene,
  config?: Partial<LightingConfig>
): LightingSetup {
  const intensity = config?.intensity ?? 1.0;
  const lights: THREE.Light[] = [];
  
  // Soft overhead light
  const overhead = new THREE.DirectionalLight(0xf5f5f5, intensity * 0.6);
  overhead.position.set(0, 10, 0);
  overhead.castShadow = true;
  configureShadow(overhead, 'medium');
  lights.push(overhead);
  scene.add(overhead);
  
  // Multiple soft fill lights from different angles
  const angles = [0, 72, 144, 216, 288];
  angles.forEach((angle, i) => {
    const radians = (angle * Math.PI) / 180;
    const fillLight = new THREE.DirectionalLight(0xfafafa, intensity * 0.2);
    fillLight.position.set(
      Math.cos(radians) * 5,
      4,
      Math.sin(radians) * 5
    );
    fillLight.castShadow = false;
    lights.push(fillLight);
    scene.add(fillLight);
  });
  
  // Strong ambient for even illumination
  const ambient = new THREE.AmbientLight(0xffffff, intensity * 0.6);
  lights.push(ambient);
  scene.add(ambient);
  
  return {
    lights,
    dispose: () => disposeLights(lights, scene)
  };
}

// =============================================================================
// TECHNICAL LIGHTING
// =============================================================================

/**
 * Create even technical lighting
 * Minimizes shadows for clear detail visibility
 */
export function createTechnicalLighting(
  scene: THREE.Scene,
  config?: Partial<LightingConfig>
): LightingSetup {
  const intensity = config?.intensity ?? 1.0;
  const lights: THREE.Light[] = [];
  
  // Four-point even lighting
  const positions = [
    [5, 8, 5],
    [-5, 8, 5],
    [-5, 8, -5],
    [5, 8, -5]
  ];
  
  positions.forEach((pos, i) => {
    const light = new THREE.DirectionalLight(0xffffff, intensity * 0.35);
    light.position.set(pos[0], pos[1], pos[2]);
    light.castShadow = i === 0; // Only one shadow caster
    if (i === 0) {
      configureShadow(light, 'medium');
    }
    lights.push(light);
    scene.add(light);
  });
  
  // Strong ambient to eliminate dark areas
  const ambient = new THREE.AmbientLight(0xffffff, intensity * 0.5);
  lights.push(ambient);
  scene.add(ambient);
  
  return {
    lights,
    dispose: () => disposeLights(lights, scene)
  };
}

// =============================================================================
// DRAMATIC LIGHTING
// =============================================================================

/**
 * Create dramatic presentation lighting
 * High contrast for marketing materials
 */
export function createDramaticLighting(
  scene: THREE.Scene,
  config?: Partial<LightingConfig>
): LightingSetup {
  const intensity = config?.intensity ?? 1.0;
  const lights: THREE.Light[] = [];
  
  // Strong key light with warm tint
  const keyLight = new THREE.SpotLight(0xfff0e0, intensity * 2.0);
  keyLight.position.set(8, 12, 6);
  keyLight.angle = Math.PI / 6;
  keyLight.penumbra = 0.5;
  keyLight.decay = 2;
  keyLight.distance = 50;
  keyLight.castShadow = true;
  configureShadow(keyLight, config?.shadowQuality || 'ultra');
  lights.push(keyLight);
  scene.add(keyLight);
  
  // Subtle blue rim light
  const rimLight = new THREE.DirectionalLight(0x4060ff, intensity * 0.3);
  rimLight.position.set(-3, 2, -8);
  rimLight.castShadow = false;
  lights.push(rimLight);
  scene.add(rimLight);
  
  // Minimal ambient (keeps shadows dark)
  const ambient = new THREE.AmbientLight(0x202020, intensity * 0.2);
  lights.push(ambient);
  scene.add(ambient);
  
  return {
    lights,
    dispose: () => disposeLights(lights, scene)
  };
}

// =============================================================================
// SHADOW CONFIGURATION
// =============================================================================

/**
 * Configure shadow quality for a light
 */
function configureShadow(
  light: THREE.DirectionalLight | THREE.SpotLight,
  quality: 'low' | 'medium' | 'high' | 'ultra'
): void {
  const sizes: Record<string, number> = {
    low: 512,
    medium: 1024,
    high: 2048,
    ultra: 4096
  };
  
  light.shadow.mapSize.width = sizes[quality];
  light.shadow.mapSize.height = sizes[quality];
  
  if (light instanceof THREE.DirectionalLight) {
    light.shadow.camera.near = 0.5;
    light.shadow.camera.far = 500;
    light.shadow.camera.left = -50;
    light.shadow.camera.right = 50;
    light.shadow.camera.top = 50;
    light.shadow.camera.bottom = -50;
  }
  
  light.shadow.bias = -0.0001;
  light.shadow.normalBias = 0.02;
}

// =============================================================================
// PRESET FACTORY
// =============================================================================

/**
 * Create lighting setup from preset name
 */
export function createLighting(
  scene: THREE.Scene,
  config: LightingConfig
): LightingSetup {
  switch (config.preset) {
    case 'studio':
      return createStudioLighting(scene, config);
    case 'outdoor':
      return createOutdoorLighting(scene, config);
    case 'overcast':
      return createOvercastLighting(scene, config);
    case 'technical':
      return createTechnicalLighting(scene, config);
    case 'dramatic':
      return createDramaticLighting(scene, config);
    default:
      return createStudioLighting(scene, config);
  }
}

// =============================================================================
// ENVIRONMENT MAP LOADING
// =============================================================================

/**
 * Load and apply an environment map for reflections
 */
export async function loadEnvironmentMap(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  path: string
): Promise<THREE.Texture | null> {
  return new Promise((resolve) => {
    const loader = new THREE.CubeTextureLoader();
    
    // Assume standard cube map naming convention
    const urls = [
      `${path}/px.jpg`, `${path}/nx.jpg`,
      `${path}/py.jpg`, `${path}/ny.jpg`,
      `${path}/pz.jpg`, `${path}/nz.jpg`
    ];
    
    loader.load(
      urls,
      (texture) => {
        const pmremGenerator = new THREE.PMREMGenerator(renderer);
        pmremGenerator.compileEquirectangularShader();
        
        const envMap = pmremGenerator.fromCubemap(texture as any).texture;
        scene.environment = envMap;
        
        pmremGenerator.dispose();
        resolve(envMap);
      },
      undefined,
      (error) => {
        console.error('Failed to load environment map:', error);
        resolve(null);
      }
    );
  });
}

/**
 * Create a simple procedural environment map
 */
export function createProceduralEnvironment(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  config?: {
    skyColor?: THREE.Color;
    groundColor?: THREE.Color;
    horizonColor?: THREE.Color;
  }
): THREE.Texture {
  const skyColor = config?.skyColor || new THREE.Color(0x87ceeb);
  const groundColor = config?.groundColor || new THREE.Color(0x8b7355);
  const horizonColor = config?.horizonColor || new THREE.Color(0xffffff);
  
  // Create a simple gradient scene for environment
  const envScene = new THREE.Scene();
  
  // Sky sphere with gradient
  const vertexShader = `
    varying vec3 vWorldPosition;
    void main() {
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPosition.xyz;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;
  
  const fragmentShader = `
    uniform vec3 topColor;
    uniform vec3 bottomColor;
    uniform vec3 horizonColor;
    uniform float offset;
    uniform float exponent;
    varying vec3 vWorldPosition;
    
    void main() {
      float h = normalize(vWorldPosition + offset).y;
      float t = max(pow(max(h, 0.0), exponent), 0.0);
      float b = max(pow(max(-h, 0.0), exponent), 0.0);
      vec3 color = mix(horizonColor, topColor, t);
      color = mix(color, bottomColor, b);
      gl_FragColor = vec4(color, 1.0);
    }
  `;
  
  const material = new THREE.ShaderMaterial({
    uniforms: {
      topColor: { value: skyColor },
      bottomColor: { value: groundColor },
      horizonColor: { value: horizonColor },
      offset: { value: 33 },
      exponent: { value: 0.6 }
    },
    vertexShader,
    fragmentShader,
    side: THREE.BackSide
  });
  
  const geometry = new THREE.SphereGeometry(100, 32, 15);
  const mesh = new THREE.Mesh(geometry, material);
  envScene.add(mesh);
  
  // Generate environment map
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  const envMap = pmremGenerator.fromScene(envScene).texture;
  
  scene.environment = envMap;
  
  // Cleanup
  geometry.dispose();
  material.dispose();
  pmremGenerator.dispose();
  
  return envMap;
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Dispose of all lights in a setup
 */
function disposeLights(lights: THREE.Light[], scene: THREE.Scene): void {
  lights.forEach(light => {
    scene.remove(light);
    if (light instanceof THREE.DirectionalLight || light instanceof THREE.SpotLight) {
      light.shadow.map?.dispose();
    }
    light.dispose?.();
  });
}

/**
 * Update shadow camera to encompass scene bounds
 */
export function fitShadowCamera(
  light: THREE.DirectionalLight,
  scene: THREE.Scene,
  padding: number = 10
): void {
  const box = new THREE.Box3().setFromObject(scene);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  
  const maxSize = Math.max(size.x, size.y, size.z) + padding;
  
  light.shadow.camera.left = -maxSize;
  light.shadow.camera.right = maxSize;
  light.shadow.camera.top = maxSize;
  light.shadow.camera.bottom = -maxSize;
  light.shadow.camera.updateProjectionMatrix();
  
  // Position light to look at scene center
  light.target.position.copy(center);
  light.target.updateMatrixWorld();
}

// =============================================================================
// EXPORTS
// =============================================================================

export const LightingSetup = {
  createStudioLighting,
  createOutdoorLighting,
  createOvercastLighting,
  createTechnicalLighting,
  createDramaticLighting,
  createLighting,
  loadEnvironmentMap,
  createProceduralEnvironment,
  fitShadowCamera
};
