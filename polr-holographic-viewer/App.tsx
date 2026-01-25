import { useEffect, useRef, useState, useMemo } from 'react';
import { calculateCompressionRatio, validateSemanticDetail } from './schemas/semantic-detail';
import { SemanticToMeshConverter } from './hologram/semantic-to-mesh';
import { HolographicRenderer, DisplayMode, HolographicConfig, CameraViewName } from './hologram/holographic-renderer';
import { SAMPLE_DETAILS, getDetailById } from './data/sample-details';
import { ComparisonPanel } from './components/ComparisonPanel';
import { LightingPanel, LightingPreset } from './components/LightingPanel';
import './styles/app.css';

export default function HologramApp() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [renderer, setRenderer] = useState<HolographicRenderer | null>(null);
  const converter = useMemo(() => new SemanticToMeshConverter(), []);
  
  const [selectedDetailId, setSelectedDetailId] = useState<string>(SAMPLE_DETAILS[0].id);
  const [displayMode, setDisplayMode] = useState<DisplayMode>('standard-3d');
  const [config, setConfig] = useState<Partial<HolographicConfig>>({
    holographicEffect: true,
    wireframeOverlay: true,
    autoRotate: true,
    scanLines: true,
    glowIntensity: 0.15
  });
  
  const [xrSupport, setXrSupport] = useState({ ar: false, vr: false });
  const [showSemanticPanel, setShowSemanticPanel] = useState(true);
  const [lightingPreset, setLightingPreset] = useState<LightingPreset>('studio');
  
  const selectedDetail = useMemo(() => 
    getDetailById(selectedDetailId) || SAMPLE_DETAILS[0],
    [selectedDetailId]
  );
  
  const compressionStats = useMemo(() => 
    calculateCompressionRatio(selectedDetail),
    [selectedDetail]
  );
  
  const validation = useMemo(() => 
    validateSemanticDetail(selectedDetail),
    [selectedDetail]
  );
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    const holoRenderer = new HolographicRenderer(containerRef.current, config);
    setRenderer(holoRenderer);
    holoRenderer.checkXRSupport().then(setXrSupport);
    
    return () => {
      holoRenderer.dispose();
      converter.dispose();
    };
  }, []);
  
  useEffect(() => {
    if (!renderer || !selectedDetail) return;
    const scene = converter.convert(selectedDetail);
    renderer.loadDetail(scene);
  }, [renderer, selectedDetail, converter]);
  
  useEffect(() => {
    if (renderer) renderer.setConfig(config);
  }, [renderer, config]);
  
  const toggleConfig = (key: keyof HolographicConfig) => {
    setConfig(prev => ({ ...prev, [key]: !prev[key] }));
  };
  
  const handleDisplayModeChange = async (mode: DisplayMode) => {
    setDisplayMode(mode);
    if (renderer) await renderer.setDisplayMode(mode);
  };
  
  const resetCamera = () => renderer?.resetCamera();

  const handleLightingChange = (preset: LightingPreset) => {
    setLightingPreset(preset);
    renderer?.setLightingPreset(preset);
  };

  const handleCompare = (mfr1: string, mfr2: string, mode: string) => {
    console.log(`Compare: ${mfr1} vs ${mfr2} (${mode})`);
    alert(`Comparing ${mfr1} vs ${mfr2}\n\nMode: ${mode}\n\nFull comparison visualization coming soon!`);
  };
  
  return (
    <div className="hologram-app">
      <header className="app-header">
        <div className="header-left">
          <div className="logo">
            <span className="logo-icon">◇</span>
            <span className="logo-text">POLR</span>
            <span className="logo-subtitle">Holographic Viewer</span>
          </div>
        </div>
        <div className="header-center">
          <h1 className="detail-title">{selectedDetail.name}</h1>
          <span className="detail-id">{selectedDetail.id}</span>
        </div>
        <div className="header-right">
          <div className="compression-badge">
            <span className="badge-value">{compressionStats.ratio.toLocaleString()}:1</span>
            <span className="badge-label">Compression</span>
          </div>
        </div>
      </header>
      
      <div className="main-content">
        <aside className="controls-panel">
          <section className="panel-section">
            <h3 className="section-title"><span className="section-icon">◈</span>Detail Selection</h3>
            <select 
              className="detail-select"
              value={selectedDetailId}
              onChange={(e) => setSelectedDetailId(e.target.value)}
            >
              {SAMPLE_DETAILS.map(d => (
                <option key={d.id} value={d.id}>{d.id}: {d.name}</option>
              ))}
            </select>
            <div className="category-badge">{selectedDetail.category.replace('-', ' ').toUpperCase()}</div>
          </section>
          
          <section className="panel-section">
            <h3 className="section-title"><span className="section-icon">◈</span>Display Mode</h3>
            <div className="mode-buttons">
              <button className={`mode-btn ${displayMode === 'standard-3d' ? 'active' : ''}`}
                onClick={() => handleDisplayModeChange('standard-3d')}>3D View</button>
              <button className={`mode-btn ${displayMode === 'ar-webxr' ? 'active' : ''}`}
                onClick={() => handleDisplayModeChange('ar-webxr')}
                disabled={!xrSupport.ar}
                title={xrSupport.ar ? 'Enter Augmented Reality mode' : 'AR requires WebXR-compatible browser and device (Quest, Vision Pro, etc.)'}>
                AR Mode {!xrSupport.ar && <span className="mode-status">N/A</span>}
              </button>
              <button className={`mode-btn ${displayMode === 'vr-webxr' ? 'active' : ''}`}
                onClick={() => handleDisplayModeChange('vr-webxr')}
                disabled={!xrSupport.vr}
                title={xrSupport.vr ? 'Enter Virtual Reality mode' : 'VR requires WebXR-compatible browser and headset'}>
                VR Mode {!xrSupport.vr && <span className="mode-status">N/A</span>}
              </button>
              <button className={`mode-btn ${displayMode === 'looking-glass' ? 'active' : ''}`}
                onClick={() => handleDisplayModeChange('looking-glass')}
                title="Looking Glass holographic display mode">
                Looking Glass
              </button>
            </div>
            {(!xrSupport.ar && !xrSupport.vr) && (
              <div className="xr-hint">WebXR requires compatible headset</div>
            )}
          </section>
          
          <section className="panel-section">
            <h3 className="section-title"><span className="section-icon">◈</span>Holographic Effects</h3>
            <div className="toggle-list">
              {(['holographicEffect', 'wireframeOverlay', 'scanLines', 'autoRotate'] as const).map(key => (
                <label key={key} className="toggle-item">
                  <input type="checkbox" checked={!!config[key]} onChange={() => toggleConfig(key)} />
                  <span className="toggle-label">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                </label>
              ))}
            </div>
          </section>
          
          <section className="panel-section">
            <h3 className="section-title"><span className="section-icon">◈</span>Camera Views</h3>
            <div className="camera-views-grid">
              <button className="view-btn" onClick={() => renderer?.setCameraView('plan')} title="Plan View (Top)">Plan</button>
              <button className="view-btn" onClick={() => renderer?.setCameraView('home')} title="Home View">Home</button>
            </div>
            <div className="camera-subsection">
              <span className="subsection-label">Elevations</span>
              <div className="camera-views-grid">
                <button className="view-btn" onClick={() => renderer?.setCameraView('north')} title="North Elevation">N</button>
                <button className="view-btn" onClick={() => renderer?.setCameraView('south')} title="South Elevation">S</button>
                <button className="view-btn" onClick={() => renderer?.setCameraView('east')} title="East Elevation">E</button>
                <button className="view-btn" onClick={() => renderer?.setCameraView('west')} title="West Elevation">W</button>
              </div>
            </div>
            <div className="camera-subsection">
              <span className="subsection-label">Isometric</span>
              <div className="camera-views-grid">
                <button className="view-btn" onClick={() => renderer?.setCameraView('isoNE')} title="Northeast Isometric">NE</button>
                <button className="view-btn" onClick={() => renderer?.setCameraView('isoNW')} title="Northwest Isometric">NW</button>
                <button className="view-btn" onClick={() => renderer?.setCameraView('isoSE')} title="Southeast Isometric">SE</button>
                <button className="view-btn" onClick={() => renderer?.setCameraView('isoSW')} title="Southwest Isometric">SW</button>
              </div>
            </div>
          </section>
          
          <section className="panel-section products-section">
            <h3 className="section-title"><span className="section-icon">◈</span>GCP Products</h3>
            <div className="products-list">
              {selectedDetail.products.map((p, i) => (
                <div key={i} className="product-card">
                  <span className="product-manufacturer">{p.manufacturer}</span>
                  <span className="product-name">{p.product}</span>
                  <span className="product-layer">{p.layer}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="panel-section">
            <h3 className="section-title"><span className="section-icon">◈</span>Lighting</h3>
            <LightingPanel
              onPresetChange={handleLightingChange}
              currentPreset={lightingPreset}
            />
          </section>

          <section className="panel-section">
            <h3 className="section-title"><span className="section-icon">◈</span>Or Equal Compare</h3>
            <ComparisonPanel onCompare={handleCompare} />
          </section>
        </aside>
        
        <main className="viewport-container">
          <div ref={containerRef} className="hologram-viewport" />
          <div className="viewport-overlay">
            <div className="overlay-corner top-left">
              <span className="corner-text">SEMANTIC 3D</span>
              <span className="corner-detail">LIVE RENDER</span>
            </div>
            <div className="overlay-corner top-right">
              <span className="corner-text">{selectedDetail.layers.length} LAYERS</span>
              <span className="corner-detail">{selectedDetail.connections.length} CONNECTIONS</span>
            </div>
            <div className="overlay-corner bottom-left">
              <span className="corner-text">{compressionStats.semanticBytes} BYTES</span>
              <span className="corner-detail">SEMANTIC DATA</span>
            </div>
            <div className="overlay-corner bottom-right">
              <span className="corner-text">v{selectedDetail.version}</span>
              <span className="corner-detail">{validation.valid ? '✓ VALID' : '✗ ERRORS'}</span>
            </div>
          </div>
          <div className="controls-hint">
            <span>🖱️ Drag to rotate</span><span>⚲ Scroll to zoom</span><span>⇧+Drag to pan</span>
          </div>
        </main>
        
        {showSemanticPanel && (
          <aside className="semantic-panel">
            <div className="panel-header">
              <h3 className="section-title"><span className="section-icon">◈</span>Semantic Compression</h3>
              <button className="close-panel-btn" onClick={() => setShowSemanticPanel(false)}>×</button>
            </div>
            <div className="compression-stats">
              <div className="stat-card">
                <span className="stat-value">{compressionStats.semanticBytes}</span>
                <span className="stat-label">Semantic Bytes</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">~{(compressionStats.estimatedMeshBytes / 1000000).toFixed(1)}MB</span>
                <span className="stat-label">Est. 3D Mesh</span>
              </div>
              <div className="stat-card highlight">
                <span className="stat-value">{compressionStats.ratio.toLocaleString()}:1</span>
                <span className="stat-label">Compression Ratio</span>
              </div>
            </div>
            <div className="semantic-code-container">
              <div className="code-header">
                <span>semantic-detail.json</span>
                <button className="copy-btn"
                  onClick={() => navigator.clipboard.writeText(JSON.stringify(selectedDetail, null, 2))}>Copy</button>
              </div>
              <pre className="semantic-code">{JSON.stringify(selectedDetail, null, 2)}</pre>
            </div>
            <div className="layers-list">
              <h4>Layer Stack</h4>
              {selectedDetail.layers.map((layer, i) => (
                <div key={i} className="layer-item">
                  <div className="layer-color" style={{ backgroundColor: layer.properties.color }} />
                  <div className="layer-info">
                    <span className="layer-name">{layer.id}</span>
                    <span className="layer-material">{layer.material}</span>
                    <span className="layer-thickness">{layer.thickness}mm</span>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        )}
        
        {!showSemanticPanel && (
          <button className="show-panel-btn" onClick={() => setShowSemanticPanel(true)}>
            ◀ Show Data
          </button>
        )}
      </div>
      
      <footer className="app-footer">
        <div className="footer-left">
          <span>BuildingSystems.ai × Lefebvre Design Solutions</span>
        </div>
        <div className="footer-center">
          <span className="footer-tech">SEMANTIC COMPRESSION • THREE.JS • WEBXR</span>
        </div>
        <div className="footer-right">
          <span className="footer-badge">R&D PROTOTYPE</span>
        </div>
      </footer>
    </div>
  );
}
