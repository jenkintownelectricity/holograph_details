/**
 * DNA Import Service
 * L0-CMD-2026-0125-005 Phase 3
 *
 * Loads Construction DNA materials from JSON and ZIP files.
 * Validates structure and converts to POLR format.
 */

import JSZip from 'jszip';
import { MaterialDNA } from '../types/construction-dna';
import { POLRMaterial, convertDNAMaterials } from '../adapters/dna-adapter';

// =============================================================================
// TYPES
// =============================================================================

export interface ImportResult {
  /** Whether the import was successful */
  success: boolean;
  /** Converted POLR materials */
  materials: POLRMaterial[];
  /** Errors that prevented import */
  errors: string[];
  /** Non-fatal warnings */
  warnings: string[];
  /** Statistics about the import */
  stats: {
    filesProcessed: number;
    materialsFound: number;
    materialsImported: number;
    materialsSkipped: number;
  };
}

// =============================================================================
// MAIN IMPORT FUNCTION
// =============================================================================

/**
 * Import DNA materials from a file.
 * Supports .json and .zip file formats.
 *
 * @param file - The file to import
 * @returns ImportResult with materials and status
 */
export async function importDNAFile(file: File): Promise<ImportResult> {
  const errors: string[] = [];
  const warnings: string[] = [];
  const stats = {
    filesProcessed: 0,
    materialsFound: 0,
    materialsImported: 0,
    materialsSkipped: 0
  };

  try {
    let dnaMaterials: MaterialDNA[] = [];

    if (file.name.endsWith('.zip')) {
      dnaMaterials = await importZip(file, errors, warnings, stats);
    } else if (file.name.endsWith('.json')) {
      dnaMaterials = await importJSON(file, errors, warnings, stats);
      stats.filesProcessed = 1;
    } else {
      return {
        success: false,
        materials: [],
        errors: ['Unsupported file type. Use .json or .zip'],
        warnings: [],
        stats
      };
    }

    stats.materialsFound = dnaMaterials.length + stats.materialsSkipped;
    stats.materialsImported = dnaMaterials.length;

    // Convert to POLR format
    const materials = convertDNAMaterials(dnaMaterials);

    console.log(`[DNAImport] Imported ${materials.length} materials from ${file.name}`);

    return {
      success: true,
      materials,
      errors,
      warnings
    , stats
    };
  } catch (error) {
    console.error('[DNAImport] Import failed:', error);
    return {
      success: false,
      materials: [],
      errors: [error instanceof Error ? error.message : 'Unknown error during import'],
      warnings,
      stats
    };
  }
}

// =============================================================================
// JSON IMPORT
// =============================================================================

async function importJSON(
  file: File,
  errors: string[],
  warnings: string[],
  stats: { materialsSkipped: number }
): Promise<MaterialDNA[]> {
  const text = await file.text();
  let data: any;

  try {
    data = JSON.parse(text);
  } catch (e) {
    throw new Error(`Invalid JSON in ${file.name}`);
  }

  return extractMaterials(data, warnings, stats);
}

// =============================================================================
// ZIP IMPORT
// =============================================================================

async function importZip(
  file: File,
  errors: string[],
  warnings: string[],
  stats: { filesProcessed: number; materialsSkipped: number }
): Promise<MaterialDNA[]> {
  const zip = await JSZip.loadAsync(file);
  const materials: MaterialDNA[] = [];

  for (const [filename, zipEntry] of Object.entries(zip.files)) {
    // Skip directories and non-JSON files
    if (zipEntry.dir || !filename.endsWith('.json')) {
      continue;
    }

    // Skip macOS metadata files
    if (filename.startsWith('__MACOSX') || filename.includes('/.')) {
      continue;
    }

    stats.filesProcessed++;

    try {
      const text = await zipEntry.async('text');
      const data = JSON.parse(text);
      const extracted = extractMaterials(data, warnings, stats);
      materials.push(...extracted);
    } catch (e) {
      warnings.push(`Failed to parse ${filename}: ${e instanceof Error ? e.message : 'Unknown error'}`);
    }
  }

  return materials;
}

// =============================================================================
// MATERIAL EXTRACTION
// =============================================================================

function extractMaterials(
  data: any,
  warnings: string[],
  stats: { materialsSkipped: number }
): MaterialDNA[] {
  const materials: MaterialDNA[] = [];

  // Handle array of materials
  if (Array.isArray(data)) {
    for (const item of data) {
      if (validateDNA(item, warnings)) {
        materials.push(normalizeDNA(item));
      } else {
        stats.materialsSkipped++;
      }
    }
    return materials;
  }

  // Handle object with "materials" array (common export format)
  if (data.materials && Array.isArray(data.materials)) {
    for (const item of data.materials) {
      if (validateDNA(item, warnings)) {
        materials.push(normalizeDNA(item));
      } else {
        stats.materialsSkipped++;
      }
    }
    return materials;
  }

  // Handle single material object
  if (validateDNA(data, warnings)) {
    materials.push(normalizeDNA(data));
  } else {
    stats.materialsSkipped++;
  }

  return materials;
}

// =============================================================================
// VALIDATION
// =============================================================================

function validateDNA(data: any, warnings: string[]): data is MaterialDNA {
  // Must be an object
  if (!data || typeof data !== 'object') {
    return false;
  }

  // Must have an id
  if (!data.id || typeof data.id !== 'string') {
    warnings.push('Material missing required "id" field, skipped');
    return false;
  }

  // Should have at least some identifying information
  if (!data.baseChemistry && !data.product && !data.manufacturer) {
    warnings.push(`Material ${data.id} has no chemistry, product, or manufacturer`);
    // Still allow it, but warn
  }

  return true;
}

// =============================================================================
// NORMALIZATION
// =============================================================================

function normalizeDNA(data: any): MaterialDNA {
  // Ensure all expected fields exist with proper types
  return {
    id: data.id,
    division: data.division || '07',
    category: data.category || 'Uncategorized',
    assemblyType: data.assemblyType,
    condition: data.condition,
    manufacturer: data.manufacturer,
    product: data.product,
    specSheetUrl: data.specSheetUrl,
    baseChemistry: data.baseChemistry,
    reinforcement: data.reinforcement,
    surfaceTreatment: data.surfaceTreatment,
    thicknessMil: typeof data.thicknessMil === 'number' ? data.thicknessMil : undefined,
    color: data.color,
    sri: typeof data.sri === 'number' ? data.sri : undefined,
    fireRating: data.fireRating,
    permRating: typeof data.permRating === 'number' ? data.permRating : undefined,
    tensileStrength: typeof data.tensileStrength === 'number' ? data.tensileStrength : undefined,
    elongation: typeof data.elongation === 'number' ? data.elongation : undefined,
    tempRangeMin: typeof data.tempRangeMin === 'number' ? data.tempRangeMin : undefined,
    tempRangeMax: typeof data.tempRangeMax === 'number' ? data.tempRangeMax : undefined,
    failureModes: Array.isArray(data.failureModes) ? data.failureModes : undefined,
    compatibilityNotes: Array.isArray(data.compatibilityNotes) ? data.compatibilityNotes : undefined,
    applicationConstraints: Array.isArray(data.applicationConstraints) ? data.applicationConstraints : undefined,
    codeReferences: Array.isArray(data.codeReferences) ? data.codeReferences : undefined,
  };
}

// =============================================================================
// EXPORT FUNCTION
// =============================================================================

/**
 * Export POLR materials back to DNA JSON format.
 *
 * @param materials - Array of POLR materials to export
 * @returns JSON string of DNA materials
 */
export function exportToDNA(materials: POLRMaterial[]): string {
  const dnaExport = materials.map(m => m.dna);
  return JSON.stringify({ materials: dnaExport }, null, 2);
}

/**
 * Export POLR materials as a downloadable JSON file.
 *
 * @param materials - Array of POLR materials to export
 * @param filename - Name for the downloaded file
 */
export function downloadDNAExport(materials: POLRMaterial[], filename = 'dna-materials.json'): void {
  const json = exportToDNA(materials);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);
}

export default {
  importDNAFile,
  exportToDNA,
  downloadDNAExport,
};
