/**
 * Layer DNA Panel Component
 * 
 * Displays the full 20-tier DNA specification for a selected layer
 */

import React, { useState, useMemo } from 'react';
import type { MaterialDNA, FailureMode, DNA_TIER_GROUPS } from '../types';
import { formatDNAValue } from '../adapters/dna-adapter';

interface LayerDNAPanelProps {
  material: MaterialDNA | null;
  onClose?: () => void;
  className?: string;
}

// Tier group definitions
const TIER_GROUPS = [
  {
    name: 'Classification',
    range: 'Tiers 1-6',
    description: 'What is it?',
    color: 'blue',
    fields: ['id', 'division', 'category', 'assemblyType', 'manufacturer', 'product'] as const
  },
  {
    name: 'Material Science',
    range: 'Tiers 7-12',
    description: "What's it made of?",
    color: 'green',
    fields: ['baseChemistry', 'reinforcement', 'surfaceTreatment', 'thicknessMil', 'color', 'sri'] as const
  },
  {
    name: 'Performance',
    range: 'Tiers 13-16',
    description: 'How does it perform?',
    color: 'amber',
    fields: ['fireRating', 'permRating', 'tensileStrength', 'elongation', 'tempRangeMin', 'tempRangeMax'] as const
  },
  {
    name: 'Metadata',
    range: 'Tiers 17-20',
    description: 'Documentation & References',
    color: 'purple',
    fields: ['failureModes', 'compatibilityNotes', 'applicationConstraints', 'codeReferences'] as const
  }
];

// Field display names
const FIELD_LABELS: Record<string, string> = {
  id: 'Material ID',
  division: 'CSI Division',
  category: 'Category',
  assemblyType: 'Assembly Type',
  manufacturer: 'Manufacturer',
  product: 'Product Name',
  baseChemistry: 'Base Chemistry',
  reinforcement: 'Reinforcement',
  surfaceTreatment: 'Surface Treatment',
  thicknessMil: 'Thickness',
  color: 'Color',
  sri: 'Solar Reflectance Index',
  fireRating: 'Fire Rating',
  permRating: 'Perm Rating',
  tensileStrength: 'Tensile Strength',
  elongation: 'Elongation',
  tempRangeMin: 'Min Temperature',
  tempRangeMax: 'Max Temperature',
  failureModes: 'Failure Modes',
  compatibilityNotes: 'Compatibility Notes',
  applicationConstraints: 'Application Constraints',
  codeReferences: 'Code References'
};

// Color swatch component
const ColorSwatch: React.FC<{ color: string }> = ({ color }) => (
  <div className="flex items-center gap-2">
    <div 
      className="w-6 h-6 rounded border border-gray-300 shadow-inner"
      style={{ backgroundColor: color }}
    />
    <span className="font-mono text-sm">{color}</span>
  </div>
);

// Failure mode card component
const FailureModeCard: React.FC<{ mode: FailureMode }> = ({ mode }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const severityColors = {
    critical: 'bg-red-100 text-red-800 border-red-200',
    high: 'bg-orange-100 text-orange-800 border-orange-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    low: 'bg-blue-100 text-blue-800 border-blue-200'
  };
  
  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 text-xs font-medium rounded ${severityColors[mode.severity]}`}>
            {mode.severity.toUpperCase()}
          </span>
          <span className="font-medium">{mode.name}</span>
        </div>
        <svg 
          className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isExpanded && (
        <div className="p-3 space-y-3 border-t">
          <p className="text-sm text-gray-600">{mode.description}</p>
          
          <div>
            <h5 className="text-xs font-semibold text-gray-500 uppercase mb-1">Causes</h5>
            <ul className="text-sm space-y-1">
              {mode.causes.map((cause, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-red-500">â€¢</span>
                  {cause}
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h5 className="text-xs font-semibold text-gray-500 uppercase mb-1">Prevention</h5>
            <ul className="text-sm space-y-1">
              {mode.prevention.map((prevention, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-green-500">âœ“</span>
                  {prevention}
                </li>
              ))}
            </ul>
          </div>
          
          {mode.detectionMethod && (
            <div>
              <h5 className="text-xs font-semibold text-gray-500 uppercase mb-1">Detection</h5>
              <p className="text-sm">{mode.detectionMethod}</p>
            </div>
          )}
          
          {mode.repairMethod && (
            <div>
              <h5 className="text-xs font-semibold text-gray-500 uppercase mb-1">Repair</h5>
              <p className="text-sm">{mode.repairMethod}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export const LayerDNAPanel: React.FC<LayerDNAPanelProps> = ({
  material,
  onClose,
  className = ''
}) => {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['Classification']));
  const [activeTab, setActiveTab] = useState<'properties' | 'failures' | 'compatibility'>('properties');
  
  const toggleGroup = (groupName: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(groupName)) {
        next.delete(groupName);
      } else {
        next.add(groupName);
      }
      return next;
    });
  };
  
  if (!material) {
    return (
      <div className={`p-6 text-center text-gray-500 ${className}`}>
        <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        <p>Select a layer to view its DNA</p>
      </div>
    );
  }
  
  const groupColors = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    amber: 'bg-amber-500',
    purple: 'bg-purple-500'
  };
  
  return (
    <div className={`bg-white rounded-lg shadow-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">{material.product}</h3>
            <p className="text-blue-100 text-sm">{material.manufacturer}</p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/20 rounded transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        
        {/* Spec sheet link */}
        {material.specSheetUrl && (
          <a
            href={material.specSheetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 mt-2 text-sm text-blue-100 hover:text-white"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            View Spec Sheet
          </a>
        )}
      </div>
      
      {/* Tabs */}
      <div className="flex border-b">
        <button
          onClick={() => setActiveTab('properties')}
          className={`flex-1 py-2 px-4 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'properties'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Properties
        </button>
        <button
          onClick={() => setActiveTab('failures')}
          className={`flex-1 py-2 px-4 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'failures'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Failure Modes ({material.failureModes.length})
        </button>
        <button
          onClick={() => setActiveTab('compatibility')}
          className={`flex-1 py-2 px-4 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'compatibility'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Compatibility
        </button>
      </div>
      
      {/* Content */}
      <div className="p-4 max-h-96 overflow-y-auto">
        {activeTab === 'properties' && (
          <div className="space-y-4">
            {TIER_GROUPS.map(group => (
              <div key={group.name} className="border rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleGroup(group.name)}
                  className="w-full p-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-8 rounded ${groupColors[group.color as keyof typeof groupColors]}`} />
                    <div className="text-left">
                      <div className="font-medium">{group.name}</div>
                      <div className="text-xs text-gray-500">{group.range} â€” {group.description}</div>
                    </div>
                  </div>
                  <svg 
                    className={`w-5 h-5 transition-transform ${expandedGroups.has(group.name) ? 'rotate-180' : ''}`}
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {expandedGroups.has(group.name) && (
                  <div className="p-3 border-t space-y-2">
                    {group.fields.map(field => {
                      const value = material[field as keyof MaterialDNA];
                      
                      // Special handling for arrays
                      if (Array.isArray(value)) {
                        if (field === 'failureModes') return null; // Handled in Failures tab
                        return (
                          <div key={field} className="py-2">
                            <div className="text-xs font-medium text-gray-500 uppercase mb-1">
                              {FIELD_LABELS[field]}
                            </div>
                            <ul className="text-sm space-y-1">
                              {value.map((item, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <span className="text-gray-400">â€¢</span>
                                  {String(item)}
                                </li>
                              ))}
                            </ul>
                          </div>
                        );
                      }
                      
                      // Special handling for color
                      if (field === 'color') {
                        return (
                          <div key={field} className="flex items-center justify-between py-2">
                            <span className="text-sm text-gray-600">{FIELD_LABELS[field]}</span>
                            <ColorSwatch color={value as string} />
                          </div>
                        );
                      }
                      
                      return (
                        <div key={field} className="flex items-center justify-between py-2">
                          <span className="text-sm text-gray-600">{FIELD_LABELS[field]}</span>
                          <span className="text-sm font-medium">
                            {formatDNAValue(field as keyof MaterialDNA, value)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        
        {activeTab === 'failures' && (
          <div className="space-y-3">
            {material.failureModes.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No failure modes documented</p>
            ) : (
              material.failureModes.map(mode => (
                <FailureModeCard key={mode.id} mode={mode} />
              ))
            )}
          </div>
        )}
        
        {activeTab === 'compatibility' && (
          <div className="space-y-4">
            {/* Compatibility notes */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Compatibility Notes</h4>
              {material.compatibilityNotes.length === 0 ? (
                <p className="text-gray-500 text-sm">No compatibility notes</p>
              ) : (
                <ul className="space-y-2">
                  {material.compatibilityNotes.map((note, i) => {
                    const isIncompatible = note.toLowerCase().includes('incompatible');
                    return (
                      <li 
                        key={i}
                        className={`text-sm p-2 rounded ${
                          isIncompatible 
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : 'bg-green-50 text-green-700 border border-green-200'
                        }`}
                      >
                        {isIncompatible ? 'âš ï¸ ' : 'âœ“ '}{note}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
            
            {/* Application constraints */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Application Constraints</h4>
              {material.applicationConstraints.length === 0 ? (
                <p className="text-gray-500 text-sm">No application constraints</p>
              ) : (
                <ul className="space-y-1">
                  {material.applicationConstraints.map((constraint, i) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <span className="text-amber-500">âš¡</span>
                      {constraint}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            
            {/* Code references */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Code References</h4>
              {material.codeReferences.length === 0 ? (
                <p className="text-gray-500 text-sm">No code references</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {material.codeReferences.map((code, i) => (
                    <span 
                      key={i}
                      className="px-2 py-1 text-xs font-mono bg-gray-100 rounded"
                    >
                      {code}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LayerDNAPanel;
