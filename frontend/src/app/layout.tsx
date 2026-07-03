import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Corporate Holocron',
  description: 'Governance, Risk, and Compliance — local development',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
