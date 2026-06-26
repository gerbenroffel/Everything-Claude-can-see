import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Prosus Regulatory Intelligence Portal',
  description: 'Portfolio regulatory matters tracking and AI-powered risk intelligence',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
