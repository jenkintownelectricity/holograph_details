import React, { useRef, useEffect, useCallback, useState } from 'react';
import * as THREE from 'three';

export interface ViewerLayer {
  id: string;
  name: string;
  orderIndex: number;
  color: string;
  materialType: string;
  thicknessMm: number;
  productName?: string;
  manufacturer?: string;
  csiSection?: string;
  geometryParams?: any;
  visible: boolean;
}

interface ThreeViewerProps {
  layers: ViewerLayer[];
  exploded: boolean;
  sectionCut: boolean;
  onLayerHover?: (layerId: string | null) => void;
}

export function ThreeViewer({ layers, exploded, sectionCut, onLayerHover }: ThreeViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    groups: Map<string, THREE.Group>;
    clippingPlane: THREE.Plane;
    controls: { spherical: any; target: THREE.Vector3; updateCamera: () => void };
    animFrameId: number;
  } | null>(null);

  // Initialize Three.js
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const w = container.clientWidth;
    const h = container.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f4f8);

    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
    camera.position.set(3.5, 2.5, 3.5);
    camera.lookAt(0, 0.7, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.localClippingEnabled = true;
    container.appendChild(renderer.domElement);

    // Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 8, 5);
    dirLight.castShadow = true;
    scene.add(dirLight);
    const fillLight = new THREE.DirectionalLight(0x8ecae6, 0.3);
    fillLight.position.set(-3, 4, -2);
    scene.add(fillLight);

    // Grid
    const grid = new THREE.GridHelper(8, 16, 0xd0d0d0, 0xe8e8e8);
    grid.position.y = -0.01;
    scene.add(grid);

    const clippingPlane = new THREE.Plane(new THREE.Vector3(-1, 0, 0), 0.8);

    // Orbit controls
    const spherical = {
      theta: Math.PI / 4,
      phi: Math.PI / 3.5,
      radius: 5,
    };
    const target = new THREE.Vector3(0, 0.7, 0);

    function updateCamera() {
      const sp = Math.sin(spherical.phi);
      camera.position.set(
        target.x + spherical.radius * sp * Math.sin(spherical.theta),
        target.y + spherical.radius * Math.cos(spherical.phi),
        target.z + spherical.radius * sp * Math.cos(spherical.theta)
      );
      camera.lookAt(target);
    }
    updateCamera();

    let isDown = false, isRight = false, prevX = 0, prevY = 0;

    const onDown = (e: MouseEvent) => { isDown = true; isRight = e.button === 2; prevX = e.clientX; prevY = e.clientY; };
    const onUp = () => { isDown = false; };
    const onCtx = (e: Event) => e.preventDefault();
    const onMove = (e: MouseEvent) => {
      if (!isDown) return;
      const dx = e.clientX - prevX, dy = e.clientY - prevY;
      prevX = e.clientX; prevY = e.clientY;
      if (isRight) {
        const ps = 0.003 * spherical.radius;
        const right = new THREE.Vector3().setFromMatrixColumn(camera.matrix, 0);
        const up = new THREE.Vector3().setFromMatrixColumn(camera.matrix, 1);
        target.add(right.multiplyScalar(-dx * ps));
        target.add(up.multiplyScalar(dy * ps));
      } else {
        spherical.theta -= dx * 0.005;
        spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi + dy * 0.005));
      }
      updateCamera();
    };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      spherical.radius *= e.deltaY > 0 ? 1.08 : 0.92;
      spherical.radius = Math.max(1, Math.min(20, spherical.radius));
      updateCamera();
    };

    renderer.domElement.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup', onUp);
    renderer.domElement.addEventListener('contextmenu', onCtx);
    window.addEventListener('mousemove', onMove);
    renderer.domElement.addEventListener('wheel', onWheel, { passive: false });

    // Animate
    let animFrameId = 0;
    function animate() {
      animFrameId = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    }
    animate();

    // Resize
    const onResize = () => {
      const w2 = container.clientWidth, h2 = container.clientHeight;
      camera.aspect = w2 / h2;
      camera.updateProjectionMatrix();
      renderer.setSize(w2, h2);
    };
    window.addEventListener('resize', onResize);

    sceneRef.current = {
      scene, camera, renderer,
      groups: new Map(),
      clippingPlane,
      controls: { spherical, target, updateCamera },
      animFrameId,
    };

    return () => {
      cancelAnimationFrame(animFrameId);
      renderer.domElement.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
      renderer.domElement.removeEventListener('contextmenu', onCtx);
      window.removeEventListener('mousemove', onMove);
      renderer.domElement.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      container.removeChild(renderer.domElement);
      sceneRef.current = null;
    };
  }, []);

  // Build/update layers
  useEffect(() => {
    const ctx = sceneRef.current;
    if (!ctx) return;

    // Remove old groups
    ctx.groups.forEach(g => ctx.scene.remove(g));
    ctx.groups.clear();

    layers.forEach((layer, i) => {
      const group = new THREE.Group();
      group.userData = { layerId: layer.id };

      const gp = layer.geometryParams || {};
      const clipping = sectionCut ? [ctx.clippingPlane] : [];

      const mat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(layer.color),
        roughness: gp.isCoping || gp.isFlashing ? 0.3 : 0.7,
        metalness: gp.isCoping || gp.isFlashing ? 0.5 : 0,
        side: THREE.DoubleSide,
        clippingPlanes: clipping,
      });

      if (gp.isWall) {
        const geo = new THREE.BoxGeometry(gp.width || 0.2, gp.height || 1.8, gp.depth || 2.0);
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(gp.positionX || 1.3, gp.positionY || 0.9, gp.positionZ || 0);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        group.add(mesh);
      } else if (gp.isBarrier) {
        const geo = new THREE.BoxGeometry(gp.width || 0.015, gp.height || 1.8, gp.depth || 2.0);
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(gp.positionX || 1.2, gp.positionY || 0.9, gp.positionZ || 0);
        mesh.castShadow = true;
        group.add(mesh);
      } else if (gp.isCoping) {
        const shape = new THREE.Shape();
        shape.moveTo(-0.18, 0); shape.lineTo(0.38, 0); shape.lineTo(0.40, -0.06);
        shape.lineTo(0.38, -0.10); shape.lineTo(-0.16, -0.10); shape.lineTo(-0.20, -0.06);
        shape.closePath();
        const geo = new THREE.ExtrudeGeometry(shape, { depth: 2.0, bevelEnabled: false });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(1.1, gp.positionY || 1.8, -1.0);
        mesh.castShadow = true;
        group.add(mesh);
      } else if (gp.isFlashing) {
        const geo = new THREE.BoxGeometry(gp.width || 0.01, gp.height || 0.30, gp.depth || 2.0);
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(gp.positionX || 1.19, gp.positionY || 1.35, gp.positionZ || 0);
        mesh.castShadow = true;
        group.add(mesh);
        const lipGeo = new THREE.BoxGeometry(0.08, 0.008, gp.depth || 2.0);
        const lip = new THREE.Mesh(lipGeo, mat.clone());
        lip.position.set((gp.positionX || 1.19) - 0.04, (gp.positionY || 1.35) - 0.15, 0);
        group.add(lip);
      } else if (gp.isSealant) {
        const geo = new THREE.BoxGeometry(gp.width || 0.04, gp.height || 0.02, gp.depth || 2.0);
        const m1 = new THREE.Mesh(geo, mat);
        m1.position.set(gp.positionX || 1.3, gp.positionY || 1.8, 0);
        group.add(m1);
        const geo2 = new THREE.BoxGeometry(0.02, 0.04, gp.depth || 2.0);
        const m2 = new THREE.Mesh(geo2, mat.clone());
        m2.position.set(1.19, 1.22, 0);
        group.add(m2);
      } else {
        // Standard flat roof layer
        const geo = new THREE.BoxGeometry(gp.width || 2.4, gp.height || 0.04, gp.depth || 2.0);
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(gp.positionX || 0, gp.positionY || (i * 0.05), gp.positionZ || 0);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        group.add(mesh);
      }

      group.visible = layer.visible;

      // Exploded offset
      if (exploded) {
        if (gp.isWall || gp.isBarrier) {
          group.position.x = (i + 1) * 0.08;
        } else if (gp.isCoping || gp.isSealant) {
          group.position.y = (i + 1) * 0.15 + 0.5;
        } else if (gp.isFlashing) {
          group.position.y = (i + 1) * 0.15 + 0.3;
          group.position.x = 0.15;
        } else {
          group.position.y = (i + 1) * 0.15;
        }
      }

      ctx.scene.add(group);
      ctx.groups.set(layer.id, group);
    });
  }, [layers, exploded, sectionCut]);

  // Update visibility
  useEffect(() => {
    const ctx = sceneRef.current;
    if (!ctx) return;
    layers.forEach(l => {
      const g = ctx.groups.get(l.id);
      if (g) g.visible = l.visible;
    });
  }, [layers]);

  return (
    <div
      ref={containerRef}
      style={{
        flex: 1,
        position: 'relative',
        background: 'linear-gradient(180deg, #f0f4f8 0%, #e2e8f0 100%)',
      }}
    >
      <div style={{
        position: 'absolute',
        bottom: 12,
        left: '50%',
        transform: 'translateX(-50%)',
        fontSize: 11,
        color: '#64748b',
        background: 'rgba(255,255,255,0.85)',
        padding: '4px 14px',
        borderRadius: 12,
        pointerEvents: 'none',
      }}>
        Click + drag to orbit &bull; Scroll to zoom &bull; Right-click to pan
      </div>
    </div>
  );
}
