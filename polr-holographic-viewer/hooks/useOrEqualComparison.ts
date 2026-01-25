/**
 * Or Equal Comparison Hook
 * L0-CMD-2026-0125-003 Phase A1
 *
 * React hook wrapping OrEqualComparison class for comparison visualization
 */

import { useRef, useState, useCallback, useEffect } from 'react';
import * as THREE from 'three';
import {
  OrEqualComparison,
  ComparisonMode,
  SemanticDetail,
  DifferenceReport
} from '../features/or-equal-comparison';

export interface UseOrEqualComparisonReturn {
  /** Current comparison mode */
  mode: ComparisonMode | null;
  /** Whether a comparison is currently active */
  isComparing: boolean;
  /** Current manufacturers being compared */
  manufacturers: [string, string] | null;
  /** Difference report between manufacturers */
  differenceReport: DifferenceReport | null;
  /** Current slider position (0-1) for slider mode */
  sliderPosition: number;
  /** Current toggle index for toggle mode */
  currentToggleIndex: number;
  /** Start a comparison */
  startComparison: (
    detail: SemanticDetail,
    mfr1: string,
    mfr2: string,
    comparisonMode: ComparisonMode
  ) => void;
  /** Stop the current comparison */
  stopComparison: () => void;
  /** Set slider position (for slider mode) */
  setSliderPosition: (position: number) => void;
  /** Toggle to next manufacturer (for toggle mode) */
  toggle: () => string | null;
  /** Toggle to specific manufacturer (for toggle mode) */
  toggleTo: (manufacturer: string) => void;
  /** Get the current manufacturer in toggle mode */
  getCurrentManufacturer: () => string | null;
}

export function useOrEqualComparison(
  scene: THREE.Scene | null
): UseOrEqualComparisonReturn {
  const comparisonRef = useRef<OrEqualComparison | null>(null);
  const toggleGroupRef = useRef<THREE.Group | null>(null);

  const [mode, setMode] = useState<ComparisonMode | null>(null);
  const [isComparing, setIsComparing] = useState(false);
  const [manufacturers, setManufacturers] = useState<[string, string] | null>(null);
  const [differenceReport, setDifferenceReport] = useState<DifferenceReport | null>(null);
  const [sliderPosition, setSliderPositionState] = useState(0.5);
  const [currentToggleIndex, setCurrentToggleIndex] = useState(0);

  // Initialize comparison instance when scene is available
  useEffect(() => {
    if (scene && !comparisonRef.current) {
      comparisonRef.current = new OrEqualComparison();
      comparisonRef.current.initialize(scene);
    }

    return () => {
      comparisonRef.current?.dispose();
      comparisonRef.current = null;
    };
  }, [scene]);

  // Start comparison
  const startComparison = useCallback((
    detail: SemanticDetail,
    mfr1: string,
    mfr2: string,
    comparisonMode: ComparisonMode
  ) => {
    if (!comparisonRef.current) {
      console.error('OrEqualComparison not initialized');
      return;
    }

    // Clear any existing comparison
    comparisonRef.current.clearComparison();

    // Set state
    setMode(comparisonMode);
    setIsComparing(true);
    setManufacturers([mfr1, mfr2]);

    // Generate difference report
    const report = comparisonRef.current.getDifferenceReport(detail, mfr1, mfr2);
    setDifferenceReport(report);

    // Log comparison event (IV.06 NON-REPUDIATION)
    console.log(`[POLR Comparison] Started ${comparisonMode} comparison: ${mfr1} vs ${mfr2}`);
    console.log(`[POLR Comparison] Overall equivalency score: ${(report.overallEquivalencyScore * 100).toFixed(1)}%`);

    // Create the comparison visualization
    switch (comparisonMode) {
      case 'side-by-side':
        comparisonRef.current.createSideBySide(detail, [mfr1, mfr2]);
        break;

      case 'slider':
        comparisonRef.current.createSliderComparison(detail, mfr1, mfr2);
        setSliderPositionState(0.5);
        break;

      case 'toggle':
        toggleGroupRef.current = comparisonRef.current.createToggleComparison(detail, [mfr1, mfr2]);
        setCurrentToggleIndex(0);
        break;

      case 'animate':
        // Animation mode uses toggle internally
        toggleGroupRef.current = comparisonRef.current.createToggleComparison(detail, [mfr1, mfr2]);
        setCurrentToggleIndex(0);
        break;
    }
  }, []);

  // Stop comparison
  const stopComparison = useCallback(() => {
    if (comparisonRef.current) {
      comparisonRef.current.clearComparison();
      console.log('[POLR Comparison] Stopped comparison');
    }

    setMode(null);
    setIsComparing(false);
    setManufacturers(null);
    setDifferenceReport(null);
    toggleGroupRef.current = null;
  }, []);

  // Set slider position
  const setSliderPosition = useCallback((position: number) => {
    if (!comparisonRef.current || mode !== 'slider') return;

    const clampedPosition = Math.max(0, Math.min(1, position));
    setSliderPositionState(clampedPosition);
    comparisonRef.current.setSliderPosition(clampedPosition);
  }, [mode]);

  // Toggle to next manufacturer
  const toggle = useCallback((): string | null => {
    if (!toggleGroupRef.current || !manufacturers) return null;

    const toggleFn = toggleGroupRef.current.userData.toggle;
    if (typeof toggleFn === 'function') {
      const nextMfr = toggleFn();
      const newIndex = manufacturers.indexOf(nextMfr);
      setCurrentToggleIndex(newIndex >= 0 ? newIndex : 0);
      console.log(`[POLR Comparison] Toggled to: ${nextMfr}`);
      return nextMfr;
    }
    return null;
  }, [manufacturers]);

  // Toggle to specific manufacturer
  const toggleTo = useCallback((manufacturer: string) => {
    if (!toggleGroupRef.current || !manufacturers) return;

    const toggleFn = toggleGroupRef.current.userData.toggle;
    if (typeof toggleFn === 'function') {
      toggleFn(manufacturer);
      const newIndex = manufacturers.indexOf(manufacturer);
      setCurrentToggleIndex(newIndex >= 0 ? newIndex : 0);
      console.log(`[POLR Comparison] Toggled to: ${manufacturer}`);
    }
  }, [manufacturers]);

  // Get current manufacturer in toggle mode
  const getCurrentManufacturer = useCallback((): string | null => {
    if (!toggleGroupRef.current) return null;

    const getFn = toggleGroupRef.current.userData.getCurrentManufacturer;
    if (typeof getFn === 'function') {
      return getFn();
    }
    return manufacturers?.[currentToggleIndex] || null;
  }, [manufacturers, currentToggleIndex]);

  return {
    mode,
    isComparing,
    manufacturers,
    differenceReport,
    sliderPosition,
    currentToggleIndex,
    startComparison,
    stopComparison,
    setSliderPosition,
    toggle,
    toggleTo,
    getCurrentManufacturer
  };
}

export default useOrEqualComparison;
