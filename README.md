# 3D BIM Detail Viewer — Multi-Tenant SaaS Platform

**Browser-based 3D construction detail viewing for architecture and building enclosure professionals.**

View parapet assemblies, roofing details, air barriers, and waterproofing systems as interactive 3D models with layer-by-layer control, product identification, and GCP/Saint-Gobain integration.

---

## Quick Start

### Standalone Demo (no dependencies)

Open `demo/index.html` in any browser — double-click the file. No server, no install.

- 10-layer parapet wall assembly
- Layer toggles, quick filters (All / None / GCP Only)
- Exploded view and section cut
- Three.js r128 from CDN

### SaaS Platform (full stack)

```bash
# Prerequisites: Node.js 18+, PostgreSQL 14+

# Install dependencies
npm install

# Set up database
createdb bim_viewer
npm run --workspace=backend migrate
npm run --workspace=backend seed
# Seed login: admin@demo.com / demo123

# Run both frontend and backend
npm run dev
```

- **Frontend:** http://localhost:3000 (React + Vite)
- **Backend API:** http://localhost:3001 (Express)
- **Health check:** http://localhost:3001/api/health

---

## Architecture

```
holograph_details/
├── demo/                        # Standalone HTML demo (zero deps)
│   └── index.html
├── frontend/                    # React + Vite SaaS frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── viewer/          # Three.js 3D viewer
│   │   │   ├── layers/          # Layer panel, toggles, filters
│   │   │   ├── details/         # Dashboard, detail viewer
│   │   │   ├── auth/            # Login, register
│   │   │   └── layout/          # Header, footer
│   │   ├── contexts/            # Auth + Tenant React contexts
│   │   ├── services/            # API client with JWT
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
├── backend/                     # Express API (Node.js)
│   ├── src/
│   │   ├── middleware/           # Tenant resolution, JWT auth, errors
│   │   ├── routes/              # auth, details, tenants, products
│   │   ├── db/                  # PostgreSQL, migrations, seed
│   │   └── index.ts
│   └── package.json
├── shared/                      # Shared TypeScript types
│   └── types/
│       ├── tenant.ts
│       ├── detail.ts
│       ├── layer.ts
│       └── user.ts
├── polr-holographic-viewer/     # Original R&D prototype
└── package.json                 # Workspace root
```

---

## Multi-Tenant Design

- **Schema-per-tenant** PostgreSQL isolation
- Tenant resolved via `X-Tenant-ID` header or subdomain
- JWT auth with `{ userId, tenantId, role }` payload
- Roles: `admin`, `editor`, `viewer`
- Per-tenant branding (logo, colors, name)

### API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/health` | No | Health check |
| GET | `/api/tenants` | No | List tenants |
| POST | `/api/tenants` | No | Create tenant |
| POST | `/api/auth/login` | Tenant | Login, get JWT |
| POST | `/api/auth/register` | Tenant | Register user |
| GET | `/api/details` | JWT | List details |
| GET | `/api/details/:id` | JWT | Detail + layers |
| POST | `/api/details` | JWT (editor+) | Create detail |
| PUT | `/api/details/:id` | JWT (editor+) | Update detail |
| DELETE | `/api/details/:id` | JWT (admin) | Delete detail |
| GET | `/api/details/:id/layers` | JWT | Get layers |
| PUT | `/api/details/:id/layers` | JWT (editor+) | Update layers |
| GET | `/api/products` | JWT | Product catalog |
| GET | `/api/tenant/settings` | Tenant | Tenant branding |

---

## Parapet Detail — Layer Specification

| # | Layer | Color | Thickness | Product |
|---|-------|-------|-----------|---------|
| 1 | Structural Deck | #888888 | 6" | Concrete or steel deck |
| 2 | Vapor Retarder | #4488CC | thin | Below insulation |
| 3 | Insulation (Polyiso) | #FFCC00 | 3" | Tapered at roof edge |
| 4 | Cover Board | #CCCCCC | 0.5" | Gypsum or HD polyiso |
| 5 | Roofing Membrane | #333333 | 2-ply | **GCP** — base + cap sheet |
| 6 | Parapet Wall | #D4B896 | 36-48" | CMU or steel stud |
| 7 | Air Barrier | #228B22 | — | **GCP Perm-A-Barrier** |
| 8 | Metal Coping | #C0C0C0 | — | Drip edges both sides |
| 9 | Counter-Flashing | #808080 | — | Reglet, overlaps 4" |
| 10 | Sealant | #CC3333 | — | At reglet + coping joints |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, TypeScript, Vite |
| 3D Rendering | Three.js (r128+ CDN in demo, bundled in SaaS) |
| Backend | Express 4, Node.js |
| Database | PostgreSQL (schema-per-tenant) |
| Auth | JWT (bcryptjs, jsonwebtoken) |
| State | React Context (Auth, Tenant) |

---

## Build Status

| Component | Description | Status |
|-----------|-------------|--------|
| Standalone Demo | `demo/index.html` — zero-dependency Three.js viewer | **Working** |
| Frontend SaaS | React + Vite with 3D viewer, layer controls, auth | **Ready** |
| Backend API | Express + PostgreSQL with JWT auth, 14 endpoints | **Ready** |
| Multi-Tenant DB | Schema-per-tenant PostgreSQL isolation | **Ready** |
| Auth System | JWT with bcryptjs, role-based (admin/editor/viewer) | **Ready** |
| Deployment | Railway + Vercel configuration | **Pending** |

**Current Milestone:** Demo working, full SaaS stack ready for deployment.

---

## LDS Ecosystem

This repository is part of the Lefebvre Design Solutions construction technology platform:

| Repository | Description | Status |
|-----------|-------------|--------|
| [SUPA-SAINT](https://github.com/jenkintownelectricity/SUPA-SAINT) | Unified GCP/Saint-Gobain Super App (18 entities) | Assembler Phase |
| [GPC_Shop_Drawings](https://github.com/jenkintownelectricity/GPC_Shop_Drawings) | AI-powered shop drawing production | Alpha Complete |
| [construction_dna](https://github.com/jenkintownelectricity/construction_dna) | 20-tier material DNA taxonomy | Kernel Ready |
| [construction_development_scraper](https://github.com/jenkintownelectricity/construction_development_scraper) | Groq-based opportunity discovery | Production |
| **holograph_details** (this repo) | 3D BIM detail viewer (multi-tenant SaaS) | Demo Ready |

All repositories governed under LDS L0-command architecture with ValidKernel deterministic trust.

---

## License

3D BIM Detail Viewer is a trademark of Lefebvre Design Solutions LLC / ValidKernel.

**Dual License:**
- **Open License (Free):** Public, educational, open-source, and government use. Attribution required.
- **Commercial License:** Revenue-generating use requires separate commercial license. Contact Lefebvre Design Solutions LLC.

All deployments operate under ValidKernel deterministic trust infrastructure with RuleBind license enforcement and StrictRun execution logging.

---

## Author

**Armand Lefebvre**
Lefebvre Design Solutions LLC / ValidKernel

VALIDKERNEL &copy; 2026 — INFRASTRUCTURE FIRST. BORING BY DESIGN.

*Last Updated: 2026-02-15*
