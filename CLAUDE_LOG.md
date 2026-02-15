# CLAUDE_LOG -- Holograph Details

Complete log of every change, decision, problem, solution, and open item for the 3D BIM Detail Viewer multi-tenant SaaS platform.

**Repository:** holograph_details
**Branch:** `claude/entity-extraction-scaffold-5vKZG`
**Created:** 2026-02-15

---

## Session 1 -- Platform Build (Initial Build)

### Changes Made
1. **Created `demo/index.html`** -- Standalone zero-dependency 3D detail viewer
   - 10-layer parapet wall assembly (structural deck through sealant)
   - Layer toggles with individual visibility controls
   - Quick filters: All / None / GCP Only
   - Exploded view and section cut modes
   - Three.js r128 loaded from CDN
   - Double-click to open — no server, no install

2. **Created `frontend/`** -- React + Vite SaaS frontend
   - `components/viewer/` -- Three.js 3D viewer with orbit controls
   - `components/layers/` -- Layer panel with toggles and filters
   - `components/details/` -- Dashboard and detail viewer pages
   - `components/auth/` -- Login and register forms
   - `components/layout/` -- Header and footer
   - `contexts/` -- Auth and Tenant React contexts with JWT
   - `services/` -- API client with automatic JWT injection

3. **Created `backend/`** -- Express API server
   - `middleware/` -- Tenant resolution (X-Tenant-ID header or subdomain), JWT auth, error handling
   - `routes/auth.ts` -- Login (POST) and register (POST) endpoints
   - `routes/details.ts` -- CRUD for construction details with layer management
   - `routes/tenants.ts` -- Tenant creation and listing
   - `routes/products.ts` -- Product catalog endpoint
   - `db/` -- PostgreSQL connection, migrations (schema-per-tenant), seed data
   - 14 API endpoints total

4. **Created `shared/types/`** -- Shared TypeScript type definitions
   - `tenant.ts` -- Tenant model (name, subdomain, branding)
   - `detail.ts` -- Construction detail model
   - `layer.ts` -- Layer model (material, color, thickness, product)
   - `user.ts` -- User model with roles (admin, editor, viewer)

5. **Created `polr-holographic-viewer/`** -- Original R&D prototype (preserved)

6. **Created `package.json`** -- Workspace root with npm workspaces

### Decisions
- **D-001:** Schema-per-tenant PostgreSQL isolation chosen over row-level security — stronger data isolation for construction firms handling sensitive project data
- **D-002:** Tenant resolved via `X-Tenant-ID` header (API) or subdomain (web) — supports both programmatic and browser access
- **D-003:** JWT payload carries `{ userId, tenantId, role }` — tenant context embedded in token, no database lookup needed per request
- **D-004:** Three.js version pinned at r128 in demo (CDN), bundled in SaaS frontend — ensures consistent 3D rendering
- **D-005:** 10-layer parapet wall assembly as default demo — represents real GCP/Saint-Gobain building envelope detail with Perm-A-Barrier air barrier

### Parapet Detail Specification
| Layer | Material | GCP Product |
|-------|----------|-------------|
| 1 | Structural Deck | Concrete/steel |
| 2 | Vapor Retarder | Below insulation |
| 3 | Insulation (Polyiso) | Tapered at edge |
| 4 | Cover Board | Gypsum/HD polyiso |
| 5 | Roofing Membrane | **GCP** base + cap |
| 6 | Parapet Wall | CMU/steel stud |
| 7 | Air Barrier | **GCP Perm-A-Barrier** |
| 8 | Metal Coping | Drip edges |
| 9 | Counter-Flashing | Reglet, 4" overlap |
| 10 | Sealant | Reglet + coping joints |

### Status at Session End
- Standalone demo: Working (open HTML file in browser)
- SaaS frontend: Built with React + Vite + Three.js
- SaaS backend: Built with Express + PostgreSQL (schema-per-tenant)
- 14 API endpoints defined and implemented
- Seed data: admin@demo.com / demo123
- Deployment: Pending (Railway + Vercel configs ready)

---

## Session 2 -- Ecosystem Documentation Sync (2026-02-15)

### Command Executed
**L0-CMD-2026-0215-002** -- Ecosystem Documentation Update across all 5 LDS repositories

### Changes Made
1. **Updated `README.md`** -- Added Build Status section, Ecosystem Links block, "Last Updated" timestamp
2. **Created `CLAUDE_LOG.md`** -- This file, documenting complete session history

### Status at Session End
- README updated with ecosystem links cross-referencing all 5 LDS repos
- CLAUDE_LOG created with full build history
- Governance alignment with LDS L0-command architecture
