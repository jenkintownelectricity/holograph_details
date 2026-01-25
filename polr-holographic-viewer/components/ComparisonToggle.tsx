/**
 * Toggle Comparison Component
 * L0-CMD-2026-0125-003 Phase A4
 *
 * Toggle button to switch between manufacturer variants
 */

import { useEffect, useCallback } from 'react';
import { DifferenceReport } from '../features/or-equal-comparison';

interface Props {
  manufacturers: [string, string];
  currentIndex: number;
  differenceReport: DifferenceReport | null;
  onToggle: () => void;
  onClose: () => void;
}

export function ComparisonToggle({
  manufacturers,
  currentIndex,
  differenceReport,
  onToggle,
  onClose
}: Props) {
  const currentManufacturer = manufacturers[currentIndex];
  const otherManufacturer = manufacturers[currentIndex === 0 ? 1 : 0];

  // Keyboard shortcut: Space to toggle
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.code === 'Space' && !e.repeat) {
      e.preventDefault();
      onToggle();
    }
  }, [onToggle]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="comparison-overlay comparison-toggle">
      <div className="comparison-header">
        <h3 className="comparison-title">
          <span className="comparison-icon">◇</span>
          Toggle Comparison
        </h3>
        <button className="comparison-close" onClick={onClose} title="Close comparison">
          ×
        </button>
      </div>

      <div className="toggle-display">
        <div className="toggle-current">
          <span className="toggle-label">Currently Viewing</span>
          <span className="toggle-manufacturer">{currentManufacturer}</span>
        </div>

        <button
          className="toggle-switch-btn"
          onClick={onToggle}
          title="Press Space to toggle"
        >
          <span className="toggle-arrow">⟷</span>
          <span className="toggle-text">Switch to {otherManufacturer}</span>
        </button>

        <div className="toggle-indicators">
          {manufacturers.map((mfr, idx) => (
            <div
              key={mfr}
              className={`toggle-indicator ${idx === currentIndex ? 'active' : ''}`}
            >
              <span className="indicator-badge">{idx === 0 ? 'A' : 'B'}</span>
              <span className="indicator-name">{mfr}</span>
            </div>
          ))}
        </div>
      </div>

      {differenceReport && (
        <div className="comparison-report toggle-report">
          <div className="report-score">
            <span className="score-label">Equivalency Score</span>
            <span className="score-value">
              {(differenceReport.overallEquivalencyScore * 100).toFixed(0)}%
            </span>
          </div>

          {differenceReport.productChanges.length > 0 && (
            <div className="report-changes compact">
              {differenceReport.productChanges.slice(0, 3).map((change, idx) => (
                <div key={idx} className="change-item compact">
                  <span className="change-layer">{change.layerId}</span>
                  <span className="change-confidence">
                    {(change.confidenceScore * 100).toFixed(0)}%
                  </span>
                </div>
              ))}
              {differenceReport.productChanges.length > 3 && (
                <div className="change-more">
                  +{differenceReport.productChanges.length - 3} more
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="comparison-hint">
        <span>Press <kbd>Space</kbd> to toggle • Click button to switch</span>
      </div>
    </div>
  );
}

export default ComparisonToggle;
