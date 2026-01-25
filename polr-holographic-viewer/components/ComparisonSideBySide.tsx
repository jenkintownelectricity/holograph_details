/**
 * Side-by-Side Comparison Component
 * L0-CMD-2026-0125-004 Phase A2
 *
 * Displays two manufacturer variants side by side with actual 3D rendering
 */

import { useRef, useEffect } from 'react';
import { DualSceneManager } from '../utils/dualRenderer';
import { DifferenceReport } from '../features/or-equal-comparison';
import { SemanticDetail } from '../schemas/semantic-detail';

interface Props {
  detail: SemanticDetail;
  manufacturerA: string;
  manufacturerB: string;
  differenceReport: DifferenceReport | null;
  onClose: () => void;
}

export function ComparisonSideBySide({
  detail,
  manufacturerA,
  manufacturerB,
  differenceReport,
  onClose
}: Props) {
  const container1Ref = useRef<HTMLDivElement>(null);
  const container2Ref = useRef<HTMLDivElement>(null);
  const managerRef = useRef<DualSceneManager | null>(null);

  useEffect(() => {
    if (!container1Ref.current || !container2Ref.current) return;

    // Create dual scene manager
    managerRef.current = new DualSceneManager(
      container1Ref.current,
      container2Ref.current,
      {
        backgroundColor: 0x050510,
        syncCameras: true
      }
    );

    // Load the detail with both manufacturers
    managerRef.current.loadDetails(detail, manufacturerA, manufacturerB);

    // Handle resize when overlay is shown
    const resizeObserver = new ResizeObserver(() => {
      managerRef.current?.resize();
    });
    resizeObserver.observe(container1Ref.current);
    resizeObserver.observe(container2Ref.current);

    return () => {
      resizeObserver.disconnect();
      managerRef.current?.dispose();
      managerRef.current = null;
    };
  }, [detail, manufacturerA, manufacturerB]);

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

      <div className="comparison-viewports-container">
        <div className="comparison-viewport-wrapper">
          <div className="comparison-viewport-label">
            <span className="label-badge">A</span>
            <span className="label-name">{manufacturerA}</span>
          </div>
          <div ref={container1Ref} className="comparison-viewport-canvas" />
        </div>

        <div className="comparison-divider">
          <span className="divider-text">vs</span>
        </div>

        <div className="comparison-viewport-wrapper">
          <div className="comparison-viewport-label">
            <span className="label-badge">B</span>
            <span className="label-name">{manufacturerB}</span>
          </div>
          <div ref={container2Ref} className="comparison-viewport-canvas" />
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
        <span>Drag to rotate both views (synchronized) • Scroll to zoom</span>
      </div>
    </div>
  );
}

export default ComparisonSideBySide;
