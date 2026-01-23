/**
 * Material Factory
 * Creates Three.js PBR materials from base material definitions
 */

import * as THREE from 'three';
import { BaseMaterial, TextureType } from './base-materials';
import { getProductMaterial } from './manufacturers';

export class MaterialFactory {
  private textureCache: Map<string, THREE.Texture> = new Map();
  private materialCache: Map<string, THREE.MeshStandardMaterial> = new Map();

  /**
   * Create a Three.js material from a base material definition
   */
  createMaterial(baseMaterial: BaseMaterial): THREE.MeshStandardMaterial {
    // Check cache first
    const cacheKey = baseMaterial.id;
    if (this.materialCache.has(cacheKey)) {
      return this.materialCache.get(cacheKey)!.clone();
    }

    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color(baseMaterial.color),
      roughness: baseMaterial.roughness,
      metalness: baseMaterial.metalness,
      transparent: baseMaterial.opacity < 1,
      opacity: baseMaterial.opacity,
      side: THREE.DoubleSide
    });

    // Add procedural texture based on type
    this.applyProceduralTexture(material, baseMaterial.texture);

    // Cache the material
    this.materialCache.set(cacheKey, material);

    return material.clone();
  }

  /**
   * Create material from manufacturer product
   */
  createProductMaterial(
    manufacturerId: string,
    productName: string
  ): THREE.MeshStandardMaterial | null {
    const baseMaterial = getProductMaterial(manufacturerId, productName);
    if (!baseMaterial) return null;

    return this.createMaterial(baseMaterial);
  }

  /**
   * Create a simple material with color override
   */
  createSimpleMaterial(
    baseMaterial: BaseMaterial,
    colorOverride?: string
  ): THREE.MeshStandardMaterial {
    const material = this.createMaterial(baseMaterial);
    if (colorOverride) {
      material.color = new THREE.Color(colorOverride);
    }
    return material;
  }

  /**
   * Apply procedural textures based on texture type
   */
  private applyProceduralTexture(
    material: THREE.MeshStandardMaterial,
    texture: { type: TextureType; scale: number; bumpStrength: number }
  ): void {
    // Generate procedural normal map based on texture type
    const normalMap = this.generateProceduralNormalMap(texture.type, texture.scale);
    if (normalMap) {
      material.normalMap = normalMap;
      material.normalScale = new THREE.Vector2(texture.bumpStrength, texture.bumpStrength);
    }

    // Add roughness variation for realism
    const roughnessMap = this.generateRoughnessMap(texture.type, texture.scale);
    if (roughnessMap) {
      material.roughnessMap = roughnessMap;
    }
  }

  /**
   * Generate procedural normal map for different texture types
   */
  private generateProceduralNormalMap(type: TextureType, scale: number): THREE.Texture | null {
    const cacheKey = `normal-${type}-${scale}`;
    if (this.textureCache.has(cacheKey)) {
      return this.textureCache.get(cacheKey)!;
    }

    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    // Fill with neutral normal (pointing up)
    ctx.fillStyle = '#8080ff';
    ctx.fillRect(0, 0, size, size);

    switch (type) {
      case 'granular':
        this.drawGranularNormal(ctx, size);
        break;
      case 'rubberized':
        this.drawRubberizedNormal(ctx, size);
        break;
      case 'orange-peel':
        this.drawOrangePeelNormal(ctx, size);
        break;
      case 'dimpled':
        this.drawDimpledNormal(ctx, size);
        break;
      case 'concrete-formed':
        this.drawConcreteNormal(ctx, size);
        break;
      case 'concrete-broom':
        this.drawConcreteBroomNormal(ctx, size);
        break;
      case 'grid':
        this.drawGridNormal(ctx, size);
        break;
      case 'fabric':
        this.drawFabricNormal(ctx, size);
        break;
      case 'foam-closed':
        this.drawFoamNormal(ctx, size);
        break;
      case 'metal-mill':
        this.drawMetalMillNormal(ctx, size);
        break;
      default:
        return null; // Smooth surfaces don't need normal maps
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(scale, scale);

    this.textureCache.set(cacheKey, texture);
    return texture;
  }

  private drawGranularNormal(ctx: CanvasRenderingContext2D, size: number): void {
    // Mineral granule surface (like cap sheet roofing)
    for (let i = 0; i < size * size * 0.3; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const r = 1 + Math.random() * 3;

      // Random normal direction for each granule
      const nx = 128 + (Math.random() - 0.5) * 60;
      const ny = 128 + (Math.random() - 0.5) * 60;

      ctx.fillStyle = `rgb(${nx}, ${ny}, 255)`;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private drawRubberizedNormal(ctx: CanvasRenderingContext2D, size: number): void {
    // Subtle rubber texture
    for (let i = 0; i < size * size * 0.1; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const r = 2 + Math.random() * 4;

      const nx = 128 + (Math.random() - 0.5) * 30;
      const ny = 128 + (Math.random() - 0.5) * 30;

      ctx.fillStyle = `rgb(${nx}, ${ny}, 250)`;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private drawOrangePeelNormal(ctx: CanvasRenderingContext2D, size: number): void {
    // Spray-applied texture
    for (let i = 0; i < size * size * 0.15; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const r = 3 + Math.random() * 6;

      const gradient = ctx.createRadialGradient(x, y, 0, x, y, r);
      gradient.addColorStop(0, 'rgb(128, 128, 255)');
      gradient.addColorStop(0.5, 'rgb(140, 140, 250)');
      gradient.addColorStop(1, 'rgb(128, 128, 255)');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private drawDimpledNormal(ctx: CanvasRenderingContext2D, size: number): void {
    // Drainage board dimple pattern
    const dimpleSize = size / 8;
    for (let x = dimpleSize / 2; x < size; x += dimpleSize) {
      for (let y = dimpleSize / 2; y < size; y += dimpleSize) {
        const gradient = ctx.createRadialGradient(
          x, y, 0,
          x, y, dimpleSize * 0.4
        );
        gradient.addColorStop(0, 'rgb(128, 128, 200)');
        gradient.addColorStop(0.7, 'rgb(100, 100, 255)');
        gradient.addColorStop(1, 'rgb(128, 128, 255)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, dimpleSize * 0.4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  private drawConcreteNormal(ctx: CanvasRenderingContext2D, size: number): void {
    // Concrete with bug holes and form marks
    // Bug holes
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const r = 2 + Math.random() * 5;

      ctx.fillStyle = 'rgb(100, 100, 255)';
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Subtle surface variation
    for (let i = 0; i < size * size * 0.05; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const nx = 128 + (Math.random() - 0.5) * 20;
      const ny = 128 + (Math.random() - 0.5) * 20;

      ctx.fillStyle = `rgb(${nx}, ${ny}, 255)`;
      ctx.fillRect(x, y, 2, 2);
    }
  }

  private drawConcreteBroomNormal(ctx: CanvasRenderingContext2D, size: number): void {
    // Broom-finished concrete with linear striations
    ctx.strokeStyle = 'rgb(110, 110, 255)';
    ctx.lineWidth = 1;

    for (let y = 0; y < size; y += 3) {
      ctx.beginPath();
      ctx.moveTo(0, y + (Math.random() - 0.5) * 2);
      for (let x = 0; x < size; x += 10) {
        ctx.lineTo(x, y + (Math.random() - 0.5) * 2);
      }
      ctx.stroke();
    }
  }

  private drawGridNormal(ctx: CanvasRenderingContext2D, size: number): void {
    // HDPE grid pattern
    const gridSize = size / 16;
    ctx.strokeStyle = 'rgb(110, 110, 255)';
    ctx.lineWidth = 2;

    for (let x = 0; x < size; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, size);
      ctx.stroke();
    }

    for (let y = 0; y < size; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(size, y);
      ctx.stroke();
    }
  }

  private drawFabricNormal(ctx: CanvasRenderingContext2D, size: number): void {
    // Woven fabric texture
    const weaveSize = 4;
    for (let x = 0; x < size; x += weaveSize) {
      for (let y = 0; y < size; y += weaveSize) {
        const isOver = ((x / weaveSize) + (y / weaveSize)) % 2 === 0;
        const nz = isOver ? 255 : 240;
        ctx.fillStyle = `rgb(128, 128, ${nz})`;
        ctx.fillRect(x, y, weaveSize, weaveSize);
      }
    }
  }

  private drawFoamNormal(ctx: CanvasRenderingContext2D, size: number): void {
    // Closed-cell foam texture
    for (let i = 0; i < size * size * 0.08; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const r = 1 + Math.random() * 2;

      const nx = 128 + (Math.random() - 0.5) * 15;
      const ny = 128 + (Math.random() - 0.5) * 15;

      ctx.fillStyle = `rgb(${nx}, ${ny}, 252)`;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private drawMetalMillNormal(ctx: CanvasRenderingContext2D, size: number): void {
    // Mill-finish metal with subtle linear marks
    ctx.strokeStyle = 'rgb(120, 120, 255)';
    ctx.lineWidth = 0.5;

    for (let i = 0; i < 100; i++) {
      const y = Math.random() * size;
      const length = 20 + Math.random() * 80;
      const startX = Math.random() * size;

      ctx.beginPath();
      ctx.moveTo(startX, y);
      ctx.lineTo(startX + length, y + (Math.random() - 0.5) * 2);
      ctx.stroke();
    }
  }

  private generateRoughnessMap(type: TextureType, scale: number): THREE.Texture | null {
    // Only generate for materials that need roughness variation
    if (!['granular', 'concrete-formed', 'concrete-broom', 'fabric', 'rubberized'].includes(type)) {
      return null;
    }

    const cacheKey = `roughness-${type}-${scale}`;
    if (this.textureCache.has(cacheKey)) {
      return this.textureCache.get(cacheKey)!;
    }

    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    // Base roughness (gray)
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, size, size);

    // Add variation
    for (let i = 0; i < size * size * 0.1; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const brightness = Math.random() * 100 + 78;
      ctx.fillStyle = `rgb(${brightness}, ${brightness}, ${brightness})`;
      ctx.fillRect(x, y, 3, 3);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(scale, scale);

    this.textureCache.set(cacheKey, texture);
    return texture;
  }

  /**
   * Dispose all cached textures and materials
   */
  dispose(): void {
    this.textureCache.forEach(texture => texture.dispose());
    this.textureCache.clear();

    this.materialCache.forEach(material => material.dispose());
    this.materialCache.clear();
  }

  /**
   * Clear caches (useful for hot reload)
   */
  clearCache(): void {
    this.dispose();
  }
}

// Export singleton instance
export const materialFactory = new MaterialFactory();
