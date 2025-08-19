import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../styles/globals.css'
import { ErrorBoundary } from '../components/ErrorBoundary'
import { AuthProvider } from '../components/AuthContext'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Providers } from './providers'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: {
    default: 'Toastify - Cold Email Outreach Management',
    template: '%s | Toastify'
  },
  description: 'Transform your cold email outreach with automatic prospect scoring, engagement tracking, and AI-powered optimization.',
  keywords: ['cold email', 'outreach', 'sales', 'email marketing', 'lead generation', 'prospect management'],
  authors: [{ name: 'Toastify Team' }],
  creator: 'Toastify',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://toastify.app'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'Toastify - Cold Email Outreach Management',
    description: 'Transform your cold email outreach with automatic prospect scoring and engagement tracking.',
    siteName: 'Toastify',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Toastify - Cold Email Outreach Management',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Toastify - Cold Email Outreach Management',
    description: 'Transform your cold email outreach with automatic prospect scoring and engagement tracking.',
    images: ['/og-image.png'],
    creator: '@toastify',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { url: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content="#030213" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="font-sans antialiased">
        <ErrorBoundary
          onError={(error, errorInfo) => {
            console.error('Application error:', error, errorInfo)
            // TODO: Send to error reporting service like Sentry
          }}
        >
          <Providers>
            {children}
          </Providers>
        </ErrorBoundary>
        
        {/* Service Worker Registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW registered: ', registration);
                    })
                    .catch(function(registrationError) {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  )
}