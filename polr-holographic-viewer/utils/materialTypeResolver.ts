/**
 * Material Type Resolver Utility
 * L0-CMD-2026-0125-004 Phase B3
 *
 * Enriches semantic detail layers with materialType for equivalency lookup.
 * Works with existing semantic details without requiring schema changes.
 */

import { SemanticDetail, SemanticLayer } from '../schemas/semantic-detail';
import { resolveMaterialType } from '../data/layer-material-mapping';

/**
 * Extended layer type with materialType property for equivalency lookup.
 */
export interface EnrichedLayer extends SemanticLayer {
  /** Product equivalency key for this layer */
  materialType?: string;
}

/**
 * Semantic detail with enriched layers containing materialType.
 */
export interface EnrichedSemanticDetail extends Omit<SemanticDetail, 'layers'> {
  layers: EnrichedLayer[];
}

/**
 * Enrich a single layer with its materialType for equivalency lookup.
 *
 * @param layer - The semantic layer to enrich
 * @returns Layer with materialType property added
 */
export function enrichLayer(layer: SemanticLayer): EnrichedLayer {
  const materialType = resolveMaterialType(
    layer.id,
    layer.material,
    layer.annotation
  );

  return {
    ...layer,
    materialType,
  };
}

/**
 * Enrich all layers in a semantic detail with materialType.
 *
 * @param detail - The semantic detail to enrich
 * @returns Detail with all layers enriched
 */
export function enrichDetail(detail: SemanticDetail): EnrichedSemanticDetail {
  return {
    ...detail,
    layers: detail.layers.map(enrichLayer),
  };
}

/**
 * Get the count of layers that have valid materialType mappings.
 *
 * @param detail - The semantic detail to check
 * @returns Object with total layers and mapped count
 */
export function getMaterialTypeCoverage(detail: SemanticDetail): {
  total: number;
  mapped: number;
  percentage: number;
  unmappedLayers: string[];
} {
  const enriched = enrichDetail(detail);
  const unmappedLayers: string[] = [];

  enriched.layers.forEach(layer => {
    if (!layer.materialType) {
      unmappedLayers.push(layer.id);
    }
  });

  const total = enriched.layers.length;
  const mapped = total - unmappedLayers.length;

  return {
    total,
    mapped,
    percentage: total > 0 ? (mapped / total) * 100 : 0,
    unmappedLayers,
  };
}

/**
 * Check if a detail has sufficient materialType coverage for meaningful comparison.
 * Requires at least 50% of layers to have mappings.
 *
 * @param detail - The semantic detail to check
 * @returns Whether the detail has sufficient coverage
 */
export function hasAdequateCoverage(detail: SemanticDetail): boolean {
  const coverage = getMaterialTypeCoverage(detail);
  return coverage.percentage >= 50;
}

/**
 * Get all unique materialTypes present in a detail.
 *
 * @param detail - The semantic detail
 * @returns Array of unique materialType keys
 */
export function getDetailMaterialTypes(detail: SemanticDetail): string[] {
  const enriched = enrichDetail(detail);
  const types = new Set<string>();

  enriched.layers.forEach(layer => {
    if (layer.materialType) {
      types.add(layer.materialType);
    }
  });

  return Array.from(types);
}

export default {
  enrichLayer,
  enrichDetail,
  getMaterialTypeCoverage,
  hasAdequateCoverage,
  getDetailMaterialTypes,
};
