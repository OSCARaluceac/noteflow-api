export default function Home() {
  return (
    <main style={{ fontFamily: 'monospace', padding: '2rem', maxWidth: '700px' }}>
      <h1>📋 Noteflow API</h1>
      <p>API REST para la app NoteFlow. Todos los endpoints devuelven JSON.</p>

      <h2>Endpoints disponibles</h2>
      <table style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr style={{ textAlign: 'left', borderBottom: '1px solid #ccc' }}>
            <th style={{ padding: '8px' }}>Método</th>
            <th style={{ padding: '8px' }}>Ruta</th>
            <th style={{ padding: '8px' }}>Descripción</th>
          </tr>
        </thead>
        <tbody>
          {[
            ['GET',    '/api/notes',                          'Lista todas las notas'],
            ['POST',   '/api/notes',                          'Crea una nota'],
            ['GET',    '/api/notes/:id',                      'Detalle de una nota'],
            ['PATCH',  '/api/notes/:id',                      'Actualiza una nota'],
            ['DELETE', '/api/notes/:id',                      'Elimina una nota'],
            ['GET',    '/api/notes/:id/checklist-items',      'Items de un checklist'],
            ['POST',   '/api/notes/:id/checklist-items',      'Añade un item'],
            ['PATCH',  '/api/checklist-items/:itemId',        'Marca/desmarca item'],
            ['DELETE', '/api/checklist-items/:itemId',        'Elimina un item'],
          ].map(([method, path, desc]) => (
            <tr key={path + method} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '8px', fontWeight: 'bold' }}>{method}</td>
              <td style={{ padding: '8px' }}>{path}</td>
              <td style={{ padding: '8px', color: '#555' }}>{desc}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
