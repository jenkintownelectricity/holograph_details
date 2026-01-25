/**
 * Or Equal Comparison Panel Component
 * Allows users to compare products across manufacturers
 */

import { useState } from 'react';

interface Props {
  onCompare: (mfr1: string, mfr2: string, mode: string) => void;
}

const MANUFACTURERS = [
  'GCP Applied Technologies',
  'Carlisle CCW',
  'Sika',
  'Tremco',
  'W.R. Meadows',
  'Henry Company',
  'Firestone'
];

export function ComparisonPanel({ onCompare }: Props) {
  const [mfr1, setMfr1] = useState('GCP Applied Technologies');
  const [mfr2, setMfr2] = useState('Carlisle CCW');
  const [mode, setMode] = useState('side-by-side');

  return (
    <div className="comparison-panel">
      <h4 className="comparison-title">OR EQUAL COMPARE</h4>
      <div className="compare-row">
        <select
          className="compare-select"
          value={mfr1}
          onChange={e => setMfr1(e.target.value)}
        >
          {MANUFACTURERS.map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
        <span className="compare-vs">vs</span>
        <select
          className="compare-select"
          value={mfr2}
          onChange={e => setMfr2(e.target.value)}
        >
          {MANUFACTURERS.map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>
      <div className="compare-modes">
        <label className="mode-option">
          <input
            type="radio"
            name="compareMode"
            value="side-by-side"
            checked={mode === 'side-by-side'}
            onChange={e => setMode(e.target.value)}
          />
          Side-by-Side
        </label>
        <label className="mode-option">
          <input
            type="radio"
            name="compareMode"
            value="slider"
            checked={mode === 'slider'}
            onChange={e => setMode(e.target.value)}
          />
          Slider
        </label>
        <label className="mode-option">
          <input
            type="radio"
            name="compareMode"
            value="toggle"
            checked={mode === 'toggle'}
            onChange={e => setMode(e.target.value)}
          />
          Toggle
        </label>
      </div>
      <button
        className="compare-btn"
        onClick={() => onCompare(mfr1, mfr2, mode)}
        disabled={mfr1 === mfr2}
      >
        Compare Products
      </button>
      {mfr1 === mfr2 && (
        <div className="compare-hint">Select different manufacturers</div>
      )}
    </div>
  );
}
