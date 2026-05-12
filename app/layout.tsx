export const metadata = {
  title: 'Noteflow API',
  description: 'REST API para la app NoteFlow',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
