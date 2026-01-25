/**
 * Three.js Mock for Vitest
 * L0-CMD-2026-0125-003 Phase B2
 *
 * Complete mock for Three.js classes used in tests
 */

import { vi } from 'vitest';

// =============================================================================
// MATH CLASSES
// =============================================================================

export class Vector2 {
  x: number;
  y: number;

  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  set(x: number, y: number) {
    this.x = x;
    this.y = y;
    return this;
  }

  clone() {
    return new Vector2(this.x, this.y);
  }

  copy(v: Vector2) {
    this.x = v.x;
    this.y = v.y;
    return this;
  }

  add(v: Vector2) {
    this.x += v.x;
    this.y += v.y;
    return this;
  }

  sub(v: Vector2) {
    this.x -= v.x;
    this.y -= v.y;
    return this;
  }

  multiplyScalar(s: number) {
    this.x *= s;
    this.y *= s;
    return this;
  }

  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  normalize() {
    const len = this.length() || 1;
    this.x /= len;
    this.y /= len;
    return this;
  }
}

export class Vector3 {
  x: number;
  y: number;
  z: number;

  constructor(x = 0, y = 0, z = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  set(x: number, y: number, z: number) {
    this.x = x;
    this.y = y;
    this.z = z;
    return this;
  }

  clone() {
    return new Vector3(this.x, this.y, this.z);
  }

  copy(v: Vector3) {
    this.x = v.x;
    this.y = v.y;
    this.z = v.z;
    return this;
  }

  add(v: Vector3) {
    this.x += v.x;
    this.y += v.y;
    this.z += v.z;
    return this;
  }

  sub(v: Vector3) {
    this.x -= v.x;
    this.y -= v.y;
    this.z -= v.z;
    return this;
  }

  multiplyScalar(s: number) {
    this.x *= s;
    this.y *= s;
    this.z *= s;
    return this;
  }

  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  }

  normalize() {
    const len = this.length() || 1;
    this.x /= len;
    this.y /= len;
    this.z /= len;
    return this;
  }

  cross(v: Vector3) {
    const ax = this.x, ay = this.y, az = this.z;
    this.x = ay * v.z - az * v.y;
    this.y = az * v.x - ax * v.z;
    this.z = ax * v.y - ay * v.x;
    return this;
  }

  dot(v: Vector3) {
    return this.x * v.x + this.y * v.y + this.z * v.z;
  }

  applyMatrix4(m: Matrix4) {
    return this;
  }

  applyQuaternion(q: Quaternion) {
    return this;
  }
}

export class Vector4 {
  x: number;
  y: number;
  z: number;
  w: number;

  constructor(x = 0, y = 0, z = 0, w = 1) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
  }
}

export class Quaternion {
  x: number;
  y: number;
  z: number;
  w: number;

  constructor(x = 0, y = 0, z = 0, w = 1) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
  }

  setFromEuler(euler: Euler) {
    return this;
  }

  setFromAxisAngle(axis: Vector3, angle: number) {
    return this;
  }

  clone() {
    return new Quaternion(this.x, this.y, this.z, this.w);
  }
}

export class Euler {
  x: number;
  y: number;
  z: number;
  order: string;

  constructor(x = 0, y = 0, z = 0, order = 'XYZ') {
    this.x = x;
    this.y = y;
    this.z = z;
    this.order = order;
  }

  set(x: number, y: number, z: number, order?: string) {
    this.x = x;
    this.y = y;
    this.z = z;
    if (order) this.order = order;
    return this;
  }

  clone() {
    return new Euler(this.x, this.y, this.z, this.order);
  }
}

export class Matrix4 {
  elements: number[];

  constructor() {
    this.elements = [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    ];
  }

  identity() {
    return this;
  }

  clone() {
    return new Matrix4();
  }

  copy(m: Matrix4) {
    return this;
  }

  multiply(m: Matrix4) {
    return this;
  }

  invert() {
    return this;
  }
}

export class Color {
  r: number;
  g: number;
  b: number;
  isColor = true;

  constructor(color?: string | number | Color) {
    this.r = 1;
    this.g = 1;
    this.b = 1;
    if (typeof color === 'number') {
      this.setHex(color);
    } else if (typeof color === 'string') {
      this.setStyle(color);
    }
  }

  set(color: string | number | Color) {
    if (typeof color === 'number') {
      this.setHex(color);
    }
    return this;
  }

  setHex(hex: number) {
    this.r = ((hex >> 16) & 255) / 255;
    this.g = ((hex >> 8) & 255) / 255;
    this.b = (hex & 255) / 255;
    return this;
  }

  setStyle(style: string) {
    return this;
  }

  getHex() {
    return (this.r * 255) << 16 ^ (this.g * 255) << 8 ^ (this.b * 255);
  }

  clone() {
    return new Color().setHex(this.getHex());
  }
}

export class Plane {
  normal: Vector3;
  constant: number;

  constructor(normal?: Vector3, constant?: number) {
    this.normal = normal || new Vector3(1, 0, 0);
    this.constant = constant || 0;
  }
}

// =============================================================================
// GEOMETRY CLASSES
// =============================================================================

class MockBufferGeometry {
  attributes: { [key: string]: any } = {
    position: {
      count: 100,
      getX: vi.fn((i: number) => i * 0.1),
      getY: vi.fn((i: number) => i * 0.1),
      getZ: vi.fn((i: number) => i * 0.1),
      setXYZ: vi.fn(),
      needsUpdate: false
    },
    normal: {
      count: 100,
      getX: vi.fn(() => 0),
      getY: vi.fn(() => 1),
      getZ: vi.fn(() => 0),
      setXYZ: vi.fn(),
      needsUpdate: false
    }
  };
  index: any = null;
  uuid = Math.random().toString(36);
  type = 'BufferGeometry';

  rotateX(angle: number) {
    return this;
  }

  rotateY(angle: number) {
    return this;
  }

  rotateZ(angle: number) {
    return this;
  }

  translate(x: number, y: number, z: number) {
    return this;
  }

  scale(x: number, y: number, z: number) {
    return this;
  }

  center() {
    return this;
  }

  computeVertexNormals() {
    return this;
  }

  computeBoundingBox() {
    return this;
  }

  computeBoundingSphere() {
    return this;
  }

  dispose() {}

  clone() {
    return new MockBufferGeometry();
  }
}

export class BufferGeometry extends MockBufferGeometry {
  constructor() {
    super();
    this.type = 'BufferGeometry';
  }
}

export class BoxGeometry extends MockBufferGeometry {
  parameters: { width: number; height: number; depth: number };

  constructor(width = 1, height = 1, depth = 1) {
    super();
    this.type = 'BoxGeometry';
    this.parameters = { width, height, depth };
  }
}

export class CylinderGeometry extends MockBufferGeometry {
  parameters: { radiusTop: number; radiusBottom: number; height: number; radialSegments: number };

  constructor(radiusTop = 1, radiusBottom = 1, height = 1, radialSegments = 8) {
    super();
    this.type = 'CylinderGeometry';
    this.parameters = { radiusTop, radiusBottom, height, radialSegments };
  }
}

export class SphereGeometry extends MockBufferGeometry {
  parameters: { radius: number; widthSegments: number; heightSegments: number };

  constructor(
    radius = 1,
    widthSegments = 16,
    heightSegments = 8,
    phiStart = 0,
    phiLength = Math.PI * 2,
    thetaStart = 0,
    thetaLength = Math.PI
  ) {
    super();
    this.type = 'SphereGeometry';
    this.parameters = { radius, widthSegments, heightSegments };
  }
}

export class PlaneGeometry extends MockBufferGeometry {
  parameters: { width: number; height: number };

  constructor(width = 1, height = 1) {
    super();
    this.type = 'PlaneGeometry';
    this.parameters = { width, height };
  }
}

export class LatheGeometry extends MockBufferGeometry {
  parameters: { points: Vector2[]; segments: number };

  constructor(points: Vector2[] = [], segments = 12) {
    super();
    this.type = 'LatheGeometry';
    this.parameters = { points, segments };
  }
}

export class TubeGeometry extends MockBufferGeometry {
  parameters: { path: any; tubularSegments: number; radius: number };

  constructor(path?: any, tubularSegments = 64, radius = 1) {
    super();
    this.type = 'TubeGeometry';
    this.parameters = { path, tubularSegments, radius };
  }
}

export class ExtrudeGeometry extends MockBufferGeometry {
  parameters: { shapes: Shape[]; options: any };

  constructor(shapes?: Shape | Shape[], options?: any) {
    super();
    this.type = 'ExtrudeGeometry';
    this.parameters = {
      shapes: Array.isArray(shapes) ? shapes : shapes ? [shapes] : [],
      options: options || {}
    };
  }
}

// =============================================================================
// SHAPE CLASS
// =============================================================================

export class Shape {
  curves: any[] = [];
  currentPoint = new Vector2();

  moveTo(x: number, y: number) {
    this.currentPoint.set(x, y);
    return this;
  }

  lineTo(x: number, y: number) {
    this.currentPoint.set(x, y);
    return this;
  }

  quadraticCurveTo(cpX: number, cpY: number, x: number, y: number) {
    this.currentPoint.set(x, y);
    return this;
  }

  bezierCurveTo(cp1X: number, cp1Y: number, cp2X: number, cp2Y: number, x: number, y: number) {
    this.currentPoint.set(x, y);
    return this;
  }

  absarc(x: number, y: number, radius: number, startAngle: number, endAngle: number, clockwise?: boolean) {
    return this;
  }

  closePath() {
    return this;
  }

  getPoints(divisions?: number) {
    return [new Vector2(0, 0), new Vector2(1, 0), new Vector2(1, 1), new Vector2(0, 1)];
  }
}

// =============================================================================
// CURVE CLASSES
// =============================================================================

export class Curve {
  getPoints(divisions = 5) {
    return Array(divisions + 1).fill(null).map(() => new Vector3());
  }

  getPointAt(t: number) {
    return new Vector3();
  }
}

export class CatmullRomCurve3 extends Curve {
  points: Vector3[];
  closed: boolean;

  constructor(points: Vector3[] = [], closed = false) {
    super();
    this.points = points;
    this.closed = closed;
  }
}

export class LineCurve3 extends Curve {
  v1: Vector3;
  v2: Vector3;

  constructor(v1 = new Vector3(), v2 = new Vector3()) {
    super();
    this.v1 = v1;
    this.v2 = v2;
  }
}

// =============================================================================
// MATERIAL CLASSES
// =============================================================================

export class Material {
  uuid = Math.random().toString(36);
  name = '';
  side = 0;
  transparent = false;
  opacity = 1;
  visible = true;
  needsUpdate = false;

  dispose() {}

  clone() {
    return new Material();
  }
}

export class MeshBasicMaterial extends Material {
  color = new Color(0xffffff);
  map: any = null;
  wireframe = false;

  constructor(params?: any) {
    super();
    if (params) {
      if (params.color !== undefined) this.color = new Color(params.color);
      if (params.map !== undefined) this.map = params.map;
      if (params.wireframe !== undefined) this.wireframe = params.wireframe;
      if (params.transparent !== undefined) this.transparent = params.transparent;
      if (params.opacity !== undefined) this.opacity = params.opacity;
      if (params.side !== undefined) this.side = params.side;
    }
  }

  clone() {
    return new MeshBasicMaterial({ color: this.color.getHex() });
  }
}

export class MeshStandardMaterial extends Material {
  color = new Color(0xffffff);
  roughness = 1;
  metalness = 0;
  map: any = null;
  normalMap: any = null;
  normalScale = new Vector2(1, 1);
  roughnessMap: any = null;
  metalnessMap: any = null;
  aoMap: any = null;
  envMap: any = null;
  emissive = new Color(0x000000);
  emissiveIntensity = 1;

  constructor(params?: any) {
    super();
    if (params) {
      if (params.color !== undefined) this.color = new Color(params.color);
      if (params.roughness !== undefined) this.roughness = params.roughness;
      if (params.metalness !== undefined) this.metalness = params.metalness;
      if (params.map !== undefined) this.map = params.map;
      if (params.normalMap !== undefined) this.normalMap = params.normalMap;
      if (params.side !== undefined) this.side = params.side;
    }
  }

  clone() {
    return new MeshStandardMaterial({
      color: this.color.getHex(),
      roughness: this.roughness,
      metalness: this.metalness
    });
  }
}

export class MeshPhysicalMaterial extends MeshStandardMaterial {
  clearcoat = 0;
  clearcoatRoughness = 0;
  transmission = 0;
  thickness = 0;

  constructor(params?: any) {
    super(params);
    if (params) {
      if (params.clearcoat !== undefined) this.clearcoat = params.clearcoat;
      if (params.clearcoatRoughness !== undefined) this.clearcoatRoughness = params.clearcoatRoughness;
    }
  }
}

export class LineBasicMaterial extends Material {
  color = new Color(0xffffff);
  linewidth = 1;

  constructor(params?: any) {
    super();
    if (params) {
      if (params.color !== undefined) this.color = new Color(params.color);
      if (params.linewidth !== undefined) this.linewidth = params.linewidth;
    }
  }
}

// =============================================================================
// OBJECT3D AND SCENE CLASSES
// =============================================================================

export class Object3D {
  uuid = Math.random().toString(36);
  name = '';
  type = 'Object3D';
  parent: Object3D | null = null;
  children: Object3D[] = [];
  position = new Vector3();
  rotation = new Euler();
  quaternion = new Quaternion();
  scale = new Vector3(1, 1, 1);
  matrix = new Matrix4();
  matrixWorld = new Matrix4();
  visible = true;
  castShadow = false;
  receiveShadow = false;
  userData: { [key: string]: any } = {};

  add(...objects: Object3D[]) {
    for (const object of objects) {
      object.parent = this;
      this.children.push(object);
    }
    return this;
  }

  remove(...objects: Object3D[]) {
    for (const object of objects) {
      const idx = this.children.indexOf(object);
      if (idx !== -1) {
        this.children.splice(idx, 1);
        object.parent = null;
      }
    }
    return this;
  }

  clear() {
    for (const child of this.children) {
      child.parent = null;
    }
    this.children = [];
    return this;
  }

  traverse(callback: (object: Object3D) => void) {
    callback(this);
    for (const child of this.children) {
      child.traverse(callback);
    }
  }

  getObjectByName(name: string): Object3D | undefined {
    if (this.name === name) return this;
    for (const child of this.children) {
      const result = child.getObjectByName(name);
      if (result) return result;
    }
    return undefined;
  }

  lookAt(target: Vector3 | number, y?: number, z?: number) {}

  updateMatrix() {}

  updateMatrixWorld(force?: boolean) {}

  clone(recursive?: boolean): Object3D {
    return new Object3D();
  }
}

export class Group extends Object3D {
  type = 'Group';
  isGroup = true;

  clone(recursive?: boolean): Group {
    return new Group();
  }
}

export class Scene extends Object3D {
  type = 'Scene';
  isScene = true;
  background: Color | Texture | null = null;
  environment: Texture | null = null;
  fog: any = null;
}

export class Mesh extends Object3D {
  type = 'Mesh';
  isMesh = true;
  geometry: BufferGeometry;
  material: Material | Material[];

  constructor(geometry?: BufferGeometry, material?: Material | Material[]) {
    super();
    this.geometry = geometry || new BufferGeometry();
    this.material = material || new MeshBasicMaterial();
  }

  clone(recursive?: boolean): Mesh {
    return new Mesh(this.geometry.clone(),
      Array.isArray(this.material)
        ? this.material.map(m => m.clone())
        : this.material.clone()
    );
  }
}

export class Line extends Object3D {
  type = 'Line';
  isLine = true;
  geometry: BufferGeometry;
  material: Material;

  constructor(geometry?: BufferGeometry, material?: Material) {
    super();
    this.geometry = geometry || new BufferGeometry();
    this.material = material || new LineBasicMaterial();
  }
}

// =============================================================================
// CAMERA CLASSES
// =============================================================================

export class Camera extends Object3D {
  type = 'Camera';
  isCamera = true;
  matrixWorldInverse = new Matrix4();
  projectionMatrix = new Matrix4();
  projectionMatrixInverse = new Matrix4();
}

export class PerspectiveCamera extends Camera {
  type = 'PerspectiveCamera';
  isPerspectiveCamera = true;
  fov: number;
  aspect: number;
  near: number;
  far: number;
  zoom = 1;

  constructor(fov = 50, aspect = 1, near = 0.1, far = 2000) {
    super();
    this.fov = fov;
    this.aspect = aspect;
    this.near = near;
    this.far = far;
  }

  updateProjectionMatrix() {}

  clone(): PerspectiveCamera {
    return new PerspectiveCamera(this.fov, this.aspect, this.near, this.far);
  }
}

export class OrthographicCamera extends Camera {
  type = 'OrthographicCamera';
  isOrthographicCamera = true;
  left: number;
  right: number;
  top: number;
  bottom: number;
  near: number;
  far: number;
  zoom = 1;

  constructor(left = -1, right = 1, top = 1, bottom = -1, near = 0.1, far = 2000) {
    super();
    this.left = left;
    this.right = right;
    this.top = top;
    this.bottom = bottom;
    this.near = near;
    this.far = far;
  }

  updateProjectionMatrix() {}
}

// =============================================================================
// LIGHT CLASSES
// =============================================================================

export class Light extends Object3D {
  type = 'Light';
  isLight = true;
  color = new Color(0xffffff);
  intensity = 1;

  constructor(color?: Color | number, intensity?: number) {
    super();
    if (color !== undefined) this.color = new Color(color);
    if (intensity !== undefined) this.intensity = intensity;
  }
}

export class AmbientLight extends Light {
  type = 'AmbientLight';
  isAmbientLight = true;
}

export class DirectionalLight extends Light {
  type = 'DirectionalLight';
  isDirectionalLight = true;
  target = new Object3D();
  shadow = { camera: new OrthographicCamera(), mapSize: new Vector2(512, 512) };
}

export class PointLight extends Light {
  type = 'PointLight';
  isPointLight = true;
  distance = 0;
  decay = 2;
}

export class SpotLight extends Light {
  type = 'SpotLight';
  isSpotLight = true;
  target = new Object3D();
  angle = Math.PI / 3;
  penumbra = 0;
  distance = 0;
  decay = 2;
}

export class HemisphereLight extends Light {
  type = 'HemisphereLight';
  isHemisphereLight = true;
  groundColor = new Color(0x000000);

  constructor(skyColor?: Color | number, groundColor?: Color | number, intensity?: number) {
    super(skyColor, intensity);
    if (groundColor !== undefined) this.groundColor = new Color(groundColor);
  }
}

// =============================================================================
// TEXTURE CLASSES
// =============================================================================

export class Texture {
  uuid = Math.random().toString(36);
  name = '';
  image: any = null;
  mapping = 300;
  wrapS = 1000;
  wrapT = 1000;
  magFilter = 1006;
  minFilter = 1008;
  anisotropy = 1;
  format = 1023;
  type = 1009;
  offset = new Vector2(0, 0);
  repeat = new Vector2(1, 1);
  rotation = 0;
  center = new Vector2(0, 0);
  needsUpdate = false;
  colorSpace = '';

  dispose() {}

  clone() {
    return new Texture();
  }
}

export class CanvasTexture extends Texture {
  constructor(canvas?: HTMLCanvasElement) {
    super();
    this.image = canvas;
  }
}

export class DataTexture extends Texture {
  constructor(data?: any, width?: number, height?: number) {
    super();
  }
}

// =============================================================================
// LOADERS
// =============================================================================

export class TextureLoader {
  path = '';

  setPath(path: string) {
    this.path = path;
    return this;
  }

  load(
    url: string,
    onLoad?: (texture: Texture) => void,
    onProgress?: (event: ProgressEvent) => void,
    onError?: (error: Error) => void
  ): Texture {
    const texture = new Texture();
    texture.image = { src: url, width: 256, height: 256 };
    if (onLoad) setTimeout(() => onLoad(texture), 0);
    return texture;
  }

  loadAsync(url: string): Promise<Texture> {
    return Promise.resolve(this.load(url));
  }
}

// =============================================================================
// RENDERER
// =============================================================================

export class WebGLRenderer {
  domElement = typeof document !== 'undefined' ? document.createElement('canvas') : { width: 800, height: 600 };
  shadowMap = { enabled: false, type: 2 };
  outputColorSpace = '';
  toneMapping = 0;
  toneMappingExposure = 1;

  constructor(params?: any) {}

  setSize(width: number, height: number) {}

  setPixelRatio(ratio: number) {}

  setClearColor(color: Color | number, alpha?: number) {}

  render(scene: Scene, camera: Camera) {}

  dispose() {}

  getContext() {
    return {};
  }

  setAnimationLoop(callback: ((time: number) => void) | null) {}
}

// =============================================================================
// CONSTANTS
// =============================================================================

export const DoubleSide = 2;
export const FrontSide = 0;
export const BackSide = 1;

export const RepeatWrapping = 1000;
export const ClampToEdgeWrapping = 1001;
export const MirroredRepeatWrapping = 1002;

export const NearestFilter = 1003;
export const NearestMipmapNearestFilter = 1004;
export const NearestMipmapLinearFilter = 1005;
export const LinearFilter = 1006;
export const LinearMipmapNearestFilter = 1007;
export const LinearMipmapLinearFilter = 1008;

export const UnsignedByteType = 1009;
export const FloatType = 1015;
export const HalfFloatType = 1016;

export const RGBAFormat = 1023;
export const RGBFormat = 1022;

export const SRGBColorSpace = 'srgb';
export const LinearSRGBColorSpace = 'srgb-linear';

export const NoToneMapping = 0;
export const LinearToneMapping = 1;
export const ReinhardToneMapping = 2;
export const CineonToneMapping = 3;
export const ACESFilmicToneMapping = 4;

export const PCFSoftShadowMap = 2;
export const VSMShadowMap = 3;

// =============================================================================
// HELPER CLASSES
// =============================================================================

export class Box3 {
  min = new Vector3(-Infinity, -Infinity, -Infinity);
  max = new Vector3(Infinity, Infinity, Infinity);

  setFromObject(object: Object3D) {
    return this;
  }

  getCenter(target: Vector3) {
    return target.set(0, 0, 0);
  }

  getSize(target: Vector3) {
    return target.set(1, 1, 1);
  }
}

export class Sphere {
  center = new Vector3();
  radius = 1;

  constructor(center?: Vector3, radius?: number) {
    if (center) this.center.copy(center);
    if (radius !== undefined) this.radius = radius;
  }
}

export class Raycaster {
  ray = { origin: new Vector3(), direction: new Vector3() };
  near = 0;
  far = Infinity;

  setFromCamera(coords: Vector2, camera: Camera) {}

  intersectObject(object: Object3D, recursive?: boolean): any[] {
    return [];
  }

  intersectObjects(objects: Object3D[], recursive?: boolean): any[] {
    return [];
  }
}

export class Clock {
  running = false;
  elapsedTime = 0;

  start() {
    this.running = true;
  }

  stop() {
    this.running = false;
  }

  getElapsedTime() {
    return this.elapsedTime;
  }

  getDelta() {
    return 0.016;
  }
}

// =============================================================================
// BUFFER ATTRIBUTE
// =============================================================================

export class BufferAttribute {
  array: Float32Array;
  itemSize: number;
  count: number;
  normalized: boolean;
  needsUpdate = false;

  constructor(array: Float32Array, itemSize: number, normalized = false) {
    this.array = array;
    this.itemSize = itemSize;
    this.count = array.length / itemSize;
    this.normalized = normalized;
  }

  getX(index: number) {
    return this.array[index * this.itemSize];
  }

  getY(index: number) {
    return this.array[index * this.itemSize + 1];
  }

  getZ(index: number) {
    return this.array[index * this.itemSize + 2];
  }

  setXYZ(index: number, x: number, y: number, z: number) {
    this.array[index * this.itemSize] = x;
    this.array[index * this.itemSize + 1] = y;
    this.array[index * this.itemSize + 2] = z;
    return this;
  }
}

export class Float32BufferAttribute extends BufferAttribute {
  constructor(array: number[] | Float32Array, itemSize: number) {
    super(array instanceof Float32Array ? array : new Float32Array(array), itemSize);
  }
}

// Default export for compatibility
export default {
  Vector2,
  Vector3,
  Vector4,
  Quaternion,
  Euler,
  Matrix4,
  Color,
  Plane,
  BufferGeometry,
  BoxGeometry,
  CylinderGeometry,
  SphereGeometry,
  PlaneGeometry,
  LatheGeometry,
  TubeGeometry,
  ExtrudeGeometry,
  Shape,
  Curve,
  CatmullRomCurve3,
  LineCurve3,
  Material,
  MeshBasicMaterial,
  MeshStandardMaterial,
  MeshPhysicalMaterial,
  LineBasicMaterial,
  Object3D,
  Group,
  Scene,
  Mesh,
  Line,
  Camera,
  PerspectiveCamera,
  OrthographicCamera,
  Light,
  AmbientLight,
  DirectionalLight,
  PointLight,
  SpotLight,
  HemisphereLight,
  Texture,
  CanvasTexture,
  DataTexture,
  TextureLoader,
  WebGLRenderer,
  DoubleSide,
  FrontSide,
  BackSide,
  RepeatWrapping,
  ClampToEdgeWrapping,
  MirroredRepeatWrapping,
  NearestFilter,
  LinearFilter,
  LinearMipmapLinearFilter,
  SRGBColorSpace,
  LinearSRGBColorSpace,
  Box3,
  Sphere,
  Raycaster,
  Clock,
  BufferAttribute,
  Float32BufferAttribute
};
