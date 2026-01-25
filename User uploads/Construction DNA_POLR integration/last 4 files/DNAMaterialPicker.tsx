/**
 * DNA Material Picker
 * Searchable dropdown for selecting DNA materials to assign to layers
 */

import React, { useState, useMemo, useCallback } from 'react';
import { MaterialDNA, getDefaultColor } from '../types/construction-dna';
import { useDNAMaterialStore } from '../stores/dna-material-store';

// ============================================================================
// TYPES
// ============================================================================

interface DNAMaterialPickerProps {
  /** Currently selected DNA material ID */
  selectedId?: string;
  /** Callback when a material is selected */
  onSelect: (material: MaterialDNA | null) => void;
  /** Optional filter by chemistry */
  filterChemistry?: string;
  /** Optional filter by category */
  filterCategory?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Whether the picker is disabled */
  disabled?: boolean;
  /** Custom class name */
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function DNAMaterialPicker({
  selectedId,
  onSelect,
  filterChemistry,
  filterCategory,
  placeholder = 'Select a material...',
  disabled = false,
  className = ''
}: DNAMaterialPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Get materials from store
  const materials = useDNAMaterialStore(state => state.materials);
  
  // Find selected material
  const selectedMaterial = useMemo(() => {
    if (!selectedId) return null;
    return materials.find(m => m.id === selectedId) || null;
  }, [materials, selectedId]);
  
  // Filter and search materials
  const filteredMaterials = useMemo(() => {
    let result = [...materials];
    
    // Apply chemistry filter
    if (filterChemistry) {
      result = result.filter(m => 
        m.baseChemistry.toLowerCase() === filterChemistry.toLowerCase()
      );
    }
    
    // Apply category filter
    if (filterCategory) {
      result = result.filter(m => 
        m.category?.toLowerCase() === filterCategory.toLowerCase()
      );
    }
    
    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(m => 
        m.product?.toLowerCase().includes(query) ||
        m.manufacturer?.toLowerCase().includes(query) ||
        m.baseChemistry.toLowerCase().includes(query) ||
        m.category?.toLowerCase().includes(query)
      );
    }
    
    return result;
  }, [materials, filterChemistry, filterCategory, searchQuery]);
  
  // Group materials by chemistry for better organization
  const groupedMaterials = useMemo(() => {
    const groups: Record<string, MaterialDNA[]> = {};
    
    filteredMaterials.forEach(m => {
      const key = m.baseChemistry;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(m);
    });
    
    return groups;
  }, [filteredMaterials]);
  
  // Handle selection
  const handleSelect = useCallback((material: MaterialDNA) => {
    onSelect(material);
    setIsOpen(false);
    setSearchQuery('');
  }, [onSelect]);
  
  // Handle clear
  const handleClear = useCallback(() => {
    onSelect(null);
    setSearchQuery('');
  }, [onSelect]);
  
  return (
    <div className={`dna-material-picker ${className}`}>
      {/* Selected Value / Trigger */}
      <button
        type="button"
        className="dna-picker-trigger"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
      >
        {selectedMaterial ? (
          <div className="dna-picker-selected">
            <span 
              className="dna-picker-color"
              style={{ backgroundColor: selectedMaterial.color || getDefaultColor(selectedMaterial.baseChemistry) }}
            />
            <span className="dna-picker-name">
              {selectedMaterial.product || selectedMaterial.baseChemistry}
            </span>
            <span className="dna-picker-manufacturer">
              {selectedMaterial.manufacturer}
            </span>
            <button 
              className="dna-picker-clear"
              onClick={(e) => { e.stopPropagation(); handleClear(); }}
            >
              ✕
            </button>
          </div>
        ) : (
          <span className="dna-picker-placeholder">{placeholder}</span>
        )}
        <span className="dna-picker-chevron">{isOpen ? '▲' : '▼'}</span>
      </button>
      
      {/* Dropdown */}
      {isOpen && (
        <div className="dna-picker-dropdown">
          {/* Search Input */}
          <div className="dna-picker-search">
            <input
              type="text"
              placeholder="Search materials..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
          </div>
          
          {/* Materials List */}
          <div className="dna-picker-list">
            {Object.keys(groupedMaterials).length === 0 ? (
              <div className="dna-picker-empty">
                {materials.length === 0 
                  ? 'No materials imported. Import DNA materials first.'
                  : 'No materials match your search.'}
              </div>
            ) : (
              Object.entries(groupedMaterials).map(([chemistry, mats]) => (
                <div key={chemistry} className="dna-picker-group">
                  <div className="dna-picker-group-header">
                    <span 
                      className="dna-picker-color"
                      style={{ backgroundColor: getDefaultColor(chemistry) }}
                    />
                    {chemistry}
                    <span className="dna-picker-count">({mats.length})</span>
                  </div>
                  {mats.map(material => (
                    <button
                      key={material.id}
                      className={`dna-picker-item ${selectedId === material.id ? 'selected' : ''}`}
                      onClick={() => handleSelect(material)}
                    >
                      <span 
                        className="dna-picker-color"
                        style={{ backgroundColor: material.color || getDefaultColor(material.baseChemistry) }}
                      />
                      <div className="dna-picker-item-info">
                        <span className="dna-picker-item-name">
                          {material.product || material.baseChemistry}
                        </span>
                        <span className="dna-picker-item-details">
                          {material.manufacturer}
                          {material.thicknessMil && ` • ${material.thicknessMil} mil`}
                        </span>
                      </div>
                      {material.specSheetUrl && (
                        <a
                          href={material.specSheetUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="dna-picker-spec-link"
                          onClick={(e) => e.stopPropagation()}
                          title="View Spec Sheet"
                        >
                          📄
                        </a>
                      )}
                    </button>
                  ))}
                </div>
              ))
            )}
          </div>
        </div>
      )}
      
      {/* Styles */}
      <style>{`
        .dna-material-picker {
          position: relative;
          width: 100%;
        }
        
        .dna-picker-trigger {
          width: 100%;
          padding: 8px 12px;
          background: #0a0a1a;
          border: 1px solid #1a1a2e;
          border-radius: 4px;
          color: #ffffff;
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: space-between;
          transition: border-color 0.2s;
        }
        
        .dna-picker-trigger:hover:not(:disabled) {
          border-color: #00ffff;
        }
        
        .dna-picker-trigger:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .dna-picker-selected {
          display: flex;
          align-items: center;
          gap: 8px;
          flex: 1;
        }
        
        .dna-picker-color {
          width: 12px;
          height: 12px;
          border-radius: 2px;
          flex-shrink: 0;
        }
        
        .dna-picker-name {
          color: #ffffff;
        }
        
        .dna-picker-manufacturer {
          color: #888888;
          font-size: 11px;
        }
        
        .dna-picker-clear {
          background: none;
          border: none;
          color: #888888;
          cursor: pointer;
          padding: 2px 4px;
          font-size: 10px;
        }
        
        .dna-picker-clear:hover {
          color: #ff4444;
        }
        
        .dna-picker-placeholder {
          color: #666666;
        }
        
        .dna-picker-chevron {
          color: #00ffff;
          font-size: 10px;
        }
        
        .dna-picker-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          margin-top: 4px;
          background: #0a0a1a;
          border: 1px solid #00ffff;
          border-radius: 4px;
          z-index: 1000;
          max-height: 300px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        
        .dna-picker-search {
          padding: 8px;
          border-bottom: 1px solid #1a1a2e;
        }
        
        .dna-picker-search input {
          width: 100%;
          padding: 6px 10px;
          background: #050510;
          border: 1px solid #1a1a2e;
          border-radius: 4px;
          color: #ffffff;
          font-family: inherit;
          font-size: 12px;
        }
        
        .dna-picker-search input:focus {
          outline: none;
          border-color: #00ffff;
        }
        
        .dna-picker-list {
          overflow-y: auto;
          flex: 1;
        }
        
        .dna-picker-empty {
          padding: 20px;
          text-align: center;
          color: #666666;
          font-size: 12px;
        }
        
        .dna-picker-group {
          border-bottom: 1px solid #1a1a2e;
        }
        
        .dna-picker-group:last-child {
          border-bottom: none;
        }
        
        .dna-picker-group-header {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: #0f0f1f;
          color: #00ffff;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .dna-picker-count {
          color: #666666;
          font-weight: normal;
        }
        
        .dna-picker-item {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 12px 8px 24px;
          background: none;
          border: none;
          color: #ffffff;
          font-family: inherit;
          font-size: 12px;
          cursor: pointer;
          text-align: left;
          transition: background 0.1s;
        }
        
        .dna-picker-item:hover {
          background: #1a1a2e;
        }
        
        .dna-picker-item.selected {
          background: rgba(0, 255, 255, 0.1);
        }
        
        .dna-picker-item-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        
        .dna-picker-item-name {
          color: #ffffff;
        }
        
        .dna-picker-item-details {
          color: #666666;
          font-size: 10px;
        }
        
        .dna-picker-spec-link {
          padding: 4px;
          text-decoration: none;
          opacity: 0.6;
          transition: opacity 0.1s;
        }
        
        .dna-picker-spec-link:hover {
          opacity: 1;
        }
      `}</style>
    </div>
  );
}

// ============================================================================
// COMPACT VARIANT
// ============================================================================

interface DNAMaterialBadgeProps {
  material: MaterialDNA;
  onClick?: () => void;
  showManufacturer?: boolean;
}

export function DNAMaterialBadge({ 
  material, 
  onClick,
  showManufacturer = true 
}: DNAMaterialBadgeProps) {
  return (
    <button
      className="dna-material-badge"
      onClick={onClick}
      type="button"
    >
      <span 
        className="dna-badge-color"
        style={{ backgroundColor: material.color || getDefaultColor(material.baseChemistry) }}
      />
      <span className="dna-badge-chemistry">{material.baseChemistry}</span>
      {showManufacturer && material.manufacturer && (
        <span className="dna-badge-manufacturer">{material.manufacturer}</span>
      )}
      
      <style>{`
        .dna-material-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 8px;
          background: #0a0a1a;
          border: 1px solid #1a1a2e;
          border-radius: 4px;
          color: #ffffff;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          cursor: pointer;
          transition: border-color 0.2s;
        }
        
        .dna-material-badge:hover {
          border-color: #00ffff;
        }
        
        .dna-badge-color {
          width: 8px;
          height: 8px;
          border-radius: 2px;
        }
        
        .dna-badge-chemistry {
          font-weight: 600;
        }
        
        .dna-badge-manufacturer {
          color: #666666;
        }
      `}</style>
    </button>
  );
}

// ============================================================================
// EXPORTS
// ============================================================================

export default DNAMaterialPicker;
