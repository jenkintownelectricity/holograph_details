import React from 'react';
import type { ViewerLayer } from '../viewer/ThreeViewer';

interface LayerPanelProps {
  layers: ViewerLayer[];
  onToggle: (id: string, visible: boolean) => void;
  onFilterAll: () => void;
  onFilterNone: () => void;
  onFilterGCP: () => void;
  exploded: boolean;
  sectionCut: boolean;
  onToggleExplode: () => void;
  onToggleSection: () => void;
  onResetView: () => void;
}

export function LayerPanel({
  layers, onToggle, onFilterAll, onFilterNone, onFilterGCP,
  exploded, sectionCut, onToggleExplode, onToggleSection, onResetView,
}: LayerPanelProps) {
  const allOn = layers.every(l => l.visible);
  const noneOn = layers.every(l => !l.visible);
  const gcpOn = layers.every(l => l.visible === !!l.manufacturer?.includes('GCP'));

  return (
    <div style={styles.sidebar}>
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Quick Filters</h3>
        <div style={styles.filterRow}>
          <FilterBtn label="All" active={allOn} onClick={onFilterAll} />
          <FilterBtn label="None" active={noneOn} onClick={onFilterNone} />
          <FilterBtn label="GCP Only" active={gcpOn && !allOn && !noneOn} onClick={onFilterGCP} />
        </div>
      </div>

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>View Controls</h3>
        <div style={styles.filterRow}>
          <ControlBtn label="Exploded" active={exploded} onClick={onToggleExplode} />
          <ControlBtn label="Section Cut" active={sectionCut} onClick={onToggleSection} />
        </div>
        <div style={{ ...styles.filterRow, marginTop: 6 }}>
          <ControlBtn label="Reset View" active={false} onClick={onResetView} />
        </div>
      </div>

      <div style={{ ...styles.section, flex: 1, overflowY: 'auto' }}>
        <h3 style={styles.sectionTitle}>Layers</h3>
        {layers.map(layer => (
          <div key={layer.id} style={styles.layerItem}>
            <div style={{ ...styles.layerColor, background: layer.color }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={styles.layerName}>
                {layer.name}
                {layer.manufacturer?.includes('GCP') && (
                  <span style={styles.gcpBadge}>GCP</span>
                )}
              </div>
              <div style={styles.layerDetail}>
                {layer.productName || layer.materialType}
                {layer.csiSection && ` — ${layer.csiSection}`}
              </div>
            </div>
            <label style={styles.toggle}>
              <input
                type="checkbox"
                checked={layer.visible}
                onChange={(e) => onToggle(layer.id, e.target.checked)}
                style={{ opacity: 0, width: 0, height: 0, position: 'absolute' }}
              />
              <span style={{
                ...styles.slider,
                background: layer.visible ? '#2563eb' : '#cbd5e1',
              }}>
                <span style={{
                  ...styles.sliderDot,
                  transform: layer.visible ? 'translateX(16px)' : 'translateX(0)',
                }} />
              </span>
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}

function FilterBtn({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '5px 12px',
        border: `1px solid ${active ? '#2563eb' : '#e2e8f0'}`,
        borderRadius: 16,
        background: active ? '#2563eb' : '#fff',
        color: active ? '#fff' : '#1e293b',
        fontSize: 12,
        cursor: 'pointer',
      }}
    >
      {label}
    </button>
  );
}

function ControlBtn({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        padding: '8px 12px',
        border: `1px solid ${active ? '#2563eb' : '#e2e8f0'}`,
        borderRadius: 6,
        background: active ? '#2563eb' : '#fff',
        color: active ? '#fff' : '#1e293b',
        fontSize: 12,
        fontWeight: 500,
        cursor: 'pointer',
        textAlign: 'center' as const,
      }}
    >
      {label}
    </button>
  );
}

const styles: Record<string, React.CSSProperties> = {
  sidebar: {
    width: 320,
    minWidth: 320,
    background: '#fff',
    borderRight: '1px solid #e2e8f0',
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
  },
  section: {
    padding: 16,
    borderBottom: '1px solid #e2e8f0',
  },
  sectionTitle: {
    fontSize: 11,
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
    color: '#64748b',
    marginBottom: 12,
    margin: '0 0 12px',
  },
  filterRow: {
    display: 'flex',
    gap: 6,
    flexWrap: 'wrap' as const,
  },
  layerItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '8px 4px',
    borderBottom: '1px solid #f1f5f9',
  },
  layerColor: {
    width: 16,
    height: 16,
    borderRadius: 3,
    flexShrink: 0,
    border: '1px solid rgba(0,0,0,0.1)',
  },
  layerName: {
    fontSize: 13,
    fontWeight: 500,
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  layerDetail: {
    fontSize: 11,
    color: '#64748b',
  },
  gcpBadge: {
    fontSize: 9,
    background: '#dbeafe',
    color: '#1d4ed8',
    padding: '1px 6px',
    borderRadius: 8,
    fontWeight: 600,
    marginLeft: 6,
  },
  toggle: {
    position: 'relative' as const,
    width: 36,
    height: 20,
    flexShrink: 0,
    cursor: 'pointer',
  },
  slider: {
    display: 'block',
    width: 36,
    height: 20,
    borderRadius: 10,
    transition: 'background 0.2s',
    position: 'relative' as const,
  },
  sliderDot: {
    display: 'block',
    width: 16,
    height: 16,
    borderRadius: '50%',
    background: '#fff',
    position: 'absolute' as const,
    top: 2,
    left: 2,
    transition: 'transform 0.2s',
    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
  },
};
