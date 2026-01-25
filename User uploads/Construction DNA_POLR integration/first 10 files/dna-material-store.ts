/**
 * DNA Material Store
 * 
 * Zustand store for managing imported DNA materials
 * with localStorage persistence
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { MaterialDNA, DNAImportResult, BaseChemistry } from '../types';
import { parseDNAJson, parseDNAZip, getTestDNAMaterials } from '../services/dna-import';

// ============================================================================
// STORE STATE INTERFACE
// ============================================================================

interface DNAMaterialState {
  // Data
  materials: MaterialDNA[];
  
  // Status
  isLoading: boolean;
  error: string | null;
  lastImportedAt: Date | null;
  
  // Actions
  addMaterials: (materials: MaterialDNA[]) => DNAImportResult;
  removeMaterial: (id: string) => void;
  updateMaterial: (id: string, updates: Partial<MaterialDNA>) => void;
  clearAll: () => void;
  
  // Import actions
  importFromFile: (file: File) => Promise<DNAImportResult>;
  importFromJson: (json: string) => Promise<DNAImportResult>;
  loadTestData: () => void;
  
  // Query methods
  getById: (id: string) => MaterialDNA | undefined;
  getByChemistry: (chemistry: BaseChemistry) => MaterialDNA[];
  getByManufacturer: (manufacturer: string) => MaterialDNA[];
  getByCategory: (category: string) => MaterialDNA[];
  search: (query: string) => MaterialDNA[];
  
  // Compatibility
  checkCompatibility: (material1Id: string, material2Id: string) => { compatible: boolean; reason?: string };
  getCompatibleWith: (materialId: string) => MaterialDNA[];
  getIncompatibleWith: (materialId: string) => MaterialDNA[];
}

// ============================================================================
// INCOMPATIBILITY MATRIX
// ============================================================================

const INCOMPATIBILITY_MATRIX: Record<string, string[]> = {
  'TPO': ['asphalt', 'SBS', 'APP', 'BUR'],
  'EPDM': ['PVC', 'asphalt', 'SBS', 'APP', 'BUR'],
  'PVC': ['EPDM', 'asphalt', 'SBS', 'APP', 'BUR'],
  'SBS': ['TPO', 'PVC', 'EPDM'],
  'APP': ['TPO', 'PVC', 'EPDM'],
  'BUR': ['TPO', 'PVC', 'EPDM'],
  'asphalt': ['TPO', 'PVC', 'EPDM'],
};

// ============================================================================
// STORE IMPLEMENTATION
// ============================================================================

export const useDNAMaterialStore = create<DNAMaterialState>()(
  persist(
    (set, get) => ({
      // Initial state
      materials: [],
      isLoading: false,
      error: null,
      lastImportedAt: null,
      
      // Add materials (with deduplication)
      addMaterials: (newMaterials: MaterialDNA[]) => {
        const result: DNAImportResult = {
          success: false,
          materialsImported: 0,
          materialsSkipped: 0,
          errors: [],
          warnings: []
        };
        
        set(state => {
          const existingIds = new Set(state.materials.map(m => m.id));
          const toAdd: MaterialDNA[] = [];
          
          for (const material of newMaterials) {
            if (existingIds.has(material.id)) {
              // Update existing
              result.warnings.push(`Updated existing material: ${material.id}`);
              result.materialsImported++;
            } else {
              toAdd.push(material);
              result.materialsImported++;
            }
          }
          
          // Merge: update existing + add new
          const updated = state.materials.map(existing => {
            const replacement = newMaterials.find(m => m.id === existing.id);
            return replacement || existing;
          });
          
          result.success = result.materialsImported > 0;
          
          return {
            materials: [...updated.filter(m => !toAdd.find(a => a.id === m.id)), ...toAdd],
            lastImportedAt: new Date(),
            error: null
          };
        });
        
        return result;
      },
      
      // Remove material
      removeMaterial: (id: string) => {
        set(state => ({
          materials: state.materials.filter(m => m.id !== id)
        }));
      },
      
      // Update material
      updateMaterial: (id: string, updates: Partial<MaterialDNA>) => {
        set(state => ({
          materials: state.materials.map(m => 
            m.id === id ? { ...m, ...updates } : m
          )
        }));
      },
      
      // Clear all
      clearAll: () => {
        set({ materials: [], lastImportedAt: null, error: null });
      },
      
      // Import from file
      importFromFile: async (file: File) => {
        set({ isLoading: true, error: null });
        
        const result: DNAImportResult = {
          success: false,
          materialsImported: 0,
          materialsSkipped: 0,
          errors: [],
          warnings: []
        };
        
        try {
          let parseResult: { materials: MaterialDNA[]; errors: string[]; warnings: string[] };
          
          if (file.name.endsWith('.json')) {
            const text = await file.text();
            parseResult = await parseDNAJson(text);
          } else if (file.name.endsWith('.zip')) {
            const buffer = await file.arrayBuffer();
            parseResult = await parseDNAZip(buffer);
          } else {
            result.errors.push(`Unsupported file type: ${file.name}`);
            set({ isLoading: false, error: result.errors[0] });
            return result;
          }
          
          result.errors = parseResult.errors;
          result.warnings = parseResult.warnings;
          
          if (parseResult.materials.length > 0) {
            const addResult = get().addMaterials(parseResult.materials);
            result.materialsImported = addResult.materialsImported;
            result.materialsSkipped = parseResult.errors.length;
            result.success = true;
          }
          
          set({ isLoading: false });
          return result;
        } catch (e) {
          const errorMsg = e instanceof Error ? e.message : 'Unknown error';
          result.errors.push(errorMsg);
          set({ isLoading: false, error: errorMsg });
          return result;
        }
      },
      
      // Import from JSON string
      importFromJson: async (json: string) => {
        set({ isLoading: true, error: null });
        
        const result: DNAImportResult = {
          success: false,
          materialsImported: 0,
          materialsSkipped: 0,
          errors: [],
          warnings: []
        };
        
        try {
          const parseResult = await parseDNAJson(json);
          result.errors = parseResult.errors;
          result.warnings = parseResult.warnings;
          
          if (parseResult.materials.length > 0) {
            const addResult = get().addMaterials(parseResult.materials);
            result.materialsImported = addResult.materialsImported;
            result.materialsSkipped = parseResult.errors.length;
            result.success = true;
          }
          
          set({ isLoading: false });
          return result;
        } catch (e) {
          const errorMsg = e instanceof Error ? e.message : 'Unknown error';
          result.errors.push(errorMsg);
          set({ isLoading: false, error: errorMsg });
          return result;
        }
      },
      
      // Load test data
      loadTestData: () => {
        const testMaterials = getTestDNAMaterials();
        get().addMaterials(testMaterials);
      },
      
      // Get by ID
      getById: (id: string) => {
        return get().materials.find(m => m.id === id);
      },
      
      // Get by chemistry
      getByChemistry: (chemistry: BaseChemistry) => {
        return get().materials.filter(
          m => m.baseChemistry.toLowerCase() === chemistry.toLowerCase()
        );
      },
      
      // Get by manufacturer
      getByManufacturer: (manufacturer: string) => {
        return get().materials.filter(
          m => m.manufacturer.toLowerCase().includes(manufacturer.toLowerCase())
        );
      },
      
      // Get by category
      getByCategory: (category: string) => {
        return get().materials.filter(
          m => m.category.toLowerCase() === category.toLowerCase()
        );
      },
      
      // Search materials
      search: (query: string) => {
        const q = query.toLowerCase();
        return get().materials.filter(m => 
          m.id.toLowerCase().includes(q) ||
          m.manufacturer.toLowerCase().includes(q) ||
          m.product.toLowerCase().includes(q) ||
          m.baseChemistry.toLowerCase().includes(q) ||
          m.category.toLowerCase().includes(q) ||
          m.assemblyType.toLowerCase().includes(q)
        );
      },
      
      // Check compatibility between two materials
      checkCompatibility: (material1Id: string, material2Id: string) => {
        const m1 = get().getById(material1Id);
        const m2 = get().getById(material2Id);
        
        if (!m1 || !m2) {
          return { compatible: true, reason: 'Material not found' };
        }
        
        const incompatible1 = INCOMPATIBILITY_MATRIX[m1.baseChemistry] || [];
        const incompatible2 = INCOMPATIBILITY_MATRIX[m2.baseChemistry] || [];
        
        if (incompatible1.includes(m2.baseChemistry)) {
          const note = m1.compatibilityNotes.find(
            n => n.toLowerCase().includes(m2.baseChemistry.toLowerCase())
          );
          return {
            compatible: false,
            reason: note || `${m1.baseChemistry} is incompatible with ${m2.baseChemistry}`
          };
        }
        
        if (incompatible2.includes(m1.baseChemistry)) {
          const note = m2.compatibilityNotes.find(
            n => n.toLowerCase().includes(m1.baseChemistry.toLowerCase())
          );
          return {
            compatible: false,
            reason: note || `${m2.baseChemistry} is incompatible with ${m1.baseChemistry}`
          };
        }
        
        return { compatible: true };
      },
      
      // Get materials compatible with given material
      getCompatibleWith: (materialId: string) => {
        const material = get().getById(materialId);
        if (!material) return [];
        
        return get().materials.filter(m => {
          if (m.id === materialId) return false;
          const { compatible } = get().checkCompatibility(materialId, m.id);
          return compatible;
        });
      },
      
      // Get materials incompatible with given material
      getIncompatibleWith: (materialId: string) => {
        const material = get().getById(materialId);
        if (!material) return [];
        
        return get().materials.filter(m => {
          if (m.id === materialId) return false;
          const { compatible } = get().checkCompatibility(materialId, m.id);
          return !compatible;
        });
      }
    }),
    {
      name: 'dna-material-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        materials: state.materials,
        lastImportedAt: state.lastImportedAt
      })
    }
  )
);

// ============================================================================
// SELECTOR HOOKS
// ============================================================================

export const useDNAMaterials = () => useDNAMaterialStore(state => state.materials);
export const useDNALoading = () => useDNAMaterialStore(state => state.isLoading);
export const useDNAError = () => useDNAMaterialStore(state => state.error);
