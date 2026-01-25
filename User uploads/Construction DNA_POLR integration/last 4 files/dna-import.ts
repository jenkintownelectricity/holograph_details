/**
 * DNA Import Service
 * Handles importing MaterialDNA from JSON and ZIP files
 */

import JSZip from 'jszip';
import { MaterialDNA, validateMaterialDNA } from '../types/construction-dna';

// ============================================================================
// IMPORT RESULT
// ============================================================================

export interface ImportResult {
  success: boolean;
  materials: MaterialDNA[];
  errors: string[];
  warnings: string[];
  filename?: string;
}

// ============================================================================
// JSON PARSING
// ============================================================================

/**
 * Parse DNA materials from a JSON string
 */
export function parseDNAJson(
  jsonString: string,
  filename?: string
): ImportResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const materials: MaterialDNA[] = [];
  
  try {
    const data = JSON.parse(jsonString);
    
    // Handle different JSON structures
    let rawMaterials: unknown[] = [];
    
    if (Array.isArray(data)) {
      // Direct array of materials
      rawMaterials = data;
    } else if (data.materials && Array.isArray(data.materials)) {
      // Object with materials array
      rawMaterials = data.materials;
    } else if (data.id && data.baseChemistry) {
      // Single material object
      rawMaterials = [data];
    } else {
      errors.push('Invalid JSON structure: expected array or object with materials');
      return { success: false, materials: [], errors, warnings, filename };
    }
    
    // Validate and collect materials
    for (let i = 0; i < rawMaterials.length; i++) {
      const raw = rawMaterials[i] as Partial<MaterialDNA>;
      const validation = validateMaterialDNA(raw);
      
      if (validation.valid) {
        materials.push(raw as MaterialDNA);
      } else {
        validation.errors.forEach(err => 
          errors.push(`Material ${i + 1}: ${err}`)
        );
      }
      
      validation.warnings.forEach(warn => 
        warnings.push(`Material ${raw.id || i + 1}: ${warn}`)
      );
    }
    
    return {
      success: errors.length === 0,
      materials,
      errors,
      warnings,
      filename
    };
    
  } catch (e) {
    return {
      success: false,
      materials: [],
      errors: [e instanceof Error ? e.message : 'Failed to parse JSON'],
      warnings: [],
      filename
    };
  }
}

/**
 * Parse DNA materials from a File object (JSON)
 */
export async function parseDNAJsonFile(file: File): Promise<ImportResult> {
  try {
    const text = await file.text();
    return parseDNAJson(text, file.name);
  } catch (e) {
    return {
      success: false,
      materials: [],
      errors: [`Failed to read file: ${e instanceof Error ? e.message : 'Unknown error'}`],
      warnings: [],
      filename: file.name
    };
  }
}

// ============================================================================
// ZIP PARSING
// ============================================================================

/**
 * Parse DNA materials from a ZIP file containing JSON files
 */
export async function parseDNAZip(file: File): Promise<ImportResult> {
  const errors: string[] = [];
  const warnings: string[] = [];
  const allMaterials: MaterialDNA[] = [];
  
  try {
    const zip = await JSZip.loadAsync(file);
    const jsonFiles: string[] = [];
    
    // Find all JSON files in the ZIP
    zip.forEach((relativePath, zipEntry) => {
      if (relativePath.endsWith('.json') && !zipEntry.dir) {
        jsonFiles.push(relativePath);
      }
    });
    
    if (jsonFiles.length === 0) {
      return {
        success: false,
        materials: [],
        errors: ['No JSON files found in ZIP'],
        warnings: [],
        filename: file.name
      };
    }
    
    // Parse each JSON file
    for (const jsonPath of jsonFiles) {
      try {
        const content = await zip.file(jsonPath)?.async('string');
        if (content) {
          const result = parseDNAJson(content, jsonPath);
          
          allMaterials.push(...result.materials);
          result.errors.forEach(e => errors.push(`${jsonPath}: ${e}`));
          result.warnings.forEach(w => warnings.push(`${jsonPath}: ${w}`));
        }
      } catch (e) {
        warnings.push(`Failed to parse ${jsonPath}`);
      }
    }
    
    return {
      success: allMaterials.length > 0,
      materials: allMaterials,
      errors,
      warnings,
      filename: file.name
    };
    
  } catch (e) {
    return {
      success: false,
      materials: [],
      errors: [`Failed to read ZIP: ${e instanceof Error ? e.message : 'Unknown error'}`],
      warnings: [],
      filename: file.name
    };
  }
}

// ============================================================================
// FILE IMPORT (AUTO-DETECT FORMAT)
// ============================================================================

/**
 * Import DNA materials from a file (auto-detects JSON or ZIP)
 */
export async function importDNAFile(file: File): Promise<ImportResult> {
  const filename = file.name.toLowerCase();
  
  if (filename.endsWith('.zip')) {
    return parseDNAZip(file);
  } else if (filename.endsWith('.json')) {
    return parseDNAJsonFile(file);
  } else {
    return {
      success: false,
      materials: [],
      errors: ['Unsupported file type. Please use .json or .zip files.'],
      warnings: [],
      filename: file.name
    };
  }
}

// ============================================================================
// TEST DATA
// ============================================================================

/**
 * Get sample DNA materials for testing
 */
export function getTestDNAMaterials(): MaterialDNA[] {
  return [
    {
      id: 'tpo-carlisle-60',
      division: '07',
      category: 'Roofing',
      assemblyType: 'Field Membrane',
      manufacturer: 'Carlisle SynTec',
      product: 'Sure-Weld TPO 60 mil',
      specSheetUrl: 'https://www.carlislesyntec.com/datasheets/sure-weld-tpo-60.pdf',
      baseChemistry: 'TPO',
      reinforcement: 'polyester',
      surfaceTreatment: 'smooth',
      thicknessMil: 60,
      color: '#F5F5F5',
      sri: 108,
      fireRating: 'A',
      permRating: 0.06,
      tensileStrength: 350,
      elongation: 400,
      tempRangeMin: -40,
      tempRangeMax: 180,
      failureModes: [
        {
          id: 'seam-failure',
          name: 'Seam Failure',
          description: 'Weld separation at heat-welded seams',
          causes: ['Improper weld temperature', 'Contaminated surfaces'],
          prevention: ['Maintain 900-1000°F', 'Clean surfaces before welding'],
          severity: 'critical'
        }
      ],
      compatibilityNotes: ['Incompatible with asphalt', 'Compatible with polyiso'],
      applicationConstraints: ['Minimum 40°F for welding'],
      codeReferences: ['ASTM D6878', 'FM 4470']
    },
    {
      id: 'epdm-firestone-90',
      division: '07',
      category: 'Roofing',
      assemblyType: 'Field Membrane',
      manufacturer: 'Firestone Building Products',
      product: 'RubberGard EPDM 90 mil',
      specSheetUrl: 'https://www.firestonebpco.com/datasheets/rubberdard-90.pdf',
      baseChemistry: 'EPDM',
      reinforcement: 'none',
      surfaceTreatment: 'smooth',
      thicknessMil: 90,
      color: '#1A1A1A',
      fireRating: 'A',
      permRating: 0.03,
      tensileStrength: 200,
      elongation: 300,
      tempRangeMin: -45,
      tempRangeMax: 250,
      failureModes: [
        {
          id: 'oil-degradation',
          name: 'Oil/Grease Degradation',
          description: 'EPDM swells when exposed to oils',
          causes: ['Kitchen exhaust', 'HVAC condensate'],
          prevention: ['Oil-resistant membrane near exhausts'],
          severity: 'high'
        }
      ],
      compatibilityNotes: ['INCOMPATIBLE with asphalt', 'INCOMPATIBLE with PVC'],
      applicationConstraints: ['Avoid petroleum products'],
      codeReferences: ['ASTM D4637', 'FM 4470']
    },
    {
      id: 'polyiso-atlas-25',
      division: '07',
      category: 'Insulation',
      assemblyType: 'Roof Insulation',
      manufacturer: 'Atlas Roofing',
      product: 'ACFoam-II 2.5"',
      specSheetUrl: 'https://www.atlasroofing.com/specs/acfoam-ii.pdf',
      baseChemistry: 'polyiso',
      reinforcement: 'fiberglass',
      surfaceTreatment: 'coated',
      thicknessMil: 2500,
      color: '#D4A574',
      fireRating: 'A',
      permRating: 1.0,
      rValue: 6.0,
      tempRangeMin: -100,
      tempRangeMax: 250,
      failureModes: [
        {
          id: 'moisture-absorption',
          name: 'Moisture Absorption',
          description: 'Polyiso absorbs moisture reducing R-value',
          causes: ['Roof leaks', 'Condensation'],
          prevention: ['Maintain roof integrity', 'Vapor retarder'],
          severity: 'high'
        }
      ],
      compatibilityNotes: ['Compatible with all membrane types'],
      applicationConstraints: ['R-value decreases below 40°F'],
      codeReferences: ['ASTM C1289', 'FM 4450']
    },
    {
      id: 'sbs-soprema-180',
      division: '07',
      category: 'Roofing',
      assemblyType: 'Cap Sheet',
      manufacturer: 'SOPREMA',
      product: 'SOPRASTAR Flam 180',
      specSheetUrl: 'https://www.soprema.us/datasheets/soprastar-flam.pdf',
      baseChemistry: 'SBS',
      reinforcement: 'polyester',
      surfaceTreatment: 'granule',
      thicknessMil: 180,
      color: '#2D2D2D',
      fireRating: 'A',
      permRating: 0.05,
      tensileStrength: 450,
      elongation: 50,
      tempRangeMin: -20,
      tempRangeMax: 240,
      failureModes: [
        {
          id: 'blistering',
          name: 'Blistering',
          description: 'Air/moisture pockets between plies',
          causes: ['Moisture in substrate', 'Poor adhesion'],
          prevention: ['Dry substrate', 'Proper torch technique'],
          severity: 'high'
        }
      ],
      compatibilityNotes: ['INCOMPATIBLE with TPO/PVC/EPDM'],
      applicationConstraints: ['Torch-applied - fire safety required'],
      codeReferences: ['ASTM D6162', 'FM 4470']
    },
    {
      id: 'pvc-sarnafil-60',
      division: '07',
      category: 'Roofing',
      assemblyType: 'Field Membrane',
      manufacturer: 'Sika Sarnafil',
      product: 'Sarnafil G 60 mil',
      specSheetUrl: 'https://www.sika.com/datasheets/sarnafil-g.pdf',
      baseChemistry: 'PVC',
      reinforcement: 'polyester',
      surfaceTreatment: 'smooth',
      thicknessMil: 60,
      color: '#E8E8E8',
      sri: 104,
      fireRating: 'A',
      permRating: 0.05,
      tensileStrength: 300,
      elongation: 200,
      tempRangeMin: -30,
      tempRangeMax: 160,
      failureModes: [
        {
          id: 'plasticizer-migration',
          name: 'Plasticizer Migration',
          description: 'Plasticizers leach out causing brittleness',
          causes: ['Contact with polystyrene', 'High temps', 'Age'],
          prevention: ['Avoid contact with EPS/XPS', 'Use separators'],
          severity: 'high'
        }
      ],
      compatibilityNotes: ['INCOMPATIBLE with EPS/XPS insulation', 'Compatible with polyiso'],
      applicationConstraints: ['Do not install over polystyrene'],
      codeReferences: ['ASTM D4434', 'FM 4470']
    },
    {
      id: 'xps-owens-corning',
      division: '07',
      category: 'Insulation',
      assemblyType: 'Below-Grade Insulation',
      manufacturer: 'Owens Corning',
      product: 'FOAMULAR 250',
      specSheetUrl: 'https://www.owenscorning.com/specs/foamular-250.pdf',
      baseChemistry: 'XPS',
      surfaceTreatment: 'smooth',
      thicknessMil: 2000,
      color: '#FF9ECF',
      fireRating: 'unrated',
      permRating: 1.1,
      rValue: 5.0,
      tempRangeMin: -100,
      tempRangeMax: 165,
      failureModes: [
        {
          id: 'plasticizer-attack',
          name: 'Plasticizer Attack',
          description: 'PVC plasticizers dissolve XPS',
          causes: ['Direct contact with PVC membrane'],
          prevention: ['Never use under PVC', 'Install separator'],
          severity: 'critical'
        }
      ],
      compatibilityNotes: ['INCOMPATIBLE with PVC', 'Compatible with EPDM/TPO'],
      applicationConstraints: ['Do not use under PVC membrane'],
      codeReferences: ['ASTM C578', 'FM 4450']
    }
  ];
}

// ============================================================================
// EXPORT FUNCTION
// ============================================================================

/**
 * Export materials to DNA JSON format
 */
export function exportDNAToJson(materials: MaterialDNA[]): string {
  return JSON.stringify({
    version: '1.0',
    exportedFrom: 'POLR Holographic Viewer',
    exportedAt: new Date().toISOString(),
    materials
  }, null, 2);
}
