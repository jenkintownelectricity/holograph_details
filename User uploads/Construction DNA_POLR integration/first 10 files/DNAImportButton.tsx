/**
 * DNA Import Button Component
 * 
 * File upload button for importing DNA JSON/ZIP files
 */

import React, { useRef, useState, useCallback } from 'react';
import { useDNAMaterialStore } from '../stores/dna-material-store';
import type { DNAImportResult } from '../types';

interface DNAImportButtonProps {
  onImportComplete?: (result: DNAImportResult) => void;
  className?: string;
  variant?: 'button' | 'dropzone';
}

export const DNAImportButton: React.FC<DNAImportButtonProps> = ({
  onImportComplete,
  className = '',
  variant = 'button'
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [importStatus, setImportStatus] = useState<{
    show: boolean;
    type: 'success' | 'error' | 'loading';
    message: string;
  }>({ show: false, type: 'success', message: '' });
  
  const { importFromFile, loadTestData, isLoading } = useDNAMaterialStore();
  
  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    // Validate file type
    if (!file.name.endsWith('.json') && !file.name.endsWith('.zip')) {
      setImportStatus({
        show: true,
        type: 'error',
        message: 'Please select a .json or .zip file'
      });
      return;
    }
    
    setImportStatus({ show: true, type: 'loading', message: 'Importing...' });
    
    try {
      const result = await importFromFile(file);
      
      if (result.success) {
        setImportStatus({
          show: true,
          type: 'success',
          message: `Imported ${result.materialsImported} material(s)${result.warnings.length > 0 ? ` with ${result.warnings.length} warning(s)` : ''}`
        });
      } else {
        setImportStatus({
          show: true,
          type: 'error',
          message: result.errors[0] || 'Import failed'
        });
      }
      
      onImportComplete?.(result);
    } catch (error) {
      setImportStatus({
        show: true,
        type: 'error',
        message: error instanceof Error ? error.message : 'Import failed'
      });
    }
    
    // Clear status after 3 seconds
    setTimeout(() => setImportStatus(s => ({ ...s, show: false })), 3000);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [importFromFile, onImportComplete]);
  
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);
  
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);
  
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);
  
  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);
  
  const handleLoadTestData = useCallback(() => {
    loadTestData();
    setImportStatus({
      show: true,
      type: 'success',
      message: 'Loaded test materials (TPO, EPDM, Polyiso, SBS)'
    });
    setTimeout(() => setImportStatus(s => ({ ...s, show: false })), 3000);
  }, [loadTestData]);
  
  // Status indicator color
  const statusColors = {
    success: 'bg-green-100 border-green-500 text-green-700',
    error: 'bg-red-100 border-red-500 text-red-700',
    loading: 'bg-blue-100 border-blue-500 text-blue-700'
  };
  
  if (variant === 'dropzone') {
    return (
      <div className={className}>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,.zip"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />
        
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
            transition-colors duration-200
            ${isDragging 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
            }
            ${isLoading ? 'opacity-50 pointer-events-none' : ''}
          `}
        >
          <div className="flex flex-col items-center gap-2">
            <svg 
              className={`w-12 h-12 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`}
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" 
              />
            </svg>
            
            <div className="text-lg font-medium text-gray-700">
              {isDragging ? 'Drop DNA file here' : 'Import DNA Materials'}
            </div>
            
            <div className="text-sm text-gray-500">
              Drag & drop a .json or .zip file, or click to browse
            </div>
          </div>
        </div>
        
        <div className="flex gap-2 mt-3">
          <button
            onClick={handleLoadTestData}
            className="text-sm text-blue-600 hover:text-blue-800 underline"
          >
            Load test data
          </button>
        </div>
        
        {importStatus.show && (
          <div className={`mt-3 p-3 border rounded ${statusColors[importStatus.type]}`}>
            {importStatus.type === 'loading' && (
              <span className="inline-block animate-spin mr-2">â³</span>
            )}
            {importStatus.message}
          </div>
        )}
      </div>
    );
  }
  
  // Default button variant
  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,.zip"
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
      />
      
      <button
        onClick={handleClick}
        disabled={isLoading}
        className={`
          inline-flex items-center gap-2 px-4 py-2 
          bg-blue-600 text-white rounded-lg
          hover:bg-blue-700 
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors duration-200
        `}
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
        {isLoading ? 'Importing...' : 'Import DNA'}
      </button>
      
      <button
        onClick={handleLoadTestData}
        className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
      >
        Test Data
      </button>
      
      {importStatus.show && (
        <span className={`text-sm ${
          importStatus.type === 'success' ? 'text-green-600' :
          importStatus.type === 'error' ? 'text-red-600' :
          'text-blue-600'
        }`}>
          {importStatus.message}
        </span>
      )}
    </div>
  );
};

export default DNAImportButton;
