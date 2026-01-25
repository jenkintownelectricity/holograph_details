/**
 * Specification Integration
 * POLR Strategic Development - Phase B2.2
 * 
 * Generate CSI 3-part specifications from visual details
 * Parse specifications to create visual details
 * 
 * @module features/spec-integration
 * @version 1.0.0
 */

import { PRODUCT_EQUIVALENCIES } from './or-equal-comparison';

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export type SpecFormat = 'masterspec' | 'speclink' | 'generic' | 'abbreviated';

export interface SemanticDetail {
  id: string;
  name: string;
  description: string;
  category: string;
  layers: SemanticLayer[];
}

export interface SemanticLayer {
  id: string;
  materialType: string;
  thickness: number;
  material: {
    manufacturer?: string;
    product?: string;
  };
}

export interface SpecificationSection {
  number: string;
  title: string;
  part1General: string;
  part2Products: string;
  part3Execution: string;
}

export interface ParsedSpecification {
  sectionNumber: string;
  sectionTitle: string;
  products: ParsedProduct[];
  executionNotes: string[];
}

export interface ParsedProduct {
  description: string;
  manufacturer?: string;
  productName?: string;
  thickness?: number;
  orEquals?: string[];
}

// =============================================================================
// CSI SECTION MAPPING
// =============================================================================

const CSI_SECTIONS: Record<string, { number: string; title: string }> = {
  'waterproofing': { number: '07 10 00', title: 'DAMPPROOFING AND WATERPROOFING' },
  'below-grade-waterproofing': { number: '07 11 00', title: 'DAMPPROOFING' },
  'membrane-waterproofing': { number: '07 13 00', title: 'SHEET WATERPROOFING' },
  'air-barrier': { number: '07 27 00', title: 'AIR BARRIERS' },
  'vapor-retarder': { number: '07 26 00', title: 'VAPOR RETARDERS' },
  'roofing': { number: '07 50 00', title: 'MEMBRANE ROOFING' },
  'tpo-roofing': { number: '07 54 23', title: 'THERMOPLASTIC POLYOLEFIN ROOFING' },
  'epdm-roofing': { number: '07 53 23', title: 'ETHYLENE-PROPYLENE-DIENE-MONOMER ROOFING' },
  'mod-bit-roofing': { number: '07 52 00', title: 'MODIFIED BITUMINOUS MEMBRANE ROOFING' },
  'insulation': { number: '07 21 00', title: 'THERMAL INSULATION' },
  'flashing': { number: '07 62 00', title: 'SHEET METAL FLASHING AND TRIM' },
  'sealants': { number: '07 92 00', title: 'JOINT SEALANTS' },
  'foundation': { number: '07 11 13', title: 'BITUMINOUS DAMPPROOFING' }
};

// =============================================================================
// SPECIFICATION GENERATOR CLASS
// =============================================================================

export class SpecificationIntegration {

  /**
   * Generate CSI 3-part specification from semantic detail
   */
  generateSpecification(
    detail: SemanticDetail,
    format: SpecFormat = 'generic',
    options?: {
      includeOrEquals?: boolean;
      maxOrEquals?: number;
      includeSubmittals?: boolean;
    }
  ): string {
    const section = this.getCSISection(detail.category);
    const opts = { includeOrEquals: true, maxOrEquals: 3, includeSubmittals: true, ...options };

    let spec = '';

    // Header
    spec += `SECTION ${section.number}\n`;
    spec += `${section.title}\n\n`;

    // Part 1 - General
    spec += this.generatePart1(detail, format, opts);

    // Part 2 - Products
    spec += this.generatePart2(detail, format, opts);

    // Part 3 - Execution
    spec += this.generatePart3(detail, format);

    return spec;
  }

  /**
   * Generate abbreviated specification (for quick reference)
   */
  generateAbbreviated(detail: SemanticDetail): string {
    const section = this.getCSISection(detail.category);
    let spec = `${section.number} - ${section.title}\n\n`;
    spec += `Detail: ${detail.name}\n`;
    spec += `Description: ${detail.description}\n\n`;
    spec += `MATERIALS:\n`;

    detail.layers.forEach((layer, index) => {
      const letter = String.fromCharCode(65 + index);
      const product = layer.material.product || this.inferProductDescription(layer.materialType);
      const mfr = layer.material.manufacturer || 'As specified';
      spec += `${letter}. ${product}\n`;
      spec += `   Manufacturer: ${mfr}\n`;
      if (layer.thickness) spec += `   Thickness: ${layer.thickness}mm\n`;
      spec += '\n';
    });

    return spec;
  }

  /**
   * Parse specification text to extract product information
   */
  parseSpecification(specText: string): ParsedSpecification {
    const result: ParsedSpecification = {
      sectionNumber: '',
      sectionTitle: '',
      products: [],
      executionNotes: []
    };

    // Extract section header
    const sectionMatch = specText.match(/SECTION\s+([\d\s]+)\s*\n\s*([A-Z\s]+)/i);
    if (sectionMatch) {
      result.sectionNumber = sectionMatch[1].trim();
      result.sectionTitle = sectionMatch[2].trim();
    }

    // Extract products from Part 2
    const part2Match = specText.match(/PART 2.*?(?=PART 3|$)/si);
    if (part2Match) {
      result.products = this.extractProducts(part2Match[0]);
    }

    // Extract execution notes from Part 3
    const part3Match = specText.match(/PART 3.*$/si);
    if (part3Match) {
      result.executionNotes = this.extractExecutionNotes(part3Match[0]);
    }

    return result;
  }

  /**
   * Convert parsed specification to semantic detail structure
   */
  specToDetail(parsed: ParsedSpecification, detailId: string): Partial<SemanticDetail> {
    return {
      id: detailId,
      name: parsed.sectionTitle,
      category: this.inferCategoryFromSection(parsed.sectionNumber),
      layers: parsed.products.map((product, index) => ({
        id: `layer-${index}`,
        materialType: this.inferMaterialType(product.description),
        thickness: product.thickness || 0,
        material: {
          manufacturer: product.manufacturer,
          product: product.productName
        }
      }))
    };
  }

  /**
   * Generate "or equal" substitution language
   */
  generateOrEqualClause(
    manufacturer: string,
    product: string,
    maxAlternatives: number = 3
  ): string {
    const equivalents = this.findEquivalents(manufacturer, product);
    
    if (equivalents.length === 0) {
      return `${manufacturer} "${product}" or approved equal.`;
    }

    const topEquivalents = equivalents
      .sort((a, b) => b.confidenceScore - a.confidenceScore)
      .slice(0, maxAlternatives);

    let clause = `${manufacturer} "${product}"`;
    
    if (topEquivalents.length > 0) {
      const altList = topEquivalents
        .map(e => `${e.manufacturer} "${e.productName}"`)
        .join('; ');
      clause += `; or equal: ${altList}`;
    }

    clause += '.';
    return clause;
  }

  // ===========================================================================
  // PRIVATE METHODS - PART GENERATION
  // ===========================================================================

  private generatePart1(
    detail: SemanticDetail,
    format: SpecFormat,
    opts: { includeSubmittals?: boolean }
  ): string {
    let part1 = `PART 1 - GENERAL\n\n`;

    // 1.01 Summary
    part1 += `1.01 SUMMARY\n\n`;
    part1 += `A. Section includes: ${detail.description}\n\n`;
    part1 += `B. Related Sections:\n`;
    part1 += `   1. Section 03 30 00 - Cast-in-Place Concrete\n`;
    part1 += `   2. Section 07 92 00 - Joint Sealants\n\n`;

    // 1.02 References
    part1 += `1.02 REFERENCES\n\n`;
    part1 += `A. ASTM International:\n`;
    part1 += `   1. ASTM D412 - Vulcanized Rubber and Thermoplastic Elastomers\n`;
    part1 += `   2. ASTM E96 - Water Vapor Transmission\n\n`;

    // 1.03 Submittals
    if (opts.includeSubmittals) {
      part1 += `1.03 SUBMITTALS\n\n`;
      part1 += `A. Product Data: Submit manufacturer's technical data for each product.\n\n`;
      part1 += `B. Shop Drawings: Submit details of conditions requiring special attention.\n\n`;
      part1 += `C. Samples: Submit samples of each membrane and accessory material.\n\n`;
    }

    // 1.04 Quality Assurance
    part1 += `1.04 QUALITY ASSURANCE\n\n`;
    part1 += `A. Installer Qualifications: Minimum 5 years experience with specified systems.\n\n`;
    part1 += `B. Manufacturer Qualifications: Minimum 10 years manufacturing specified products.\n\n`;

    // 1.05 Delivery & Storage
    part1 += `1.05 DELIVERY, STORAGE, AND HANDLING\n\n`;
    part1 += `A. Deliver materials in original, unopened packaging.\n\n`;
    part1 += `B. Store materials protected from weather, moisture, and UV exposure.\n\n`;

    return part1;
  }

  private generatePart2(
    detail: SemanticDetail,
    format: SpecFormat,
    opts: { includeOrEquals?: boolean; maxOrEquals?: number }
  ): string {
    let part2 = `PART 2 - PRODUCTS\n\n`;
    part2 += `2.01 MATERIALS\n\n`;

    detail.layers.forEach((layer, index) => {
      const letter = String.fromCharCode(65 + index);
      const productName = layer.material.product || this.inferProductDescription(layer.materialType);
      const manufacturer = layer.material.manufacturer || 'As specified';

      part2 += `${letter}. ${this.formatMaterialType(layer.materialType)}:\n`;
      part2 += `   1. Manufacturer: ${manufacturer}\n`;
      part2 += `   2. Product: ${productName}\n`;
      
      if (layer.thickness) {
        part2 += `   3. Thickness: ${layer.thickness}mm minimum\n`;
      }

      // Add "or equal" clause
      if (opts.includeOrEquals && layer.material.manufacturer && layer.material.product) {
        const equivalents = this.findEquivalents(layer.material.manufacturer, layer.material.product);
        if (equivalents.length > 0) {
          const topEq = equivalents.slice(0, opts.maxOrEquals);
          part2 += `   ${layer.thickness ? 4 : 3}. Or Equal:\n`;
          topEq.forEach((eq, i) => {
            part2 += `      ${String.fromCharCode(97 + i)}. ${eq.manufacturer} "${eq.productName}"\n`;
          });
        }
      }

      part2 += '\n';
    });

    // Accessories
    part2 += `2.02 ACCESSORIES\n\n`;
    part2 += `A. Primers: As recommended by membrane manufacturer.\n\n`;
    part2 += `B. Sealants: Compatible with membrane system.\n\n`;
    part2 += `C. Termination Bars: Extruded aluminum, pre-punched, mill finish.\n\n`;
    part2 += `D. Fasteners: As recommended by manufacturer for substrate.\n\n`;

    return part2;
  }

  private generatePart3(detail: SemanticDetail, format: SpecFormat): string {
    let part3 = `PART 3 - EXECUTION\n\n`;

    // Examination
    part3 += `3.01 EXAMINATION\n\n`;
    part3 += `A. Verify substrate is clean, dry, and free of defects.\n\n`;
    part3 += `B. Verify ambient and substrate temperatures meet manufacturer requirements.\n\n`;
    part3 += `C. Report unsatisfactory conditions in writing.\n\n`;

    // Preparation
    part3 += `3.02 PREPARATION\n\n`;
    part3 += `A. Clean substrate of dust, debris, and loose material.\n\n`;
    part3 += `B. Apply primer where required by manufacturer.\n\n`;
    part3 += `C. Allow primer to dry per manufacturer recommendations.\n\n`;

    // Installation
    part3 += `3.03 INSTALLATION\n\n`;
    part3 += `A. Install in accordance with manufacturer's written instructions.\n\n`;
    part3 += `B. Maintain minimum laps as specified by manufacturer.\n\n`;
    part3 += `C. Seal all penetrations, terminations, and transitions watertight.\n\n`;
    part3 += `D. Refer to Detail ${detail.id} for assembly configuration.\n\n`;

    // Protection
    part3 += `3.04 PROTECTION\n\n`;
    part3 += `A. Protect installed work from damage until covered.\n\n`;
    part3 += `B. Repair damaged areas per manufacturer recommendations.\n\n`;

    part3 += `END OF SECTION\n`;

    return part3;
  }

  // ===========================================================================
  // PRIVATE METHODS - UTILITIES
  // ===========================================================================

  private getCSISection(category: string): { number: string; title: string } {
    return CSI_SECTIONS[category] || CSI_SECTIONS['waterproofing'];
  }

  private formatMaterialType(type: string): string {
    return type
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  private inferProductDescription(materialType: string): string {
    const descriptions: Record<string, string> = {
      'membrane-self-adhered': 'Self-adhered waterproofing membrane',
      'membrane-air-barrier': 'Self-adhered air barrier membrane',
      'membrane-tpo': 'TPO single-ply roofing membrane',
      'membrane-epdm': 'EPDM roofing membrane',
      'insulation-xps': 'Extruded polystyrene insulation',
      'insulation-polyiso': 'Polyisocyanurate insulation',
      'drainage-composite': 'Drainage composite board',
      'protection-board': 'Semi-rigid protection board'
    };
    return descriptions[materialType] || materialType;
  }

  private findEquivalents(manufacturer: string, product: string): Array<{
    manufacturer: string;
    productName: string;
    confidenceScore: number;
  }> {
    for (const data of Object.values(PRODUCT_EQUIVALENCIES)) {
      const found = data.products.find(
        p => p.manufacturer === manufacturer && p.product === product
      );
      if (found) {
        return data.products
          .filter(p => p.manufacturer !== manufacturer)
          .map(p => ({
            manufacturer: p.manufacturer,
            productName: p.product,
            confidenceScore: p.confidenceScore
          }));
      }
    }
    return [];
  }

  private extractProducts(part2Text: string): ParsedProduct[] {
    const products: ParsedProduct[] = [];
    const productPattern = /([A-Z])\.\s+([^:]+):\s*(?:\n\s*\d+\.\s*Manufacturer:\s*([^\n]+))?(?:\n\s*\d+\.\s*Product:\s*([^\n]+))?/gi;
    
    let match;
    while ((match = productPattern.exec(part2Text)) !== null) {
      products.push({
        description: match[2].trim(),
        manufacturer: match[3]?.trim(),
        productName: match[4]?.trim()
      });
    }
    return products;
  }

  private extractExecutionNotes(part3Text: string): string[] {
    const notes: string[] = [];
    const notePattern = /[A-Z]\.\s+([^\n]+)/g;
    let match;
    while ((match = notePattern.exec(part3Text)) !== null) {
      notes.push(match[1].trim());
    }
    return notes;
  }

  private inferCategoryFromSection(sectionNumber: string): string {
    const num = sectionNumber.replace(/\s/g, '');
    if (num.startsWith('071')) return 'waterproofing';
    if (num.startsWith('0727')) return 'air-barrier';
    if (num.startsWith('075')) return 'roofing';
    if (num.startsWith('0721')) return 'insulation';
    return 'waterproofing';
  }

  private inferMaterialType(description: string): string {
    const lower = description.toLowerCase();
    if (lower.includes('waterproof') && lower.includes('membrane')) return 'membrane-self-adhered';
    if (lower.includes('air barrier')) return 'membrane-air-barrier';
    if (lower.includes('tpo')) return 'membrane-tpo';
    if (lower.includes('epdm')) return 'membrane-epdm';
    if (lower.includes('insulation')) return 'insulation-xps';
    if (lower.includes('drainage')) return 'drainage-composite';
    return 'unknown';
  }
}

// =============================================================================
// SINGLETON EXPORT
// =============================================================================

export const specIntegration = new SpecificationIntegration();
