/**
 * Side-by-Side Comparison Component
 * L0-CMD-2026-0125-003 Phase A2
 *
 * Displays two manufacturer variants side by side
 */

import { DifferenceReport } from '../features/or-equal-comparison';

interface Props {
  manufacturerA: string;
  manufacturerB: string;
  differenceReport: DifferenceReport | null;
  onClose: () => void;
}

export function ComparisonSideBySide({
  manufacturerA,
  manufacturerB,
  differenceReport,
  onClose
}: Props) {
  return (
    <div className="comparison-overlay comparison-side-by-side">
      <div className="comparison-header">
        <h3 className="comparison-title">
          <span className="comparison-icon">◇</span>
          Side-by-Side Comparison
        </h3>
        <button className="comparison-close" onClick={onClose} title="Close comparison">
          ×
        </button>
      </div>

      <div className="comparison-labels">
        <div className="comparison-label left">
          <span className="label-badge">A</span>
          <span className="label-name">{manufacturerA}</span>
        </div>
        <div className="comparison-divider-label">vs</div>
        <div className="comparison-label right">
          <span className="label-badge">B</span>
          <span className="label-name">{manufacturerB}</span>
        </div>
      </div>

      {differenceReport && (
        <div className="comparison-report">
          <div className="report-score">
            <span className="score-label">Equivalency Score</span>
            <span className="score-value">
              {(differenceReport.overallEquivalencyScore * 100).toFixed(0)}%
            </span>
          </div>

          {differenceReport.productChanges.length > 0 && (
            <div className="report-changes">
              <h4>Product Changes</h4>
              {differenceReport.productChanges.map((change, idx) => (
                <div key={idx} className="change-item">
                  <div className="change-layer">{change.layerId}</div>
                  <div className="change-products">
                    <span className="change-from">{change.fromProduct}</span>
                    <span className="change-arrow">→</span>
                    <span className="change-to">{change.toProduct}</span>
                  </div>
                  <div className="change-confidence">
                    {(change.confidenceScore * 100).toFixed(0)}%
                  </div>
                </div>
              ))}
            </div>
          )}

          {differenceReport.warnings.length > 0 && (
            <div className="report-warnings">
              <h4>Warnings</h4>
              {differenceReport.warnings.map((warning, idx) => (
                <div key={idx} className="warning-item">
                  <span className="warning-icon">⚠</span>
                  {warning}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="comparison-hint">
        <span>Drag to rotate both views • Scroll to zoom</span>
      </div>
    </div>
  );
}

export default ComparisonSideBySide;
