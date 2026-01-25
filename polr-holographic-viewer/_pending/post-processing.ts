/**
 * Post-Processing Effects for Photorealistic Rendering
 * POLR Strategic Development - Phase A4.2
 * 
 * Advanced rendering effects using Three.js post-processing
 * 
 * @module rendering/post-processing
 * @version 1.0.0
 */

import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { SSAOPass } from 'three/examples/jsm/postprocessing/SSAOPass';
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass';
import { GammaCorrectionShader } from 'three/examples/jsm/shaders/GammaCorrectionShader';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader';

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export type PostProcessingPreset = 
  | 'photorealistic'   // Full quality with all effects
  | 'technical'        // Clean, sharp, minimal effects
  | 'presentation'     // Enhanced visuals for demos
  | 'performance';     // Lightweight for real-time

export interface PostProcessingConfig {
  preset?: PostProcessingPreset;
  
  // Ambient Occlusion
  ssao?: {
    enabled: boolean;
    kernelRadius?: number;
    minDistance?: number;
    maxDistance?: number;
  };
  
  // Anti-aliasing
  antiAliasing?: 'none' | 'fxaa' | 'smaa';
  
  // Bloom
  bloom?: {
    enabled: boolean;
    strength?: number;
    radius?: number;
    threshold?: number;
  };
  
  // Color correction
  colorCorrection?: {
    enabled: boolean;
    exposure?: number;
    saturation?: number;
    contrast?: number;
  };
  
  // Vignette
  vignette?: {
    enabled: boolean;
    darkness?: number;
    offset?: number;
  };
  
  // Sharpening
  sharpen?: {
    enabled: boolean;
    strength?: number;
  };
}

export interface PostProcessingSetup {
  composer: EffectComposer;
  passes: Map<string, any>;
  resize: (width: number, height: number) => void;
  update: (config: Partial<PostProcessingConfig>) => void;
  render: () => void;
  dispose: () => void;
}

// =============================================================================
// PRESET CONFIGURATIONS
// =============================================================================

const PRESETS: Record<PostProcessingPreset, PostProcessingConfig> = {
  photorealistic: {
    ssao: {
      enabled: true,
      kernelRadius: 16,
      minDistance: 0.005,
      maxDistance: 0.1
    },
    antiAliasing: 'smaa',
    bloom: {
      enabled: true,
      strength: 0.1,
      radius: 0.4,
      threshold: 0.9
    },
    colorCorrection: {
      enabled: true,
      exposure: 1.0,
      saturation: 1.05,
      contrast: 1.05
    },
    vignette: {
      enabled: true,
      darkness: 0.3,
      offset: 1.0
    },
    sharpen: {
      enabled: true,
      strength: 0.2
    }
  },
  
  technical: {
    ssao: {
      enabled: false
    },
    antiAliasing: 'fxaa',
    bloom: {
      enabled: false
    },
    colorCorrection: {
      enabled: true,
      exposure: 1.0,
      saturation: 1.0,
      contrast: 1.0
    },
    vignette: {
      enabled: false
    },
    sharpen: {
      enabled: true,
      strength: 0.3
    }
  },
  
  presentation: {
    ssao: {
      enabled: true,
      kernelRadius: 12,
      minDistance: 0.005,
      maxDistance: 0.08
    },
    antiAliasing: 'smaa',
    bloom: {
      enabled: true,
      strength: 0.2,
      radius: 0.3,
      threshold: 0.85
    },
    colorCorrection: {
      enabled: true,
      exposure: 1.1,
      saturation: 1.1,
      contrast: 1.1
    },
    vignette: {
      enabled: true,
      darkness: 0.4,
      offset: 0.9
    },
    sharpen: {
      enabled: true,
      strength: 0.15
    }
  },
  
  performance: {
    ssao: {
      enabled: false
    },
    antiAliasing: 'fxaa',
    bloom: {
      enabled: false
    },
    colorCorrection: {
      enabled: false
    },
    vignette: {
      enabled: false
    },
    sharpen: {
      enabled: false
    }
  }
};

// =============================================================================
// CUSTOM SHADERS
// =============================================================================

/**
 * Color correction shader
 */
const ColorCorrectionShader = {
  uniforms: {
    tDiffuse: { value: null },
    exposure: { value: 1.0 },
    saturation: { value: 1.0 },
    contrast: { value: 1.0 }
  },
  
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float exposure;
    uniform float saturation;
    uniform float contrast;
    varying vec2 vUv;
    
    vec3 adjustSaturation(vec3 color, float saturation) {
      float grey = dot(color, vec3(0.2126, 0.7152, 0.0722));
      return mix(vec3(grey), color, saturation);
    }
    
    vec3 adjustContrast(vec3 color, float contrast) {
      return (color - 0.5) * contrast + 0.5;
    }
    
    void main() {
      vec4 texel = texture2D(tDiffuse, vUv);
      vec3 color = texel.rgb;
      
      // Apply exposure
      color *= exposure;
      
      // Apply saturation
      color = adjustSaturation(color, saturation);
      
      // Apply contrast
      color = adjustContrast(color, contrast);
      
      gl_FragColor = vec4(color, texel.a);
    }
  `
};

/**
 * Vignette shader
 */
const VignetteShader = {
  uniforms: {
    tDiffuse: { value: null },
    darkness: { value: 0.5 },
    offset: { value: 1.0 }
  },
  
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float darkness;
    uniform float offset;
    varying vec2 vUv;
    
    void main() {
      vec4 texel = texture2D(tDiffuse, vUv);
      
      vec2 uv = (vUv - vec2(0.5)) * vec2(offset);
      float vignette = 1.0 - smoothstep(0.5, 1.0, length(uv) * 1.5);
      vignette = mix(1.0 - darkness, 1.0, vignette);
      
      gl_FragColor = vec4(texel.rgb * vignette, texel.a);
    }
  `
};

/**
 * Sharpen shader
 */
const SharpenShader = {
  uniforms: {
    tDiffuse: { value: null },
    strength: { value: 0.25 },
    resolution: { value: new THREE.Vector2(1, 1) }
  },
  
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float strength;
    uniform vec2 resolution;
    varying vec2 vUv;
    
    void main() {
      vec2 texel = 1.0 / resolution;
      
      vec4 center = texture2D(tDiffuse, vUv);
      vec4 top = texture2D(tDiffuse, vUv + vec2(0.0, texel.y));
      vec4 bottom = texture2D(tDiffuse, vUv - vec2(0.0, texel.y));
      vec4 left = texture2D(tDiffuse, vUv - vec2(texel.x, 0.0));
      vec4 right = texture2D(tDiffuse, vUv + vec2(texel.x, 0.0));
      
      vec4 sharpened = center * (1.0 + 4.0 * strength) - (top + bottom + left + right) * strength;
      
      gl_FragColor = clamp(sharpened, 0.0, 1.0);
    }
  `
};

// =============================================================================
// MAIN SETUP FUNCTION
// =============================================================================

/**
 * Set up post-processing pipeline
 */
export function setupPostProcessing(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.Camera,
  config?: PostProcessingConfig
): PostProcessingSetup {
  const width = window.innerWidth;
  const height = window.innerHeight;
  
  // Get preset config or use defaults
  const presetConfig = config?.preset ? PRESETS[config.preset] : PRESETS.photorealistic;
  const finalConfig = { ...presetConfig, ...config };
  
  // Create composer with proper render target
  const renderTarget = new THREE.WebGLRenderTarget(width, height, {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    format: THREE.RGBAFormat,
    colorSpace: THREE.SRGBColorSpace
  });
  
  const composer = new EffectComposer(renderer, renderTarget);
  const passes = new Map<string, any>();
  
  // 1. Base render pass
  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);
  passes.set('render', renderPass);
  
  // 2. SSAO Pass (Ambient Occlusion)
  if (finalConfig.ssao?.enabled) {
    const ssaoPass = new SSAOPass(scene, camera, width, height);
    ssaoPass.kernelRadius = finalConfig.ssao.kernelRadius ?? 16;
    ssaoPass.minDistance = finalConfig.ssao.minDistance ?? 0.005;
    ssaoPass.maxDistance = finalConfig.ssao.maxDistance ?? 0.1;
    composer.addPass(ssaoPass);
    passes.set('ssao', ssaoPass);
  }
  
  // 3. Bloom Pass
  if (finalConfig.bloom?.enabled) {
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(width, height),
      finalConfig.bloom.strength ?? 0.1,
      finalConfig.bloom.radius ?? 0.4,
      finalConfig.bloom.threshold ?? 0.9
    );
    composer.addPass(bloomPass);
    passes.set('bloom', bloomPass);
  }
  
  // 4. Color Correction Pass
  if (finalConfig.colorCorrection?.enabled) {
    const colorPass = new ShaderPass(ColorCorrectionShader);
    colorPass.uniforms.exposure.value = finalConfig.colorCorrection.exposure ?? 1.0;
    colorPass.uniforms.saturation.value = finalConfig.colorCorrection.saturation ?? 1.0;
    colorPass.uniforms.contrast.value = finalConfig.colorCorrection.contrast ?? 1.0;
    composer.addPass(colorPass);
    passes.set('colorCorrection', colorPass);
  }
  
  // 5. Vignette Pass
  if (finalConfig.vignette?.enabled) {
    const vignettePass = new ShaderPass(VignetteShader);
    vignettePass.uniforms.darkness.value = finalConfig.vignette.darkness ?? 0.5;
    vignettePass.uniforms.offset.value = finalConfig.vignette.offset ?? 1.0;
    composer.addPass(vignettePass);
    passes.set('vignette', vignettePass);
  }
  
  // 6. Sharpen Pass
  if (finalConfig.sharpen?.enabled) {
    const sharpenPass = new ShaderPass(SharpenShader);
    sharpenPass.uniforms.strength.value = finalConfig.sharpen.strength ?? 0.25;
    sharpenPass.uniforms.resolution.value = new THREE.Vector2(width, height);
    composer.addPass(sharpenPass);
    passes.set('sharpen', sharpenPass);
  }
  
  // 7. Anti-aliasing Pass
  if (finalConfig.antiAliasing === 'smaa') {
    const smaaPass = new SMAAPass(width, height);
    composer.addPass(smaaPass);
    passes.set('antiAliasing', smaaPass);
  } else if (finalConfig.antiAliasing === 'fxaa') {
    const fxaaPass = new ShaderPass(FXAAShader);
    fxaaPass.material.uniforms['resolution'].value.x = 1 / width;
    fxaaPass.material.uniforms['resolution'].value.y = 1 / height;
    composer.addPass(fxaaPass);
    passes.set('antiAliasing', fxaaPass);
  }
  
  // 8. Output pass (required for proper color output)
  const outputPass = new OutputPass();
  composer.addPass(outputPass);
  passes.set('output', outputPass);
  
  // Resize handler
  const resize = (newWidth: number, newHeight: number): void => {
    composer.setSize(newWidth, newHeight);
    
    // Update resolution-dependent passes
    const sharpenPass = passes.get('sharpen');
    if (sharpenPass) {
      sharpenPass.uniforms.resolution.value.set(newWidth, newHeight);
    }
    
    const fxaaPass = passes.get('antiAliasing');
    if (fxaaPass && fxaaPass.material?.uniforms?.['resolution']) {
      fxaaPass.material.uniforms['resolution'].value.x = 1 / newWidth;
      fxaaPass.material.uniforms['resolution'].value.y = 1 / newHeight;
    }
    
    const ssaoPass = passes.get('ssao');
    if (ssaoPass) {
      ssaoPass.setSize(newWidth, newHeight);
    }
    
    const bloomPass = passes.get('bloom');
    if (bloomPass) {
      bloomPass.resolution.set(newWidth, newHeight);
    }
  };
  
  // Update handler for runtime config changes
  const update = (newConfig: Partial<PostProcessingConfig>): void => {
    // Update SSAO
    const ssaoPass = passes.get('ssao');
    if (ssaoPass && newConfig.ssao) {
      if (newConfig.ssao.kernelRadius !== undefined) {
        ssaoPass.kernelRadius = newConfig.ssao.kernelRadius;
      }
      if (newConfig.ssao.minDistance !== undefined) {
        ssaoPass.minDistance = newConfig.ssao.minDistance;
      }
      if (newConfig.ssao.maxDistance !== undefined) {
        ssaoPass.maxDistance = newConfig.ssao.maxDistance;
      }
    }
    
    // Update Bloom
    const bloomPass = passes.get('bloom');
    if (bloomPass && newConfig.bloom) {
      if (newConfig.bloom.strength !== undefined) {
        bloomPass.strength = newConfig.bloom.strength;
      }
      if (newConfig.bloom.radius !== undefined) {
        bloomPass.radius = newConfig.bloom.radius;
      }
      if (newConfig.bloom.threshold !== undefined) {
        bloomPass.threshold = newConfig.bloom.threshold;
      }
    }
    
    // Update Color Correction
    const colorPass = passes.get('colorCorrection');
    if (colorPass && newConfig.colorCorrection) {
      if (newConfig.colorCorrection.exposure !== undefined) {
        colorPass.uniforms.exposure.value = newConfig.colorCorrection.exposure;
      }
      if (newConfig.colorCorrection.saturation !== undefined) {
        colorPass.uniforms.saturation.value = newConfig.colorCorrection.saturation;
      }
      if (newConfig.colorCorrection.contrast !== undefined) {
        colorPass.uniforms.contrast.value = newConfig.colorCorrection.contrast;
      }
    }
    
    // Update Vignette
    const vignettePass = passes.get('vignette');
    if (vignettePass && newConfig.vignette) {
      if (newConfig.vignette.darkness !== undefined) {
        vignettePass.uniforms.darkness.value = newConfig.vignette.darkness;
      }
      if (newConfig.vignette.offset !== undefined) {
        vignettePass.uniforms.offset.value = newConfig.vignette.offset;
      }
    }
    
    // Update Sharpen
    const sharpenPass = passes.get('sharpen');
    if (sharpenPass && newConfig.sharpen?.strength !== undefined) {
      sharpenPass.uniforms.strength.value = newConfig.sharpen.strength;
    }
  };
  
  // Render handler
  const render = (): void => {
    composer.render();
  };
  
  // Dispose handler
  const dispose = (): void => {
    renderTarget.dispose();
    passes.forEach(pass => {
      if (pass.dispose) {
        pass.dispose();
      }
    });
    passes.clear();
  };
  
  return {
    composer,
    passes,
    resize,
    update,
    render,
    dispose
  };
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Create a screenshot with post-processing at specified resolution
 */
export async function captureScreenshot(
  setup: PostProcessingSetup,
  width: number,
  height: number
): Promise<string> {
  // Store original size
  const originalWidth = window.innerWidth;
  const originalHeight = window.innerHeight;
  
  // Resize to capture resolution
  setup.resize(width, height);
  setup.render();
  
  // Capture image
  const canvas = setup.composer.renderer.domElement;
  const dataUrl = canvas.toDataURL('image/png');
  
  // Restore original size
  setup.resize(originalWidth, originalHeight);
  
  return dataUrl;
}

/**
 * Enable/disable specific post-processing effect
 */
export function toggleEffect(
  setup: PostProcessingSetup,
  effectName: string,
  enabled: boolean
): boolean {
  const pass = setup.passes.get(effectName);
  if (pass && 'enabled' in pass) {
    pass.enabled = enabled;
    return true;
  }
  return false;
}

// =============================================================================
// EXPORTS
// =============================================================================

export const PostProcessing = {
  setupPostProcessing,
  captureScreenshot,
  toggleEffect,
  PRESETS,
  shaders: {
    ColorCorrectionShader,
    VignetteShader,
    SharpenShader
  }
};
