/**
 * Slider Comparison Component
 * L0-CMD-2026-0125-003 Phase A3
 *
 * Draggable slider to reveal both manufacturer variants
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { DifferenceReport } from '../features/or-equal-comparison';

interface Props {
  manufacturerA: string;
  manufacturerB: string;
  differenceReport: DifferenceReport | null;
  sliderPosition: number;
  onSliderChange: (position: number) => void;
  onClose: () => void;
}

export function ComparisonSlider({
  manufacturerA,
  manufacturerB,
  differenceReport,
  sliderPosition,
  onSliderChange,
  onClose
}: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    onSliderChange(Math.max(0, Math.min(1, x)));
  }, [isDragging, onSliderChange]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging || !containerRef.current) return;

    const touch = e.touches[0];
    const rect = containerRef.current.getBoundingClientRect();
    const x = (touch.clientX - rect.left) / rect.width;
    onSliderChange(Math.max(0, Math.min(1, x)));
  }, [isDragging, onSliderChange]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleMouseUp);

      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        window.removeEventListener('touchmove', handleTouchMove);
        window.removeEventListener('touchend', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove]);

  const sliderPercentage = sliderPosition * 100;

  return (
    <div className="comparison-overlay comparison-slider" ref={containerRef}>
      <div className="comparison-header">
        <h3 className="comparison-title">
          <span className="comparison-icon">◇</span>
          Slider Comparison
        </h3>
        <button className="comparison-close" onClick={onClose} title="Close comparison">
          ×
        </button>
      </div>

      <div className="slider-labels">
        <div
          className="slider-label left"
          style={{ opacity: 1 - sliderPosition * 0.5 }}
        >
          <span className="label-badge">A</span>
          <span className="label-name">{manufacturerA}</span>
        </div>
        <div
          className="slider-label right"
          style={{ opacity: 0.5 + sliderPosition * 0.5 }}
        >
          <span className="label-badge">B</span>
          <span className="label-name">{manufacturerB}</span>
        </div>
      </div>

      <div
        className="slider-track"
        style={{ left: `${sliderPercentage}%` }}
        onMouseDown={handleMouseDown}
        onTouchStart={() => setIsDragging(true)}
      >
        <div className="slider-handle">
          <div className="slider-grip">
            <span className="grip-line" />
            <span className="grip-line" />
            <span className="grip-line" />
          </div>
        </div>
        <div className="slider-line" />
      </div>

      {differenceReport && (
        <div className="comparison-report slider-report">
          <div className="report-score">
            <span className="score-label">Equivalency</span>
            <span className="score-value">
              {(differenceReport.overallEquivalencyScore * 100).toFixed(0)}%
            </span>
          </div>
        </div>
      )}

      <div className="comparison-hint">
        <span>Drag slider to reveal • {sliderPercentage.toFixed(0)}%</span>
      </div>
    </div>
  );
}

export default ComparisonSlider;
