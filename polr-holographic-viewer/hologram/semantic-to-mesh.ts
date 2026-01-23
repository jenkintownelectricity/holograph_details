import * as THREE from 'three';
import { SemanticDetail } from '../schemas/semantic-detail';
import { BASE_MATERIALS } from '../materials/base-materials';
import { materialFactory } from '../materials/material-factory';

/**
 * Converts semantic detail description to full 3D mesh
 * This is the "decompression" step - turning ~500 bytes into full 3D scene
 */
export class SemanticToMeshConverter {
  private materialCache: Map<string, THREE.Material> = new Map();
  
  /**
   * Main conversion function
   * Takes semantic data (~500 bytes) and outputs full 3D scene
   */
  convert(detail: SemanticDetail): THREE.Group {
    const group = new THREE.Group();
    group.name = `detail-${detail.id}`;

    console.log('[SemanticToMesh] Converting detail:', detail.id, detail.category);

    // Get viewport dimensions or use defaults
    const viewport = detail.viewport || {
      width: 400,
      height: 300,
      depth: 150
    };

    console.log('[SemanticToMesh] Viewport:', viewport);

    // Build layer stack based on detail type
    switch (detail.category) {
      case 'expansion-joint':
        this.buildExpansionJoint(group, detail, viewport);
        break;
      case 'air-barrier':
        this.buildWallAssembly(group, detail, viewport);
        break;
      case 'roofing':
        this.buildRoofAssembly(group, detail, viewport);
        break;
      case 'foundation':
        this.buildFoundationAssembly(group, detail, viewport);
        break;
      case 'penetration':
        this.buildPenetration(group, detail, viewport);
        break;
      default:
        this.buildGenericLayers(group, detail, viewport);
    }
    
    // Add product labels
    this.addProductLabels(group, detail);

    console.log('[SemanticToMesh] Created group with', group.children.length, 'children');
    group.children.forEach((child, i) => {
      console.log(`  [${i}] ${child.name}:`, child.type);
    });

    return group;
  }
  
  /**
   * Build expansion joint detail
   */
  private buildExpansionJoint(
    group: THREE.Group, 
    detail: SemanticDetail,
    viewport: { width: number; height: number; depth: number }
  ): void {
    const params = detail.parameters;
    const jointWidth = (params.jointWidth as number) || 25;
    const wallThickness = (params.wallThickness as number) || 300;
    const membraneOverlap = (params.membraneOverlap as number) || 150;
    const backerDiameter = (params.backerRodDiameter as number) || 32;
    
    const depth = viewport.depth;
    const height = viewport.height;
    
    // Left concrete wall
    const leftWall = this.createBox(
      wallThickness, height, depth,
      this.getMaterial('concrete', { color: '#7a7a7a', roughness: 0.9 })
    );
    leftWall.position.set(-wallThickness/2 - jointWidth/2, height/2, 0);
    leftWall.name = 'substrate-left';
    group.add(leftWall);
    
    // Right concrete wall
    const rightWall = this.createBox(
      wallThickness, height, depth,
      this.getMaterial('concrete', { color: '#7a7a7a', roughness: 0.9 })
    );
    rightWall.position.set(wallThickness/2 + jointWidth/2, height/2, 0);
    rightWall.name = 'substrate-right';
    group.add(rightWall);
    
    // Membrane wrapping over joint
    const membraneShape = new THREE.Shape();
    const totalSpan = wallThickness + jointWidth + membraneOverlap * 2;
    const membraneHeight = 1.5;
    
    // Create membrane profile that bridges the gap
    membraneShape.moveTo(-totalSpan/2, 0);
    membraneShape.lineTo(-jointWidth/2 - 10, 0);
    // Dip into joint
    membraneShape.quadraticCurveTo(0, -jointWidth * 0.8, jointWidth/2 + 10, 0);
    membraneShape.lineTo(totalSpan/2, 0);
    membraneShape.lineTo(totalSpan/2, membraneHeight);
    membraneShape.lineTo(jointWidth/2 + 10, membraneHeight);
    membraneShape.quadraticCurveTo(0, -jointWidth * 0.8 + membraneHeight, -jointWidth/2 - 10, membraneHeight);
    membraneShape.lineTo(-totalSpan/2, membraneHeight);
    membraneShape.closePath();
    
    const extrudeSettings = { depth, bevelEnabled: false };
    const membraneGeom = new THREE.ExtrudeGeometry(membraneShape, extrudeSettings);
    const membrane = new THREE.Mesh(
      membraneGeom,
      this.getMaterial('membrane', { 
        color: '#0a0a0a', 
        metallic: 0.1,
        emissive: '#001111'
      })
    );
    membrane.position.set(0, height * 0.4, -depth/2);
    membrane.rotation.x = Math.PI / 2;
    membrane.name = 'membrane';
    group.add(membrane);
    
    // Backer rod (circular cross-section)
    const backerGeom = new THREE.CylinderGeometry(
      backerDiameter/2, backerDiameter/2, depth, 16
    );
    const backer = new THREE.Mesh(
      backerGeom,
      this.getMaterial('backer-rod', { color: '#e8e8e8', roughness: 0.6 })
    );
    backer.rotation.x = Math.PI / 2;
    backer.position.set(0, height * 0.4 - jointWidth * 0.4, 0);
    backer.name = 'backer-rod';
    group.add(backer);
    
    // Sealant (concave profile)
    const sealantShape = new THREE.Shape();
    sealantShape.moveTo(-jointWidth/2, 0);
    sealantShape.quadraticCurveTo(0, -15, jointWidth/2, 0);
    sealantShape.lineTo(jointWidth/2, 20);
    sealantShape.lineTo(-jointWidth/2, 20);
    sealantShape.closePath();
    
    const sealantGeom = new THREE.ExtrudeGeometry(sealantShape, { depth, bevelEnabled: false });
    const sealant = new THREE.Mesh(
      sealantGeom,
      this.getMaterial('sealant', { color: '#4a4a4a', roughness: 0.4 })
    );
    sealant.position.set(0, height * 0.4 - jointWidth * 0.2, -depth/2);
    sealant.rotation.x = Math.PI / 2;
    sealant.name = 'sealant';
    group.add(sealant);
  }
  
  /**
   * Build wall assembly (air barrier, etc)
   */
  private buildWallAssembly(
    group: THREE.Group,
    detail: SemanticDetail,
    viewport: { width: number; height: number; depth: number }
  ): void {
    const params = detail.parameters;
    const studsSpacing = (params.studsSpacing as number) || 406;
    const sheathingThickness = (params.sheathing as number) || 12.7;
    
    const width = viewport.width;
    const height = viewport.height;
    
    let xOffset = -width/2;
    
    // Create wood studs
    const studWidth = 38;
    const studDepth = 140;
    for (let x = 0; x < width; x += studsSpacing) {
      const stud = this.createBox(
        studWidth, height, studDepth,
        this.getMaterial('wood', { color: '#c4a574', roughness: 0.7 })
      );
      stud.position.set(xOffset + x + studWidth/2, height/2, -studDepth/2);
      stud.name = `stud-${x}`;
      group.add(stud);
    }
    
    // Sheathing layer
    const sheathing = this.createBox(
      width, height, sheathingThickness,
      this.getMaterial('wood', { color: '#d4b896', roughness: 0.6 })
    );
    sheathing.position.set(0, height/2, sheathingThickness/2);
    sheathing.name = 'sheathing';
    group.add(sheathing);
    
    // Air barrier (fluid-applied, orange)
    const airBarrier = this.createBox(
      width, height, 1.5,
      this.getMaterial('air-barrier', { 
        color: '#ff6b00', 
        emissive: '#331100',
        roughness: 0.3 
      })
    );
    airBarrier.position.set(0, height/2, sheathingThickness + 1);
    airBarrier.name = 'air-barrier';
    group.add(airBarrier);
    
    // Window rough opening
    const openingWidth = (params.openingWidth as number) || 900;
    const openingHeight = height * 0.6;
    
    // Create window frame cutout effect
    const frameGeom = new THREE.BoxGeometry(openingWidth + 10, openingHeight + 10, 60);
    const frame = new THREE.Mesh(
      frameGeom,
      this.getMaterial('steel', { color: '#333333', metallic: 0.8 })
    );
    frame.position.set(0, height/2, sheathingThickness + 30);
    frame.name = 'window-frame';
    group.add(frame);
  }
  
  /**
   * Build roof assembly
   */
  private buildRoofAssembly(
    group: THREE.Group,
    detail: SemanticDetail,
    viewport: { width: number; height: number; depth: number }
  ): void {
    const params = detail.parameters;
    const parapetHeight = (params.parapetHeight as number) || 450;
    const insulationThickness = (params.insulationThickness as number) || 100;
    
    const width = viewport.width;
    const depth = viewport.depth;
    
    // Deck
    const deck = this.createBox(
      width, 150, depth,
      this.getMaterial('concrete', { color: '#808080', roughness: 0.9 })
    );
    deck.position.set(0, 75, 0);
    deck.name = 'deck';
    group.add(deck);
    
    // Parapet wall
    const parapet = this.createBox(
      200, parapetHeight, depth,
      this.getMaterial('cmu', { color: '#9a9a9a', roughness: 0.85 })
    );
    parapet.position.set(-width/2 + 100, 150 + parapetHeight/2, 0);
    parapet.name = 'parapet';
    group.add(parapet);
    
    // Insulation (yellow)
    const insulation = this.createBox(
      width - 220, insulationThickness, depth,
      this.getMaterial('insulation', { color: '#ffd700', roughness: 0.7 })
    );
    insulation.position.set(110, 150 + insulationThickness/2, 0);
    insulation.name = 'insulation';
    group.add(insulation);
    
    // Roof membrane (EPDM black)
    const membrane = this.createBox(
      width - 200, 4.5, depth,
      this.getMaterial('membrane', { color: '#1a1a1a', roughness: 0.4 })
    );
    membrane.position.set(100, 150 + insulationThickness + 3, 0);
    membrane.name = 'roof-membrane';
    group.add(membrane);
    
    // Cant strip
    const cantShape = new THREE.Shape();
    cantShape.moveTo(0, 0);
    cantShape.lineTo(100, 0);
    cantShape.lineTo(0, 100);
    cantShape.closePath();
    
    const cantGeom = new THREE.ExtrudeGeometry(cantShape, { depth, bevelEnabled: false });
    const cant = new THREE.Mesh(
      cantGeom,
      this.getMaterial('insulation', { color: '#ffcc00', roughness: 0.6 })
    );
    cant.position.set(-width/2 + 200, 150 + insulationThickness, -depth/2);
    cant.name = 'cant-strip';
    group.add(cant);
    
    // Metal coping
    const copingShape = new THREE.Shape();
    copingShape.moveTo(0, 0);
    copingShape.lineTo(300, 0);
    copingShape.lineTo(300, -30);
    copingShape.lineTo(280, -50);
    copingShape.lineTo(20, -50);
    copingShape.lineTo(0, -30);
    copingShape.closePath();
    
    const copingGeom = new THREE.ExtrudeGeometry(copingShape, { depth, bevelEnabled: false });
    const coping = new THREE.Mesh(
      copingGeom,
      this.getMaterial('metal', { color: '#a8a8a8', metallic: 0.9, roughness: 0.3 })
    );
    coping.position.set(-width/2, 150 + parapetHeight + 30, -depth/2);
    coping.name = 'metal-coping';
    group.add(coping);
  }
  
  /**
   * Build foundation assembly
   */
  private buildFoundationAssembly(
    group: THREE.Group,
    detail: SemanticDetail,
    viewport: { width: number; height: number; depth: number }
  ): void {
    const params = detail.parameters;
    const wallThickness = (params.wallThickness as number) || 250;
    const slabThickness = (params.slabThickness as number) || 150;
    
    const width = viewport.width;
    const height = viewport.height;
    const depth = viewport.depth;
    
    // Foundation wall
    const wall = this.createBox(
      wallThickness, height * 0.7, depth,
      this.getMaterial('concrete', { color: '#7a7a7a', roughness: 0.9 })
    );
    wall.position.set(-width/2 + wallThickness/2, height * 0.35, 0);
    wall.name = 'foundation-wall';
    group.add(wall);
    
    // Footing
    const footing = this.createBox(
      wallThickness * 1.5, 300, depth,
      this.getMaterial('concrete', { color: '#6a6a6a', roughness: 0.95 })
    );
    footing.position.set(-width/2 + wallThickness/2, -150, 0);
    footing.name = 'footing';
    group.add(footing);
    
    // Gravel base
    const gravel = this.createBox(
      width - wallThickness - 50, 150, depth,
      this.getMaterial('gravel', { color: '#a89078', roughness: 1 })
    );
    gravel.position.set(wallThickness/2 + 25, -75, 0);
    gravel.name = 'gravel-base';
    group.add(gravel);
    
    // Under-slab vapor barrier
    const vaporBarrier = this.createBox(
      width - wallThickness - 50, 0.25, depth,
      this.getMaterial('membrane', { color: '#1a1a1a', roughness: 0.3 })
    );
    vaporBarrier.position.set(wallThickness/2 + 25, 0.125, 0);
    vaporBarrier.name = 'vapor-barrier';
    group.add(vaporBarrier);
    
    // Concrete slab
    const slab = this.createBox(
      width - wallThickness - 50, slabThickness, depth,
      this.getMaterial('concrete', { color: '#888888', roughness: 0.85 })
    );
    slab.position.set(wallThickness/2 + 25, slabThickness/2, 0);
    slab.name = 'slab';
    group.add(slab);
    
    // Wall waterproofing membrane
    const wallMembrane = this.createBox(
      1.5, height * 0.7 + 100, depth,
      this.getMaterial('membrane', { 
        color: '#0a0a0a', 
        emissive: '#001111'
      })
    );
    wallMembrane.position.set(-width/2 + wallThickness + 1, height * 0.35 - 50, 0);
    wallMembrane.name = 'wall-membrane';
    group.add(wallMembrane);
    
    // Protection board
    const protection = this.createBox(
      6, height * 0.7 + 50, depth,
      this.getMaterial('protection', { color: '#d4d4d4', roughness: 0.7 })
    );
    protection.position.set(-width/2 + wallThickness + 6, height * 0.35 - 25, 0);
    protection.name = 'protection-board';
    group.add(protection);
    
    // Drainage mat (dimpled texture)
    const drainage = this.createBox(
      8, height * 0.6, depth,
      this.getMaterial('drainage', { color: '#2a5a2a', roughness: 0.8 })
    );
    drainage.position.set(-width/2 + wallThickness + 15, height * 0.3, 0);
    drainage.name = 'drainage-mat';
    group.add(drainage);
  }
  
  /**
   * Build pipe penetration detail
   */
  private buildPenetration(
    group: THREE.Group,
    detail: SemanticDetail,
    viewport: { width: number; height: number; depth: number }
  ): void {
    const params = detail.parameters;
    const pipeDiameter = (params.pipeDiameter as number) || 100;
    const collarHeight = (params.collarHeight as number) || 150;
    
    const size = Math.min(viewport.width, viewport.depth);
    
    // Concrete substrate with hole
    const substrateShape = new THREE.Shape();
    substrateShape.moveTo(-size/2, -size/2);
    substrateShape.lineTo(size/2, -size/2);
    substrateShape.lineTo(size/2, size/2);
    substrateShape.lineTo(-size/2, size/2);
    substrateShape.closePath();
    
    // Cut hole for pipe
    const holePath = new THREE.Path();
    holePath.absarc(0, 0, pipeDiameter/2 + 10, 0, Math.PI * 2, true);
    substrateShape.holes.push(holePath);
    
    const substrateGeom = new THREE.ExtrudeGeometry(substrateShape, { 
      depth: 200, 
      bevelEnabled: false 
    });
    const substrate = new THREE.Mesh(
      substrateGeom,
      this.getMaterial('concrete', { color: '#7a7a7a', roughness: 0.9 })
    );
    substrate.rotation.x = -Math.PI / 2;
    substrate.position.y = -100;
    substrate.name = 'substrate';
    group.add(substrate);
    
    // Pipe (steel cylinder)
    const pipeGeom = new THREE.CylinderGeometry(
      pipeDiameter/2, pipeDiameter/2, viewport.height, 32
    );
    const pipe = new THREE.Mesh(
      pipeGeom,
      this.getMaterial('steel', { color: '#505050', metallic: 0.6, roughness: 0.4 })
    );
    pipe.position.y = viewport.height/2 - 100;
    pipe.name = 'pipe';
    group.add(pipe);
    
    // Membrane (flat with hole)
    const membraneShape = new THREE.Shape();
    membraneShape.moveTo(-size/2, -size/2);
    membraneShape.lineTo(size/2, -size/2);
    membraneShape.lineTo(size/2, size/2);
    membraneShape.lineTo(-size/2, size/2);
    membraneShape.closePath();
    
    const membraneHole = new THREE.Path();
    membraneHole.absarc(0, 0, pipeDiameter/2 - 5, 0, Math.PI * 2, true);
    membraneShape.holes.push(membraneHole);
    
    const membraneGeom = new THREE.ExtrudeGeometry(membraneShape, { 
      depth: 1.5, 
      bevelEnabled: false 
    });
    const membrane = new THREE.Mesh(
      membraneGeom,
      this.getMaterial('membrane', { color: '#0a0a0a', emissive: '#001111' })
    );
    membrane.rotation.x = -Math.PI / 2;
    membrane.position.y = 100;
    membrane.name = 'membrane';
    group.add(membrane);
    
    // Collar (tube around pipe)
    const collarGeom = new THREE.CylinderGeometry(
      pipeDiameter/2 + 20, pipeDiameter/2 + 60, collarHeight, 32, 1, true
    );
    const collar = new THREE.Mesh(
      collarGeom,
      this.getMaterial('membrane', { color: '#1a1a1a', roughness: 0.3 })
    );
    collar.position.y = 100 + collarHeight/2;
    collar.name = 'collar';
    group.add(collar);
    
    // Stainless clamp
    const clampGeom = new THREE.TorusGeometry(pipeDiameter/2 + 5, 8, 8, 32);
    const clamp = new THREE.Mesh(
      clampGeom,
      this.getMaterial('steel', { color: '#a0a0a0', metallic: 0.8, roughness: 0.2 })
    );
    clamp.rotation.x = Math.PI / 2;
    clamp.position.y = 100 + collarHeight - 20;
    clamp.name = 'clamp';
    group.add(clamp);
    
    // Sealant bead
    const sealantGeom = new THREE.TorusGeometry(pipeDiameter/2 + 2, 5, 8, 32);
    const sealant = new THREE.Mesh(
      sealantGeom,
      this.getMaterial('sealant', { color: '#4a4a4a', roughness: 0.4 })
    );
    sealant.rotation.x = Math.PI / 2;
    sealant.position.y = 100 + collarHeight + 5;
    sealant.name = 'sealant';
    group.add(sealant);
  }
  
  /**
   * Generic layer stacking for unrecognized categories
   */
  private buildGenericLayers(
    group: THREE.Group,
    detail: SemanticDetail,
    viewport: { width: number; height: number; depth: number }
  ): void {
    let yOffset = 0;
    const width = viewport.width;
    const depth = viewport.depth;
    
    for (const layer of detail.layers) {
      const mesh = this.createBox(
        width, layer.thickness, depth,
        this.getMaterial(layer.material, layer.properties)
      );
      mesh.position.y = yOffset + layer.thickness / 2;
      mesh.name = layer.id;
      group.add(mesh);
      
      yOffset += layer.thickness;
    }
  }
  
  /**
   * Create a simple box geometry
   */
  private createBox(
    width: number, 
    height: number, 
    depth: number, 
    material: THREE.Material
  ): THREE.Mesh {
    const geometry = new THREE.BoxGeometry(width, height, depth);
    return new THREE.Mesh(geometry, material);
  }
  
  /**
   * Get or create material with caching
   * Uses the universal material library for realistic PBR textures
   */
  private getMaterial(
    type: string,
    props: {
      color?: string;
      roughness?: number;
      metallic?: number;
      emissive?: string;
    }
  ): THREE.Material {
    const key = `${type}-${props.color}-${props.roughness}-${props.metallic}`;

    if (this.materialCache.has(key)) {
      return this.materialCache.get(key)!;
    }

    // Try to find a matching base material from the library
    const baseMaterialId = this.mapTypeToBaseMaterial(type);
    if (baseMaterialId && BASE_MATERIALS[baseMaterialId]) {
      try {
        const baseMaterial = BASE_MATERIALS[baseMaterialId];
        const material = materialFactory.createMaterial(baseMaterial);

        // Apply color override if provided and different from base
        if (props.color && props.color !== baseMaterial.color) {
          material.color = new THREE.Color(props.color);
        }

        // Apply emissive if provided
        if (props.emissive) {
          material.emissive = new THREE.Color(props.emissive);
          material.emissiveIntensity = 0.15;
        }

        this.materialCache.set(key, material);
        return material;
      } catch (e) {
        console.warn(`[SemanticToMesh] Material factory error for ${type}, using fallback:`, e);
      }
    }

    // Fallback to simple material creation
    const color = new THREE.Color(props.color || '#808080');

    const material = new THREE.MeshPhysicalMaterial({
      color,
      roughness: props.roughness ?? 0.5,
      metalness: props.metallic ?? 0,
      transparent: true,
      opacity: 0.92,
      side: THREE.DoubleSide,
      emissive: props.emissive ? new THREE.Color(props.emissive) : undefined,
      emissiveIntensity: props.emissive ? 0.15 : 0
    });

    this.materialCache.set(key, material);
    return material;
  }

  /**
   * Map legacy material type names to base material IDs
   */
  private mapTypeToBaseMaterial(type: string): string | null {
    const typeMap: Record<string, string> = {
      // Substrates
      'concrete': 'concrete-formed',
      'cmu': 'cmu-block',
      'steel': 'steel-structural',
      'wood': 'wood-framing',
      'plywood': 'plywood-sheathing',
      // Membranes
      'membrane': 'sbs-rubberized-asphalt',
      'membrane-sheet': 'sbs-rubberized-asphalt',
      'membrane-fluid': 'fluid-applied-rubber',
      // Air/vapor barriers
      'air-barrier': 'sbs-rubberized-asphalt-orange',
      'vapor-barrier': 'sbs-rubberized-asphalt',
      // Insulation
      'insulation': 'polyiso-insulation',
      'insulation-rigid': 'polyiso-insulation',
      'insulation-spray': 'fluid-applied-rubber',
      // Protection & drainage
      'protection': 'protection-board-hdpe',
      'protection-board': 'protection-board-hdpe',
      'drainage': 'drainage-composite',
      'drainage-mat': 'drainage-composite',
      // Sealants & accessories
      'sealant': 'sealant-polyurethane',
      'backer-rod': 'backer-rod',
      // Metals & flashing
      'metal': 'metal-flashing',
      'flashing': 'metal-flashing',
      'flashing-metal': 'metal-flashing',
      'termination-bar': 'termination-bar',
      // Primers
      'primer': 'primer-asphalt',
      // Misc
      'gravel': 'drainage-composite',
      'cant-strip': 'polyiso-insulation'
    };

    return typeMap[type.toLowerCase()] || null;
  }
  
  /**
   * Add floating product labels
   */
  private addProductLabels(_group: THREE.Group, _detail: SemanticDetail): void {
    // Labels will be handled by the React overlay for better readability
    // This is a placeholder for 3D text sprites if needed
  }
  
  /**
   * Dispose of all cached materials
   */
  dispose(): void {
    this.materialCache.forEach(material => material.dispose());
    this.materialCache.clear();
  }
}
