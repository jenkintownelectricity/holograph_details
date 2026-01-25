/**
 * Vitest Setup File
 * L0-CMD-2026-0125-003 Phase B1
 *
 * Configures test environment for Three.js testing in Node
 */

import { vi } from 'vitest';

// Mock canvas for Node environment
class MockCanvasRenderingContext2D {
  canvas = { width: 256, height: 256 };
  fillStyle = '';
  strokeStyle = '';
  lineWidth = 1;

  fillRect = vi.fn();
  clearRect = vi.fn();
  strokeRect = vi.fn();

  getImageData = vi.fn(() => ({
    data: new Uint8ClampedArray(256 * 256 * 4),
    width: 256,
    height: 256
  }));
  putImageData = vi.fn();
  createImageData = vi.fn((w: number, h: number) => ({
    data: new Uint8ClampedArray(w * h * 4),
    width: w,
    height: h
  }));

  setTransform = vi.fn();
  resetTransform = vi.fn();
  transform = vi.fn();
  translate = vi.fn();
  scale = vi.fn();
  rotate = vi.fn();

  drawImage = vi.fn();

  save = vi.fn();
  restore = vi.fn();

  beginPath = vi.fn();
  closePath = vi.fn();
  moveTo = vi.fn();
  lineTo = vi.fn();
  arc = vi.fn();
  arcTo = vi.fn();
  quadraticCurveTo = vi.fn();
  bezierCurveTo = vi.fn();
  rect = vi.fn();
  ellipse = vi.fn();

  stroke = vi.fn();
  fill = vi.fn();
  clip = vi.fn();

  measureText = vi.fn(() => ({
    width: 10,
    actualBoundingBoxAscent: 10,
    actualBoundingBoxDescent: 2
  }));
  fillText = vi.fn();
  strokeText = vi.fn();

  createLinearGradient = vi.fn(() => ({
    addColorStop: vi.fn()
  }));
  createRadialGradient = vi.fn(() => ({
    addColorStop: vi.fn()
  }));
  createPattern = vi.fn();

  getLineDash = vi.fn(() => []);
  setLineDash = vi.fn();
}

class MockWebGLRenderingContext {
  canvas = { width: 256, height: 256 };
  drawingBufferWidth = 256;
  drawingBufferHeight = 256;

  getParameter = vi.fn(() => null);
  getExtension = vi.fn(() => null);
  createShader = vi.fn(() => ({}));
  shaderSource = vi.fn();
  compileShader = vi.fn();
  getShaderParameter = vi.fn(() => true);
  createProgram = vi.fn(() => ({}));
  attachShader = vi.fn();
  linkProgram = vi.fn();
  getProgramParameter = vi.fn(() => true);
  useProgram = vi.fn();
  createBuffer = vi.fn(() => ({}));
  bindBuffer = vi.fn();
  bufferData = vi.fn();
  createTexture = vi.fn(() => ({}));
  bindTexture = vi.fn();
  texImage2D = vi.fn();
  texParameteri = vi.fn();
  enable = vi.fn();
  disable = vi.fn();
  viewport = vi.fn();
  clear = vi.fn();
  clearColor = vi.fn();
  drawArrays = vi.fn();
  drawElements = vi.fn();
  getAttribLocation = vi.fn(() => 0);
  getUniformLocation = vi.fn(() => ({}));
  enableVertexAttribArray = vi.fn();
  vertexAttribPointer = vi.fn();
  uniform1f = vi.fn();
  uniform1i = vi.fn();
  uniform2f = vi.fn();
  uniform3f = vi.fn();
  uniform4f = vi.fn();
  uniformMatrix4fv = vi.fn();
  deleteShader = vi.fn();
  deleteProgram = vi.fn();
  deleteBuffer = vi.fn();
  deleteTexture = vi.fn();
}

// Override HTMLCanvasElement.prototype.getContext
if (typeof HTMLCanvasElement !== 'undefined') {
  HTMLCanvasElement.prototype.getContext = vi.fn(function(
    this: HTMLCanvasElement,
    type: string
  ) {
    if (type === '2d') {
      return new MockCanvasRenderingContext2D() as unknown as CanvasRenderingContext2D;
    }
    if (type === 'webgl' || type === 'webgl2' || type === 'experimental-webgl') {
      return new MockWebGLRenderingContext() as unknown as WebGLRenderingContext;
    }
    return null;
  }) as typeof HTMLCanvasElement.prototype.getContext;
}

// Mock window.requestAnimationFrame if needed
if (typeof global !== 'undefined' && typeof (global as any).requestAnimationFrame === 'undefined') {
  (global as any).requestAnimationFrame = vi.fn((callback: FrameRequestCallback) => {
    return setTimeout(() => callback(Date.now()), 16);
  });
  (global as any).cancelAnimationFrame = vi.fn((id: number) => {
    clearTimeout(id);
  });
}

// Export for reference
export { MockCanvasRenderingContext2D, MockWebGLRenderingContext };
