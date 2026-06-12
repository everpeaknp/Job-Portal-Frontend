/** Shared business card styles for print dialog and HTML download. */
export const BUSINESS_CARD_PRINT_CSS = `
  .bc-a4-sheet {
    width: 210mm;
    min-height: 297mm;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #ffffff;
    font-family: ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .bc-card {
    width: 90mm;
    min-height: 54mm;
    padding: 5mm 5.5mm;
    background: #ffffff;
    color: #171717;
    border: 0.35mm solid #e5e5e5;
    box-sizing: border-box;
  }

  .bc-header {
    display: flex;
    gap: 3.5mm;
    align-items: flex-start;
    padding-bottom: 3mm;
    border-bottom: 0.25mm solid #e5e5e5;
  }

  .bc-logo {
    width: 12mm;
    height: 12mm;
    flex-shrink: 0;
    object-fit: cover;
    border-radius: 1mm;
    background: #f5f5f5;
  }

  .bc-logo-placeholder {
    width: 12mm;
    height: 12mm;
    flex-shrink: 0;
    border-radius: 1mm;
    background: #f5f5f5;
  }

  .bc-name {
    margin: 0;
    font-size: 11pt;
    font-weight: 600;
    letter-spacing: -0.02em;
    line-height: 1.2;
    color: #0a0a0a;
  }

  .bc-tagline {
    margin: 1mm 0 0;
    font-size: 8pt;
    font-weight: 500;
    line-height: 1.35;
    color: #525252;
  }

  .bc-meta {
    margin: 1mm 0 0;
    font-size: 7pt;
    color: #737373;
  }

  .bc-contact {
    margin-top: 3mm;
    font-size: 7.5pt;
    line-height: 1.5;
    color: #404040;
  }

  .bc-contact-line {
    margin: 0;
  }

  .bc-footer {
    margin-top: 3mm;
    padding-top: 2.5mm;
    border-top: 0.25mm solid #f0f0f0;
    font-size: 6.5pt;
    line-height: 1.45;
    color: #737373;
    word-break: break-all;
  }

`;
