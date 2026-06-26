import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Prosus Regulatory Intelligence Portal',
  description: 'Track and manage regulatory matters across the Prosus group',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen" style={{ background: '#070d1a' }}>
        {children}
      </body>
    </html>
  );
}
