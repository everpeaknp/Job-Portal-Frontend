import { BUSINESS_CARD_PRINT_CSS } from '@/lib/businessCardPrintStyles';
import { CV_PRINT_CSS } from '@/lib/cvPrintStyles';

const PRINT_BODY_CLASS = 'document-print-mode';
const PRINT_TARGET_ATTR = 'data-print-active';

const EMBEDDED_PRINT_STYLES = `
  @page { size: A4; margin: 0; }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    padding: 0;
    font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
    color: #171717;
    background: #fff;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  img { max-width: 100%; }
  ${CV_PRINT_CSS}
  ${BUSINESS_CARD_PRINT_CSS}
`;

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Print a node on the current page (keeps Tailwind styles, no popup blockers). */
export function printElementOnPage(element: HTMLElement | null): boolean {
  if (!element || typeof window === 'undefined') return false;

  element.setAttribute(PRINT_TARGET_ATTR, 'true');
  document.body.classList.add(PRINT_BODY_CLASS);

  const cleanup = () => {
    document.body.classList.remove(PRINT_BODY_CLASS);
    element.removeAttribute(PRINT_TARGET_ATTR);
  };

  const timeoutId = window.setTimeout(cleanup, 120_000);
  const cleanupOnce = () => {
    window.clearTimeout(timeoutId);
    cleanup();
  };

  window.addEventListener('afterprint', cleanupOnce, { once: true });

  window.print();
  return true;
}

/** Download the node as a standalone HTML file. */
export function downloadElementAsHtml(
  element: HTMLElement | null,
  filename: string,
  title: string,
): boolean {
  if (!element || typeof window === 'undefined') return false;

  const safeTitle = escapeHtml(title);
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${safeTitle}</title>
  <style>${EMBEDDED_PRINT_STYLES}</style>
</head>
<body>${element.innerHTML}</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.html') ? filename : `${filename}.html`;
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  return true;
}

/** Print via a new window (fallback when in-page print is unsuitable). */
export function printHtmlElement(element: HTMLElement | null, title: string): boolean {
  if (!element || typeof window === 'undefined') return false;

  const safeTitle = escapeHtml(title);
  const printWindow = window.open('', '_blank', 'width=900,height=700');
  if (!printWindow) {
    return printElementOnPage(element);
  }

  printWindow.document.write(
    `<!DOCTYPE html><html><head><meta charset="utf-8" /><title>${safeTitle}</title><style>${EMBEDDED_PRINT_STYLES}</style></head><body>${element.innerHTML}</body></html>`,
  );
  printWindow.document.close();

  const triggerPrint = () => {
    printWindow.focus();
    printWindow.print();
  };

  const images = printWindow.document.images;
  if (images.length === 0) {
    triggerPrint();
    return true;
  }

  let loaded = 0;
  const onImageDone = () => {
    loaded += 1;
    if (loaded >= images.length) {
      triggerPrint();
    }
  };

  for (let index = 0; index < images.length; index += 1) {
    const image = images[index];
    if (image.complete) {
      onImageDone();
    } else {
      image.addEventListener('load', onImageDone, { once: true });
      image.addEventListener('error', onImageDone, { once: true });
    }
  }

  return true;
}
