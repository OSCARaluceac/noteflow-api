export const metadata = {
  title: 'NoteFlow API',
  description: 'API REST para la app NoteFlow',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body style={{ margin: 0, background: '#0a0a0b', color: '#fafaf9' }}>
        {children}
      </body>
    </html>
  );
}
