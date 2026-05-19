export default function DocsPage() {
  const specUrl = '/api/docs';

  return (
    <html lang="es">
      <head>
        <title>NoteFlow API — Documentación</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.17.14/swagger-ui.min.css" />
        <style>{`
          body { margin: 0; background: #0a0a0b; }
          .swagger-ui { font-family: 'Inter', sans-serif; }
          .swagger-ui .topbar { background: #18181b; border-bottom: 2px solid #c5a028; padding: 12px 0; }
          .swagger-ui .topbar-wrapper .link { display: flex; align-items: center; gap: 12px; }
          .swagger-ui .topbar-wrapper .link::before {
            content: 'NOTEFLOW API';
            color: #c5a028;
            font-weight: 800;
            font-size: 18px;
            letter-spacing: 2px;
          }
          .swagger-ui .topbar-wrapper img { display: none; }
          .swagger-ui .info { margin: 30px 0; }
          .swagger-ui .info .title { color: #fafaf9; }
          .swagger-ui .info p, .swagger-ui .info li { color: #a8a29e; }
          .swagger-ui .scheme-container { background: #18181b; border: 1px solid #3f3f46; border-radius: 8px; }
          .swagger-ui select { background: #27272a; color: #fafaf9; border-color: #3f3f46; }
          .swagger-ui .opblock-tag { color: #fafaf9; border-bottom-color: #3f3f46; }
          .swagger-ui .opblock { border-radius: 8px; margin-bottom: 8px; }
          .swagger-ui .opblock.opblock-get { border-color: #16a34a; background: rgba(22,163,74,0.05); }
          .swagger-ui .opblock.opblock-post { border-color: #2563eb; background: rgba(37,99,235,0.05); }
          .swagger-ui .opblock.opblock-patch { border-color: #d97706; background: rgba(217,119,6,0.05); }
          .swagger-ui .opblock.opblock-delete { border-color: #dc2626; background: rgba(220,38,38,0.05); }
          .swagger-ui .opblock .opblock-summary-path { color: #fafaf9; }
          .swagger-ui .opblock .opblock-summary-description { color: #a8a29e; }
          .swagger-ui .btn.authorize { border-color: #c5a028; color: #c5a028; }
          .swagger-ui .btn.authorize svg { fill: #c5a028; }
          .swagger-ui .btn.authorize:hover { background: rgba(197,160,40,0.1); }
          .swagger-ui .btn.execute { background: #c5a028; border-color: #c5a028; }
          .swagger-ui section.models { border-color: #3f3f46; }
          .swagger-ui section.models h4 { color: #fafaf9; }
          .swagger-ui .model-title { color: #c5a028; }
        `}</style>
      </head>
      <body>
        <div id="swagger-ui" />
        <script src="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.17.14/swagger-ui-bundle.min.js" />
        <script src="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.17.14/swagger-ui-standalone-preset.min.js" />
        <script dangerouslySetInnerHTML={{
          __html: `
            window.onload = function() {
              SwaggerUIBundle({
                url: '${specUrl}',
                dom_id: '#swagger-ui',
                presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
                layout: 'StandaloneLayout',
                persistAuthorization: true,
                tryItOutEnabled: true,
                displayRequestDuration: true,
                filter: true,
                syntaxHighlight: { activate: true, theme: 'monokai' },
              });
            };
          `
        }} />
      </body>
    </html>
  );
}
