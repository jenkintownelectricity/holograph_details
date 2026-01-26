/**
 * Or Equal Comparison Feature
 * POLR Strategic Development - Phase B2.1
 * 
 * PATENTABLE INNOVATION: Real-time manufacturer equivalency visualization
 * @module features/or-equal-comparison
 * @version 1.0.0
 */

import * as THREE from 'three';
import { resolveMaterialType } from '../data/layer-material-mapping';

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export type ComparisonMode = 'side-by-side' | 'slider' | 'toggle' | 'animate';

export interface ProductChange {
  layerId: string;
  fromManufacturer: string;
  fromProduct: string;
  toManufacturer: string;
  toProduct: string;
  confidenceScore: number;
  dimensionChanges?: { property: string; from: number; to: number; unit: string }[];
}

export interface DifferenceReport {
  productChanges: ProductChange[];
  warnings: string[];
  overallEquivalencyScore: number;
}

export interface SemanticDetail {
  id: string;
  name: string;
  layers: Array<{
    id: string;
    materialType: string;
    thickness: number;
    position: { x: number; y: number; z: number };
    material: { manufacturer?: string; product?: string; color?: string };
  }>;
}

// =============================================================================
// PRODUCT EQUIVALENCY DATABASE (Core IP)
// =============================================================================

export const PRODUCT_EQUIVALENCIES: Record<string, {
  baseType: string;
  products: Array<{ manufacturer: string; product: string; thickness?: number; confidenceScore: number }>;
}> = {
  // ==========================================================================
  // WATERPROOFING MEMBRANES (Original)
  // ==========================================================================
  'membrane-self-adhered-waterproofing': {
    baseType: 'Self-Adhered Waterproofing Membrane',
    products: [
      // GCP Applied Technologies - Full Line
      { manufacturer: 'GCP Applied Technologies', product: 'BITUTHENE 3000', thickness: 1.5, confidenceScore: 1.0 },
      { manufacturer: 'GCP Applied Technologies', product: 'BITUTHENE 4000', thickness: 1.5, confidenceScore: 0.98 },
      { manufacturer: 'GCP Applied Technologies', product: 'BITUTHENE 8000', thickness: 1.5, confidenceScore: 0.96 },
      { manufacturer: 'GCP Applied Technologies', product: 'BITUTHENE Low Temp', thickness: 1.5, confidenceScore: 0.95 },
      // Carlisle CCW
      { manufacturer: 'Carlisle CCW', product: 'MiraDRI 860', thickness: 1.5, confidenceScore: 0.97 },
      { manufacturer: 'Carlisle CCW', product: 'MiraDRI 861', thickness: 1.5, confidenceScore: 0.96 },
      { manufacturer: 'Carlisle CCW', product: 'CCW MiraDRI 500', thickness: 1.5, confidenceScore: 0.95 },
      // Tremco
      { manufacturer: 'Tremco', product: 'TREMproof 250GC', thickness: 1.5, confidenceScore: 0.95 },
      { manufacturer: 'Tremco', product: 'TREMproof 260', thickness: 1.5, confidenceScore: 0.93 },
      { manufacturer: 'Tremco', product: 'Paraseal', thickness: 1.5, confidenceScore: 0.92 },
      // Henry Company
      { manufacturer: 'Henry Company', product: 'Blueskin WP 200', thickness: 1.5, confidenceScore: 0.94 },
      { manufacturer: 'Henry Company', product: 'Blueskin TWF', thickness: 1.5, confidenceScore: 0.92 },
      // SOPREMA
      { manufacturer: 'SOPREMA', product: 'COLPHENE 3000', thickness: 1.5, confidenceScore: 0.94 },
      { manufacturer: 'SOPREMA', product: 'SOPRASEAL STICK 1100T', thickness: 1.5, confidenceScore: 0.93 },
      // W.R. Meadows
      { manufacturer: 'W.R. Meadows', product: 'MEL-ROL', thickness: 1.5, confidenceScore: 0.93 },
      { manufacturer: 'W.R. Meadows', product: 'MEL-ROL LM', thickness: 1.5, confidenceScore: 0.91 },
      // Sika
      { manufacturer: 'Sika', product: 'Sikalastic-621 TC', thickness: 1.5, confidenceScore: 0.92 },
      { manufacturer: 'Sika', product: 'Sikadur Combiflex', thickness: 1.5, confidenceScore: 0.90 },
      // Polyguard
      { manufacturer: 'Polyguard', product: 'Polyguard 650', thickness: 1.5, confidenceScore: 0.91 },
      { manufacturer: 'Polyguard', product: 'Polyguard 665', thickness: 1.5, confidenceScore: 0.90 }
    ]
  },
  'membrane-air-barrier': {
    baseType: 'Self-Adhered Air Barrier Membrane',
    products: [
      // GCP Applied Technologies - Full Line
      { manufacturer: 'GCP Applied Technologies', product: 'PERM-A-BARRIER NP', thickness: 1.0, confidenceScore: 1.0 },
      { manufacturer: 'GCP Applied Technologies', product: 'PERM-A-BARRIER VPL', thickness: 1.0, confidenceScore: 0.98 },
      { manufacturer: 'GCP Applied Technologies', product: 'PERM-A-BARRIER Aluminum', thickness: 1.0, confidenceScore: 0.96 },
      { manufacturer: 'GCP Applied Technologies', product: 'PERM-A-BARRIER VPS', thickness: 1.0, confidenceScore: 0.95 },
      // Carlisle CCW
      { manufacturer: 'Carlisle CCW', product: 'Air-Bloc 31 MR', thickness: 1.0, confidenceScore: 0.97 },
      { manufacturer: 'Carlisle CCW', product: 'Air-Bloc 32', thickness: 1.0, confidenceScore: 0.95 },
      { manufacturer: 'Carlisle CCW', product: 'CCW-705 Air Barrier', thickness: 1.0, confidenceScore: 0.94 },
      // Tremco
      { manufacturer: 'Tremco', product: 'ExoAir 120', thickness: 1.0, confidenceScore: 0.96 },
      { manufacturer: 'Tremco', product: 'ExoAir 230', thickness: 1.0, confidenceScore: 0.94 },
      { manufacturer: 'Tremco', product: 'WR Grace ExoAir 110', thickness: 1.0, confidenceScore: 0.93 },
      // Henry Company
      { manufacturer: 'Henry Company', product: 'Blueskin VP100', thickness: 1.0, confidenceScore: 0.95 },
      { manufacturer: 'Henry Company', product: 'Blueskin VP160', thickness: 1.0, confidenceScore: 0.93 },
      { manufacturer: 'Henry Company', product: 'Air-Bloc 31 MR', thickness: 1.0, confidenceScore: 0.92 },
      // SOPREMA
      { manufacturer: 'SOPREMA', product: 'SOPRASEAL STICK VP', thickness: 1.0, confidenceScore: 0.94 },
      { manufacturer: 'SOPREMA', product: 'SOPRASEAL LM 202 VP', thickness: 1.0, confidenceScore: 0.92 },
      // Sika
      { manufacturer: 'Sika', product: 'Sika SealTape-S', thickness: 1.0, confidenceScore: 0.93 },
      // W.R. Meadows
      { manufacturer: 'W.R. Meadows', product: 'AIR-SHIELD LMP', thickness: 1.0, confidenceScore: 0.92 },
      { manufacturer: 'W.R. Meadows', product: 'AIR-SHIELD LM', thickness: 1.0, confidenceScore: 0.91 },
      // VaproShield
      { manufacturer: 'VaproShield', product: 'WrapShield SA', thickness: 1.0, confidenceScore: 0.91 }
    ]
  },
  'drainage-composite': {
    baseType: 'Drainage Composite Board',
    products: [
      // GCP Applied Technologies - Full Line
      { manufacturer: 'GCP Applied Technologies', product: 'HYDRODUCT 220', confidenceScore: 1.0 },
      { manufacturer: 'GCP Applied Technologies', product: 'HYDRODUCT 660', confidenceScore: 0.98 },
      { manufacturer: 'GCP Applied Technologies', product: 'HYDRODUCT 100', confidenceScore: 0.96 },
      // Carlisle CCW
      { manufacturer: 'Carlisle CCW', product: 'CCW MIRADRAIN 6000', confidenceScore: 0.97 },
      { manufacturer: 'Carlisle CCW', product: 'CCW MIRADRAIN 9000', confidenceScore: 0.95 },
      { manufacturer: 'Carlisle CCW', product: 'MiraDRI Drain', confidenceScore: 0.94 },
      // W.R. Meadows
      { manufacturer: 'W.R. Meadows', product: 'MEADOW-DRAIN', confidenceScore: 0.95 },
      { manufacturer: 'W.R. Meadows', product: 'MEL-DRAIN 3', confidenceScore: 0.93 },
      // Henry Company
      { manufacturer: 'Henry Company', product: 'Blueskin Drainage Mat', confidenceScore: 0.93 },
      // American Wick Drain
      { manufacturer: 'American Wick Drain', product: 'Amerdrain 500', confidenceScore: 0.92 },
      { manufacturer: 'American Wick Drain', product: 'Amerdrain 200', confidenceScore: 0.90 },
      // Cosella-Dorken
      { manufacturer: 'Cosella-Dorken', product: 'DELTA-DRAIN', confidenceScore: 0.92 },
      { manufacturer: 'Cosella-Dorken', product: 'DELTA-MS', confidenceScore: 0.91 }
    ]
  },

  // ==========================================================================
  // TPO MEMBRANES (Expanded from CSV L0-CMD-2026-0125-002)
  // ==========================================================================
  'membrane-tpo': {
    baseType: 'TPO Roofing Membrane',
    products: [
      // Carlisle SynTec - Market Leader
      { manufacturer: 'Carlisle SynTec', product: 'Sure-Weld TPO', thickness: 1.5, confidenceScore: 1.0 },
      { manufacturer: 'Carlisle SynTec', product: 'Sure-Weld TPO HS', thickness: 1.8, confidenceScore: 0.98 },
      { manufacturer: 'Carlisle SynTec', product: 'Sure-Weld FleeceBACK TPO', thickness: 2.0, confidenceScore: 0.97 },
      // Johns Manville
      { manufacturer: 'Johns Manville', product: 'TPO Roofing Systems', thickness: 1.5, confidenceScore: 0.97 },
      { manufacturer: 'Johns Manville', product: 'JM TPO FB', thickness: 2.0, confidenceScore: 0.96 },
      // Firestone
      { manufacturer: 'Firestone', product: 'UltraPly TPO', thickness: 1.5, confidenceScore: 0.96 },
      { manufacturer: 'Firestone', product: 'UltraPly TPO XR', thickness: 1.8, confidenceScore: 0.95 },
      // GAF
      { manufacturer: 'GAF', product: 'EverGuard TPO', thickness: 1.5, confidenceScore: 0.95 },
      { manufacturer: 'GAF', product: 'EverGuard Extreme TPO', thickness: 1.8, confidenceScore: 0.94 },
      // Sika Sarnafil
      { manufacturer: 'Sika Sarnafil', product: 'Sarnafil G TPO', thickness: 1.5, confidenceScore: 0.95 },
      { manufacturer: 'Sika Sarnafil', product: 'Sarnafil TS TPO', thickness: 1.8, confidenceScore: 0.93 },
      // Versico
      { manufacturer: 'Versico', product: 'VersiFlex TPO', thickness: 1.5, confidenceScore: 0.94 },
      { manufacturer: 'Versico', product: '16-foot TPO', thickness: 1.5, confidenceScore: 0.93 },
      // Duro-Last
      { manufacturer: 'Duro-Last', product: 'Duro-TECH TPO', thickness: 1.5, confidenceScore: 0.94 },
      { manufacturer: 'Duro-Last', product: 'Duro-TECH Fleece TPO', thickness: 2.0, confidenceScore: 0.93 },
      // Tremco Roofing
      { manufacturer: 'Tremco Roofing', product: 'TremPly TPO', thickness: 1.5, confidenceScore: 0.93 },
      // GenFlex
      { manufacturer: 'GenFlex', product: 'GenFlex TPO', thickness: 1.5, confidenceScore: 0.92 },
      // IB Roof Systems
      { manufacturer: 'IB Roof Systems', product: 'IB-4Ever TPO', thickness: 1.5, confidenceScore: 0.91 },
      // SOPREMA
      { manufacturer: 'SOPREMA', product: 'SOPRASTAR TPO', thickness: 1.5, confidenceScore: 0.92 }
    ]
  },
  // Legacy key for backwards compatibility (references main TPO list)
  'membrane-tpo-roofing': {
    baseType: 'TPO Roofing Membrane',
    products: [
      { manufacturer: 'Carlisle SynTec', product: 'Sure-Weld TPO', thickness: 1.5, confidenceScore: 1.0 },
      { manufacturer: 'Johns Manville', product: 'TPO Roofing Systems', thickness: 1.5, confidenceScore: 0.97 },
      { manufacturer: 'Firestone', product: 'UltraPly TPO', thickness: 1.5, confidenceScore: 0.96 },
      { manufacturer: 'GAF', product: 'EverGuard TPO', thickness: 1.5, confidenceScore: 0.95 },
      { manufacturer: 'Sika Sarnafil', product: 'Sarnafil G TPO', thickness: 1.5, confidenceScore: 0.95 },
      { manufacturer: 'Versico', product: 'VersiFlex TPO', thickness: 1.5, confidenceScore: 0.94 },
      { manufacturer: 'Duro-Last', product: 'Duro-TECH TPO', thickness: 1.5, confidenceScore: 0.94 }
    ]
  },

  // ==========================================================================
  // EPDM MEMBRANES (From CSV)
  // ==========================================================================
  'membrane-epdm': {
    baseType: 'EPDM Roofing Membrane',
    products: [
      // Firestone - EPDM pioneer, market leader
      { manufacturer: 'Firestone', product: 'RubberGard EPDM', thickness: 1.5, confidenceScore: 1.0 },
      { manufacturer: 'Firestone', product: 'RubberGard MAX EPDM', thickness: 1.5, confidenceScore: 0.98 },
      { manufacturer: 'Firestone', product: 'RubberGard Platinum', thickness: 1.5, confidenceScore: 0.97 },
      // Carlisle SynTec
      { manufacturer: 'Carlisle SynTec', product: 'Sure-Seal EPDM', thickness: 1.5, confidenceScore: 0.98 },
      { manufacturer: 'Carlisle SynTec', product: 'Sure-Seal EPDM SA', thickness: 1.5, confidenceScore: 0.96 },
      { manufacturer: 'Carlisle SynTec', product: 'Sure-Seal FleeceBACK EPDM', thickness: 2.0, confidenceScore: 0.95 },
      // Johns Manville
      { manufacturer: 'Johns Manville', product: 'EPDM Roofing Systems', thickness: 1.5, confidenceScore: 0.96 },
      { manufacturer: 'Johns Manville', product: 'JM EPDM FB', thickness: 2.0, confidenceScore: 0.95 },
      // Versico
      { manufacturer: 'Versico', product: 'VersiFlex EPDM', thickness: 1.5, confidenceScore: 0.94 },
      { manufacturer: 'Versico', product: 'VersiGard EPDM', thickness: 1.5, confidenceScore: 0.93 },
      // GAF
      { manufacturer: 'GAF', product: 'EverGuard EPDM', thickness: 1.5, confidenceScore: 0.94 },
      // GenFlex
      { manufacturer: 'GenFlex', product: 'GenFlex EPDM', thickness: 1.5, confidenceScore: 0.93 },
      // Mule-Hide
      { manufacturer: 'Mule-Hide', product: 'EPDM Roofing', thickness: 1.5, confidenceScore: 0.92 },
      // Tremco Roofing
      { manufacturer: 'Tremco Roofing', product: 'TremPly EPDM', thickness: 1.5, confidenceScore: 0.92 },
      // SOPREMA
      { manufacturer: 'SOPREMA', product: 'SOPRANATURE EPDM', thickness: 1.5, confidenceScore: 0.91 }
    ]
  },

  // ==========================================================================
  // PVC MEMBRANES (From CSV)
  // ==========================================================================
  'membrane-pvc': {
    baseType: 'PVC Roofing Membrane',
    products: [
      // Sika Sarnafil - PVC pioneer, industry standard
      { manufacturer: 'Sika Sarnafil', product: 'Sarnafil G 410', thickness: 1.5, confidenceScore: 1.0 },
      { manufacturer: 'Sika Sarnafil', product: 'Sarnafil S 327', thickness: 1.5, confidenceScore: 0.98 },
      { manufacturer: 'Sika Sarnafil', product: 'Sikaplan', thickness: 1.5, confidenceScore: 0.96 },
      // Duro-Last - Custom-fabricated leader
      { manufacturer: 'Duro-Last', product: 'Duro-Last PVC', thickness: 1.5, confidenceScore: 0.98 },
      { manufacturer: 'Duro-Last', product: 'Duro-Last EV PVC', thickness: 1.5, confidenceScore: 0.96 },
      // Johns Manville
      { manufacturer: 'Johns Manville', product: 'PVC Roofing Systems', thickness: 1.5, confidenceScore: 0.97 },
      { manufacturer: 'Johns Manville', product: 'JM PVC FB', thickness: 2.0, confidenceScore: 0.95 },
      // Carlisle SynTec
      { manufacturer: 'Carlisle SynTec', product: 'Sure-Weld PVC', thickness: 1.5, confidenceScore: 0.96 },
      { manufacturer: 'Carlisle SynTec', product: 'Sure-Weld FleeceBACK PVC', thickness: 2.0, confidenceScore: 0.94 },
      // IB Roof Systems
      { manufacturer: 'IB Roof Systems', product: 'IB PVC Membrane', thickness: 1.5, confidenceScore: 0.95 },
      { manufacturer: 'IB Roof Systems', product: 'IB-DeckShield', thickness: 1.5, confidenceScore: 0.93 },
      // Firestone
      { manufacturer: 'Firestone', product: 'UltraPly PVC', thickness: 1.5, confidenceScore: 0.94 },
      // GAF
      { manufacturer: 'GAF', product: 'EverGuard PVC', thickness: 1.5, confidenceScore: 0.93 },
      // Versico
      { manufacturer: 'Versico', product: 'VersiFlex PVC', thickness: 1.5, confidenceScore: 0.93 },
      // Mule-Hide
      { manufacturer: 'Mule-Hide', product: 'PVC Membrane', thickness: 1.5, confidenceScore: 0.92 },
      // Tremco Roofing
      { manufacturer: 'Tremco Roofing', product: 'TremPly PVC', thickness: 1.5, confidenceScore: 0.91 }
    ]
  },

  // ==========================================================================
  // MODIFIED BITUMEN MEMBRANES (From CSV)
  // ==========================================================================
  'membrane-mod-bit': {
    baseType: 'Modified Bitumen Roofing Membrane',
    products: [
      // SOPREMA - Global leader in mod-bit
      { manufacturer: 'SOPREMA', product: 'SOPRASTAR Cap Sheet', thickness: 4.0, confidenceScore: 1.0 },
      { manufacturer: 'SOPREMA', product: 'SOPRALENE Flam 180', thickness: 4.0, confidenceScore: 0.98 },
      { manufacturer: 'SOPREMA', product: 'ELASTOPHENE', thickness: 4.0, confidenceScore: 0.97 },
      // Polyglass
      { manufacturer: 'Polyglass', product: 'Polyflex G SA Cap', thickness: 4.0, confidenceScore: 0.97 },
      { manufacturer: 'Polyglass', product: 'Elastoflex SA V', thickness: 4.0, confidenceScore: 0.96 },
      { manufacturer: 'Polyglass', product: 'Elastoflex SA P', thickness: 4.0, confidenceScore: 0.95 },
      // GAF
      { manufacturer: 'GAF', product: 'Liberty SBS Cap', thickness: 4.0, confidenceScore: 0.96 },
      { manufacturer: 'GAF', product: 'Liberty SBS Base', thickness: 4.0, confidenceScore: 0.95 },
      { manufacturer: 'GAF', product: 'Ruberoid MOP', thickness: 4.0, confidenceScore: 0.94 },
      // CertainTeed
      { manufacturer: 'CertainTeed', product: 'Flintlastic SA Cap', thickness: 4.0, confidenceScore: 0.95 },
      { manufacturer: 'CertainTeed', product: 'Flintlastic SA Mid Ply', thickness: 4.0, confidenceScore: 0.94 },
      // Johns Manville
      { manufacturer: 'Johns Manville', product: 'DynaWeld Cap', thickness: 4.0, confidenceScore: 0.95 },
      { manufacturer: 'Johns Manville', product: 'DynaGrip SBS', thickness: 4.0, confidenceScore: 0.94 },
      // Firestone
      { manufacturer: 'Firestone', product: 'APP Cap Sheet', thickness: 4.0, confidenceScore: 0.94 },
      { manufacturer: 'Firestone', product: 'SBS Cap Sheet', thickness: 4.0, confidenceScore: 0.93 },
      // Carlisle
      { manufacturer: 'Carlisle SynTec', product: 'WIP 300HT', thickness: 4.0, confidenceScore: 0.93 },
      // Mule-Hide
      { manufacturer: 'Mule-Hide', product: 'Modified Bitumen', thickness: 4.0, confidenceScore: 0.92 },
      // Tremco Roofing
      { manufacturer: 'Tremco Roofing', product: 'POWERply', thickness: 4.0, confidenceScore: 0.92 }
    ]
  },

  // ==========================================================================
  // FLEECE-BACKED MEMBRANES (From CSV)
  // ==========================================================================
  'membrane-fleece': {
    baseType: 'Fleece-Backed Roofing Membrane',
    products: [
      // Carlisle SynTec - FleeceBACK pioneer
      { manufacturer: 'Carlisle SynTec', product: 'Sure-Weld FleeceBACK TPO', thickness: 2.0, confidenceScore: 1.0 },
      { manufacturer: 'Carlisle SynTec', product: 'Sure-Weld FleeceBACK EPDM', thickness: 2.0, confidenceScore: 0.98 },
      { manufacturer: 'Carlisle SynTec', product: 'Sure-Weld FleeceBACK PVC', thickness: 2.0, confidenceScore: 0.97 },
      // Johns Manville
      { manufacturer: 'Johns Manville', product: 'JM TPO FB', thickness: 2.0, confidenceScore: 0.97 },
      { manufacturer: 'Johns Manville', product: 'JM PVC FB', thickness: 2.0, confidenceScore: 0.96 },
      { manufacturer: 'Johns Manville', product: 'JM EPDM FB', thickness: 2.0, confidenceScore: 0.95 },
      // Versico
      { manufacturer: 'Versico', product: 'VersiFleece TPO', thickness: 2.0, confidenceScore: 0.96 },
      { manufacturer: 'Versico', product: 'VersiFleece PVC', thickness: 2.0, confidenceScore: 0.95 },
      // Duro-Last
      { manufacturer: 'Duro-Last', product: 'Duro-Fleece PVC', thickness: 2.0, confidenceScore: 0.95 },
      { manufacturer: 'Duro-Last', product: 'Duro-TECH Fleece TPO', thickness: 2.0, confidenceScore: 0.94 },
      // Firestone
      { manufacturer: 'Firestone', product: 'UltraPly TPO FB', thickness: 2.0, confidenceScore: 0.94 },
      // GAF
      { manufacturer: 'GAF', product: 'EverGuard FleeceBACK', thickness: 2.0, confidenceScore: 0.93 },
      // Sika Sarnafil
      { manufacturer: 'Sika Sarnafil', product: 'Sarnafil G Felt', thickness: 2.0, confidenceScore: 0.94 },
      // Mule-Hide
      { manufacturer: 'Mule-Hide', product: 'Fleece-Back TPO', thickness: 2.0, confidenceScore: 0.92 }
    ]
  },

  // ==========================================================================
  // POLYISO INSULATION (From CSV)
  // ==========================================================================
  'insulation-polyiso': {
    baseType: 'Polyisocyanurate Roof Insulation',
    products: [
      // Johns Manville - Major polyiso manufacturer
      { manufacturer: 'Johns Manville', product: 'ENRGY 3', thickness: 50, confidenceScore: 1.0 },
      { manufacturer: 'Johns Manville', product: 'ENRGY 3 CGF', thickness: 50, confidenceScore: 0.98 },
      { manufacturer: 'Johns Manville', product: 'ENRGY 3 25 PSI', thickness: 50, confidenceScore: 0.97 },
      // GAF
      { manufacturer: 'GAF', product: 'EnergyGuard HD', thickness: 50, confidenceScore: 0.98 },
      { manufacturer: 'GAF', product: 'EnergyGuard HD Plus', thickness: 50, confidenceScore: 0.97 },
      { manufacturer: 'GAF', product: 'EnergyGuard Tapered', thickness: 50, confidenceScore: 0.96 },
      // Carlisle SynTec
      { manufacturer: 'Carlisle SynTec', product: 'SecurShield HD', thickness: 50, confidenceScore: 0.97 },
      { manufacturer: 'Carlisle SynTec', product: 'SecurShield HD Composite', thickness: 50, confidenceScore: 0.96 },
      // Hunter Panels
      { manufacturer: 'Hunter Panels', product: 'H-Shield', thickness: 50, confidenceScore: 0.97 },
      { manufacturer: 'Hunter Panels', product: 'H-Shield CG', thickness: 50, confidenceScore: 0.96 },
      { manufacturer: 'Hunter Panels', product: 'H-Shield HD', thickness: 50, confidenceScore: 0.95 },
      // Atlas Roofing
      { manufacturer: 'Atlas Roofing', product: 'ACFoam-II', thickness: 50, confidenceScore: 0.96 },
      { manufacturer: 'Atlas Roofing', product: 'ACFoam CrossVent', thickness: 50, confidenceScore: 0.95 },
      // Rmax
      { manufacturer: 'Rmax', product: 'Thermasheath-3', thickness: 50, confidenceScore: 0.95 },
      { manufacturer: 'Rmax', product: 'ECOMAXci', thickness: 50, confidenceScore: 0.94 },
      // Firestone
      { manufacturer: 'Firestone', product: 'ISO 95+ GL', thickness: 50, confidenceScore: 0.95 },
      // Versico
      { manufacturer: 'Versico', product: 'SecurShield', thickness: 50, confidenceScore: 0.94 },
      // SOPREMA
      { manufacturer: 'SOPREMA', product: 'SOPRA-ISO', thickness: 50, confidenceScore: 0.93 },
      // Tremco Roofing
      { manufacturer: 'Tremco Roofing', product: 'TremPly ISO', thickness: 50, confidenceScore: 0.92 }
    ]
  },

  // ==========================================================================
  // XPS INSULATION (Expanded)
  // ==========================================================================
  'insulation-xps': {
    baseType: 'Extruded Polystyrene Insulation',
    products: [
      // Owens Corning - US XPS market leader
      { manufacturer: 'Owens Corning', product: 'FOAMULAR 250', thickness: 50, confidenceScore: 1.0 },
      { manufacturer: 'Owens Corning', product: 'FOAMULAR 400', thickness: 50, confidenceScore: 0.98 },
      { manufacturer: 'Owens Corning', product: 'FOAMULAR 600', thickness: 50, confidenceScore: 0.97 },
      { manufacturer: 'Owens Corning', product: 'FOAMULAR 1000', thickness: 50, confidenceScore: 0.96 },
      // DuPont/Dow
      { manufacturer: 'DuPont', product: 'STYROFOAM Brand XPS', thickness: 50, confidenceScore: 0.98 },
      { manufacturer: 'DuPont', product: 'STYROFOAM ROOFMATE', thickness: 50, confidenceScore: 0.96 },
      { manufacturer: 'DuPont', product: 'STYROFOAM HIGHLOAD', thickness: 50, confidenceScore: 0.95 },
      // Kingspan
      { manufacturer: 'Kingspan', product: 'GreenGuard XPS Type IV', thickness: 50, confidenceScore: 0.96 },
      { manufacturer: 'Kingspan', product: 'GreenGuard XPS Type VI', thickness: 50, confidenceScore: 0.95 },
      // BASF
      { manufacturer: 'BASF', product: 'Neopor GPS', thickness: 50, confidenceScore: 0.93 },
      // Insulfoam
      { manufacturer: 'Insulfoam', product: 'InsulFoam SE', thickness: 50, confidenceScore: 0.92 },
      // Atlas
      { manufacturer: 'Atlas Roofing', product: 'Atlas XPS', thickness: 50, confidenceScore: 0.92 }
    ]
  },

  // ==========================================================================
  // SILICONE COATINGS (From CSV)
  // ==========================================================================
  'coating-silicone': {
    baseType: 'Silicone Roof Coating',
    products: [
      // GE Silicones / Momentive
      { manufacturer: 'GE Silicones', product: 'Enduris 3500', thickness: 1.0, confidenceScore: 1.0 },
      { manufacturer: 'GE Silicones', product: 'Enduris 3100', thickness: 1.0, confidenceScore: 0.98 },
      // Mule-Hide
      { manufacturer: 'Mule-Hide', product: 'Silicone Roof Coating', thickness: 1.0, confidenceScore: 0.97 },
      { manufacturer: 'Mule-Hide', product: '100% Silicone Coating', thickness: 1.0, confidenceScore: 0.96 },
      // GAF
      { manufacturer: 'GAF', product: 'UniFlex Silicone', thickness: 1.0, confidenceScore: 0.96 },
      { manufacturer: 'GAF', product: 'Unisil II', thickness: 1.0, confidenceScore: 0.95 },
      // Carlisle
      { manufacturer: 'Carlisle SynTec', product: 'SynTec 100% Silicone', thickness: 1.0, confidenceScore: 0.96 },
      // Tremco
      { manufacturer: 'Tremco', product: 'AlphaGuard BIO', thickness: 1.0, confidenceScore: 0.95 },
      { manufacturer: 'Tremco', product: 'POWERSilicone', thickness: 1.0, confidenceScore: 0.94 },
      // Duro-Last
      { manufacturer: 'Duro-Last', product: 'Duro-Shield SI', thickness: 1.0, confidenceScore: 0.95 },
      // APOC
      { manufacturer: 'APOC', product: 'APOC 296 Silicone', thickness: 1.0, confidenceScore: 0.93 },
      // Henry Company
      { manufacturer: 'Henry Company', product: 'Pro-Grade 988 Silicone', thickness: 1.0, confidenceScore: 0.93 },
      // Gaco Western
      { manufacturer: 'Gaco Western', product: 'GacoFlex S20', thickness: 1.0, confidenceScore: 0.94 },
      // SOPREMA
      { manufacturer: 'SOPREMA', product: 'ALSAN RS Silicone', thickness: 1.0, confidenceScore: 0.92 },
      // W.R. Meadows
      { manufacturer: 'W.R. Meadows', product: 'Decra-Seal 880', thickness: 1.0, confidenceScore: 0.92 }
    ]
  },

  // ==========================================================================
  // ACRYLIC COATINGS (From CSV)
  // ==========================================================================
  'coating-acrylic': {
    baseType: 'Acrylic Roof Coating',
    products: [
      // Mule-Hide
      { manufacturer: 'Mule-Hide', product: 'Premium Acrylic', thickness: 0.75, confidenceScore: 1.0 },
      { manufacturer: 'Mule-Hide', product: 'High-Solids Acrylic', thickness: 0.75, confidenceScore: 0.98 },
      // GAF
      { manufacturer: 'GAF', product: 'UniFlex Acrylic', thickness: 0.75, confidenceScore: 0.97 },
      { manufacturer: 'GAF', product: 'TopCoat', thickness: 0.75, confidenceScore: 0.96 },
      // Henry Company
      { manufacturer: 'Henry Company', product: 'Tropicool', thickness: 0.75, confidenceScore: 0.96 },
      { manufacturer: 'Henry Company', product: 'Pro-Grade 587', thickness: 0.75, confidenceScore: 0.95 },
      // Polyglass
      { manufacturer: 'Polyglass', product: 'Polybrite Acrylic', thickness: 0.75, confidenceScore: 0.96 },
      { manufacturer: 'Polyglass', product: 'Elastomeric Roof Coating', thickness: 0.75, confidenceScore: 0.95 },
      // Tremco
      { manufacturer: 'Tremco', product: 'POWERply Acrylic', thickness: 0.75, confidenceScore: 0.95 },
      // Carlisle
      { manufacturer: 'Carlisle SynTec', product: 'SynTec Acrylic', thickness: 0.75, confidenceScore: 0.94 },
      // APOC
      { manufacturer: 'APOC', product: 'APOC 243', thickness: 0.75, confidenceScore: 0.93 },
      { manufacturer: 'APOC', product: 'APOC 252', thickness: 0.75, confidenceScore: 0.92 },
      // Gaco Western
      { manufacturer: 'Gaco Western', product: 'GacoFlex A40', thickness: 0.75, confidenceScore: 0.93 },
      // Duro-Last
      { manufacturer: 'Duro-Last', product: 'Duro-Shield AC', thickness: 0.75, confidenceScore: 0.93 },
      // SOPREMA
      { manufacturer: 'SOPREMA', product: 'ALSAN Acrylic', thickness: 0.75, confidenceScore: 0.92 }
    ]
  },

  // ==========================================================================
  // AIR BARRIERS (From CSV)
  // ==========================================================================
  'air-barrier': {
    baseType: 'Air Barrier System',
    products: [
      // GCP Applied Technologies
      { manufacturer: 'GCP Applied Technologies', product: 'PERM-A-BARRIER NP', thickness: 1.0, confidenceScore: 1.0 },
      { manufacturer: 'GCP Applied Technologies', product: 'PERM-A-BARRIER VPL 50', thickness: 1.0, confidenceScore: 0.98 },
      { manufacturer: 'GCP Applied Technologies', product: 'PERM-A-BARRIER Wall', thickness: 1.0, confidenceScore: 0.96 },
      // SOPREMA
      { manufacturer: 'SOPREMA', product: 'SOPRASEAL STICK 1100T', thickness: 1.0, confidenceScore: 0.97 },
      { manufacturer: 'SOPREMA', product: 'SOPRASEAL LM 202', thickness: 1.0, confidenceScore: 0.96 },
      // W.R. Meadows
      { manufacturer: 'W.R. Meadows', product: 'AIR-SHIELD LMP', thickness: 1.0, confidenceScore: 0.96 },
      { manufacturer: 'W.R. Meadows', product: 'AIR-SHIELD SMP', thickness: 1.0, confidenceScore: 0.95 },
      // Tremco
      { manufacturer: 'Tremco', product: 'ExoAir 120', thickness: 1.0, confidenceScore: 0.96 },
      { manufacturer: 'Tremco', product: 'ExoAir 230', thickness: 1.0, confidenceScore: 0.95 },
      // Henry Company
      { manufacturer: 'Henry Company', product: 'Air-Bloc 31 MR', thickness: 1.0, confidenceScore: 0.95 },
      { manufacturer: 'Henry Company', product: 'Blueskin VP100', thickness: 1.0, confidenceScore: 0.94 },
      // Carlisle CCW
      { manufacturer: 'Carlisle CCW', product: 'Air-Bloc 31 MR', thickness: 1.0, confidenceScore: 0.95 },
      // Owens Corning
      { manufacturer: 'Owens Corning', product: 'JointSealR Foam', thickness: 1.0, confidenceScore: 0.93 },
      // VaproShield
      { manufacturer: 'VaproShield', product: 'WrapShield SA', thickness: 1.0, confidenceScore: 0.93 },
      // Sika
      { manufacturer: 'Sika', product: 'SikaTack Panel', thickness: 1.0, confidenceScore: 0.92 },
      // Georgia-Pacific
      { manufacturer: 'Georgia-Pacific', product: 'ForceField', thickness: 1.0, confidenceScore: 0.92 }
    ]
  },

  // ==========================================================================
  // COVER BOARDS (From CSV)
  // ==========================================================================
  'cover-board': {
    baseType: 'Roof Cover Board',
    products: [
      // Georgia-Pacific DensDeck
      { manufacturer: 'Georgia-Pacific', product: 'DensDeck Prime', thickness: 6.0, confidenceScore: 1.0 },
      { manufacturer: 'Georgia-Pacific', product: 'DensDeck StormX', thickness: 6.0, confidenceScore: 0.98 },
      { manufacturer: 'Georgia-Pacific', product: 'DensDeck Roof Board', thickness: 6.0, confidenceScore: 0.97 },
      // USG
      { manufacturer: 'USG', product: 'Securock Brand Roof Board', thickness: 6.0, confidenceScore: 0.97 },
      { manufacturer: 'USG', product: 'Securock Glass-Mat Roof Board', thickness: 6.0, confidenceScore: 0.96 },
      // Johns Manville
      { manufacturer: 'Johns Manville', product: 'FESCO Board', thickness: 6.0, confidenceScore: 0.96 },
      { manufacturer: 'Johns Manville', product: 'SECUROCK', thickness: 6.0, confidenceScore: 0.95 },
      // Carlisle
      { manufacturer: 'Carlisle SynTec', product: 'SecurShield HD Composite', thickness: 6.0, confidenceScore: 0.95 },
      // GAF
      { manufacturer: 'GAF', product: 'EnergyGuard Cover Board', thickness: 6.0, confidenceScore: 0.95 },
      // Hunter Panels
      { manufacturer: 'Hunter Panels', product: 'H-Shield HD CG', thickness: 6.0, confidenceScore: 0.94 },
      // Firestone
      { manufacturer: 'Firestone', product: 'ISO 95+ GL', thickness: 6.0, confidenceScore: 0.94 },
      // Mule-Hide
      { manufacturer: 'Mule-Hide', product: 'Dens-Deck Cover Board', thickness: 6.0, confidenceScore: 0.93 },
      // Atlas
      { manufacturer: 'Atlas Roofing', product: 'ACFoam Nail Base', thickness: 6.0, confidenceScore: 0.93 },
      // Versico
      { manufacturer: 'Versico', product: 'SecurShield Cover Board', thickness: 6.0, confidenceScore: 0.92 }
    ]
  },

  // ==========================================================================
  // VAPOR BARRIERS (From CSV)
  // ==========================================================================
  'vapor-barrier': {
    baseType: 'Vapor Barrier/Retarder',
    products: [
      // W.R. Meadows
      { manufacturer: 'W.R. Meadows', product: 'PERMINATOR', thickness: 0.2, confidenceScore: 1.0 },
      { manufacturer: 'W.R. Meadows', product: 'SEALTIGHT PERMINATOR', thickness: 0.2, confidenceScore: 0.98 },
      // Stego Industries
      { manufacturer: 'Stego Industries', product: 'Stego Wrap', thickness: 0.2, confidenceScore: 0.98 },
      { manufacturer: 'Stego Industries', product: 'Stego Wrap Class A', thickness: 0.2, confidenceScore: 0.97 },
      // Carlisle CCW
      { manufacturer: 'Carlisle CCW', product: 'MiraDRI 860 VB', thickness: 0.2, confidenceScore: 0.96 },
      // GCP Applied Technologies
      { manufacturer: 'GCP Applied Technologies', product: 'BITUTHENE VB', thickness: 0.2, confidenceScore: 0.96 },
      // Johns Manville
      { manufacturer: 'Johns Manville', product: 'JM VB', thickness: 0.2, confidenceScore: 0.95 },
      // Tremco
      { manufacturer: 'Tremco', product: 'TREMproof VB', thickness: 0.2, confidenceScore: 0.95 },
      // Fortifiber
      { manufacturer: 'Fortifiber', product: 'Moistop Ultra', thickness: 0.2, confidenceScore: 0.94 },
      // Reef Industries
      { manufacturer: 'Reef Industries', product: 'Griffolyn', thickness: 0.2, confidenceScore: 0.93 },
      // Duro-Last
      { manufacturer: 'Duro-Last', product: 'Duro-Last VB', thickness: 0.2, confidenceScore: 0.93 },
      // SOPREMA
      { manufacturer: 'SOPREMA', product: 'SOPRAVAP R', thickness: 0.2, confidenceScore: 0.93 },
      // Polyglass
      { manufacturer: 'Polyglass', product: 'Polystick VB', thickness: 0.2, confidenceScore: 0.92 },
      // Mule-Hide
      { manufacturer: 'Mule-Hide', product: 'Retarder/Barrier', thickness: 0.2, confidenceScore: 0.91 }
    ]
  },

  // ==========================================================================
  // SEALANTS (From CSV)
  // ==========================================================================
  'sealant': {
    baseType: 'Joint Sealant',
    products: [
      // Sika - Global sealant leader
      { manufacturer: 'Sika', product: 'Sikaflex-1a', confidenceScore: 1.0 },
      { manufacturer: 'Sika', product: 'Sikaflex-15 LM', confidenceScore: 0.98 },
      { manufacturer: 'Sika', product: 'Sikaflex-2c NS', confidenceScore: 0.97 },
      { manufacturer: 'Sika', product: 'SikaSil WS-295', confidenceScore: 0.96 },
      // Tremco
      { manufacturer: 'Tremco', product: 'Dymonic 100', confidenceScore: 0.98 },
      { manufacturer: 'Tremco', product: 'Dymonic FC', confidenceScore: 0.97 },
      { manufacturer: 'Tremco', product: 'Spectrem 1', confidenceScore: 0.96 },
      { manufacturer: 'Tremco', product: 'Spectrem 2', confidenceScore: 0.95 },
      // BASF / MasterSeal
      { manufacturer: 'BASF', product: 'MasterSeal NP 1', confidenceScore: 0.97 },
      { manufacturer: 'BASF', product: 'MasterSeal SL 1', confidenceScore: 0.96 },
      // Dow
      { manufacturer: 'Dow', product: 'DOWSIL 790', confidenceScore: 0.96 },
      { manufacturer: 'Dow', product: 'DOWSIL 795', confidenceScore: 0.95 },
      // Pecora
      { manufacturer: 'Pecora', product: 'Dynatrol I-XL', confidenceScore: 0.95 },
      { manufacturer: 'Pecora', product: 'NR-200', confidenceScore: 0.94 },
      // W.R. Meadows
      { manufacturer: 'W.R. Meadows', product: 'POURTHANE', confidenceScore: 0.95 },
      { manufacturer: 'W.R. Meadows', product: 'HI-SPEC', confidenceScore: 0.94 },
      // GCP Applied Technologies
      { manufacturer: 'GCP Applied Technologies', product: 'BITUTHENE Mastic', confidenceScore: 0.94 },
      // SOPREMA
      { manufacturer: 'SOPREMA', product: 'SOPRASEAL Sealant', confidenceScore: 0.93 },
      // Bostik
      { manufacturer: 'Bostik', product: 'Pro-MS 50', confidenceScore: 0.93 },
      // Henry Company
      { manufacturer: 'Henry Company', product: 'Tropi-Cool 887', confidenceScore: 0.92 }
    ]
  },

  // ==========================================================================
  // ADHESIVES (From CSV)
  // ==========================================================================
  'adhesive': {
    baseType: 'Roofing Adhesive',
    products: [
      // Carlisle SynTec
      { manufacturer: 'Carlisle SynTec', product: 'CAV-GRIP III', confidenceScore: 1.0 },
      { manufacturer: 'Carlisle SynTec', product: 'FAST 100', confidenceScore: 0.98 },
      { manufacturer: 'Carlisle SynTec', product: 'Bonding Adhesive BA-2012', confidenceScore: 0.97 },
      // Johns Manville
      { manufacturer: 'Johns Manville', product: 'JM?"x??" R-Panel Adhesive', confidenceScore: 0.97 },
      { manufacturer: 'Johns Manville', product: 'JM All Purpose Adhesive', confidenceScore: 0.96 },
      // Firestone
      { manufacturer: 'Firestone', product: 'Quick Prime Plus', confidenceScore: 0.97 },
      { manufacturer: 'Firestone', product: 'Bonding Adhesive', confidenceScore: 0.96 },
      // GAF
      { manufacturer: 'GAF', product: 'FlexSeal Adhesive', confidenceScore: 0.96 },
      { manufacturer: 'GAF', product: 'Roofing Adhesive', confidenceScore: 0.95 },
      // Mule-Hide
      { manufacturer: 'Mule-Hide', product: 'SA Primer', confidenceScore: 0.95 },
      { manufacturer: 'Mule-Hide', product: 'Low Rise Adhesive', confidenceScore: 0.94 },
      // Tremco
      { manufacturer: 'Tremco', product: 'POWERbond', confidenceScore: 0.95 },
      // Versico
      { manufacturer: 'Versico', product: 'VersiWeld BA', confidenceScore: 0.94 },
      // SOPREMA
      { manufacturer: 'SOPREMA', product: 'DUOTACK', confidenceScore: 0.94 },
      // Duro-Last
      { manufacturer: 'Duro-Last', product: 'Duro-Last Adhesive', confidenceScore: 0.93 },
      // W.R. Meadows
      { manufacturer: 'W.R. Meadows', product: 'MEL-PRIME', confidenceScore: 0.93 },
      // Sika
      { manufacturer: 'Sika', product: 'Sarnacol 2170', confidenceScore: 0.93 }
    ]
  },

  // ==========================================================================
  // FASTENERS (From CSV)
  // ==========================================================================
  'fastener': {
    baseType: 'Roofing Fastener',
    products: [
      // OMG Roofing Products
      { manufacturer: 'OMG Roofing Products', product: 'OlyBond 500 Plates', confidenceScore: 1.0 },
      { manufacturer: 'OMG Roofing Products', product: 'HP Fasteners', confidenceScore: 0.98 },
      { manufacturer: 'OMG Roofing Products', product: 'RhinoBond Plates', confidenceScore: 0.97 },
      // Carlisle SynTec
      { manufacturer: 'Carlisle SynTec', product: 'Grip-Rite Fasteners', confidenceScore: 0.97 },
      { manufacturer: 'Carlisle SynTec', product: 'SynTec Plates', confidenceScore: 0.96 },
      // Johns Manville
      { manufacturer: 'Johns Manville', product: 'JM Fasteners', confidenceScore: 0.96 },
      { manufacturer: 'Johns Manville', product: 'JM Metal Plates', confidenceScore: 0.95 },
      // Firestone
      { manufacturer: 'Firestone', product: 'Fastening System', confidenceScore: 0.95 },
      // GAF
      { manufacturer: 'GAF', product: 'EverGuard Fasteners', confidenceScore: 0.95 },
      // Trufast
      { manufacturer: 'Trufast', product: 'TruGrip Fastener', confidenceScore: 0.94 },
      { manufacturer: 'Trufast', product: 'Roof-Lok Fastener', confidenceScore: 0.93 },
      // ITW Buildex
      { manufacturer: 'ITW Buildex', product: 'Teks Fasteners', confidenceScore: 0.94 },
      // Roofmaster
      { manufacturer: 'Roofmaster', product: 'RM-300 Fastener', confidenceScore: 0.93 },
      // Mule-Hide
      { manufacturer: 'Mule-Hide', product: 'FM Approved Fasteners', confidenceScore: 0.93 },
      // SOPREMA
      { manufacturer: 'SOPREMA', product: 'SOPRAFIX Fasteners', confidenceScore: 0.92 }
    ]
  },

  // ==========================================================================
  // PRIMERS (From CSV)
  // ==========================================================================
  'primer': {
    baseType: 'Roofing Primer',
    products: [
      // GCP Applied Technologies
      { manufacturer: 'GCP Applied Technologies', product: 'BITUTHENE Primer B2', confidenceScore: 1.0 },
      { manufacturer: 'GCP Applied Technologies', product: 'BITUTHENE Primer B2 LVC', confidenceScore: 0.98 },
      { manufacturer: 'GCP Applied Technologies', product: 'PERM-A-BARRIER Primer', confidenceScore: 0.97 },
      // Carlisle SynTec
      { manufacturer: 'Carlisle SynTec', product: 'EPDM Primer', confidenceScore: 0.97 },
      { manufacturer: 'Carlisle SynTec', product: 'TPO Primer', confidenceScore: 0.96 },
      // Tremco
      { manufacturer: 'Tremco', product: 'Porous Surface Primer', confidenceScore: 0.96 },
      { manufacturer: 'Tremco', product: 'ExoAir Primer', confidenceScore: 0.95 },
      // Firestone
      { manufacturer: 'Firestone', product: 'Quick Prime Plus', confidenceScore: 0.96 },
      { manufacturer: 'Firestone', product: 'Splice Primer', confidenceScore: 0.95 },
      // Johns Manville
      { manufacturer: 'Johns Manville', product: 'JM Primer', confidenceScore: 0.95 },
      // Henry Company
      { manufacturer: 'Henry Company', product: 'Blueskin Primer', confidenceScore: 0.95 },
      // W.R. Meadows
      { manufacturer: 'W.R. Meadows', product: 'MEL-PRIME', confidenceScore: 0.94 },
      // SOPREMA
      { manufacturer: 'SOPREMA', product: 'SOPRASEAL Primer', confidenceScore: 0.94 },
      // Mule-Hide
      { manufacturer: 'Mule-Hide', product: 'Multi-Purpose Primer', confidenceScore: 0.93 },
      // Polyglass
      { manufacturer: 'Polyglass', product: 'Polyprimer 500', confidenceScore: 0.93 },
      // GAF
      { manufacturer: 'GAF', product: 'EverGuard Primer', confidenceScore: 0.92 }
    ]
  },

  // ==========================================================================
  // LIQUID APPLIED (From CSV)
  // ==========================================================================
  'coating-liquid': {
    baseType: 'Liquid Applied Roofing System',
    products: [
      // SOPREMA - PMMA leader
      { manufacturer: 'SOPREMA', product: 'ALSAN RS', thickness: 1.5, confidenceScore: 1.0 },
      { manufacturer: 'SOPREMA', product: 'ALSAN Flashing', thickness: 1.5, confidenceScore: 0.98 },
      { manufacturer: 'SOPREMA', product: 'ALSAN 970 F', thickness: 1.5, confidenceScore: 0.96 },
      // Sika
      { manufacturer: 'Sika', product: 'Sikalastic-621 TC', thickness: 1.5, confidenceScore: 0.97 },
      { manufacturer: 'Sika', product: 'Sikalastic-560', thickness: 1.5, confidenceScore: 0.96 },
      // Tremco
      { manufacturer: 'Tremco', product: 'AlphaGuard', thickness: 1.5, confidenceScore: 0.96 },
      { manufacturer: 'Tremco', product: 'POWERply Premier', thickness: 1.5, confidenceScore: 0.95 },
      // Johns Manville
      { manufacturer: 'Johns Manville', product: 'LARIS', thickness: 1.5, confidenceScore: 0.96 },
      // Polyglass
      { manufacturer: 'Polyglass', product: 'Polybrite LA', thickness: 1.5, confidenceScore: 0.95 },
      { manufacturer: 'Polyglass', product: 'Mapelastic Smart', thickness: 1.5, confidenceScore: 0.94 },
      // GAF
      { manufacturer: 'GAF', product: 'UniCoat Liquid', thickness: 1.5, confidenceScore: 0.94 },
      // GCP Applied Technologies
      { manufacturer: 'GCP Applied Technologies', product: 'PROCOR 100', thickness: 1.5, confidenceScore: 0.94 },
      // Kemper System
      { manufacturer: 'Kemper System', product: 'KEMPEROL', thickness: 1.5, confidenceScore: 0.95 },
      // Henry Company
      { manufacturer: 'Henry Company', product: 'Pro-Grade 790-11', thickness: 1.5, confidenceScore: 0.93 },
      // Carlisle
      { manufacturer: 'Carlisle SynTec', product: 'SynTec PMMA', thickness: 1.5, confidenceScore: 0.93 }
    ]
  },

  // ==========================================================================
  // FLASHING (From CSV)
  // ==========================================================================
  'flashing': {
    baseType: 'Roofing Flashing',
    products: [
      // Carlisle SynTec
      { manufacturer: 'Carlisle SynTec', product: 'TPO Flashing', confidenceScore: 1.0 },
      { manufacturer: 'Carlisle SynTec', product: 'EPDM Flashing', confidenceScore: 0.98 },
      { manufacturer: 'Carlisle SynTec', product: 'Quick Seam Flashing', confidenceScore: 0.97 },
      // Duro-Last - Custom fabricated
      { manufacturer: 'Duro-Last', product: 'Custom Flashings', confidenceScore: 0.98 },
      { manufacturer: 'Duro-Last', product: 'Prefabricated Flashings', confidenceScore: 0.97 },
      // Johns Manville
      { manufacturer: 'Johns Manville', product: 'JM Flashing', confidenceScore: 0.96 },
      { manufacturer: 'Johns Manville', product: 'JM EPDM Flashing', confidenceScore: 0.95 },
      // Firestone
      { manufacturer: 'Firestone', product: 'QuickSeam Flashing', confidenceScore: 0.96 },
      { manufacturer: 'Firestone', product: 'RubberGard Flashing', confidenceScore: 0.95 },
      // GAF
      { manufacturer: 'GAF', product: 'EverGuard Flashing', confidenceScore: 0.95 },
      // Sika Sarnafil
      { manufacturer: 'Sika Sarnafil', product: 'Sarnafil Flashing', confidenceScore: 0.95 },
      // Versico
      { manufacturer: 'Versico', product: 'VersiFlash', confidenceScore: 0.94 },
      // W.R. Meadows
      { manufacturer: 'W.R. Meadows', product: 'MEL-ROL Flashing', confidenceScore: 0.94 },
      // SOPREMA
      { manufacturer: 'SOPREMA', product: 'SOPRALENE Flashing', confidenceScore: 0.93 },
      // Mule-Hide
      { manufacturer: 'Mule-Hide', product: 'Uncured Flashing', confidenceScore: 0.93 },
      // Polyglass
      { manufacturer: 'Polyglass', product: 'PMMA Flashing', confidenceScore: 0.92 },
      // Tremco
      { manufacturer: 'Tremco', product: 'POWERply Flashing', confidenceScore: 0.92 }
    ]
  },

  // ==========================================================================
  // SUBSTRATE TYPES (Universal mappings)
  // ==========================================================================
  'substrate-concrete': {
    baseType: 'Concrete Substrate',
    products: [
      { manufacturer: 'Universal', product: 'Structural Concrete Deck', confidenceScore: 1.0 },
      { manufacturer: 'Universal', product: 'Lightweight Concrete', confidenceScore: 0.95 },
      { manufacturer: 'Universal', product: 'Precast Concrete', confidenceScore: 0.94 },
      { manufacturer: 'Universal', product: 'Concrete Topping Slab', confidenceScore: 0.93 }
    ]
  },
  'substrate-cmu': {
    baseType: 'Concrete Masonry Unit',
    products: [
      { manufacturer: 'Universal', product: 'Standard CMU', confidenceScore: 1.0 },
      { manufacturer: 'Universal', product: 'Lightweight CMU', confidenceScore: 0.95 },
      { manufacturer: 'Universal', product: 'Split-Face CMU', confidenceScore: 0.94 },
      { manufacturer: 'Universal', product: 'Insulated CMU', confidenceScore: 0.93 }
    ]
  },
  'substrate-steel': {
    baseType: 'Steel Deck Substrate',
    products: [
      { manufacturer: 'Vulcraft', product: 'Steel Roof Deck', confidenceScore: 1.0 },
      { manufacturer: 'Nucor', product: 'Steel Deck', confidenceScore: 0.97 },
      { manufacturer: 'CSC Steel', product: 'B Deck', confidenceScore: 0.96 },
      { manufacturer: 'Verco', product: 'Steel Roof Deck', confidenceScore: 0.95 },
      { manufacturer: 'ASC Profiles', product: 'Metal Deck', confidenceScore: 0.94 },
      { manufacturer: 'Universal', product: 'Type B Steel Deck', confidenceScore: 0.93 }
    ]
  },
  'substrate-wood': {
    baseType: 'Wood Substrate',
    products: [
      { manufacturer: 'LP Building Solutions', product: 'LP Legacy', confidenceScore: 1.0 },
      { manufacturer: 'LP Building Solutions', product: 'LP TopNotch', confidenceScore: 0.97 },
      { manufacturer: 'Weyerhaeuser', product: 'Edge Gold OSB', confidenceScore: 0.96 },
      { manufacturer: 'Huber', product: 'AdvanTech', confidenceScore: 0.98 },
      { manufacturer: 'Georgia-Pacific', product: 'Plytanium Plywood', confidenceScore: 0.95 },
      { manufacturer: 'Universal', product: 'CDX Plywood', confidenceScore: 0.94 }
    ]
  },
  'substrate-gypsum': {
    baseType: 'Gypsum Board Substrate',
    products: [
      { manufacturer: 'Georgia-Pacific', product: 'DensDeck Prime', confidenceScore: 1.0 },
      { manufacturer: 'Georgia-Pacific', product: 'DensDeck', confidenceScore: 0.98 },
      { manufacturer: 'USG', product: 'Securock', confidenceScore: 0.97 },
      { manufacturer: 'CertainTeed', product: 'GlasRoc Sheathing', confidenceScore: 0.95 },
      { manufacturer: 'National Gypsum', product: 'Gold Bond XP', confidenceScore: 0.94 }
    ]
  },
  'substrate-aluminum': {
    baseType: 'Aluminum Substrate',
    products: [
      { manufacturer: 'Universal', product: 'Aluminum Panel', confidenceScore: 1.0 },
      { manufacturer: 'PAC-CLAD', product: 'Aluminum Panels', confidenceScore: 0.97 },
      { manufacturer: 'Firestone', product: 'Metal Wall Panels', confidenceScore: 0.95 },
      { manufacturer: 'ATAS', product: 'Aluminum Wall Panel', confidenceScore: 0.94 }
    ]
  },
  // ==========================================================================
  // SUBSTRATES (Universal - same across all manufacturers)
  // ==========================================================================
  'substrate-concrete': {
    baseType: 'Concrete Substrate',
    products: [
      { manufacturer: 'Generic', product: 'Cast-in-Place Concrete', confidenceScore: 1.0 },
      { manufacturer: 'GCP Applied Technologies', product: 'Concrete Substrate', confidenceScore: 1.0 },
      { manufacturer: 'Carlisle CCW', product: 'Concrete Substrate', confidenceScore: 1.0 }
    ]
  },
  'substrate-cmu': {
    baseType: 'Concrete Masonry Unit',
    products: [
      { manufacturer: 'Generic', product: 'CMU Wall', confidenceScore: 1.0 },
      { manufacturer: 'GCP Applied Technologies', product: 'CMU Substrate', confidenceScore: 1.0 },
      { manufacturer: 'Carlisle CCW', product: 'CMU Substrate', confidenceScore: 1.0 }
    ]
  },
};

// =============================================================================
// OR EQUAL COMPARISON CLASS
// =============================================================================

export class OrEqualComparison {
  private scene: THREE.Scene | null = null;
  private details: Map<string, THREE.Group> = new Map();
  private comparisonGroup: THREE.Group;
  private sliderPlane: THREE.Plane | null = null;

  constructor() {
    this.comparisonGroup = new THREE.Group();
    this.comparisonGroup.name = 'or-equal-comparison';
  }

  initialize(scene: THREE.Scene): void {
    this.scene = scene;
    scene.add(this.comparisonGroup);
  }

  /**
   * Create side-by-side comparison view
   */
  createSideBySide(detail: SemanticDetail, manufacturers: string[], spacing = 500): THREE.Group[] {
    this.clearComparison();
    const views: THREE.Group[] = [];

    manufacturers.forEach((mfr, index) => {
      const variant = this.switchManufacturer(detail, mfr);
      const mesh = this.createDetailMesh(variant);
      mesh.position.x = index * spacing;

      const label = this.createLabel(mfr);
      label.position.y = 300;
      mesh.add(label);

      views.push(mesh);
      this.details.set(mfr, mesh);
      this.comparisonGroup.add(mesh);
    });

    return views;
  }

  /**
   * Create slider comparison (like image diff tools)
   */
  createSliderComparison(detail: SemanticDetail, mfr1: string, mfr2: string): THREE.Group {
    this.clearComparison();
    const group = new THREE.Group();
    group.name = 'slider-comparison';

    const view1 = this.createDetailMesh(this.switchManufacturer(detail, mfr1));
    const view2 = this.createDetailMesh(this.switchManufacturer(detail, mfr2));

    this.sliderPlane = new THREE.Plane(new THREE.Vector3(1, 0, 0), 0);
    const inversePlane = new THREE.Plane(new THREE.Vector3(-1, 0, 0), 0);

    this.applyClippingPlane(view1, this.sliderPlane);
    this.applyClippingPlane(view2, inversePlane);

    group.add(view1, view2);

    group.userData.updateSlider = (position: number) => {
      const bounds = new THREE.Box3().setFromObject(group);
      const width = bounds.max.x - bounds.min.x;
      const sliderX = bounds.min.x + width * position;
      this.sliderPlane!.constant = sliderX;
      inversePlane.constant = -sliderX;
    };

    this.comparisonGroup.add(group);
    return group;
  }

  /**
   * Create toggle comparison (switch between manufacturers)
   */
  createToggleComparison(detail: SemanticDetail, manufacturers: string[]): THREE.Group {
    this.clearComparison();
    const group = new THREE.Group();
    let currentIndex = 0;

    manufacturers.forEach((mfr, index) => {
      const mesh = this.createDetailMesh(this.switchManufacturer(detail, mfr));
      mesh.visible = index === 0;
      this.details.set(mfr, mesh);
      group.add(mesh);
    });

    group.userData.toggle = (target?: string | number) => {
      let idx = typeof target === 'string' ? manufacturers.indexOf(target) : target ?? -1;
      if (idx === -1) idx = (currentIndex + 1) % manufacturers.length;
      group.children.forEach((c, i) => c.visible = i === idx);
      currentIndex = idx;
      return manufacturers[currentIndex];
    };

    group.userData.getCurrentManufacturer = () => manufacturers[currentIndex];
    this.comparisonGroup.add(group);
    return group;
  }

  /**
   * Generate difference report between manufacturers
   * Uses resolveMaterialType to compute materialType when not directly available on layer
   */
  getDifferenceReport(detail: SemanticDetail | any, mfr1: string, mfr2: string): DifferenceReport {
    const productChanges: ProductChange[] = [];
    const warnings: string[] = [];

    detail.layers.forEach((layer: any) => {
      // Resolve materialType - try layer.materialType first, then use resolver
      let materialType = layer.materialType;
      if (!materialType) {
        // Use the resolver to compute materialType from layer properties
        const material = typeof layer.material === 'string' ? layer.material : layer.material?.type || '';
        materialType = resolveMaterialType(layer.id, material, layer.annotation);
      }

      if (!materialType) {
        // Skip layers we can't resolve (substrates, structural elements, etc.)
        console.log(`[OrEqualComparison] Skipping layer without materialType: ${layer.id}`);
        return;
      }

      const equivalents = PRODUCT_EQUIVALENCIES[materialType];
      if (!equivalents) {
        warnings.push(`No equivalency data for: ${materialType} (layer: ${layer.id})`);
        return;
      }

      const p1 = equivalents.products.find(p => p.manufacturer === mfr1);
      const p2 = equivalents.products.find(p => p.manufacturer === mfr2);

      if (!p1) { warnings.push(`${mfr1} has no product for ${materialType}`); return; }
      if (!p2) { warnings.push(`${mfr2} has no product for ${materialType}`); return; }

      const change: ProductChange = {
        layerId: layer.id,
        fromManufacturer: mfr1,
        fromProduct: p1.product,
        toManufacturer: mfr2,
        toProduct: p2.product,
        confidenceScore: Math.min(p1.confidenceScore, p2.confidenceScore)
      };

      if (p1.thickness !== undefined && p2.thickness !== undefined && p1.thickness !== p2.thickness) {
        change.dimensionChanges = [{
          property: 'thickness',
          from: p1.thickness,
          to: p2.thickness,
          unit: 'mm'
        }];
      }

      productChanges.push(change);
      if (p2.confidenceScore < 0.9) {
        warnings.push(`${p2.product} has ${(p2.confidenceScore * 100).toFixed(0)}% confidence`);
      }
    });

    const avgScore = productChanges.length > 0
      ? productChanges.reduce((sum, c) => sum + c.confidenceScore, 0) / productChanges.length
      : 0;

    return { productChanges, warnings, overallEquivalencyScore: avgScore };
  }

  setSliderPosition(position: number): void {
    const slider = this.comparisonGroup.children.find(c => c.name === 'slider-comparison');
    slider?.userData.updateSlider?.(Math.max(0, Math.min(1, position)));
  }

  clearComparison(): void {
    while (this.comparisonGroup.children.length > 0) {
      const child = this.comparisonGroup.children[0];
      this.disposeObject(child);
      this.comparisonGroup.remove(child);
    }
    this.details.clear();
    this.sliderPlane = null;
  }

  // ===========================================================================
  // PRIVATE METHODS
  // ===========================================================================

  private switchManufacturer(detail: SemanticDetail, targetMfr: string): SemanticDetail {
    return {
      ...detail,
      layers: detail.layers.map(layer => {
        const eq = PRODUCT_EQUIVALENCIES[layer.materialType];
        const target = eq?.products.find(p => p.manufacturer === targetMfr);
        if (!target) return layer;
        return {
          ...layer,
          thickness: target.thickness ?? layer.thickness,
          material: { ...layer.material, manufacturer: targetMfr, product: target.product }
        };
      })
    };
  }

  private createDetailMesh(detail: SemanticDetail): THREE.Group {
    const group = new THREE.Group();
    group.name = detail.id;
    detail.layers.forEach(layer => {
      const geo = new THREE.BoxGeometry(200, layer.thickness, 300);
      const mat = new THREE.MeshStandardMaterial({ color: layer.material.color || 0x808080, roughness: 0.7 });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.name = layer.id;
      mesh.position.set(layer.position.x, layer.position.y, layer.position.z);
      mesh.castShadow = true;
      group.add(mesh);
    });
    return group;
  }

  private createLabel(text: string): THREE.Sprite {
    const canvas = document.createElement('canvas');
    canvas.width = 512; canvas.height = 128;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = 'rgba(0,0,0,0.8)';
    ctx.fillRect(0, 0, 512, 128);
    ctx.strokeStyle = '#00ffff';
    ctx.lineWidth = 3;
    ctx.strokeRect(3, 3, 506, 122);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(text, 256, 74);
    const texture = new THREE.CanvasTexture(canvas);
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture }));
    sprite.scale.set(200, 50, 1);
    return sprite;
  }

  private applyClippingPlane(obj: THREE.Object3D, plane: THREE.Plane): void {
    obj.traverse(child => {
      if (child instanceof THREE.Mesh && child.material) {
        const mat = child.material as THREE.Material;
        mat.clippingPlanes = [plane];
        mat.clipShadows = true;
      }
    });
  }

  private disposeObject(obj: THREE.Object3D): void {
    if (obj instanceof THREE.Mesh) {
      obj.geometry.dispose();
      if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
      else obj.material.dispose();
    }
    obj.children.forEach(c => this.disposeObject(c));
  }

  dispose(): void {
    this.clearComparison();
    this.scene?.remove(this.comparisonGroup);
  }
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

export function findEquivalentProducts(manufacturer: string, product: string) {
  for (const data of Object.values(PRODUCT_EQUIVALENCIES)) {
    const found = data.products.find(p => p.manufacturer === manufacturer && p.product === product);
    if (found) {
      return data.products.filter(p => p.manufacturer !== manufacturer)
        .map(p => ({ manufacturer: p.manufacturer, product: p.product, confidenceScore: p.confidenceScore }));
    }
  }
  return [];
}

export function getManufacturersForMaterialType(materialType: string): string[] {
  return PRODUCT_EQUIVALENCIES[materialType]?.products.map(p => p.manufacturer) || [];
}

export const orEqualComparison = new OrEqualComparison();
