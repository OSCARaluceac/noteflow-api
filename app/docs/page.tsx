// Fix 3: eliminado <html>/<head>/<body> — el layout raíz ya los provee.
// SwaggerUI via CDN requería su propio <html> y causaba el error React #418
// (hidratación fallida: el servidor renderiza HTML, el cliente espera React).
// Solución: página completamente client-side que carga SwaggerUI dinámicamente
// después del montaje, sin conflicto con el SSR.

'use client';

import { useEffect, useRef } from 'react';

export default function DocsPage() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Inyectar CSS de Swagger UI
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.17.14/swagger-ui.min.css';
    document.head.appendChild(link);

    // Cargar bundle JS de Swagger UI y después el preset
    const script1 = document.createElement('script');
    script1.src = 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.17.14/swagger-ui-bundle.min.js';
    script1.onload = () => {
      const script2 = document.createElement('script');
      script2.src = 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.17.14/swagger-ui-standalone-preset.min.js';
      script2.onload = () => {
        const w = window as any;
        if (w.SwaggerUIBundle && ref.current) {
          w.SwaggerUIBundle({
            url: '/api/docs',
            domNode: ref.current,
            presets: [w.SwaggerUIBundle.presets.apis, w.SwaggerUIStandalonePreset],
            layout: 'StandaloneLayout',
            persistAuthorization: true,
            tryItOutEnabled: true,
            displayRequestDuration: true,
            filter: true,
            syntaxHighlight: { activate: true, theme: 'monokai' },
          });
        }
      };
      document.head.appendChild(script2);
    };
    document.head.appendChild(script1);
  }, []);

  return (
    <>
      <style>{`
        body { margin: 0; background: #0a0a0b; }
        .swagger-ui .topbar { background: #18181b; border-bottom: 2px solid #c5a028; }
        .swagger-ui .topbar-wrapper .link::before {
          content: 'NOTEFLOW API';
          color: #c5a028;
          font-weight: 800;
          font-size: 18px;
          letter-spacing: 2px;
        }
        .swagger-ui .topbar-wrapper img { display: none; }
        .swagger-ui .info .title { color: #fafaf9; }
        .swagger-ui .info p, .swagger-ui .info li { color: #a8a29e; }
        .swagger-ui .scheme-container { background: #18181b; border: 1px solid #3f3f46; }
        .swagger-ui select { background: #27272a; color: #fafaf9; border-color: #3f3f46; }
        .swagger-ui .opblock-tag { color: #fafaf9; border-bottom-color: #3f3f46; }
        .swagger-ui .opblock { border-radius: 8px; margin-bottom: 8px; }
        .swagger-ui .opblock.opblock-get  { border-color: #16a34a; background: rgba(22,163,74,0.05); }
        .swagger-ui .opblock.opblock-post { border-color: #2563eb; background: rgba(37,99,235,0.05); }
        .swagger-ui .opblock.opblock-patch { border-color: #d97706; background: rgba(217,119,6,0.05); }
        .swagger-ui .opblock.opblock-delete { border-color: #dc2626; background: rgba(220,38,38,0.05); }
        .swagger-ui .opblock .opblock-summary-path { color: #fafaf9; }
        .swagger-ui .btn.authorize { border-color: #c5a028; color: #c5a028; }
        .swagger-ui .btn.authorize svg { fill: #c5a028; }
        .swagger-ui .btn.execute { background: #c5a028; border-color: #c5a028; }
        .swagger-ui section.models { border-color: #3f3f46; }
        .swagger-ui .model-title { color: #c5a028; }
      `}</style>
      <div ref={ref} />
    </>
  );
}
