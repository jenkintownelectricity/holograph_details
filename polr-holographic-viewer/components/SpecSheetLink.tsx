/**
 * Spec Sheet Link Component
 * L0-CMD-2026-0125-005 Phase 6
 *
 * Renders a link to manufacturer specification sheets.
 * Shows manufacturer and product info with external link indicator.
 */

interface Props {
  /** URL to the specification sheet */
  url: string;
  /** Manufacturer name for display */
  manufacturer?: string;
  /** Product name for display */
  product?: string;
  /** Optional custom label */
  label?: string;
  /** Size variant */
  size?: 'small' | 'medium' | 'large';
  /** Whether to show as a button or inline link */
  variant?: 'link' | 'button';
}

export function SpecSheetLink({
  url,
  manufacturer,
  product,
  label,
  size = 'medium',
  variant = 'link'
}: Props) {
  // Validate URL
  if (!url || !isValidUrl(url)) {
    return null;
  }

  // Build display text
  const displayText = label ||
    (product && manufacturer ? `${manufacturer} - ${product}` :
      product || manufacturer || 'View Spec Sheet');

  const handleClick = (e: React.MouseEvent) => {
    // Track click for analytics (if analytics added later)
    console.log('[SpecSheetLink] Opening:', url);
  };

  if (variant === 'button') {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={`spec-sheet-btn spec-sheet-btn--${size}`}
        onClick={handleClick}
        title={`Open specification sheet for ${displayText}`}
      >
        <span className="spec-sheet-icon">📄</span>
        <span className="spec-sheet-text">Spec Sheet</span>
        <span className="spec-sheet-external">↗</span>

        <style>{buttonStyles}</style>
      </a>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`spec-sheet-link spec-sheet-link--${size}`}
      onClick={handleClick}
      title={`Open specification sheet: ${url}`}
    >
      <span className="spec-sheet-icon">📄</span>
      <span className="spec-sheet-text">{displayText}</span>
      <span className="spec-sheet-external">↗</span>

      <style>{linkStyles}</style>
    </a>
  );
}

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

const linkStyles = `
  .spec-sheet-link {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: #60A5FA;
    text-decoration: none;
    transition: all 0.2s ease;
  }

  .spec-sheet-link:hover {
    color: #93C5FD;
    text-decoration: underline;
  }

  .spec-sheet-link--small {
    font-size: 11px;
  }

  .spec-sheet-link--medium {
    font-size: 13px;
  }

  .spec-sheet-link--large {
    font-size: 15px;
  }

  .spec-sheet-link .spec-sheet-icon {
    font-size: 1em;
  }

  .spec-sheet-link .spec-sheet-text {
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .spec-sheet-link .spec-sheet-external {
    font-size: 0.8em;
    opacity: 0.7;
  }

  .spec-sheet-link:hover .spec-sheet-external {
    opacity: 1;
  }
`;

const buttonStyles = `
  .spec-sheet-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    background: #1E40AF;
    color: white;
    border-radius: 6px;
    text-decoration: none;
    font-weight: 500;
    transition: all 0.2s ease;
  }

  .spec-sheet-btn:hover {
    background: #2563EB;
    transform: translateY(-1px);
  }

  .spec-sheet-btn--small {
    font-size: 11px;
    padding: 4px 8px;
  }

  .spec-sheet-btn--medium {
    font-size: 13px;
    padding: 6px 12px;
  }

  .spec-sheet-btn--large {
    font-size: 15px;
    padding: 8px 16px;
  }

  .spec-sheet-btn .spec-sheet-icon {
    font-size: 1.1em;
  }

  .spec-sheet-btn .spec-sheet-external {
    font-size: 0.9em;
    opacity: 0.8;
  }

  .spec-sheet-btn:hover .spec-sheet-external {
    opacity: 1;
    transform: translate(1px, -1px);
  }
`;

export default SpecSheetLink;
