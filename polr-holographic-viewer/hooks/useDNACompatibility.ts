/**
 * DNA Compatibility Hook
 * L0-CMD-2026-0125-004 Phase C3
 *
 * React hook for checking material compatibility using Construction DNA.
 * Analyzes adjacent layers in semantic details for incompatibilities.
 */

import { useMemo } from 'react';
import { SemanticDetail, SemanticLayer } from '../schemas/semantic-detail';
import {
  checkCompatibility,
  CompatibilityResult,
  CompatibilityStatus,
  FailureMode,
  getFailureModesForMaterial,
  BaseChemistry
} from '../types/construction-dna';
import { getBaseChemistry, getDNAProfile, hasDNAData } from '../data/dna-materials';
import { resolveMaterialType } from '../data/layer-material-mapping';

// =============================================================================
// TYPES
// =============================================================================

export interface CompatibilityWarning {
  layer1Id: string;
  layer1Name: string;
  layer1Chemistry?: BaseChemistry;
  layer2Id: string;
  layer2Name: string;
  layer2Chemistry?: BaseChemistry;
  result: CompatibilityResult;
}

export interface MaterialInfo {
  layerId: string;
  layerName: string;
  materialType?: string;
  chemistry?: BaseChemistry;
  failureModes: FailureMode[];
  compatibilityNotes: string[];
}

export interface DNAAnalysisResult {
  /** Total layers analyzed */
  totalLayers: number;

  /** Layers with DNA data available */
  layersWithDNA: number;

  /** Compatibility warnings between adjacent layers */
  warnings: CompatibilityWarning[];

  /** Count by severity */
  incompatibleCount: number;
  conditionalCount: number;

  /** Material info for each layer */
  materialInfo: MaterialInfo[];

  /** Whether the detail has any critical incompatibilities */
  hasCriticalIssues: boolean;

  /** Summary message for display */
  summaryMessage: string;
}

// =============================================================================
// HOOK IMPLEMENTATION
// =============================================================================

/**
 * Analyze a semantic detail for material compatibility using Construction DNA.
 *
 * @param detail - The semantic detail to analyze (or null)
 * @returns DNA analysis result with warnings and material info
 */
export function useDNACompatibility(detail: SemanticDetail | null): DNAAnalysisResult {
  return useMemo(() => {
    // Empty result if no detail
    if (!detail?.layers || detail.layers.length === 0) {
      return {
        totalLayers: 0,
        layersWithDNA: 0,
        warnings: [],
        incompatibleCount: 0,
        conditionalCount: 0,
        materialInfo: [],
        hasCriticalIssues: false,
        summaryMessage: 'No layers to analyze'
      };
    }

    const warnings: CompatibilityWarning[] = [];
    const materialInfo: MaterialInfo[] = [];
    let layersWithDNA = 0;

    // Analyze each layer
    detail.layers.forEach((layer, index) => {
      // Resolve materialType for this layer
      const materialType = resolveMaterialType(
        layer.id,
        layer.material,
        layer.annotation
      );

      // Get DNA chemistry
      const chemistry = materialType ? getBaseChemistry(materialType) : undefined;

      // Get DNA profile for failure modes and notes
      const profile = materialType ? getDNAProfile(materialType) : undefined;

      // Get failure modes for this chemistry
      const failureModes = chemistry ? getFailureModesForMaterial(chemistry) : [];

      // Track DNA coverage
      if (chemistry || hasDNAData(materialType || '')) {
        layersWithDNA++;
      }

      // Build material info
      materialInfo.push({
        layerId: layer.id,
        layerName: layer.annotation || layer.id,
        materialType,
        chemistry,
        failureModes,
        compatibilityNotes: profile?.compatibilityNotes || []
      });

      // Check compatibility with next layer (adjacent pairs)
      if (index < detail.layers.length - 1) {
        const nextLayer = detail.layers[index + 1];
        const nextMaterialType = resolveMaterialType(
          nextLayer.id,
          nextLayer.material,
          nextLayer.annotation
        );
        const nextChemistry = nextMaterialType ? getBaseChemistry(nextMaterialType) : undefined;

        // Only check if both layers have chemistry data
        if (chemistry && nextChemistry) {
          const result = checkCompatibility(chemistry, nextChemistry);

          // Only add warnings for non-compatible or conditional
          if (result.status !== 'compatible' && result.status !== 'unknown') {
            warnings.push({
              layer1Id: layer.id,
              layer1Name: layer.annotation || layer.id,
              layer1Chemistry: chemistry,
              layer2Id: nextLayer.id,
              layer2Name: nextLayer.annotation || nextLayer.id,
              layer2Chemistry: nextChemistry,
              result
            });
          }
        }
      }
    });

    // Count by severity
    const incompatibleCount = warnings.filter(w => w.result.status === 'incompatible').length;
    const conditionalCount = warnings.filter(w => w.result.status === 'conditional').length;

    // Determine if there are critical issues
    const hasCriticalIssues = incompatibleCount > 0;

    // Generate summary message
    let summaryMessage: string;
    if (warnings.length === 0) {
      summaryMessage = `All ${layersWithDNA} analyzed layers are compatible`;
    } else if (hasCriticalIssues) {
      summaryMessage = `${incompatibleCount} incompatible material combination${incompatibleCount > 1 ? 's' : ''} found`;
    } else {
      summaryMessage = `${conditionalCount} conditional compatibility warning${conditionalCount > 1 ? 's' : ''}`;
    }

    return {
      totalLayers: detail.layers.length,
      layersWithDNA,
      warnings,
      incompatibleCount,
      conditionalCount,
      materialInfo,
      hasCriticalIssues,
      summaryMessage
    };
  }, [detail]);
}

/**
 * Check compatibility between two specific material types.
 * Utility function for one-off checks.
 *
 * @param materialType1 - First material type key
 * @param materialType2 - Second material type key
 * @returns CompatibilityResult
 */
export function checkMaterialCompatibility(
  materialType1: string,
  materialType2: string
): CompatibilityResult {
  const chem1 = getBaseChemistry(materialType1);
  const chem2 = getBaseChemistry(materialType2);

  if (!chem1 || !chem2) {
    return {
      status: 'unknown',
      reason: 'Insufficient DNA data for one or both materials'
    };
  }

  return checkCompatibility(chem1, chem2);
}

export default useDNACompatibility;
