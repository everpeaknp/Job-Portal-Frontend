/** Shared A4 CV styles for print dialog and HTML download. */
export const CV_PRINT_CSS = `
  .cv-a4-sheet {
    width: 210mm;
    min-height: 297mm;
    margin: 0 auto;
    background: #ffffff;
    color: #171717;
    font-family: ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    font-size: 10.5pt;
    line-height: 1.55;
  }

  .cv-a4-inner {
    padding: 18mm 20mm 20mm;
  }

  .cv-header {
    display: flex;
    gap: 1.25rem;
    align-items: flex-start;
    padding-bottom: 1.25rem;
    border-bottom: 1px solid #e5e5e5;
  }

  .cv-photo {
    width: 22mm;
    height: 22mm;
    flex-shrink: 0;
    overflow: hidden;
    border-radius: 2px;
    background: #f5f5f5;
    object-fit: cover;
  }

  .cv-photo-placeholder {
    width: 22mm;
    height: 22mm;
    flex-shrink: 0;
    border-radius: 2px;
    background: #f5f5f5;
  }

  .cv-name {
    font-size: 22pt;
    font-weight: 600;
    letter-spacing: -0.02em;
    line-height: 1.15;
    color: #0a0a0a;
    margin: 0;
  }

  .cv-subtitle {
    margin-top: 0.35rem;
    font-size: 11pt;
    font-weight: 500;
    color: #525252;
  }

  .cv-contact {
    margin-top: 0.65rem;
    font-size: 9.5pt;
    color: #737373;
  }

  .cv-section {
    padding-top: 1.1rem;
  }

  .cv-section-title {
    margin: 0 0 0.65rem;
    padding-bottom: 0.35rem;
    border-bottom: 1px solid #e5e5e5;
    font-size: 9pt;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: #404040;
  }

  .cv-summary {
    margin: 0;
    color: #404040;
    white-space: pre-wrap;
  }

  .cv-entry {
    margin-bottom: 0.95rem;
  }

  .cv-entry:last-child {
    margin-bottom: 0;
  }

  .cv-entry-head {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 1rem;
  }

  .cv-entry-title {
    margin: 0;
    font-size: 11pt;
    font-weight: 600;
    color: #171717;
  }

  .cv-entry-date {
    flex-shrink: 0;
    font-size: 9pt;
    color: #737373;
  }

  .cv-entry-org {
    margin: 0.15rem 0 0;
    font-size: 10pt;
    font-weight: 500;
    color: #525252;
  }

  .cv-entry-desc {
    margin: 0.35rem 0 0;
    font-size: 10pt;
    color: #525252;
  }

  .cv-lang-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.35rem 1.5rem;
  }

  .cv-lang-row {
    display: flex;
    justify-content: space-between;
    gap: 0.75rem;
    font-size: 10pt;
    color: #404040;
  }

  .cv-lang-level {
    color: #737373;
  }
`;
