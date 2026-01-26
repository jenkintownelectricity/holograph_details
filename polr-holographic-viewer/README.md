# POLR Holographic Viewer

**Semantic 3D Construction Detail Visualization with Holographic Effects**

R&D Prototype | BuildingSystems.ai × Lefebvre Design Solutions

---

## Overview

This prototype demonstrates the power of **semantic compression** for construction detail visualization. Instead of transmitting multi-megabyte 3D mesh files, we compress construction details to ~500-2000 bytes of semantic data and reconstruct full 3D models client-side.

### Key Innovation

```
Traditional: 2-50 MB mesh file with 100,000+ vertices
Semantic:    500-2000 bytes of structured parameters
────────────────────────────────────────────────────
Compression: 2,500:1 to 5,600:1 ratio
```

### Latest Additions (v1.2.0)

- **Construction DNA Integration** - Import 20-tier material DNA from JSON/ZIP files
- **Expanded Equivalency Database** - 334 products across 27 categories from 28+ manufacturers
- **Or-Equal Comparison Visualization** - Side-by-side and overlay comparison modes

## Features

### Semantic Compression
- TypeScript schema for construction details
- Layer stack definitions with materials
- Connection and joint specifications
- Product references (GCP products)

### Construction DNA Integration
- Import material data from Construction DNA JSON/ZIP files
- 20-tier material DNA with chemistry, properties, failure modes
- Zustand-powered persistent storage (localStorage)
- Three.js material conversion from DNA properties
- Layer panel shows expanded DNA details with spec sheet links

### Or-Equal Comparison System
- **334 products** across **27 material categories**
- **28+ manufacturers** with confidence scoring (0.85-1.0)
- Comparison modes: side-by-side and overlay
- Auto-substitution recommendations based on equivalency scores
- Categories include:
  - Membranes (TPO, EPDM, PVC, Mod-Bit, Self-Adhered)
  - Insulation (Polyiso, XPS)
  - Coatings (Silicone, Acrylic, Liquid-Applied)
  - Accessories (Sealants, Adhesives, Fasteners, Primers, Flashing)
  - Substrates (Concrete, CMU, Steel, Wood, Gypsum, Aluminum)

### 3D Model Generation
- Real-time mesh generation from semantic data
- Support for multiple detail types:
  - Expansion joints
  - Air barriers
  - Roof assemblies
  - Foundation walls
  - Pipe penetrations

### Holographic Rendering
- Three.js WebGL renderer
- Futuristic holographic effects:
  - Cyan/magenta glow
  - Wireframe overlay
  - Scan lines shader
  - Subtle flicker animation
- Orbit controls with auto-rotate

### WebXR Ready
- AR mode support (WebXR immersive-ar)
- VR mode support (WebXR immersive-vr)
- Looking Glass display placeholder

## Sample Details Included

| ID | Name | Category | Products |
|----|------|----------|----------|
| WP-003 | Expansion Joint at Foundation Wall | expansion-joint | BITUTHENE 3000, SIKAFLEX-1A |
| AB-001 | Air Barrier at Window Head | air-barrier | R-GUARD FASTFLASH, VYCOR PLUS |
| RF-002 | Roof Edge Termination | roofing | RUBBERGARD EPDM, INSULFOAM |
| FD-001 | Foundation to Slab-on-Grade | foundation | BITUTHENE 3000, HYDRODUCT 220 |
| PN-001 | Pipe Penetration | penetration | BITUTHENE 3000, SIKAFLEX-1A |

## Technology Stack

- **React 18** - UI framework
- **Three.js 0.160** - WebGL 3D rendering
- **TypeScript 5** - Type-safe development
- **Vite 5** - Build tool
- **Zustand 5** - State management with localStorage persistence
- **JSZip** - ZIP file processing for DNA imports
- **WebXR** - AR/VR support
- **Vitest** - Testing framework (79 tests passing)

## Getting Started

```bash
# Install dependencies
npm install

# Development server (frontend only)
npm run dev

# Development server (frontend + backend upload server)
npm run dev:all

# Production build
npm run build

# Run tests
npm run test

# Type check
npm run type-check
```

## Integrated Modules (L0-CMD-2026-0125-001)

This version integrates the POLR Strategic Development modules:

| Module | Location | Description |
|--------|----------|-------------|
| AI Texture Generator | `materials/ai-texture-generator.ts` | Scenario AI integration for photorealistic textures |
| Texture Library | `materials/texture-library.ts` | 25+ procedural/hybrid textures |
| Realistic Details | `geometry/realistic-details.ts` | Fasteners, sealants, termination bars, stress plates |
| Lighting Setup | `rendering/lighting-setup.ts` | 5 lighting presets (studio, outdoor, etc.) |
| Post-Processing | `rendering/post-processing.ts` | SSAO, bloom, SMAA, color correction |
| OR-Equal Comparison | `features/or-equal-comparison.ts` | Manufacturer equivalency engine |
| Spec Integration | `features/spec-integration.ts` | CSI 3-part specification generation |
| Embeddable Widget | `embed/widget.ts` | Third-party website integration |
| REST API | `api/routes.ts` | Programmatic access endpoints |

### Using the Demo Component

```tsx
import { ManufacturerComparison } from './demos';

// In your component:
<ManufacturerComparison
  onCompare={({ mfr1, mfr2, mode }) => {
    console.log(`Comparing ${mfr1} vs ${mfr2} in ${mode} mode`);
  }}
/>
```

## Project Structure

```
polr-holographic-viewer/
├── schemas/
│   └── semantic-detail.ts        # Core semantic compression schema
├── data/
│   ├── sample-details.ts         # Sample construction details
│   └── manufacturer-coverage.json # Manufacturer coverage matrix
├── docs/
│   ├── PATENT_DOCUMENTATION.md   # Patent claims documentation
│   └── equivalency-scoring.md    # Scoring methodology
├── hologram/
│   ├── semantic-to-mesh.ts       # 3D mesh generator
│   └── holographic-renderer.ts   # WebGL renderer with effects
├── adapters/
│   └── dna-adapter.ts            # Construction DNA → POLR converter
├── services/
│   └── dna-import.ts             # DNA JSON/ZIP import service
├── stores/
│   └── dna-material-store.ts     # Zustand DNA material state
├── utils/
│   └── dna-to-three.ts           # DNA → Three.js material converter
├── materials/
│   ├── index.ts                  # Barrel export
│   ├── base-materials.ts         # Core material definitions
│   ├── manufacturers.ts          # Manufacturer product mappings
│   ├── material-factory.ts       # PBR material generator
│   ├── texture-library.ts        # Hybrid texture system
│   └── ai-texture-generator.ts   # AI-assisted texture generation
├── geometry/
│   ├── index.ts                  # Barrel export
│   └── realistic-details.ts      # Fasteners, sealants, termination bars
├── rendering/
│   ├── index.ts                  # Barrel export
│   ├── lighting-setup.ts         # 5 lighting presets
│   └── post-processing.ts        # SSAO, bloom, SMAA
├── features/
│   ├── index.ts                  # Barrel export
│   ├── or-equal-comparison.ts    # 334 products, 27 categories
│   └── spec-integration.ts       # CSI specification generation
├── embed/
│   ├── index.ts                  # Barrel export
│   └── widget.ts                 # Embeddable viewer widget
├── api/
│   ├── index.ts                  # Barrel export
│   └── routes.ts                 # REST API definitions
├── components/
│   ├── ComparisonPanel.tsx       # OR-Equal UI component
│   ├── LightingPanel.tsx         # Lighting preset selector
│   ├── ZipUpload.tsx             # Assembly upload component
│   ├── DNAImportButton.tsx       # DNA file upload UI
│   ├── LayerDNAPanel.tsx         # Layer DNA details panel
│   └── SpecSheetLink.tsx         # Manufacturer spec sheet links
├── demos/
│   ├── index.ts                  # Barrel export
│   └── ManufacturerComparison.tsx # Demo: Compare manufacturers
├── server/
│   ├── index.ts                  # Express upload server
│   └── zip-processor.ts          # Assembly extraction
├── tests/
│   ├── features.test.ts          # OR-Equal comparison tests
│   ├── geometry.test.ts          # Geometry generation tests
│   └── materials.test.ts         # Texture library tests
├── styles/
│   └── app.css                   # Futuristic dark theme
├── App.tsx                       # Main React application
├── main.tsx                      # Entry point
└── vitest.config.ts              # Test configuration
```

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    SEMANTIC DETAIL                          │
│  {                                                          │
│    id: "WP-003",                                            │
│    category: "expansion-joint",                             │
│    layers: [...],                                           │
│    connections: [...],                                      │
│    products: [...]                                          │
│  }                                                          │
│                     ~500 bytes                              │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              SEMANTIC-TO-MESH CONVERTER                     │
│                                                             │
│  • Parse parameters                                         │
│  • Generate THREE.js geometries                             │
│  • Apply materials with properties                          │
│  • Build spatial relationships                              │
│                                                             │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              HOLOGRAPHIC RENDERER                           │
│                                                             │
│  • THREE.js WebGL rendering                                 │
│  • Holographic post-processing                              │
│  • Orbit controls                                           │
│  • WebXR integration                                        │
│                                                             │
│                    ~2 MB equivalent                         │
└─────────────────────────────────────────────────────────────┘
```

## New Features (v1.2.0)

### Construction DNA Integration (L0-CMD-2026-0125-005)
- **DNA Import** - Upload JSON/ZIP files from Construction DNA repository
- **Material Store** - Zustand-powered persistence with localStorage
- **3D Visualization** - DNA chemistry mapped to Three.js material properties
- **Layer Details** - Expandable panels showing 20-tier material DNA
- **Spec Sheet Links** - Direct links to manufacturer specification sheets

### Expanded Equivalency Database (L0-CMD-2026-0125-008)
- **334 Products** - Up from ~116 products (188% increase)
- **27 Categories** - Added 6 substrate types
- **Confidence Scoring** - 0.85-1.0 scale for equivalency recommendations
- **Documentation** - Full scoring methodology in `docs/equivalency-scoring.md`

## Features (v1.1.0)

### Track A: Photorealistic Rendering
- **Texture Library** - Hybrid procedural/AI/photo texture system with 25+ materials
- **Lighting Presets** - Studio, outdoor, overcast, technical, and dramatic lighting modes
- **Material Categories** - Membranes, insulation, concrete, metal, sealants, drainage

### Track B: Patentable Features
- **Or-Equal Comparison** - Compare products across 28+ manufacturers
- **Specification Integration** - CSI 3-part spec generation (coming soon)
- **Embeddable Widget** - For manufacturer websites (coming soon)
- **REST API** - Programmatic access (coming soon)

### Manufacturer Support (28+ Manufacturers)

**Tier 1 - Major National Manufacturers:**
- Carlisle SynTec (24 products, 98% coverage)
- Johns Manville (22 products, 97% coverage)
- GAF (20 products, 96% coverage)
- GCP Applied Technologies (18 products, 95% coverage)
- Firestone (18 products, 95% coverage)
- SOPREMA (20 products, 94% coverage)
- Tremco (20 products, 92% coverage)

**Tier 2 - Regional/Specialty:**
- W.R. Meadows, Henry Company, Mule-Hide, Versico, Duro-Last
- Polyglass, Sika, Sika Sarnafil, Carlisle CCW

**Tier 3 - Category Specialists:**
- Hunter Panels, Atlas Roofing, Rmax (Insulation)
- Georgia-Pacific, USG, CertainTeed (Substrates)
- Owens Corning, DuPont, Kingspan (XPS)
- GenFlex, IB Roof Systems (Membranes)

## Future Roadmap

### Hardware Integration
- [ ] Looking Glass display support
- [ ] Meta Quest 3 AR passthrough
- [ ] Apple Vision Pro visionOS
- [ ] HoloLens 2 integration
- [ ] Swave HXR (future tech)

### Features
- [ ] Real-time collaboration
- [ ] Voice annotations
- [ ] Measurement tools
- [ ] QR code detail linking
- [ ] POLR library integration

### Transmission Protocol
```typescript
// ~10 KB/s holographic stream vs ~50 MB/s volumetric video
interface HologramStreamPacket {
  timestamp: number;
  semantic: SemanticDetail;  // ~500 bytes
  audio?: ArrayBuffer;       // Optional voice
  gestures?: GestureData;    // Hand positions
}
```

## Applications

1. **Construction Site Review** - AR glasses for on-site detail inspection
2. **Client Presentations** - Holographic table display
3. **Remote Collaboration** - Share 3D details in real-time
4. **Training** - Apprentices examine details from all angles
5. **Quality Control** - Compare as-built to holographic spec

---

## License

MIT License - BuildingSystems.ai × Lefebvre Design Solutions

## Command Reference

This prototype was built under **ValidKernel L0 Governance**:

| Command ID | Description | Status |
|------------|-------------|--------|
| L0-CMD-2026-0121-012 | Initial holographic viewer prototype | Complete |
| L0-CMD-2026-0125-001 | Track A/B module integration | Complete |
| L0-CMD-2026-0125-003 | Or-Equal comparison visualization | Complete |
| L0-CMD-2026-0125-004 | MaterialType mapping + DNA integration | Complete |
| L0-CMD-2026-0125-005 | Construction DNA to POLR data pipeline | Complete |
| L0-CMD-2026-0125-008 | Equivalency database expansion (334 products) | Complete |

## Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

**Current Status:** 79 tests passing
