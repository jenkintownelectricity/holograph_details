/**
 * Layer DNA Panel Component
 * L0-CMD-2026-0125-005 Phase 6
 *
 * Displays detailed Construction DNA information for a layer.
 * Shows 20-tier taxonomy including chemistry, failure modes, specs.
 */

import { useMemo } from 'react';
import { POLRMaterial } from '../adapters/dna-adapter';
import { MaterialDNA, getSeverityColor, COMMON_FAILURE_MODES } from '../types/construction-dna';
import { getDNAProfile, getBaseChemistry } from '../data/dna-materials';
import SpecSheetLink from './SpecSheetLink';

interface Props {
  /** Material from store or layer */
  material?: POLRMaterial;
  /** Material type key for looking up DNA */
  materialType?: string;
  /** Layer name for display */
  layerName?: string;
  /** Whether panel is expanded */
  isExpanded?: boolean;
  /** Toggle expansion */
  onToggle?: () => void;
  /** Compact mode shows less detail */
  compact?: boolean;
}

export function LayerDNAPanel({
  material,
  materialType,
  layerName,
  isExpanded = true,
  onToggle,
  compact = false
}: Props) {
  // Get DNA data either from POLR material or lookup
  const dnaData = useMemo(() => {
    if (material?.dna) {
      return material.dna;
    }
    if (materialType) {
      return getDNAProfile(materialType);
    }
    return undefined;
  }, [material, materialType]);

  const chemistry = useMemo(() => {
    if (material?.chemistry) {
      return material.chemistry;
    }
    if (materialType) {
      return getBaseChemistry(materialType);
    }
    return undefined;
  }, [material, materialType]);

  if (!dnaData && !chemistry) {
    return (
      <div className="layer-dna-panel layer-dna-panel--empty">
        <span className="dna-empty-text">No DNA data available</span>
      </div>
    );
  }

  const displayName = layerName || material?.name || materialType || 'Unknown Layer';

  return (
    <div className={`layer-dna-panel ${compact ? 'layer-dna-panel--compact' : ''}`}>
      {/* Header */}
      <div className="dna-layer-header" onClick={onToggle}>
        <div className="dna-layer-title">
          <span className="dna-helix">🧬</span>
          <span className="dna-layer-name">{displayName}</span>
        </div>
        {chemistry && (
          <span className="dna-chemistry-badge">{chemistry}</span>
        )}
        {onToggle && (
          <span className="dna-toggle-icon">{isExpanded ? '▼' : '▶'}</span>
        )}
      </div>

      {/* Content */}
      {isExpanded && dnaData && (
        <div className="dna-layer-content">
          {/* Basic Info */}
          <div className="dna-section">
            <div className="dna-row">
              <span className="dna-label">Division</span>
              <span className="dna-value">{dnaData.division || '—'}</span>
            </div>
            <div className="dna-row">
              <span className="dna-label">Category</span>
              <span className="dna-value">{dnaData.category || '—'}</span>
            </div>
            {dnaData.manufacturer && (
              <div className="dna-row">
                <span className="dna-label">Manufacturer</span>
                <span className="dna-value">{dnaData.manufacturer}</span>
              </div>
            )}
            {dnaData.product && (
              <div className="dna-row">
                <span className="dna-label">Product</span>
                <span className="dna-value">{dnaData.product}</span>
              </div>
            )}
          </div>

          {/* Physical Properties */}
          {!compact && (
            <div className="dna-section">
              <h4 className="dna-section-title">Physical Properties</h4>
              <div className="dna-properties-grid">
                {dnaData.thicknessMil !== undefined && (
                  <div className="dna-prop">
                    <span className="dna-prop-label">Thickness</span>
                    <span className="dna-prop-value">{dnaData.thicknessMil} mil</span>
                  </div>
                )}
                {dnaData.color && (
                  <div className="dna-prop">
                    <span className="dna-prop-label">Color</span>
                    <span className="dna-prop-value">{dnaData.color}</span>
                  </div>
                )}
                {dnaData.sri !== undefined && (
                  <div className="dna-prop">
                    <span className="dna-prop-label">SRI</span>
                    <span className="dna-prop-value">{dnaData.sri}</span>
                  </div>
                )}
                {dnaData.fireRating && (
                  <div className="dna-prop">
                    <span className="dna-prop-label">Fire Rating</span>
                    <span className="dna-prop-value">{dnaData.fireRating}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Mechanical Properties */}
          {!compact && (dnaData.tensileStrength || dnaData.elongation) && (
            <div className="dna-section">
              <h4 className="dna-section-title">Mechanical Properties</h4>
              <div className="dna-properties-grid">
                {dnaData.tensileStrength !== undefined && (
                  <div className="dna-prop">
                    <span className="dna-prop-label">Tensile</span>
                    <span className="dna-prop-value">{dnaData.tensileStrength} psi</span>
                  </div>
                )}
                {dnaData.elongation !== undefined && (
                  <div className="dna-prop">
                    <span className="dna-prop-label">Elongation</span>
                    <span className="dna-prop-value">{dnaData.elongation}%</span>
                  </div>
                )}
                {dnaData.tempRangeMin !== undefined && dnaData.tempRangeMax !== undefined && (
                  <div className="dna-prop dna-prop--wide">
                    <span className="dna-prop-label">Temp Range</span>
                    <span className="dna-prop-value">
                      {dnaData.tempRangeMin}°F to {dnaData.tempRangeMax}°F
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Failure Modes */}
          {dnaData.failureModes && dnaData.failureModes.length > 0 && (
            <div className="dna-section">
              <h4 className="dna-section-title">Failure Risks</h4>
              <div className="dna-failure-list">
                {dnaData.failureModes.map((mode, idx) => (
                  <div
                    key={idx}
                    className="dna-failure-item"
                    style={{
                      borderLeftColor: getSeverityColor(mode.severity)
                    }}
                  >
                    <span className="failure-name">{mode.name}</span>
                    <span
                      className="failure-severity"
                      style={{ color: getSeverityColor(mode.severity) }}
                    >
                      {mode.severity}
                    </span>
                    {!compact && (
                      <span className="failure-desc">{mode.description}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Compatibility Notes */}
          {!compact && dnaData.compatibilityNotes && dnaData.compatibilityNotes.length > 0 && (
            <div className="dna-section">
              <h4 className="dna-section-title">Compatibility</h4>
              <ul className="dna-notes-list">
                {dnaData.compatibilityNotes.map((note, idx) => (
                  <li
                    key={idx}
                    className={`dna-note ${note.includes('INCOMPATIBLE') ? 'dna-note--warning' : ''}`}
                  >
                    {note}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Application Constraints */}
          {!compact && dnaData.applicationConstraints && dnaData.applicationConstraints.length > 0 && (
            <div className="dna-section">
              <h4 className="dna-section-title">Application Notes</h4>
              <ul className="dna-notes-list">
                {dnaData.applicationConstraints.map((constraint, idx) => (
                  <li key={idx} className="dna-note">
                    {constraint}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Spec Sheet Link */}
          {dnaData.specSheetUrl && (
            <div className="dna-section dna-section--footer">
              <SpecSheetLink
                url={dnaData.specSheetUrl}
                manufacturer={dnaData.manufacturer}
                product={dnaData.product}
              />
            </div>
          )}
        </div>
      )}

      <style>{`
        .layer-dna-panel {
          background: #1F2937;
          border-radius: 8px;
          overflow: hidden;
          font-size: 13px;
        }

        .layer-dna-panel--compact {
          font-size: 12px;
        }

        .layer-dna-panel--empty {
          padding: 12px;
          color: #6B7280;
          text-align: center;
        }

        .dna-layer-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background: #374151;
          cursor: pointer;
          transition: background 0.2s;
        }

        .dna-layer-header:hover {
          background: #4B5563;
        }

        .dna-layer-title {
          display: flex;
          align-items: center;
          gap: 8px;
          flex: 1;
        }

        .dna-helix {
          font-size: 16px;
        }

        .dna-layer-name {
          color: #F3F4F6;
          font-weight: 500;
        }

        .dna-chemistry-badge {
          background: #4F46E5;
          color: white;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .dna-toggle-icon {
          color: #9CA3AF;
          font-size: 10px;
        }

        .dna-layer-content {
          padding: 16px;
        }

        .dna-section {
          margin-bottom: 16px;
        }

        .dna-section:last-child {
          margin-bottom: 0;
        }

        .dna-section-title {
          color: #9CA3AF;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin: 0 0 8px 0;
        }

        .dna-row {
          display: flex;
          justify-content: space-between;
          padding: 4px 0;
          border-bottom: 1px solid #374151;
        }

        .dna-row:last-child {
          border-bottom: none;
        }

        .dna-label {
          color: #9CA3AF;
        }

        .dna-value {
          color: #E5E7EB;
          font-weight: 500;
        }

        .dna-properties-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
        }

        .dna-prop {
          background: #374151;
          padding: 8px 12px;
          border-radius: 4px;
        }

        .dna-prop--wide {
          grid-column: span 2;
        }

        .dna-prop-label {
          display: block;
          color: #9CA3AF;
          font-size: 10px;
          text-transform: uppercase;
          margin-bottom: 2px;
        }

        .dna-prop-value {
          color: #F3F4F6;
          font-weight: 600;
        }

        .dna-failure-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .dna-failure-item {
          background: #374151;
          padding: 8px 12px;
          border-radius: 4px;
          border-left: 3px solid;
        }

        .failure-name {
          color: #F3F4F6;
          font-weight: 500;
          display: block;
        }

        .failure-severity {
          font-size: 10px;
          text-transform: uppercase;
          font-weight: 600;
        }

        .failure-desc {
          display: block;
          color: #9CA3AF;
          font-size: 12px;
          margin-top: 4px;
        }

        .dna-notes-list {
          margin: 0;
          padding-left: 16px;
          color: #D1D5DB;
        }

        .dna-notes-list li {
          margin-bottom: 4px;
        }

        .dna-note--warning {
          color: #FBBF24;
        }

        .dna-section--footer {
          padding-top: 12px;
          border-top: 1px solid #374151;
        }
      `}</style>
    </div>
  );
}

export default LayerDNAPanel;
