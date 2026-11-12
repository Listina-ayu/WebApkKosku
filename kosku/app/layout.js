import './globals.css';

export const metadata = {
  title: 'KosKu - Manajemen Kos',
  description: 'Aplikasi web manajemen kos: kamar, penghuni, tagihan, dan pembayaran.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
