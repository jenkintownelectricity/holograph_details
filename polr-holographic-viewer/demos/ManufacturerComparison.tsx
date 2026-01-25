/**
 * Manufacturer Comparison Demo Component
 *
 * Demonstrates the OR-Equal comparison feature for switching between
 * manufacturer products in construction details.
 */

import React, { useState, useMemo } from 'react';
import {
  PRODUCT_EQUIVALENCIES,
  findEquivalentProducts,
  getManufacturersForMaterialType,
  ComparisonMode,
  orEqualComparison
} from '../features/or-equal-comparison';

// Available material types from the equivalency database
const MATERIAL_TYPES = Object.keys(PRODUCT_EQUIVALENCIES);

// Comparison mode options
const COMPARISON_MODES: { value: ComparisonMode; label: string }[] = [
  { value: 'side-by-side', label: 'Side by Side' },
  { value: 'slider', label: 'Slider' },
  { value: 'toggle', label: 'Toggle' },
  { value: 'animate', label: 'Animate' }
];

interface ManufacturerComparisonProps {
  onCompare?: (result: { mfr1: string; mfr2: string; mode: ComparisonMode }) => void;
}

export const ManufacturerComparison: React.FC<ManufacturerComparisonProps> = ({ onCompare }) => {
  const [selectedMaterialType, setSelectedMaterialType] = useState(MATERIAL_TYPES[0]);
  const [manufacturerA, setManufacturerA] = useState('');
  const [manufacturerB, setManufacturerB] = useState('');
  const [comparisonMode, setComparisonMode] = useState<ComparisonMode>('side-by-side');
  const [showResults, setShowResults] = useState(false);

  // Get products for the selected material type
  const productsForType = useMemo(() => {
    return PRODUCT_EQUIVALENCIES[selectedMaterialType]?.products || [];
  }, [selectedMaterialType]);

  // Get unique manufacturers for dropdown
  const availableManufacturers = useMemo(() => {
    return [...new Set(productsForType.map(p => p.manufacturer))];
  }, [productsForType]);

  // Get selected product details
  const productA = useMemo(() => {
    return productsForType.find(p => p.manufacturer === manufacturerA);
  }, [productsForType, manufacturerA]);

  const productB = useMemo(() => {
    return productsForType.find(p => p.manufacturer === manufacturerB);
  }, [productsForType, manufacturerB]);

  // Handle material type change
  const handleMaterialTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMaterialType(e.target.value);
    setManufacturerA('');
    setManufacturerB('');
    setShowResults(false);
  };

  // Handle compare button click
  const handleCompare = () => {
    if (manufacturerA && manufacturerB) {
      setShowResults(true);
      onCompare?.({
        mfr1: manufacturerA,
        mfr2: manufacturerB,
        mode: comparisonMode
      });
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>OR-Equal Manufacturer Comparison</h2>
      <p style={styles.subtitle}>
        Compare equivalent products from different manufacturers
      </p>

      {/* Material Type Selection */}
      <div style={styles.section}>
        <label style={styles.label}>Material Type</label>
        <select
          style={styles.select}
          value={selectedMaterialType}
          onChange={handleMaterialTypeChange}
        >
          {MATERIAL_TYPES.map(type => (
            <option key={type} value={type}>
              {PRODUCT_EQUIVALENCIES[type].baseType}
            </option>
          ))}
        </select>
      </div>

      {/* Manufacturer Selection Grid */}
      <div style={styles.compareGrid}>
        {/* Manufacturer A */}
        <div style={styles.manufacturerCard}>
          <label style={styles.label}>Manufacturer A (Base)</label>
          <select
            style={styles.select}
            value={manufacturerA}
            onChange={(e) => setManufacturerA(e.target.value)}
          >
            <option value="">Select manufacturer...</option>
            {availableManufacturers.map(mfr => (
              <option key={mfr} value={mfr}>{mfr}</option>
            ))}
          </select>
          {productA && (
            <div style={styles.productDetails}>
              <div style={styles.productName}>{productA.product}</div>
              <div style={styles.productMeta}>
                Confidence: {(productA.confidenceScore * 100).toFixed(0)}%
              </div>
              {productA.thickness && (
                <div style={styles.productMeta}>
                  Thickness: {productA.thickness}mm
                </div>
              )}
            </div>
          )}
        </div>

        {/* VS Divider */}
        <div style={styles.vsDivider}>VS</div>

        {/* Manufacturer B */}
        <div style={styles.manufacturerCard}>
          <label style={styles.label}>Manufacturer B (Compare)</label>
          <select
            style={styles.select}
            value={manufacturerB}
            onChange={(e) => setManufacturerB(e.target.value)}
          >
            <option value="">Select manufacturer...</option>
            {availableManufacturers
              .filter(mfr => mfr !== manufacturerA)
              .map(mfr => (
                <option key={mfr} value={mfr}>{mfr}</option>
              ))}
          </select>
          {productB && (
            <div style={styles.productDetails}>
              <div style={styles.productName}>{productB.product}</div>
              <div style={styles.productMeta}>
                Confidence: {(productB.confidenceScore * 100).toFixed(0)}%
              </div>
              {productB.thickness && (
                <div style={styles.productMeta}>
                  Thickness: {productB.thickness}mm
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Comparison Mode */}
      <div style={styles.section}>
        <label style={styles.label}>Comparison Mode</label>
        <div style={styles.modeButtons}>
          {COMPARISON_MODES.map(mode => (
            <button
              key={mode.value}
              style={{
                ...styles.modeButton,
                ...(comparisonMode === mode.value ? styles.modeButtonActive : {})
              }}
              onClick={() => setComparisonMode(mode.value)}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* Compare Button */}
      <button
        style={{
          ...styles.compareButton,
          ...(!(manufacturerA && manufacturerB) ? styles.compareButtonDisabled : {})
        }}
        onClick={handleCompare}
        disabled={!(manufacturerA && manufacturerB)}
      >
        Compare Products
      </button>

      {/* Results Panel */}
      {showResults && productA && productB && (
        <div style={styles.resultsPanel}>
          <h3 style={styles.resultsTitle}>Comparison Results</h3>
          <div style={styles.resultRow}>
            <span style={styles.resultLabel}>Equivalency Score:</span>
            <span style={styles.resultValue}>
              {((productA.confidenceScore + productB.confidenceScore) / 2 * 100).toFixed(0)}%
            </span>
          </div>
          <div style={styles.resultRow}>
            <span style={styles.resultLabel}>Base Type:</span>
            <span style={styles.resultValue}>
              {PRODUCT_EQUIVALENCIES[selectedMaterialType].baseType}
            </span>
          </div>
          <div style={styles.resultRow}>
            <span style={styles.resultLabel}>Display Mode:</span>
            <span style={styles.resultValue}>{comparisonMode}</span>
          </div>
          <p style={styles.resultsNote}>
            3D comparison view will render in the main viewport using the selected display mode.
          </p>
        </div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '20px',
    backgroundColor: 'rgba(20, 20, 30, 0.95)',
    borderRadius: '12px',
    border: '1px solid rgba(100, 200, 255, 0.3)',
    maxWidth: '600px',
    margin: '20px auto',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    color: '#e0e0e0',
  },
  title: {
    margin: '0 0 8px 0',
    fontSize: '20px',
    fontWeight: 700,
    color: '#64c8ff',
  },
  subtitle: {
    margin: '0 0 20px 0',
    fontSize: '14px',
    color: '#888',
  },
  section: {
    marginBottom: '16px',
  },
  label: {
    display: 'block',
    marginBottom: '6px',
    fontSize: '12px',
    fontWeight: 600,
    color: '#aaa',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  select: {
    width: '100%',
    padding: '10px 12px',
    backgroundColor: 'rgba(30, 30, 50, 0.8)',
    border: '1px solid rgba(100, 200, 255, 0.2)',
    borderRadius: '6px',
    color: '#e0e0e0',
    fontSize: '14px',
    cursor: 'pointer',
  },
  compareGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr auto 1fr',
    gap: '16px',
    alignItems: 'start',
    marginBottom: '20px',
  },
  manufacturerCard: {
    padding: '12px',
    backgroundColor: 'rgba(30, 30, 50, 0.5)',
    borderRadius: '8px',
    border: '1px solid rgba(100, 200, 255, 0.15)',
  },
  vsDivider: {
    padding: '40px 16px',
    fontSize: '18px',
    fontWeight: 700,
    color: '#64c8ff',
  },
  productDetails: {
    marginTop: '12px',
    padding: '10px',
    backgroundColor: 'rgba(100, 200, 255, 0.1)',
    borderRadius: '6px',
  },
  productName: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#64c8ff',
    marginBottom: '6px',
  },
  productMeta: {
    fontSize: '12px',
    color: '#888',
    marginBottom: '2px',
  },
  modeButtons: {
    display: 'flex',
    gap: '8px',
  },
  modeButton: {
    flex: 1,
    padding: '8px 12px',
    backgroundColor: 'rgba(30, 30, 50, 0.8)',
    border: '1px solid rgba(100, 200, 255, 0.2)',
    borderRadius: '6px',
    color: '#aaa',
    fontSize: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  modeButtonActive: {
    backgroundColor: 'rgba(100, 200, 255, 0.2)',
    borderColor: '#64c8ff',
    color: '#64c8ff',
  },
  compareButton: {
    width: '100%',
    padding: '12px 20px',
    backgroundColor: 'linear-gradient(135deg, #00aaaa, #006666)',
    background: 'linear-gradient(135deg, #00aaaa, #006666)',
    border: 'none',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  compareButtonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  resultsPanel: {
    marginTop: '20px',
    padding: '16px',
    backgroundColor: 'rgba(100, 200, 100, 0.1)',
    border: '1px solid rgba(100, 200, 100, 0.3)',
    borderRadius: '8px',
  },
  resultsTitle: {
    margin: '0 0 12px 0',
    fontSize: '16px',
    fontWeight: 600,
    color: '#64c864',
  },
  resultRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '8px',
    fontSize: '13px',
  },
  resultLabel: {
    color: '#888',
  },
  resultValue: {
    color: '#e0e0e0',
    fontWeight: 500,
  },
  resultsNote: {
    marginTop: '12px',
    fontSize: '11px',
    color: '#888',
    fontStyle: 'italic',
  },
};

export default ManufacturerComparison;
