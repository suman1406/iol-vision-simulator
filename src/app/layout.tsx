import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';

export const metadata: Metadata = {
  title: 'IOL Optical Simulation Workstation — Clinical Patient Consultation Suite',
  description: 'Evidence-based intraocular lens optical simulation suite powered by Fourier optics and Q1 clinical benchmark data.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 antialiased selection:bg-sky-100 selection:text-sky-900">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
