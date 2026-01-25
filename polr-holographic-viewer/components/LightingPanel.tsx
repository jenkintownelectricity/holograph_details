/**
 * Lighting Presets Panel Component
 * Allows users to switch between lighting configurations
 */

import { useState } from 'react';

export type LightingPreset = 'studio' | 'outdoor' | 'overcast' | 'technical' | 'dramatic';

interface Props {
  onPresetChange: (preset: LightingPreset) => void;
  currentPreset?: LightingPreset;
}

const PRESETS: { value: LightingPreset; label: string; description: string }[] = [
  { value: 'studio', label: 'Studio', description: 'Professional 3-point lighting' },
  { value: 'outdoor', label: 'Outdoor', description: 'Construction site daylight' },
  { value: 'overcast', label: 'Overcast', description: 'Soft diffuse lighting' },
  { value: 'technical', label: 'Technical', description: 'Even lighting for detail' },
  { value: 'dramatic', label: 'Dramatic', description: 'High contrast presentation' }
];

export function LightingPanel({ onPresetChange, currentPreset = 'studio' }: Props) {
  const [preset, setPreset] = useState<LightingPreset>(currentPreset);

  const handleChange = (newPreset: LightingPreset) => {
    setPreset(newPreset);
    onPresetChange(newPreset);
  };

  return (
    <div className="lighting-panel">
      <h4 className="lighting-title">LIGHTING PRESET</h4>
      <div className="lighting-presets">
        {PRESETS.map(p => (
          <button
            key={p.value}
            className={`preset-btn ${preset === p.value ? 'active' : ''}`}
            onClick={() => handleChange(p.value)}
            title={p.description}
          >
            {p.label}
          </button>
        ))}
      </div>
      <div className="preset-description">
        {PRESETS.find(p => p.value === preset)?.description}
      </div>
    </div>
  );
}
