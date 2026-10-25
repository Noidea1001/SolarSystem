import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Aerovex Space Platform | Mission Architect & B2B Space Hardware Marketplace',
  description:
    'High-precision aerospace engineering architecture platform, verified NewSpace subsystem catalog, and B2B orbital marketplace with milestone escrow.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-space-950 text-slate-100 min-h-screen selection:bg-aeroblue/30 selection:text-white">
        {children}
      </body>
    </html>
  );
}
