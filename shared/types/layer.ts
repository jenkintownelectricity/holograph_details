export interface Layer {
  id: string;
  detailId: string;
  name: string;
  orderIndex: number;
  color: string;
  materialType: string;
  thicknessMm: number;
  productName?: string;
  manufacturer?: string;
  csiSection?: string;
  geometryParams?: GeometryParams;
  visibleDefault: boolean;
  createdAt: string;
}

export interface GeometryParams {
  type: 'box' | 'extrude' | 'custom';
  width?: number;
  height?: number;
  depth?: number;
  positionX?: number;
  positionY?: number;
  positionZ?: number;
  isWall?: boolean;
  isBarrier?: boolean;
  isCoping?: boolean;
  isFlashing?: boolean;
  isSealant?: boolean;
  [key: string]: unknown;
}

export interface UpdateLayersRequest {
  layers: {
    id: string;
    orderIndex?: number;
    visibleDefault?: boolean;
    color?: string;
  }[];
}
