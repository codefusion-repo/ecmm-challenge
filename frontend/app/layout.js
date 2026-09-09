import "./globals.css";

export const metadata = {
  title: "Catálogo de productos",
  description: "Catálogo conectado a la API de Django.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
