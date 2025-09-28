import '@workspace/ui/globals.css';

import * as React from 'react';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';

import { APP_DESCRIPTION, APP_NAME } from '@workspace/common/app';
import { baseUrl } from '@workspace/routes';
import { Toaster } from '@workspace/ui/components/sonner';

import { Footer } from '~/components/footer';
import { CookieBanner } from '~/components/fragments/cookie-banner';
import { Navbar } from '~/components/navbar';
import { Providers } from './providers';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' }
  ]
};

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl.Marketing),
  title: APP_NAME,
  description: APP_DESCRIPTION,
  keywords: [
    'nómina méxico',
    'software nómina',
    'CFDI 4.0',
    'cálculo IMSS',
    'cálculo ISR',
    'portal empleados',
    'NOM-035',
    'recursos humanos',
    'Y Combinator',
    'startup mexicana',
    'payroll software',
    'HR tech',
    'SaaS México'
  ],
  authors: [{ name: 'Quantix', url: 'https://quantix.mx' }],
  creator: 'Quantix',
  publisher: 'Quantix',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png'
  },
  manifest: `${baseUrl.Marketing}/manifest`,
  openGraph: {
    type: 'website',
    locale: 'es_MX',
    siteName: 'Quantix',
    title: APP_NAME,
    description: APP_DESCRIPTION,
    url: baseUrl.Marketing,
    images: {
      url: `${baseUrl.Marketing}/og-image`,
      width: 1200,
      height: 630,
      alt: 'Quantix - Software de Nómina con IA para México'
    }
  },
  twitter: {
    card: 'summary_large_image',
    title: APP_NAME,
    description: APP_DESCRIPTION,
    creator: '@quantix_mx',
    images: [`${baseUrl.Marketing}/og-image`]
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1
    }
  },
  alternates: {
    canonical: baseUrl.Marketing
  }
};

const inter = Inter({ subsets: ['latin'] });

export default async function RootLayout({
  children
}: React.PropsWithChildren): Promise<React.JSX.Element> {
  return (
    <html
      lang="es-MX"
      className="size-full min-h-screen"
      suppressHydrationWarning
    >
      <body className={`${inter.className} size-full overflow-x-hidden`}>
        <Providers>
          <div className="overflow-x-hidden">
            <Navbar />
            {children}
            <Footer />
            <CookieBanner />
          </div>
          <React.Suspense>
            <Toaster />
          </React.Suspense>
        </Providers>
      </body>
    </html>
  );
}
