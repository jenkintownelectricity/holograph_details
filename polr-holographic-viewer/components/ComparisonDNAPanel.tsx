/**
 * Comparison DNA Panel Component
 * L0-CMD-2026-0125-004 Phase C4
 *
 * Displays Construction DNA compatibility warnings in comparison view.
 * Shows material chemistry, failure modes, and compatibility issues.
 */

import { SemanticDetail } from '../schemas/semantic-detail';
import { useDNACompatibility, CompatibilityWarning, MaterialInfo } from '../hooks/useDNACompatibility';
import { getCompatibilityColor, getSeverityColor } from '../types/construction-dna';

interface Props {
  detail: SemanticDetail;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

export function ComparisonDNAPanel({
  detail,
  isExpanded = true,
  onToggleExpand
}: Props) {
  const analysis = useDNACompatibility(detail);

  if (analysis.totalLayers === 0) {
    return null;
  }

  return (
    <div className="dna-panel">
      <div className="dna-header" onClick={onToggleExpand}>
        <div className="dna-title">
          <span className="dna-icon">🧬</span>
          <span>Construction DNA</span>
        </div>
        <div className="dna-summary">
          {analysis.hasCriticalIssues ? (
            <span className="dna-status critical">
              {analysis.incompatibleCount} Incompatible
            </span>
          ) : analysis.conditionalCount > 0 ? (
            <span className="dna-status warning">
              {analysis.conditionalCount} Warning{analysis.conditionalCount > 1 ? 's' : ''}
            </span>
          ) : (
            <span className="dna-status ok">
              Compatible
            </span>
          )}
          {onToggleExpand && (
            <span className="dna-expand-icon">{isExpanded ? '▼' : '▶'}</span>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="dna-content">
          {/* Coverage Info */}
          <div className="dna-coverage">
            <span className="coverage-label">DNA Coverage:</span>
            <span className="coverage-value">
              {analysis.layersWithDNA}/{analysis.totalLayers} layers
            </span>
          </div>

          {/* Compatibility Warnings */}
          {analysis.warnings.length > 0 && (
            <div className="dna-warnings">
              <h4>Compatibility Issues</h4>
              {analysis.warnings.map((warning, idx) => (
                <CompatibilityWarningCard key={idx} warning={warning} />
              ))}
            </div>
          )}

          {/* No Issues Message */}
          {analysis.warnings.length === 0 && analysis.layersWithDNA > 0 && (
            <div className="dna-ok-message">
              <span className="ok-icon">✓</span>
              <span>{analysis.summaryMessage}</span>
            </div>
          )}

          {/* Material Details (collapsed by default) */}
          {analysis.materialInfo.filter(m => m.chemistry).length > 0 && (
            <details className="dna-materials-details">
              <summary>Material Chemistry Details</summary>
              <div className="dna-materials-list">
                {analysis.materialInfo
                  .filter(m => m.chemistry)
                  .map((info, idx) => (
                    <MaterialInfoCard key={idx} info={info} />
                  ))}
              </div>
            </details>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Compatibility Warning Card
 */
function CompatibilityWarningCard({ warning }: { warning: CompatibilityWarning }) {
  const statusColor = getCompatibilityColor(warning.result.status);

  return (
    <div
      className="warning-card"
      style={{ borderLeftColor: statusColor }}
    >
      <div className="warning-layers">
        <span className="warning-layer">{warning.layer1Name}</span>
        <span className="warning-chemistry">({warning.layer1Chemistry})</span>
        <span className="warning-arrow">↔</span>
        <span className="warning-layer">{warning.layer2Name}</span>
        <span className="warning-chemistry">({warning.layer2Chemistry})</span>
      </div>
      <div className="warning-status" style={{ color: statusColor }}>
        {warning.result.status.toUpperCase()}
      </div>
      {warning.result.reason && (
        <div className="warning-reason">{warning.result.reason}</div>
      )}
      {warning.result.conditions && warning.result.conditions.length > 0 && (
        <div className="warning-conditions">
          <span className="conditions-label">Required:</span>
          <ul>
            {warning.result.conditions.map((condition, idx) => (
              <li key={idx}>{condition}</li>
            ))}
          </ul>
        </div>
      )}
      {warning.result.recommendation && (
        <div className="warning-recommendation">
          <span className="rec-label">Recommendation:</span>
          <span>{warning.result.recommendation}</span>
        </div>
      )}
    </div>
  );
}

/**
 * Material Info Card
 */
function MaterialInfoCard({ info }: { info: MaterialInfo }) {
  return (
    <div className="material-card">
      <div className="material-header">
        <span className="material-name">{info.layerName}</span>
        <span className="material-chemistry">{info.chemistry}</span>
      </div>
      {info.failureModes.length > 0 && (
        <div className="material-failures">
          <span className="failures-label">Failure Risks:</span>
          {info.failureModes.map((mode, idx) => (
            <span
              key={idx}
              className="failure-badge"
              style={{ backgroundColor: getSeverityColor(mode.severity) + '33', color: getSeverityColor(mode.severity) }}
              title={mode.description}
            >
              {mode.name}
            </span>
          ))}
        </div>
      )}
      {info.compatibilityNotes.length > 0 && (
        <div className="material-notes">
          {info.compatibilityNotes.slice(0, 2).map((note, idx) => (
            <div key={idx} className="note-item">• {note}</div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ComparisonDNAPanel;
