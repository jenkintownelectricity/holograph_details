/**
 * POLR REST API Routes
 * POLR Strategic Development - Phase B3.2
 * 
 * Programmatic access to POLR details, manufacturer data, and rendering
 * 
 * @module api/routes
 * @version 1.0.0
 */

// =============================================================================
// API TYPE DEFINITIONS
// =============================================================================

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    timestamp: string;
    version: string;
    requestId: string;
  };
}

export interface PaginatedResponse<T> extends APIResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

export interface DetailSummary {
  id: string;
  name: string;
  description: string;
  category: string;
  defaultManufacturer: string;
  layerCount: number;
  thumbnailUrl: string;
  tags: string[];
}

export interface DetailFull extends DetailSummary {
  layers: LayerDefinition[];
  manufacturers: string[];
  createdAt: string;
  updatedAt: string;
}

export interface LayerDefinition {
  id: string;
  order: number;
  materialType: string;
  thickness: number;
  position: { x: number; y: number; z: number };
  material: {
    manufacturer?: string;
    product?: string;
    color?: string;
    properties?: Record<string, any>;
  };
}

export interface ManufacturerInfo {
  id: string;
  name: string;
  displayName: string;
  logoUrl: string;
  website: string;
  productCount: number;
  categories: string[];
}

export interface ProductInfo {
  id: string;
  name: string;
  manufacturer: string;
  category: string;
  description: string;
  thickness?: number;
  specifications: Record<string, any>;
  equivalents: Array<{
    manufacturer: string;
    product: string;
    confidenceScore: number;
  }>;
}

export interface RenderOptions {
  format: 'png' | 'jpg' | 'webp' | 'gltf' | 'glb' | 'usdz';
  width?: number;
  height?: number;
  quality?: number;
  view?: 'isometric' | 'plan' | 'north' | 'south' | 'east' | 'west';
  background?: string;
  transparent?: boolean;
}

export interface SpecificationOptions {
  format: 'masterspec' | 'speclink' | 'generic' | 'abbreviated';
  includeOrEquals?: boolean;
  maxOrEquals?: number;
}

// =============================================================================
// API ROUTE DEFINITIONS
// =============================================================================

/**
 * API Route Documentation
 * Base URL: https://api.buildingsystems.ai/v1
 */
export const API_ROUTES = {
  // -------------------------------------------------------------------------
  // DETAILS
  // -------------------------------------------------------------------------
  
  /**
   * GET /details
   * List all available construction details
   * 
   * Query params:
   * - category: Filter by category (e.g., "waterproofing", "roofing")
   * - manufacturer: Filter by manufacturer availability
   * - search: Full-text search
   * - page: Page number (default: 1)
   * - limit: Items per page (default: 20, max: 100)
   * 
   * Response: PaginatedResponse<DetailSummary>
   */
  LIST_DETAILS: {
    method: 'GET',
    path: '/details',
    description: 'List all available construction details'
  },

  /**
   * GET /details/:id
   * Get a specific detail with all layers and metadata
   * 
   * Path params:
   * - id: Detail ID (e.g., "WP-003")
   * 
   * Query params:
   * - manufacturer: Return with specific manufacturer products
   * 
   * Response: APIResponse<DetailFull>
   */
  GET_DETAIL: {
    method: 'GET',
    path: '/details/:id',
    description: 'Get specific detail with all layers'
  },

  /**
   * GET /details/:id/render
   * Render detail as image or 3D model
   * 
   * Path params:
   * - id: Detail ID
   * 
   * Query params:
   * - manufacturer: Manufacturer for product rendering
   * - format: Output format (png, jpg, gltf, glb, usdz)
   * - width: Image width in pixels
   * - height: Image height in pixels
   * - quality: JPEG quality (1-100)
   * - view: Camera view angle
   * - background: Background color (hex)
   * - transparent: Transparent background (PNG only)
   * 
   * Response: Binary image/model file
   */
  RENDER_DETAIL: {
    method: 'GET',
    path: '/details/:id/render',
    description: 'Render detail as image or 3D model'
  },

  /**
   * GET /details/:id/specification
   * Generate specification document
   * 
   * Path params:
   * - id: Detail ID
   * 
   * Query params:
   * - manufacturer: Manufacturer for products
   * - format: Specification format
   * - includeOrEquals: Include or-equal products
   * - maxOrEquals: Maximum alternatives to list
   * 
   * Response: APIResponse<{ text: string; format: string }>
   */
  GET_SPECIFICATION: {
    method: 'GET',
    path: '/details/:id/specification',
    description: 'Generate specification document'
  },

  /**
   * POST /details/:id/switch
   * Switch manufacturer and return updated detail
   * 
   * Path params:
   * - id: Detail ID
   * 
   * Body:
   * {
   *   "from": "GCP Applied Technologies",
   *   "to": "Carlisle CCW"
   * }
   * 
   * Response: APIResponse<{
   *   detail: DetailFull;
   *   changes: ProductChange[];
   *   warnings: string[];
   * }>
   */
  SWITCH_MANUFACTURER: {
    method: 'POST',
    path: '/details/:id/switch',
    description: 'Switch manufacturer and return updated detail'
  },

  // -------------------------------------------------------------------------
  // MANUFACTURERS
  // -------------------------------------------------------------------------

  /**
   * GET /manufacturers
   * List all manufacturers
   * 
   * Query params:
   * - category: Filter by product category
   * 
   * Response: APIResponse<ManufacturerInfo[]>
   */
  LIST_MANUFACTURERS: {
    method: 'GET',
    path: '/manufacturers',
    description: 'List all manufacturers'
  },

  /**
   * GET /manufacturers/:id
   * Get manufacturer details
   * 
   * Response: APIResponse<ManufacturerInfo>
   */
  GET_MANUFACTURER: {
    method: 'GET',
    path: '/manufacturers/:id',
    description: 'Get manufacturer details'
  },

  /**
   * GET /manufacturers/:id/products
   * List products for a manufacturer
   * 
   * Query params:
   * - category: Filter by category
   * - page, limit: Pagination
   * 
   * Response: PaginatedResponse<ProductInfo>
   */
  LIST_MANUFACTURER_PRODUCTS: {
    method: 'GET',
    path: '/manufacturers/:id/products',
    description: 'List products for a manufacturer'
  },

  // -------------------------------------------------------------------------
  // PRODUCTS & EQUIVALENTS
  // -------------------------------------------------------------------------

  /**
   * GET /products/:id
   * Get product details
   * 
   * Response: APIResponse<ProductInfo>
   */
  GET_PRODUCT: {
    method: 'GET',
    path: '/products/:id',
    description: 'Get product details'
  },

  /**
   * GET /equivalents
   * Find equivalent products
   * 
   * Query params:
   * - manufacturer: Manufacturer name
   * - product: Product name
   * OR
   * - materialType: Material type to find all equivalents
   * 
   * Response: APIResponse<ProductInfo[]>
   */
  FIND_EQUIVALENTS: {
    method: 'GET',
    path: '/equivalents',
    description: 'Find equivalent products'
  },

  // -------------------------------------------------------------------------
  // MATERIALS & TEXTURES
  // -------------------------------------------------------------------------

  /**
   * GET /materials
   * List all material types
   * 
   * Response: APIResponse<{
   *   id: string;
   *   name: string;
   *   category: string;
   *   properties: Record<string, any>;
   * }[]>
   */
  LIST_MATERIALS: {
    method: 'GET',
    path: '/materials',
    description: 'List all material types'
  },

  /**
   * GET /materials/:id/texture
   * Get PBR texture set for a material
   * 
   * Query params:
   * - resolution: 512, 1024, 2048, 4096
   * - format: jpg, png, webp
   * 
   * Response: APIResponse<{
   *   albedo: string;
   *   normal: string;
   *   roughness: string;
   *   metalness: string;
   *   ao: string;
   * }>
   */
  GET_MATERIAL_TEXTURE: {
    method: 'GET',
    path: '/materials/:id/texture',
    description: 'Get PBR texture set for a material'
  },

  // -------------------------------------------------------------------------
  // CATEGORIES
  // -------------------------------------------------------------------------

  /**
   * GET /categories
   * List all detail categories
   * 
   * Response: APIResponse<{
   *   id: string;
   *   name: string;
   *   csiSection: string;
   *   detailCount: number;
   * }[]>
   */
  LIST_CATEGORIES: {
    method: 'GET',
    path: '/categories',
    description: 'List all detail categories'
  }
};

// =============================================================================
// EXPRESS ROUTE HANDLERS (Example Implementation)
// =============================================================================

/**
 * Example Express.js route handlers
 */
export const routeHandlers = `
import express from 'express';
import { detailService } from '../services/detailService';
import { manufacturerService } from '../services/manufacturerService';
import { renderService } from '../services/renderService';
import { specService } from '../services/specificationService';

const router = express.Router();

// Middleware for API key authentication
const authenticate = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || !isValidApiKey(apiKey)) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Invalid or missing API key' }
    });
  }
  next();
};

// Rate limiting middleware
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: { success: false, error: { code: 'RATE_LIMITED', message: 'Too many requests' } }
});

router.use(authenticate);
router.use(limiter);

// GET /details
router.get('/details', async (req, res) => {
  try {
    const { category, manufacturer, search, page = 1, limit = 20 } = req.query;
    const result = await detailService.list({ category, manufacturer, search, page, limit });
    res.json({
      success: true,
      data: result.items,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        hasMore: result.hasMore
      },
      meta: { timestamp: new Date().toISOString(), version: '1.0.0' }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: error.message }
    });
  }
});

// GET /details/:id
router.get('/details/:id', async (req, res) => {
  try {
    const { manufacturer } = req.query;
    const detail = await detailService.getById(req.params.id, { manufacturer });
    if (!detail) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Detail not found' }
      });
    }
    res.json({ success: true, data: detail });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: error.message }
    });
  }
});

// GET /details/:id/render
router.get('/details/:id/render', async (req, res) => {
  try {
    const options = {
      format: req.query.format || 'png',
      width: parseInt(req.query.width) || 1920,
      height: parseInt(req.query.height) || 1080,
      manufacturer: req.query.manufacturer,
      view: req.query.view || 'isometric',
      background: req.query.background,
      transparent: req.query.transparent === 'true'
    };
    
    const buffer = await renderService.render(req.params.id, options);
    
    const contentTypes = {
      png: 'image/png',
      jpg: 'image/jpeg',
      webp: 'image/webp',
      gltf: 'model/gltf+json',
      glb: 'model/gltf-binary',
      usdz: 'model/vnd.usdz+zip'
    };
    
    res.setHeader('Content-Type', contentTypes[options.format]);
    res.setHeader('Content-Disposition', \`inline; filename="\${req.params.id}.\${options.format}"\`);
    res.send(buffer);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'RENDER_ERROR', message: error.message }
    });
  }
});

// GET /details/:id/specification
router.get('/details/:id/specification', async (req, res) => {
  try {
    const options = {
      format: req.query.format || 'generic',
      manufacturer: req.query.manufacturer,
      includeOrEquals: req.query.includeOrEquals !== 'false',
      maxOrEquals: parseInt(req.query.maxOrEquals) || 3
    };
    
    const spec = await specService.generate(req.params.id, options);
    res.json({ success: true, data: { text: spec, format: options.format } });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'SPEC_ERROR', message: error.message }
    });
  }
});

// POST /details/:id/switch
router.post('/details/:id/switch', async (req, res) => {
  try {
    const { from, to } = req.body;
    if (!from || !to) {
      return res.status(400).json({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'Both "from" and "to" manufacturers required' }
      });
    }
    
    const result = await detailService.switchManufacturer(req.params.id, from, to);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'SWITCH_ERROR', message: error.message }
    });
  }
});

// GET /manufacturers
router.get('/manufacturers', async (req, res) => {
  try {
    const manufacturers = await manufacturerService.list(req.query.category);
    res.json({ success: true, data: manufacturers });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: error.message }
    });
  }
});

// GET /equivalents
router.get('/equivalents', async (req, res) => {
  try {
    const { manufacturer, product, materialType } = req.query;
    
    let equivalents;
    if (materialType) {
      equivalents = await manufacturerService.getEquivalentsByType(materialType);
    } else if (manufacturer && product) {
      equivalents = await manufacturerService.findEquivalents(manufacturer, product);
    } else {
      return res.status(400).json({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'Provide materialType OR manufacturer+product' }
      });
    }
    
    res.json({ success: true, data: equivalents });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: error.message }
    });
  }
});

export default router;
`;

// =============================================================================
// OPENAPI SPECIFICATION
// =============================================================================

export const OPENAPI_SPEC = {
  openapi: '3.0.3',
  info: {
    title: 'POLR Construction Detail API',
    description: 'API for accessing construction details, manufacturer products, and rendering services',
    version: '1.0.0',
    contact: {
      name: 'BuildingSystems.ai',
      url: 'https://buildingsystems.ai',
      email: 'api@buildingsystems.ai'
    }
  },
  servers: [
    { url: 'https://api.buildingsystems.ai/v1', description: 'Production' },
    { url: 'https://api-staging.buildingsystems.ai/v1', description: 'Staging' }
  ],
  security: [{ apiKey: [] }],
  components: {
    securitySchemes: {
      apiKey: {
        type: 'apiKey',
        in: 'header',
        name: 'X-API-Key'
      }
    }
  }
};

// =============================================================================
// API CLIENT SDK (TypeScript)
// =============================================================================

export const API_CLIENT = `
/**
 * POLR API Client
 * @example
 * const client = new POLRClient({ apiKey: 'your-api-key' });
 * const details = await client.details.list({ category: 'waterproofing' });
 */
export class POLRClient {
  private baseUrl: string;
  private apiKey: string;
  
  constructor(config: { apiKey: string; baseUrl?: string }) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || 'https://api.buildingsystems.ai/v1';
  }
  
  private async request<T>(
    method: string,
    path: string,
    options?: { query?: Record<string, any>; body?: any }
  ): Promise<T> {
    const url = new URL(path, this.baseUrl);
    if (options?.query) {
      Object.entries(options.query).forEach(([key, value]) => {
        if (value !== undefined) url.searchParams.set(key, String(value));
      });
    }
    
    const response = await fetch(url.toString(), {
      method,
      headers: {
        'X-API-Key': this.apiKey,
        'Content-Type': 'application/json'
      },
      body: options?.body ? JSON.stringify(options.body) : undefined
    });
    
    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error?.message || 'API request failed');
    }
    return data.data;
  }
  
  details = {
    list: (params?: { category?: string; manufacturer?: string; search?: string; page?: number; limit?: number }) =>
      this.request<DetailSummary[]>('GET', '/details', { query: params }),
      
    get: (id: string, manufacturer?: string) =>
      this.request<DetailFull>('GET', \`/details/\${id}\`, { query: { manufacturer } }),
      
    render: (id: string, options: RenderOptions) =>
      this.request<Blob>('GET', \`/details/\${id}/render\`, { query: options }),
      
    specification: (id: string, options?: SpecificationOptions) =>
      this.request<{ text: string; format: string }>('GET', \`/details/\${id}/specification\`, { query: options }),
      
    switchManufacturer: (id: string, from: string, to: string) =>
      this.request<{ detail: DetailFull; changes: any[]; warnings: string[] }>(
        'POST', \`/details/\${id}/switch\`, { body: { from, to } }
      )
  };
  
  manufacturers = {
    list: (category?: string) =>
      this.request<ManufacturerInfo[]>('GET', '/manufacturers', { query: { category } }),
      
    get: (id: string) =>
      this.request<ManufacturerInfo>('GET', \`/manufacturers/\${id}\`),
      
    products: (id: string, params?: { category?: string; page?: number; limit?: number }) =>
      this.request<ProductInfo[]>('GET', \`/manufacturers/\${id}/products\`, { query: params })
  };
  
  equivalents = {
    find: (manufacturer: string, product: string) =>
      this.request<ProductInfo[]>('GET', '/equivalents', { query: { manufacturer, product } }),
      
    byType: (materialType: string) =>
      this.request<ProductInfo[]>('GET', '/equivalents', { query: { materialType } })
  };
}
`;

// =============================================================================
// EXPORTS
// =============================================================================

export const APIRoutes = {
  ROUTES: API_ROUTES,
  OPENAPI: OPENAPI_SPEC,
  CLIENT_SDK: API_CLIENT,
  EXPRESS_HANDLERS: routeHandlers
};
