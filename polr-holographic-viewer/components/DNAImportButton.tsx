/**
 * DNA Import Button Component
 * L0-CMD-2026-0125-005 Phase 6
 *
 * Provides file input for importing Construction DNA materials.
 * Supports .json and .zip files.
 */

import { useRef, useState, useCallback } from 'react';
import { importDNAFile, ImportResult } from '../services/dna-import';
import { useDNAMaterialStore } from '../stores/dna-material-store';

interface Props {
  /** Optional callback when import completes */
  onImportComplete?: (result: ImportResult) => void;
  /** Button variant */
  variant?: 'primary' | 'secondary' | 'minimal';
  /** Custom button text */
  label?: string;
  /** Whether to show result notification */
  showNotification?: boolean;
}

export function DNAImportButton({
  onImportComplete,
  variant = 'primary',
  label = 'Import DNA',
  showNotification = true
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'warning';
    message: string;
  } | null>(null);

  const addMaterials = useDNAMaterialStore(state => state.addMaterials);

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setNotification(null);

    try {
      const result = await importDNAFile(file);

      if (result.success && result.materials.length > 0) {
        // Add materials to store
        addMaterials(result.materials);

        if (showNotification) {
          setNotification({
            type: result.warnings.length > 0 ? 'warning' : 'success',
            message: `Imported ${result.materials.length} materials from ${file.name}`
          });
        }
      } else if (result.errors.length > 0) {
        if (showNotification) {
          setNotification({
            type: 'error',
            message: result.errors[0]
          });
        }
      } else {
        if (showNotification) {
          setNotification({
            type: 'warning',
            message: 'No materials found in file'
          });
        }
      }

      onImportComplete?.(result);
    } catch (error) {
      console.error('[DNAImportButton] Import error:', error);
      if (showNotification) {
        setNotification({
          type: 'error',
          message: error instanceof Error ? error.message : 'Import failed'
        });
      }
    } finally {
      setIsLoading(false);
      // Reset file input so same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [addMaterials, onImportComplete, showNotification]);

  const dismissNotification = useCallback(() => {
    setNotification(null);
  }, []);

  // Variant-specific class names
  const buttonClass = `dna-import-btn dna-import-btn--${variant}`;

  return (
    <div className="dna-import-container">
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,.zip"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      <button
        className={buttonClass}
        onClick={handleClick}
        disabled={isLoading}
        title="Import Construction DNA materials (.json or .zip)"
      >
        {isLoading ? (
          <>
            <span className="dna-import-spinner" />
            <span>Importing...</span>
          </>
        ) : (
          <>
            <span className="dna-import-icon">🧬</span>
            <span>{label}</span>
          </>
        )}
      </button>

      {notification && showNotification && (
        <div className={`dna-import-notification dna-import-notification--${notification.type}`}>
          <span className="notification-icon">
            {notification.type === 'success' ? '✓' : notification.type === 'error' ? '✗' : '⚠'}
          </span>
          <span className="notification-message">{notification.message}</span>
          <button
            className="notification-dismiss"
            onClick={dismissNotification}
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      )}

      <style>{`
        .dna-import-container {
          position: relative;
          display: inline-block;
        }

        .dna-import-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
        }

        .dna-import-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .dna-import-btn--primary {
          background: linear-gradient(135deg, #4F46E5, #7C3AED);
          color: white;
        }

        .dna-import-btn--primary:hover:not(:disabled) {
          background: linear-gradient(135deg, #4338CA, #6D28D9);
          transform: translateY(-1px);
        }

        .dna-import-btn--secondary {
          background: #374151;
          color: #E5E7EB;
          border: 1px solid #4B5563;
        }

        .dna-import-btn--secondary:hover:not(:disabled) {
          background: #4B5563;
        }

        .dna-import-btn--minimal {
          background: transparent;
          color: #9CA3AF;
          padding: 4px 8px;
        }

        .dna-import-btn--minimal:hover:not(:disabled) {
          color: #E5E7EB;
          background: rgba(255, 255, 255, 0.1);
        }

        .dna-import-icon {
          font-size: 16px;
        }

        .dna-import-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: dna-spin 0.8s linear infinite;
        }

        @keyframes dna-spin {
          to { transform: rotate(360deg); }
        }

        .dna-import-notification {
          position: absolute;
          top: calc(100% + 8px);
          left: 0;
          right: 0;
          min-width: 250px;
          padding: 10px 12px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          z-index: 100;
          animation: dna-slide-in 0.2s ease;
        }

        @keyframes dna-slide-in {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .dna-import-notification--success {
          background: #065F46;
          color: #A7F3D0;
        }

        .dna-import-notification--error {
          background: #991B1B;
          color: #FECACA;
        }

        .dna-import-notification--warning {
          background: #92400E;
          color: #FDE68A;
        }

        .notification-icon {
          font-size: 14px;
          flex-shrink: 0;
        }

        .notification-message {
          flex: 1;
        }

        .notification-dismiss {
          background: none;
          border: none;
          color: inherit;
          font-size: 18px;
          cursor: pointer;
          padding: 0;
          line-height: 1;
          opacity: 0.7;
        }

        .notification-dismiss:hover {
          opacity: 1;
        }
      `}</style>
    </div>
  );
}

export default DNAImportButton;
