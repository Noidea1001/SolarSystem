import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Aerovex Solar OS | 3D Interactive Solar System & Planetary Science Explorer',
  description:
    'Full-screen 3D interactive Solar System space simulation game and educational astronomy platform with real planetary orbits and Earth geolocation.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-space-950 text-slate-100 w-screen h-screen overflow-hidden selection:bg-aeroblue/30 selection:text-white">
        {children}
      </body>
    </html>
  );
}
