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

## Features

### Semantic Compression
- TypeScript schema for construction details
- Layer stack definitions with materials
- Connection and joint specifications
- Product references (GCP products)

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
- **WebXR** - AR/VR support

## Getting Started

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Production build
npm run build
```

## Project Structure

```
src/
├── schemas/
│   └── semantic-detail.ts    # Core semantic compression schema
├── data/
│   └── sample-details.ts     # Sample construction details
├── hologram/
│   ├── semantic-to-mesh.ts   # 3D mesh generator
│   └── holographic-renderer.ts # WebGL renderer with effects
├── styles/
│   └── app.css               # Futuristic dark theme
├── App.tsx                   # Main React application
└── main.tsx                  # Entry point
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

This prototype was built per **L0-CMD-2026-0121-012** under ValidKernel governance.
