/**
 * Embeddable Widget
 * POLR Strategic Development - Phase B3.1
 * 
 * Allow manufacturers to embed interactive POLR details on their websites
 * 
 * Usage:
 * <script src="https://polr.buildingsystems.ai/widget.js"></script>
 * <div data-polr-detail="WP-003" data-manufacturer="GCP"></div>
 * 
 * @module embed/widget
 * @version 1.0.0
 */

// =============================================================================
// WIDGET CONFIGURATION
// =============================================================================

export interface WidgetConfig {
  /** Detail ID to display */
  detailId: string;
  /** Manufacturer filter (optional) */
  manufacturer?: string;
  /** Widget height */
  height?: string;
  /** Color theme */
  theme?: 'dark' | 'light';
  /** Show layer controls */
  showControls?: boolean;
  /** Show manufacturer switcher */
  showManufacturerSwitcher?: boolean;
  /** Allow fullscreen */
  allowFullscreen?: boolean;
  /** Initial camera view */
  initialView?: 'isometric' | 'plan' | 'section';
  /** Custom brand color (hex) */
  brandColor?: string;
  /** Callback when loaded */
  onLoad?: () => void;
  /** Callback on manufacturer change */
  onManufacturerChange?: (manufacturer: string) => void;
}

export interface WidgetInstance {
  /** Widget container element */
  container: HTMLElement;
  /** iframe element */
  iframe: HTMLIFrameElement;
  /** Current detail ID */
  detailId: string;
  /** Current manufacturer */
  manufacturer: string | null;
  /** Switch manufacturer programmatically */
  setManufacturer: (manufacturer: string) => void;
  /** Change detail */
  setDetail: (detailId: string) => void;
  /** Get current state */
  getState: () => { detailId: string; manufacturer: string | null };
  /** Destroy widget */
  destroy: () => void;
}

// =============================================================================
// WIDGET INITIALIZATION SCRIPT (Embed Code)
// =============================================================================

/**
 * Self-initializing widget script
 * This is what gets served from https://polr.buildingsystems.ai/widget.js
 */
export const WIDGET_EMBED_SCRIPT = `
(function() {
  'use strict';
  
  var POLR_BASE_URL = 'https://polr.buildingsystems.ai';
  var WIDGET_VERSION = '1.0.0';
  var instances = [];
  
  // Default configuration
  var defaults = {
    height: '500px',
    theme: 'dark',
    showControls: true,
    showManufacturerSwitcher: true,
    allowFullscreen: true,
    initialView: 'isometric'
  };
  
  /**
   * Initialize all POLR widgets on page
   */
  function initPOLRWidgets() {
    var containers = document.querySelectorAll('[data-polr-detail]');
    
    containers.forEach(function(container) {
      if (container.dataset.polrInitialized) return;
      
      var config = {
        detailId: container.getAttribute('data-polr-detail'),
        manufacturer: container.getAttribute('data-manufacturer') || null,
        height: container.getAttribute('data-height') || defaults.height,
        theme: container.getAttribute('data-theme') || defaults.theme,
        showControls: container.getAttribute('data-controls') !== 'false',
        showManufacturerSwitcher: container.getAttribute('data-switcher') !== 'false',
        allowFullscreen: container.getAttribute('data-fullscreen') !== 'false',
        initialView: container.getAttribute('data-view') || defaults.initialView,
        brandColor: container.getAttribute('data-brand-color') || null
      };
      
      var instance = createWidget(container, config);
      instances.push(instance);
      container.dataset.polrInitialized = 'true';
    });
  }
  
  /**
   * Create a widget instance
   */
  function createWidget(container, config) {
    // Build iframe URL with parameters
    var params = new URLSearchParams();
    params.set('detail', config.detailId);
    if (config.manufacturer) params.set('mfr', config.manufacturer);
    params.set('theme', config.theme);
    params.set('controls', config.showControls);
    params.set('switcher', config.showManufacturerSwitcher);
    params.set('fullscreen', config.allowFullscreen);
    params.set('view', config.initialView);
    if (config.brandColor) params.set('brand', config.brandColor);
    params.set('embed', 'true');
    params.set('v', WIDGET_VERSION);
    
    var iframeSrc = POLR_BASE_URL + '/embed?' + params.toString();
    
    // Create iframe
    var iframe = document.createElement('iframe');
    iframe.src = iframeSrc;
    iframe.style.width = '100%';
    iframe.style.height = config.height;
    iframe.style.border = 'none';
    iframe.style.borderRadius = '8px';
    iframe.style.backgroundColor = config.theme === 'dark' ? '#0a0a0a' : '#ffffff';
    iframe.allow = 'xr-spatial-tracking; fullscreen';
    iframe.title = 'POLR Construction Detail Viewer';
    
    // Clear container and add iframe
    container.innerHTML = '';
    container.appendChild(iframe);
    
    // Create instance object
    var instance = {
      container: container,
      iframe: iframe,
      detailId: config.detailId,
      manufacturer: config.manufacturer,
      
      setManufacturer: function(mfr) {
        this.manufacturer = mfr;
        iframe.contentWindow.postMessage({
          type: 'POLR_SET_MANUFACTURER',
          manufacturer: mfr
        }, POLR_BASE_URL);
      },
      
      setDetail: function(detailId) {
        this.detailId = detailId;
        iframe.contentWindow.postMessage({
          type: 'POLR_SET_DETAIL',
          detailId: detailId
        }, POLR_BASE_URL);
      },
      
      getState: function() {
        return {
          detailId: this.detailId,
          manufacturer: this.manufacturer
        };
      },
      
      destroy: function() {
        container.innerHTML = '';
        container.dataset.polrInitialized = '';
        var idx = instances.indexOf(this);
        if (idx > -1) instances.splice(idx, 1);
      }
    };
    
    // Listen for messages from iframe
    window.addEventListener('message', function(event) {
      if (event.origin !== POLR_BASE_URL) return;
      
      var data = event.data;
      if (!data || !data.type) return;
      
      switch (data.type) {
        case 'POLR_LOADED':
          if (container.dataset.onload) {
            var fn = window[container.dataset.onload];
            if (typeof fn === 'function') fn(instance);
          }
          break;
          
        case 'POLR_MANUFACTURER_CHANGED':
          instance.manufacturer = data.manufacturer;
          if (container.dataset.onmanufacturerchange) {
            var fn = window[container.dataset.onmanufacturerchange];
            if (typeof fn === 'function') fn(data.manufacturer);
          }
          break;
          
        case 'POLR_ERROR':
          console.error('POLR Widget Error:', data.error);
          break;
      }
    });
    
    return instance;
  }
  
  /**
   * Public API
   */
  window.POLR = {
    version: WIDGET_VERSION,
    instances: instances,
    init: initPOLRWidgets,
    create: function(container, config) {
      if (typeof container === 'string') {
        container = document.querySelector(container);
      }
      if (!container) {
        console.error('POLR: Container not found');
        return null;
      }
      return createWidget(container, Object.assign({}, defaults, config));
    },
    destroy: function(instance) {
      if (instance && typeof instance.destroy === 'function') {
        instance.destroy();
      }
    },
    destroyAll: function() {
      while (instances.length > 0) {
        instances[0].destroy();
      }
    }
  };
  
  // Auto-initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPOLRWidgets);
  } else {
    initPOLRWidgets();
  }
  
  // Re-initialize on dynamic content (MutationObserver)
  if (typeof MutationObserver !== 'undefined') {
    var observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.addedNodes.length > 0) {
          initPOLRWidgets();
        }
      });
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
})();
`;

// =============================================================================
// SERVER-SIDE WIDGET RENDERER
// =============================================================================

/**
 * Generate widget HTML for server-side rendering
 */
export function generateWidgetHTML(config: WidgetConfig): string {
  const baseUrl = 'https://polr.buildingsystems.ai';
  
  const params = new URLSearchParams();
  params.set('detail', config.detailId);
  if (config.manufacturer) params.set('mfr', config.manufacturer);
  params.set('theme', config.theme || 'dark');
  params.set('controls', String(config.showControls !== false));
  params.set('switcher', String(config.showManufacturerSwitcher !== false));
  params.set('fullscreen', String(config.allowFullscreen !== false));
  params.set('view', config.initialView || 'isometric');
  if (config.brandColor) params.set('brand', config.brandColor);
  params.set('embed', 'true');

  const iframeSrc = `${baseUrl}/embed?${params.toString()}`;
  const height = config.height || '500px';
  const bgColor = config.theme === 'light' ? '#ffffff' : '#0a0a0a';

  return `
<div class="polr-widget" data-polr-detail="${config.detailId}">
  <iframe 
    src="${iframeSrc}"
    style="width: 100%; height: ${height}; border: none; border-radius: 8px; background-color: ${bgColor};"
    allow="xr-spatial-tracking; fullscreen"
    title="POLR Construction Detail Viewer"
    loading="lazy"
  ></iframe>
</div>
  `.trim();
}

/**
 * Generate embed code snippet for users
 */
export function generateEmbedCode(config: Partial<WidgetConfig> & { detailId: string }): string {
  const attrs: string[] = [`data-polr-detail="${config.detailId}"`];
  
  if (config.manufacturer) attrs.push(`data-manufacturer="${config.manufacturer}"`);
  if (config.height) attrs.push(`data-height="${config.height}"`);
  if (config.theme) attrs.push(`data-theme="${config.theme}"`);
  if (config.showControls === false) attrs.push('data-controls="false"');
  if (config.showManufacturerSwitcher === false) attrs.push('data-switcher="false"');
  if (config.allowFullscreen === false) attrs.push('data-fullscreen="false"');
  if (config.initialView) attrs.push(`data-view="${config.initialView}"`);
  if (config.brandColor) attrs.push(`data-brand-color="${config.brandColor}"`);

  return `<!-- POLR Construction Detail Widget -->
<script src="https://polr.buildingsystems.ai/widget.js" async></script>
<div ${attrs.join(' ')}></div>`;
}

// =============================================================================
// EMBED PAGE COMPONENT (React)
// =============================================================================

/**
 * React component for the embed viewer page
 * This is what renders inside the iframe
 */
export const EmbedViewerComponent = `
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { POLRViewer } from '../components/POLRViewer';

export function EmbedViewer() {
  const [searchParams] = useSearchParams();
  const [loaded, setLoaded] = useState(false);
  
  const config = {
    detailId: searchParams.get('detail') || '',
    manufacturer: searchParams.get('mfr') || undefined,
    theme: searchParams.get('theme') as 'dark' | 'light' || 'dark',
    showControls: searchParams.get('controls') !== 'false',
    showManufacturerSwitcher: searchParams.get('switcher') !== 'false',
    allowFullscreen: searchParams.get('fullscreen') !== 'false',
    initialView: searchParams.get('view') || 'isometric',
    brandColor: searchParams.get('brand') || undefined,
    isEmbed: true
  };
  
  // Notify parent when loaded
  useEffect(() => {
    if (loaded && window.parent !== window) {
      window.parent.postMessage({ type: 'POLR_LOADED' }, '*');
    }
  }, [loaded]);
  
  // Handle messages from parent
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const { type, manufacturer, detailId } = event.data || {};
      
      switch (type) {
        case 'POLR_SET_MANUFACTURER':
          // Handle manufacturer change
          break;
        case 'POLR_SET_DETAIL':
          // Handle detail change
          break;
      }
    };
    
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);
  
  // Notify parent on manufacturer change
  const handleManufacturerChange = (manufacturer: string) => {
    if (window.parent !== window) {
      window.parent.postMessage({
        type: 'POLR_MANUFACTURER_CHANGED',
        manufacturer
      }, '*');
    }
  };
  
  if (!config.detailId) {
    return <div className="polr-embed-error">No detail specified</div>;
  }
  
  return (
    <div className={\`polr-embed polr-theme-\${config.theme}\`}>
      <POLRViewer
        {...config}
        onLoad={() => setLoaded(true)}
        onManufacturerChange={handleManufacturerChange}
      />
    </div>
  );
}
`;

// =============================================================================
// WIDGET ANALYTICS
// =============================================================================

export interface WidgetAnalyticsEvent {
  type: 'view' | 'interaction' | 'manufacturer_switch' | 'fullscreen' | 'error';
  detailId: string;
  manufacturer?: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

/**
 * Track widget analytics
 */
export function trackWidgetEvent(event: WidgetAnalyticsEvent): void {
  // In production, send to analytics endpoint
  const analyticsEndpoint = 'https://api.buildingsystems.ai/analytics/widget';
  
  fetch(analyticsEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(event),
    keepalive: true
  }).catch(() => {
    // Silently fail analytics
  });
}

// =============================================================================
// EXPORT
// =============================================================================

export const Widget = {
  EMBED_SCRIPT: WIDGET_EMBED_SCRIPT,
  generateHTML: generateWidgetHTML,
  generateEmbedCode,
  trackEvent: trackWidgetEvent
};
