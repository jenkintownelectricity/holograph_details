/**
 * DNA Resolver
 * 
 * Resolves layers to DNA materials and checks compatibility
 */

import type { 
  MaterialDNA, 
  Layer, 
  SemanticDetail, 
  CompatibilityWarning 
} from '../types';
import { findMatchingDNA, guessChemistryFromType } from '../adapters/dna-adapter';
import { checkCompatibility } from '../types/construction-dna';

// ============================================================================
// LAYER RESOLUTION
// ============================================================================

/**
 * Resolve a layer's DNA material
 * Uses dnaId if available, falls back to materialType matching
 */
export function resolveLayerDNA(
  layer: Layer,
  dnaMaterials: MaterialDNA[]
): MaterialDNA | null {
  // Already has resolved DNA
  if (layer.dnaMaterial) {
    return layer.dnaMaterial;
  }
  
  // Has DNA ID - look it up
  if (layer.dnaId) {
    return dnaMaterials.find(m => m.id === layer.dnaId) ?? null;
  }
  
  // Try to match by material type
  return findMatchingDNA(layer, dnaMaterials);
}

/**
 * Resolve all layers in a semantic detail
 */
export function resolveDetailDNA(
  detail: SemanticDetail,
  dnaMaterials: MaterialDNA[]
): SemanticDetail {
  return {
    ...detail,
    layers: detail.layers.map(layer => ({
      ...layer,
      dnaMaterial: resolveLayerDNA(layer, dnaMaterials)
    }))
  };
}

// ============================================================================
// COMPATIBILITY CHECKING
// ============================================================================

/**
 * Check compatibility between adjacent layers in a detail
 */
export function checkDetailCompatibility(
  detail: SemanticDetail
): CompatibilityWarning[] {
  const warnings: CompatibilityWarning[] = [];
  
  // Sort layers by order
  const sortedLayers = [...detail.layers].sort((a, b) => a.order - b.order);
  
  // Check each adjacent pair
  for (let i = 0; i < sortedLayers.length - 1; i++) {
    const layer1 = sortedLayers[i];
    const layer2 = sortedLayers[i + 1];
    
    // Both need DNA to check compatibility
    if (!layer1.dnaMaterial || !layer2.dnaMaterial) {
      continue;
    }
    
    const result = checkCompatibility(layer1.dnaMaterial, layer2.dnaMaterial);
    
    if (!result.compatible) {
      // Determine severity based on incompatibility type
      let severity: 'critical' | 'warning' | 'info' = 'warning';
      
      const reason = result.reason?.toLowerCase() || '';
      if (reason.includes('incompatible') || reason.includes('degrad')) {
        severity = 'critical';
      } else if (reason.includes('separator') || reason.includes('require')) {
        severity = 'warning';
      }
      
      warnings.push({
        layerId1: layer1.id,
        layerId2: layer2.id,
        layer1Name: layer1.name,
        layer2Name: layer2.name,
        reason: result.reason || 'Materials may be incompatible',
        severity
      });
    }
  }
  
  return warnings;
}

/**
 * Get compatibility score for a detail (0-100)
 * 100 = all compatible, 0 = all incompatible
 */
export function getCompatibilityScore(detail: SemanticDetail): number {
  const layersWithDNA = detail.layers.filter(l => l.dnaMaterial);
  
  if (layersWithDNA.length <= 1) {
    return 100; // Nothing to compare
  }
  
  const warnings = checkDetailCompatibility(detail);
  const interfaces = layersWithDNA.length - 1;
  
  if (interfaces === 0) {
    return 100;
  }
  
  // Weight by severity
  let penaltyPoints = 0;
  for (const warning of warnings) {
    switch (warning.severity) {
      case 'critical':
        penaltyPoints += 30;
        break;
      case 'warning':
        penaltyPoints += 15;
        break;
      case 'info':
        penaltyPoints += 5;
        break;
    }
  }
  
  const maxPenalty = interfaces * 30; // Max penalty if all critical
  const score = Math.max(0, 100 - (penaltyPoints / maxPenalty) * 100);
  
  return Math.round(score);
}

// ============================================================================
// LAYER STACK HELPERS
// ============================================================================

/**
 * Calculate total thickness of a detail
 */
export function calculateTotalThickness(detail: SemanticDetail): number {
  return detail.layers.reduce((sum, layer) => sum + layer.thickness, 0);
}

/**
 * Calculate total R-value of a detail (if insulation layers have rValue)
 */
export function calculateTotalRValue(detail: SemanticDetail): number {
  return detail.layers.reduce((sum, layer) => {
    // Polyiso: ~6.0 per inch, others vary
    if (layer.dnaMaterial?.baseChemistry === 'polyiso') {
      return sum + layer.thickness * 6.0;
    }
    if (layer.dnaMaterial?.baseChemistry === 'XPS') {
      return sum + layer.thickness * 5.0;
    }
    if (layer.dnaMaterial?.baseChemistry === 'EPS') {
      return sum + layer.thickness * 3.8;
    }
    return sum;
  }, 0);
}

/**
 * Get layer by ID
 */
export function getLayerById(detail: SemanticDetail, layerId: string): Layer | undefined {
  return detail.layers.find(l => l.id === layerId);
}

/**
 * Get layers above a given layer
 */
export function getLayersAbove(detail: SemanticDetail, layerId: string): Layer[] {
  const layer = getLayerById(detail, layerId);
  if (!layer) return [];
  return detail.layers.filter(l => l.order > layer.order);
}

/**
 * Get layers below a given layer
 */
export function getLayersBelow(detail: SemanticDetail, layerId: string): Layer[] {
  const layer = getLayerById(detail, layerId);
  if (!layer) return [];
  return detail.layers.filter(l => l.order < layer.order);
}

// ============================================================================
// CACHING
// ============================================================================

const resolutionCache = new Map<string, MaterialDNA | null>();

/**
 * Get or resolve DNA with caching
 */
export function resolveLayerDNACached(
  layer: Layer,
  dnaMaterials: MaterialDNA[]
): MaterialDNA | null {
  const cacheKey = `${layer.id}-${layer.dnaId || layer.materialType}`;
  
  if (resolutionCache.has(cacheKey)) {
    return resolutionCache.get(cacheKey) ?? null;
  }
  
  const result = resolveLayerDNA(layer, dnaMaterials);
  resolutionCache.set(cacheKey, result);
  return result;
}

/**
 * Clear resolution cache
 */
export function clearResolutionCache(): void {
  resolutionCache.clear();
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  resolveLayerDNA,
  resolveDetailDNA,
  checkDetailCompatibility,
  getCompatibilityScore,
  calculateTotalThickness,
  calculateTotalRValue,
  getLayerById,
  getLayersAbove,
  getLayersBelow,
  resolveLayerDNACached,
  clearResolutionCache
};
