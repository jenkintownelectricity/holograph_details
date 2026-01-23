# POLR Holographic Viewer

**Holographic Construction Detail Viewer with Semantic Compression**

Transform construction shop drawings into interactive 3D holograms. View wall assemblies, roofing details, expansion joints, and penetrations as fully rendered 3D models with realistic PBR materials.

---

## Overview

The POLR Holographic Viewer converts semantic construction detail descriptions into fully rendered 3D scenes. Instead of storing massive volumetric data, we use a semantic compression approach that achieves remarkable compression ratios.

### Semantic Compression

| Approach | Data Size | Description |
|----------|-----------|-------------|
| Traditional 3D | ~50 MB | Volumetric mesh data |
| Semantic | ~500 bytes | Parameters + reconstruction |
| **Compression Ratio** | **1,900:1 to 5,000:1** | Lossless reconstruction |

A simple JSON description like "6-layer roofing assembly with EPDM membrane" is expanded at runtime into thousands of vertices with accurate materials, textures, and geometry.

---

## Features

### 3D Construction Details
- **5 Detail Categories:** Expansion joints, air barriers, roofing, foundation, penetrations
- **Realistic Geometry:** Accurate layer thicknesses, proper material stacking
- **Dynamic Generation:** Details built from semantic parameters at runtime

### Universal Material Library
- **20+ Base Material Types:** Membranes, insulation, substrates, sealants, flashings
- **Procedural PBR Textures:** Granular, rubberized, dimpled, concrete, metal finishes
- **Accurate Visual Properties:** Roughness, metalness, opacity based on real materials

### Camera Views
- **Plan View:** Top-down orthographic
- **Elevations:** North, South, East, West
- **Isometric:** NE, NW, SE, SW corners
- **Smooth Transitions:** Animated camera movements with easing

### Holographic Effects
- **Emissive Glow:** Subtle material luminescence
- **Wireframe Overlay:** Cyan wireframe for technical clarity
- **Scan Lines:** Animated horizontal scan effect
- **Auto-Rotate:** Continuous rotation for presentation

### Data Visualization
- **Layer Stack:** Visual breakdown of all assembly layers
- **Compression Stats:** Real-time semantic vs mesh size comparison
- **JSON Viewer:** Raw semantic data with copy functionality
- **Product Callouts:** GCP product specifications per layer

---

## Screenshots

> *Screenshots coming soon*

| View | Description |
|------|-------------|
| Main Interface | 3D viewport with control panels |
| Expansion Joint | Cross-section with membrane detail |
| Roofing Assembly | Parapet termination with coping |
| Material Library | PBR material examples |

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| **React 18** | UI components and state management |
| **Three.js** | WebGL 3D rendering engine |
| **TypeScript** | Type-safe development |
| **Vite** | Fast build tooling and HMR |
| **WebXR** | AR/VR device support |
| **OrbitControls** | Camera interaction |

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/jenkintownelectricity/holograph_details.git
cd holograph_details/polr-holographic-viewer

# Install dependencies
npm install

# Start development server
npm run dev
```

Open **http://localhost:3000** (or 3001 if 3000 is in use)

### Build for Production

```bash
npm run build
npm run preview
```

---

## Supported Manufacturers

The material library includes product mappings for:

| Manufacturer | Products |
|--------------|----------|
| **GCP Applied Technologies** | BITUTHENE, PERM-A-BARRIER, PREPRUFE |
| **Carlisle (CCW)** | MiraDRI, MiraFLEX, CCW-705 |
| **Sika** | Sikalastic, SikaProof |
| **Tremco** | TREMproof, Vulkem |
| **W.R. Meadows** | MEL-ROL, PRECON |
| **Henry Company** | Blueskin, Air-Bloc |
| **Firestone** | RubberGard EPDM, UltraPly TPO |
| **Dow** | THERMAX, STYROFOAM |

---

## Display Modes

| Mode | Status | Hardware Required |
|------|--------|-------------------|
| Standard 3D | Working | Any modern browser |
| AR (WebXR) | Ready* | Quest 3, Vision Pro, ARCore devices |
| VR (WebXR) | Ready* | Quest, Vive, Index, WMR headsets |
| Looking Glass | Planned | Looking Glass Portrait/Go |

*Requires WebXR-compatible browser and hardware

---

## Project Structure

```
polr-holographic-viewer/
├── App.tsx                 # Main application component
├── main.tsx                # React entry point
├── index.html              # HTML template
├── hologram/
│   ├── holographic-renderer.ts  # Three.js scene management
│   └── semantic-to-mesh.ts      # Semantic → 3D conversion
├── materials/
│   ├── base-materials.ts   # 20+ material definitions
│   ├── manufacturers.ts    # Product → material mappings
│   ├── material-factory.ts # PBR material generator
│   └── index.ts
├── schemas/
│   └── semantic-detail.ts  # TypeScript interfaces
├── data/
│   └── sample-details.ts   # Sample construction details
└── styles/
    └── app.css             # Futuristic dark theme
```

---

## Future Roadmap

### Near Term
- [ ] Additional construction details (50+)
- [ ] Detail editor/creator tool
- [ ] Measurement and dimension tools
- [ ] Export to CAD formats (DXF, IFC)

### Medium Term
- [ ] AR placement mode for mobile
- [ ] VR walkthrough experience
- [ ] Looking Glass integration
- [ ] Layer assembly animations
- [ ] Detail comparison view

### Long Term
- [ ] Cloud-based detail library
- [ ] AI-assisted detail generation
- [ ] BIM integration (Revit, ArchiCAD)
- [ ] Collaborative viewing sessions

---

## Development

### Debug Console Access

```javascript
// In browser console (F12)
window.scene       // Three.js scene object
window.camera      // Perspective camera
window.renderer    // WebGL renderer
window.holoRenderer // HolographicRenderer instance
```

### Adding New Materials

1. Define base material in `materials/base-materials.ts`
2. Map manufacturer products in `materials/manufacturers.ts`
3. Add texture generation if needed in `material-factory.ts`

### Adding New Details

1. Add detail to `data/sample-details.ts`
2. Implement builder method in `semantic-to-mesh.ts` if new category

See `PROJECT_LOG.md` for detailed development notes.

---

## License

Proprietary - Lefebvre Design Solutions / BuildingSystems.ai

---

## Author

**Armand Lefebvre**
Lefebvre Design Solutions
BuildingSystems.ai

---

*Built with semantic compression technology for the future of construction visualization.*
