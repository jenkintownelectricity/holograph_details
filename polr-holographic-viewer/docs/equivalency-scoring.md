# Product Equivalency Scoring Methodology

## Document ID: L0-CMD-2026-0125-008-DOC
## Version: 1.0.0
## Last Updated: 2026-01-25

---

## Overview

The PRODUCT_EQUIVALENCIES database uses a confidence scoring system (0.0-1.0) to indicate how closely one manufacturer's product matches another for "or-equal" specifications.

---

## Confidence Score Ranges

| Score | Rating | Description | Auto-Substitution |
|-------|--------|-------------|-------------------|
| **1.00** | Reference Product | Industry standard, most commonly specified | Yes |
| **0.95-0.99** | Direct Equivalent | Same performance characteristics, major manufacturer | Yes |
| **0.90-0.94** | Strong Equivalent | Minor differences, proven track record | Yes |
| **0.85-0.89** | Acceptable Equivalent | Regional/specialty, adequate performance | With Review |
| **<0.85** | Marginal | Not recommended for automatic substitution | No |

---

## Scoring Factors

### 1. Market Position (40% weight)

- **National Distribution**: +0.05
- **FM/UL Approvals**: +0.05
- **Market Share >10%**: +0.05
- **Established Brand (>20 years)**: +0.03

### 2. Technical Performance (35% weight)

- **Published Test Data**: +0.05
- **Warranty Terms Equal/Better**: +0.05
- **Same Material Chemistry**: +0.10
- **Same Thickness/Dimension**: +0.05
- **Compatible with Standard Details**: +0.05

### 3. Application Considerations (25% weight)

- **Same Installation Method**: +0.05
- **No Additional Training Required**: +0.03
- **Widely Available**: +0.03
- **Competitive Pricing**: +0.02

---

## Category-Specific Guidelines

### Membranes (TPO, EPDM, PVC, Mod-Bit)

**Reference Products (1.0):**
- TPO: Carlisle Sure-Weld, Johns Manville TPO, Firestone UltraPly
- EPDM: Firestone RubberGard, Carlisle Sure-Seal
- PVC: Sika Sarnafil, Duro-Last
- Mod-Bit: SOPREMA SOPRASTAR, GAF Liberty

**Key Factors:**
- Membrane thickness equivalence critical
- Seam welding compatibility
- Accessory system availability

### Waterproofing Membranes

**Reference Products (1.0):**
- GCP BITUTHENE series
- Carlisle CCW MiraDRI series

**Key Factors:**
- Self-adhered vs. torch-applied
- Temperature range compatibility
- Primer system compatibility

### Insulation

**Reference Products (1.0):**
- Polyiso: Johns Manville ENRGY 3, GAF EnergyGuard
- XPS: Owens Corning FOAMULAR series

**Key Factors:**
- R-value equivalence
- Compressive strength (PSI)
- Facer type compatibility

### Coatings

**Reference Products (1.0):**
- Silicone: GE Enduris series
- Acrylic: Mule-Hide Premium Acrylic

**Key Factors:**
- Solids content
- UV stability
- Ponding water resistance

### Accessories (Sealants, Adhesives, Primers, Fasteners)

**Key Factors:**
- VOC compliance
- Temperature application range
- Cure time compatibility
- System warranty compatibility

---

## Scoring Examples

### Example 1: TPO Membrane Comparison

**Carlisle Sure-Weld TPO → Johns Manville TPO**
- Same chemistry (TPO): +0.10
- Same thickness options: +0.05
- National distribution: +0.05
- FM/UL approvals: +0.05
- Same installation method: +0.05
- **Base Score: 0.97**

### Example 2: Self-Adhered Waterproofing

**GCP BITUTHENE 3000 → Tremco TREMproof 250GC**
- Same chemistry: +0.10
- Same thickness: +0.05
- National distribution: +0.05
- Established brand: +0.03
- Different primer required: -0.03
- **Base Score: 0.95**

---

## Update Protocol

### When to Update Scores

1. **Product Discontinuation**: Remove from database
2. **New Product Launch**: Add with provisional 0.90 score
3. **Warranty Change**: Adjust by ±0.02
4. **Acquisition/Merger**: Verify product continuity
5. **Test Data Publication**: Adjust per performance

### Review Schedule

- **Quarterly**: Review top 10 products per category
- **Annually**: Full database audit
- **As Needed**: Manufacturer requests, market changes

---

## Limitations

1. **Scores are approximations** - actual performance may vary
2. **Local availability** not factored into scores
3. **Project-specific conditions** may affect suitability
4. **Warranty coordination** requires verification
5. **Code compliance** must be verified separately

---

## Data Sources

- Manufacturer spec sheets
- FM Approvals RoofNav database
- UL Product iQ
- NRCA Technical Bulletins
- Industry specification guides

---

*This methodology is proprietary to the POLR Or-Equal Comparison system.*
