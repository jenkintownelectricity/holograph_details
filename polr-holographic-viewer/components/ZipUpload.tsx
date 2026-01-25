import React, { useState, useCallback, useRef } from 'react';

// Assembly layer interface (Construction DNA format)
export interface AssemblyLayer {
  position: number;
  code: string;
  name: string;
  thickness?: {
    nominal: number;
    unit: string;
  };
  material_dna_id?: string;
  properties?: Record<string, unknown>;
}

// Assembly interface (Construction DNA format)
export interface Assembly {
  id: string;
  name: string;
  description?: string;
  category?: string;
  layers: AssemblyLayer[];
  metadata?: Record<string, unknown>;
}

// Upload result interface
export interface UploadResult {
  success: boolean;
  message: string;
  data?: {
    sessionId: string;
    originalFilename: string;
    extractedFiles: string[];
    filteredFiles: string[];
    assemblies: Assembly[];
    timestamp: string;
  };
  error?: string;
}

interface ZipUploadProps {
  onAssembliesLoaded: (assemblies: Assembly[]) => void;
  onError?: (error: string) => void;
}

export const ZipUpload: React.FC<ZipUploadProps> = ({ onAssembliesLoaded, onError }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [lastResult, setLastResult] = useState<UploadResult | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const uploadFile = async (file: File): Promise<UploadResult> => {
    const formData = new FormData();
    formData.append('file', file);

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          setUploadProgress(progress);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const result = JSON.parse(xhr.responseText);
            resolve(result);
          } catch {
            reject(new Error('Invalid server response'));
          }
        } else {
          try {
            const error = JSON.parse(xhr.responseText);
            reject(new Error(error.error || error.details || 'Upload failed'));
          } catch {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Network error - is the server running?'));
      });

      xhr.open('POST', '/api/upload');
      xhr.send(formData);
    });
  };

  const processFile = async (file: File) => {
    // Validate file type
    if (!file.name.endsWith('.zip')) {
      const errorMsg = 'Please upload a .zip file';
      setLastResult({ success: false, message: errorMsg, error: errorMsg });
      onError?.(errorMsg);
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setLastResult(null);

    try {
      const result = await uploadFile(file);
      setLastResult(result);

      if (result.success && result.data?.assemblies) {
        onAssembliesLoaded(result.data.assemblies);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Upload failed';
      setLastResult({ success: false, message: errorMsg, error: errorMsg });
      onError?.(errorMsg);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div style={styles.container}>
      {/* Header with toggle */}
      <div style={styles.header} onClick={() => setIsExpanded(!isExpanded)}>
        <span style={styles.headerIcon}>📦</span>
        <span style={styles.headerTitle}>Upload Assembly</span>
        <span style={styles.expandIcon}>{isExpanded ? '▼' : '▶'}</span>
      </div>

      {isExpanded && (
        <div style={styles.content}>
          {/* Drop zone */}
          <div
            style={{
              ...styles.dropZone,
              ...(isDragging ? styles.dropZoneDragging : {}),
              ...(isUploading ? styles.dropZoneUploading : {})
            }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleClick}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".zip"
              onChange={handleFileSelect}
              style={styles.hiddenInput}
            />

            {isUploading ? (
              <div style={styles.uploadingContent}>
                <div style={styles.spinner} />
                <div style={styles.progressText}>Uploading... {uploadProgress}%</div>
                <div style={styles.progressBar}>
                  <div
                    style={{
                      ...styles.progressFill,
                      width: `${uploadProgress}%`
                    }}
                  />
                </div>
              </div>
            ) : (
              <div style={styles.dropContent}>
                <div style={styles.dropIcon}>📁</div>
                <div style={styles.dropText}>
                  {isDragging ? 'Drop zip file here' : 'Drag & drop or click to upload'}
                </div>
                <div style={styles.dropHint}>.zip files only (Construction DNA format)</div>
              </div>
            )}
          </div>

          {/* Result display */}
          {lastResult && (
            <div
              style={{
                ...styles.result,
                ...(lastResult.success ? styles.resultSuccess : styles.resultError)
              }}
            >
              {lastResult.success ? (
                <>
                  <div style={styles.resultHeader}>
                    <span style={styles.successIcon}>✓</span>
                    <span>{lastResult.data?.originalFilename}</span>
                  </div>
                  <div style={styles.resultStats}>
                    <div>📄 {lastResult.data?.extractedFiles.length} files extracted</div>
                    <div>🗑️ {lastResult.data?.filteredFiles.length} garbage filtered</div>
                    <div>🧬 {lastResult.data?.assemblies.length} assemblies loaded</div>
                  </div>
                  {lastResult.data?.assemblies.map((asm) => (
                    <div key={asm.id} style={styles.assemblyItem}>
                      <span style={styles.assemblyName}>{asm.name}</span>
                      <span style={styles.layerCount}>({asm.layers.length} layers)</span>
                    </div>
                  ))}
                </>
              ) : (
                <div style={styles.errorContent}>
                  <span style={styles.errorIcon}>✗</span>
                  <span>{lastResult.error}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    width: '280px',
    backgroundColor: 'rgba(20, 20, 30, 0.95)',
    borderRadius: '8px',
    border: '1px solid rgba(100, 200, 255, 0.3)',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    fontSize: '12px',
    color: '#e0e0e0',
    zIndex: 1000,
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px 12px',
    cursor: 'pointer',
    borderBottom: '1px solid rgba(100, 200, 255, 0.2)',
  },
  headerIcon: {
    marginRight: '8px',
    fontSize: '14px',
  },
  headerTitle: {
    flex: 1,
    fontWeight: 600,
    color: '#64c8ff',
  },
  expandIcon: {
    fontSize: '10px',
    color: '#888',
  },
  content: {
    padding: '12px',
  },
  dropZone: {
    border: '2px dashed rgba(100, 200, 255, 0.4)',
    borderRadius: '6px',
    padding: '20px',
    textAlign: 'center' as const,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    backgroundColor: 'rgba(100, 200, 255, 0.05)',
  },
  dropZoneDragging: {
    borderColor: '#64c8ff',
    backgroundColor: 'rgba(100, 200, 255, 0.15)',
  },
  dropZoneUploading: {
    borderColor: '#ffa500',
    cursor: 'wait',
  },
  hiddenInput: {
    display: 'none',
  },
  dropContent: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '8px',
  },
  dropIcon: {
    fontSize: '24px',
  },
  dropText: {
    fontWeight: 500,
    color: '#64c8ff',
  },
  dropHint: {
    fontSize: '10px',
    color: '#888',
  },
  uploadingContent: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '10px',
  },
  spinner: {
    width: '24px',
    height: '24px',
    border: '3px solid rgba(100, 200, 255, 0.2)',
    borderTop: '3px solid #64c8ff',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  progressText: {
    color: '#ffa500',
    fontWeight: 500,
  },
  progressBar: {
    width: '100%',
    height: '4px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '2px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#ffa500',
    transition: 'width 0.2s ease',
  },
  result: {
    marginTop: '12px',
    padding: '10px',
    borderRadius: '6px',
    fontSize: '11px',
  },
  resultSuccess: {
    backgroundColor: 'rgba(100, 200, 100, 0.1)',
    border: '1px solid rgba(100, 200, 100, 0.3)',
  },
  resultError: {
    backgroundColor: 'rgba(255, 100, 100, 0.1)',
    border: '1px solid rgba(255, 100, 100, 0.3)',
  },
  resultHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginBottom: '8px',
    fontWeight: 600,
  },
  successIcon: {
    color: '#64c864',
    fontSize: '14px',
  },
  resultStats: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '4px',
    color: '#aaa',
    marginBottom: '8px',
  },
  assemblyItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '4px 8px',
    backgroundColor: 'rgba(100, 200, 255, 0.1)',
    borderRadius: '4px',
    marginTop: '4px',
  },
  assemblyName: {
    color: '#64c8ff',
  },
  layerCount: {
    color: '#888',
  },
  errorContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: '#ff6464',
  },
  errorIcon: {
    fontSize: '14px',
  },
};

export default ZipUpload;
