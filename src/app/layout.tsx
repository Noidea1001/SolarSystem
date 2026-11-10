import './globals.css';
import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'Aerovex Solar OS | 3D Interactive Solar System & Planetary Science Explorer',
  description:
    'Full-screen 3D interactive Solar System space simulation game and educational astronomy platform with real planetary orbits and Earth geolocation.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Aerovex Space',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#020409',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-space-950 text-slate-100 w-screen h-screen overflow-hidden select-none touch-none selection:bg-aeroblue/30 selection:text-white">
        {children}
      </body>
    </html>
  );
}
