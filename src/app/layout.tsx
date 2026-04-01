import type { Metadata } from 'next';
import { Inter, Geist_Mono } from 'next/font/google';
import type { ReactNode } from 'react';
import './globals.css';

interface Props {
  children: ReactNode;
}

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Station',
  description: 'Audience insights platform',
};

export default function RootLayout({ children }: Props) {
  return (
    <html lang="en" className={`${inter.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
