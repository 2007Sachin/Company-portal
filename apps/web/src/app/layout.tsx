import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Pulse — Your Live Developer Profile',
  description: 'Replace your static resume with a live, verifiable Pulse Score. Connect GitHub, LeetCode, and Medium to showcase your real coding activity to recruiters.',
  keywords: ['developer profile', 'pulse score', 'tech recruitment', 'github portfolio', 'leetcode', 'career'],
  openGraph: {
    title: 'Pulse — Your Live Developer Profile',
    description: 'Replace your static resume with a live, verifiable Pulse Score.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#f8fafc] text-slate-800 antialiased">
        {children}
      </body>
    </html>
  );
}
