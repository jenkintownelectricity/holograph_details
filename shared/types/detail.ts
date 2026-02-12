import type { Layer } from './layer.js';

export type DetailCategory = 'roofing' | 'waterproofing' | 'air-barrier' | 'foundation' | 'expansion-joint' | 'penetration' | 'flashing';

export interface Detail {
  id: string;
  name: string;
  category: DetailCategory;
  description: string;
  metadata?: Record<string, unknown>;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  layers?: Layer[];
}

export interface CreateDetailRequest {
  name: string;
  category: DetailCategory;
  description: string;
  metadata?: Record<string, unknown>;
  layers?: Omit<Layer, 'id' | 'detailId' | 'createdAt'>[];
}

export interface UpdateDetailRequest {
  name?: string;
  category?: DetailCategory;
  description?: string;
  metadata?: Record<string, unknown>;
}
