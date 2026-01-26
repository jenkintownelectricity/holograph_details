# POLR Holographic Viewer - Architecture Documentation

## Document ID: ARCH-2026-0125
## Version: 1.0.0
## Last Updated: 2026-01-25

---

## System Overview

The POLR Holographic Viewer is a semantic 3D construction detail visualization system that achieves extreme compression ratios (2,500:1 to 5,600:1) by transmitting structured parameters instead of mesh data.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         POLR HOLOGRAPHIC VIEWER                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐               │
│  │ Construction │───▶│    DNA       │───▶│   Zustand    │               │
│  │   DNA ZIP    │    │   Adapter    │    │    Store     │               │
│  └──────────────┘    └──────────────┘    └──────────────┘               │
│                              │                   │                       │
│                              ▼                   ▼                       │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐               │
│  │   Semantic   │───▶│  Semantic to │───▶│  Holographic │               │
│  │    Detail    │    │     Mesh     │    │   Renderer   │               │
│  └──────────────┘    └──────────────┘    └──────────────┘               │
│         │                    │                   │                       │
│         ▼                    ▼                   ▼                       │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐               │
│  │   Or-Equal   │    │   Material   │    │   Three.js   │               │
│  │  Comparison  │    │   Factory    │    │    Scene     │               │
│  └──────────────┘    └──────────────┘    └──────────────┘               │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Core Modules

### 1. Semantic Compression Layer

**Location:** `schemas/semantic-detail.ts`

The semantic detail schema defines the structure for compressed construction details:

```typescript
interface SemanticDetail {
  id: string;                    // Unique identifier (e.g., "WP-003")
  category: DetailCategory;      // expansion-joint, air-barrier, etc.
  layers: Layer[];               // Ordered layer stack
  connections: Connection[];     // Joint specifications
  products: ProductReference[];  // Manufacturer products
  dimensions: Dimensions;        // Width, height, depth
}
```

**Compression Ratio:**
- Traditional mesh: 2-50 MB (100,000+ vertices)
- Semantic detail: 500-2000 bytes
- Result: 2,500:1 to 5,600:1 compression

### 2. Construction DNA Integration

**Location:** `adapters/`, `services/`, `stores/`, `utils/`

Pipeline for importing material data from Construction DNA repository:

```
┌─────────────────┐
│  DNA JSON/ZIP   │
│  (20-tier data) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   dna-import    │  services/dna-import.ts
│   (validation)  │  - JSON parsing
└────────┬────────┘  - ZIP extraction
         │           - Schema validation
         ▼
┌─────────────────┐
│   dna-adapter   │  adapters/dna-adapter.ts
│   (conversion)  │  - DNA → POLRMaterial
└────────┬────────┘  - Property mapping
         │
         ▼
┌─────────────────┐
│  material-store │  stores/dna-material-store.ts
│   (Zustand)     │  - localStorage persistence
└────────┬────────┘  - Search/lookup
         │
         ▼
┌─────────────────┐
│  dna-to-three   │  utils/dna-to-three.ts
│  (rendering)    │  - Three.js materials
└─────────────────┘  - PBR properties
```

**POLRMaterial Type:**
```typescript
interface POLRMaterial {
  id: string;
  name: string;
  manufacturer: string;
  category: MaterialCategory;
  color: string;
  roughness: number;
  metalness: number;
  opacity: number;
  chemistry?: string;
  properties?: Record<string, unknown>;
  failureModes?: string[];
  specSheetUrl?: string;
}
```

### 3. Or-Equal Comparison System

**Location:** `features/or-equal-comparison.ts`

Database of 334 products across 27 categories with confidence scoring:

```typescript
const PRODUCT_EQUIVALENCIES: Record<string, CategoryProducts> = {
  'membrane-tpo': {
    baseType: 'TPO Roofing Membrane',
    products: [
      { manufacturer: 'Carlisle SynTec', product: 'Sure-Weld TPO',
        thickness: 1.5, confidenceScore: 1.0 },
      // ... 18 more products
    ]
  },
  // ... 26 more categories
};
```

**Confidence Score Ranges:**
| Score | Rating | Auto-Substitution |
|-------|--------|-------------------|
| 1.00 | Reference Product | Yes |
| 0.95-0.99 | Direct Equivalent | Yes |
| 0.90-0.94 | Strong Equivalent | Yes |
| 0.85-0.89 | Acceptable Equivalent | With Review |
| <0.85 | Marginal | No |

### 4. 3D Rendering Pipeline

**Location:** `hologram/`

```
┌─────────────────┐
│ SemanticDetail  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ SemanticToMesh  │  hologram/semantic-to-mesh.ts
│   Converter     │  - Parse layer stack
└────────┬────────┘  - Generate geometries
         │           - Apply materials
         ▼
┌─────────────────┐
│  Holographic    │  hologram/holographic-renderer.ts
│    Renderer     │  - Three.js scene
└────────┬────────┘  - Post-processing
         │           - Orbit controls
         ▼
┌─────────────────┐
│   WebGL/WebXR   │
│     Output      │
└─────────────────┘
```

### 5. Material System

**Location:** `materials/`

```
┌─────────────────┐
│ base-materials  │  Core material definitions
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  manufacturers  │  Product → Material mapping
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ material-factory│  THREE.MeshStandardMaterial
└────────┬────────┘  generation with PBR textures
         │
         ▼
┌─────────────────┐
│ texture-library │  Procedural/AI/Photo textures
└─────────────────┘
```

---

## State Management

### Zustand Stores

**DNA Material Store:** `stores/dna-material-store.ts`
```typescript
interface DNAMaterialState {
  materials: POLRMaterial[];
  lastImportTime: Date | null;
  addMaterials: (materials: POLRMaterial[]) => void;
  clearMaterials: () => void;
  getById: (id: string) => POLRMaterial | undefined;
  searchMaterials: (query: string) => POLRMaterial[];
}
```

**Persistence:** localStorage via Zustand middleware
**Key:** `polr-dna-materials`

---

## Component Architecture

### React Components

```
App.tsx
├── Header
│   ├── DNAImportButton     # File upload UI
│   └── DNA Material Badge  # Import count
├── Detail Selector         # Choose detail to view
├── Layer Stack
│   ├── Layer Item          # Individual layer
│   └── LayerDNAPanel       # Expanded DNA details
│       └── SpecSheetLink   # External links
├── Hologram Viewport       # Three.js canvas
├── Comparison Panel        # Or-Equal comparison
└── Lighting Panel          # Lighting presets
```

### Component Props

**DNAImportButton:**
```typescript
interface Props {
  variant?: 'primary' | 'secondary';
  onImportComplete?: (count: number) => void;
}
```

**LayerDNAPanel:**
```typescript
interface Props {
  materialType: string;
  layerName: string;
}
```

---

## Data Flow

### DNA Import Flow

```
1. User clicks DNAImportButton
2. File dialog opens (.json, .zip)
3. dna-import.ts processes file
4. dna-adapter.ts converts to POLRMaterial[]
5. dna-material-store.ts persists to localStorage
6. UI updates with material count badge
7. LayerDNAPanel queries store for material data
8. dna-to-three.ts converts for 3D rendering
```

### Or-Equal Comparison Flow

```
1. User selects two manufacturers
2. ComparisonPanel queries PRODUCT_EQUIVALENCIES
3. Matching products identified per category
4. Confidence scores calculated
5. Visualization mode selected (side-by-side/overlay)
6. 3D scene updates with comparison view
```

---

## Testing Strategy

**Framework:** Vitest
**Location:** `tests/`

| Test File | Coverage |
|-----------|----------|
| features.test.ts | Or-Equal comparison logic |
| geometry.test.ts | Mesh generation |
| materials.test.ts | Texture library |

**Current Status:** 79 tests passing

**Run Tests:**
```bash
npm test           # All tests
npm test:watch     # Watch mode
npm test:coverage  # With coverage
```

---

## Build & Deploy

**Build Tool:** Vite 5
**Output:** `dist/`

```bash
npm run dev        # Development server (port 5173)
npm run dev:all    # Frontend + backend upload server
npm run build      # Production build
npm run preview    # Preview production build
```

---

## External Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| react | 18.x | UI framework |
| three | 0.160.x | 3D rendering |
| zustand | 5.x | State management |
| jszip | 3.x | ZIP file processing |
| typescript | 5.x | Type safety |
| vite | 5.x | Build tool |
| vitest | 2.x | Testing |

---

## Security Considerations

1. **File Upload Validation** - DNA imports validated against schema
2. **localStorage Limits** - ~5MB browser limit for material storage
3. **External Links** - Spec sheet URLs open in new tabs with noopener
4. **No Sensitive Data** - Material data is non-PII

---

## Future Enhancements

1. **WebXR Integration** - AR/VR mode activation
2. **Real-time Collaboration** - Multi-user sessions
3. **Cloud Storage** - Replace localStorage with cloud sync
4. **AI Texture Generation** - Scenario API integration
5. **Export Formats** - DXF, IFC, glTF export

---

*Architecture documentation for POLR Holographic Viewer v1.2.0*
