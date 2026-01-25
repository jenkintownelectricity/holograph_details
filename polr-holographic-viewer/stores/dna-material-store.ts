/**
 * DNA Material Store
 * L0-CMD-2026-0125-005 Phase 4
 *
 * Zustand store for managing imported Construction DNA materials.
 * Provides persistence to localStorage and querying capabilities.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { POLRMaterial } from '../adapters/dna-adapter';
import { BaseChemistry } from '../types/construction-dna';

// =============================================================================
// TYPES
// =============================================================================

export interface DNAMaterialState {
  /** All imported materials */
  materials: POLRMaterial[];

  /** Last import timestamp */
  lastImportTime: number | null;

  /** Import source filename */
  lastImportSource: string | null;

  // Actions
  addMaterials: (materials: POLRMaterial[]) => void;
  removeMaterial: (id: string) => void;
  clearMaterials: () => void;
  replaceMaterials: (materials: POLRMaterial[]) => void;

  // Queries
  getById: (id: string) => POLRMaterial | undefined;
  getByDnaId: (dnaId: string) => POLRMaterial | undefined;
  getByChemistry: (chemistry: BaseChemistry) => POLRMaterial[];
  getByManufacturer: (manufacturer: string) => POLRMaterial[];
  getByCategory: (category: string) => POLRMaterial[];
  searchMaterials: (query: string) => POLRMaterial[];
}

// =============================================================================
// STORE IMPLEMENTATION
// =============================================================================

export const useDNAMaterialStore = create<DNAMaterialState>()(
  persist(
    (set, get) => ({
      // State
      materials: [],
      lastImportTime: null,
      lastImportSource: null,

      // =======================================================================
      // ACTIONS
      // =======================================================================

      /**
       * Add materials to the store (merges with existing).
       * Duplicates by id are replaced with newer versions.
       */
      addMaterials: (newMaterials: POLRMaterial[]) => {
        set((state) => {
          // Create a map of existing materials by id
          const materialMap = new Map(
            state.materials.map((m) => [m.id, m])
          );

          // Add/update with new materials
          for (const material of newMaterials) {
            materialMap.set(material.id, material);
          }

          return {
            materials: Array.from(materialMap.values()),
            lastImportTime: Date.now(),
          };
        });
      },

      /**
       * Remove a material by id.
       */
      removeMaterial: (id: string) => {
        set((state) => ({
          materials: state.materials.filter((m) => m.id !== id),
        }));
      },

      /**
       * Clear all materials from the store.
       */
      clearMaterials: () => {
        set({
          materials: [],
          lastImportTime: null,
          lastImportSource: null,
        });
      },

      /**
       * Replace all materials (full import).
       */
      replaceMaterials: (materials: POLRMaterial[]) => {
        set({
          materials,
          lastImportTime: Date.now(),
        });
      },

      // =======================================================================
      // QUERIES
      // =======================================================================

      /**
       * Get a material by its POLR id.
       */
      getById: (id: string) => {
        return get().materials.find((m) => m.id === id);
      },

      /**
       * Get a material by its DNA id.
       */
      getByDnaId: (dnaId: string) => {
        return get().materials.find((m) => m.dnaId === dnaId);
      },

      /**
       * Get all materials with a specific chemistry.
       */
      getByChemistry: (chemistry: BaseChemistry) => {
        return get().materials.filter((m) => m.chemistry === chemistry);
      },

      /**
       * Get all materials from a specific manufacturer.
       */
      getByManufacturer: (manufacturer: string) => {
        const lowerMfr = manufacturer.toLowerCase();
        return get().materials.filter((m) =>
          m.manufacturer.toLowerCase().includes(lowerMfr)
        );
      },

      /**
       * Get all materials in a category.
       */
      getByCategory: (category: string) => {
        const lowerCat = category.toLowerCase();
        return get().materials.filter((m) =>
          m.category.toLowerCase().includes(lowerCat)
        );
      },

      /**
       * Search materials by name, manufacturer, product, or chemistry.
       */
      searchMaterials: (query: string) => {
        const lowerQuery = query.toLowerCase();
        return get().materials.filter((m) =>
          m.name.toLowerCase().includes(lowerQuery) ||
          m.manufacturer.toLowerCase().includes(lowerQuery) ||
          m.product.toLowerCase().includes(lowerQuery) ||
          m.chemistry.toLowerCase().includes(lowerQuery) ||
          m.category.toLowerCase().includes(lowerQuery)
        );
      },
    }),
    {
      name: 'polr-dna-materials',
      storage: createJSONStorage(() => localStorage),
      // Only persist the materials data, not the methods
      partialize: (state) => ({
        materials: state.materials,
        lastImportTime: state.lastImportTime,
        lastImportSource: state.lastImportSource,
      }),
    }
  )
);

// =============================================================================
// UTILITY HOOKS
// =============================================================================

/**
 * Hook to get material count.
 */
export function useMaterialCount(): number {
  return useDNAMaterialStore((state) => state.materials.length);
}

/**
 * Hook to get unique chemistries in the store.
 */
export function useChemistryList(): BaseChemistry[] {
  return useDNAMaterialStore((state) => {
    const chemistries = new Set<BaseChemistry>();
    for (const m of state.materials) {
      if (m.chemistry) {
        chemistries.add(m.chemistry as BaseChemistry);
      }
    }
    return Array.from(chemistries);
  });
}

/**
 * Hook to get unique manufacturers in the store.
 */
export function useManufacturerList(): string[] {
  return useDNAMaterialStore((state) => {
    const manufacturers = new Set<string>();
    for (const m of state.materials) {
      if (m.manufacturer) {
        manufacturers.add(m.manufacturer);
      }
    }
    return Array.from(manufacturers).sort();
  });
}

/**
 * Hook to get materials grouped by chemistry.
 */
export function useMaterialsByChemistry(): Map<string, POLRMaterial[]> {
  return useDNAMaterialStore((state) => {
    const grouped = new Map<string, POLRMaterial[]>();
    for (const m of state.materials) {
      const chemistry = m.chemistry || 'Unknown';
      if (!grouped.has(chemistry)) {
        grouped.set(chemistry, []);
      }
      grouped.get(chemistry)!.push(m);
    }
    return grouped;
  });
}

export default useDNAMaterialStore;
