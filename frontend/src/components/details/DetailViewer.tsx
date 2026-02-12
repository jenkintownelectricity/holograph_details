import React, { useEffect, useState, useCallback } from 'react';
import { ThreeViewer, ViewerLayer } from '../viewer/ThreeViewer';
import { LayerPanel } from '../layers/LayerPanel';
import { details as detailsApi } from '../../services/api';

interface DetailViewerProps {
  detailId: string;
  onBack: () => void;
}

export function DetailViewer({ detailId, onBack }: DetailViewerProps) {
  const [detail, setDetail] = useState<any>(null);
  const [layers, setLayers] = useState<ViewerLayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exploded, setExploded] = useState(false);
  const [sectionCut, setSectionCut] = useState(false);

  useEffect(() => {
    setLoading(true);
    detailsApi.get(detailId)
      .then(res => {
        setDetail(res.detail);
        setLayers((res.detail.layers || []).map((l: any) => ({
          ...l,
          visible: l.visibleDefault !== false,
        })));
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [detailId]);

  const handleToggle = useCallback((id: string, visible: boolean) => {
    setLayers(prev => prev.map(l => l.id === id ? { ...l, visible } : l));
  }, []);

  const handleFilterAll = useCallback(() => {
    setLayers(prev => prev.map(l => ({ ...l, visible: true })));
  }, []);

  const handleFilterNone = useCallback(() => {
    setLayers(prev => prev.map(l => ({ ...l, visible: false })));
  }, []);

  const handleFilterGCP = useCallback(() => {
    setLayers(prev => prev.map(l => ({
      ...l,
      visible: !!l.manufacturer?.includes('GCP'),
    })));
  }, []);

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>Loading detail...</div>;
  if (error) return <div style={{ padding: 40, color: '#dc2626' }}>{error}</div>;

  return (
    <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
      <LayerPanel
        layers={layers}
        onToggle={handleToggle}
        onFilterAll={handleFilterAll}
        onFilterNone={handleFilterNone}
        onFilterGCP={handleFilterGCP}
        exploded={exploded}
        sectionCut={sectionCut}
        onToggleExplode={() => setExploded(e => !e)}
        onToggleSection={() => setSectionCut(s => !s)}
        onResetView={() => {}}
      />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{
          padding: '10px 20px',
          background: '#fff',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
        }}>
          <button
            onClick={onBack}
            style={{
              background: 'none',
              border: '1px solid #e2e8f0',
              borderRadius: 6,
              padding: '5px 12px',
              cursor: 'pointer',
              fontSize: 13,
            }}
          >
            &larr; Back
          </button>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: '#1e293b', margin: 0 }}>
              {detail?.name}
            </h2>
            <span style={{ fontSize: 12, color: '#64748b' }}>
              {detail?.category} &bull; {layers.length} layers
            </span>
          </div>
        </div>
        <ThreeViewer
          layers={layers}
          exploded={exploded}
          sectionCut={sectionCut}
        />
      </div>
    </div>
  );
}
