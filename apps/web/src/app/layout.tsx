import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { QueryProvider } from '@/components/providers/QueryProvider'
import { Toaster } from 'sonner'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: {
    default: 'QR Platform – Enterprise QR Management',
    template: '%s | QR Platform',
  },
  description:
    'Create, manage, and analyze QR codes at enterprise scale. Track scans, customize designs, and gain deep insights with our powerful QR management platform.',
  keywords: ['QR code', 'QR generator', 'QR analytics', 'enterprise QR', 'dynamic QR codes', 'QR management'],
  authors: [{ name: 'QR Platform' }],
  creator: 'QR Platform',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_APP_URL,
    title: 'QR Platform – Enterprise QR Management',
    description: 'Create, manage, and analyze QR codes at enterprise scale.',
    siteName: 'QR Platform',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'QR Platform',
    description: 'Enterprise QR Management System',
  },
  robots: { index: true, follow: true },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0f' },
  ],
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning className={inter.variable}>
        <body className="font-sans antialiased">
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
            <QueryProvider>
              {children}
              <Toaster richColors position="top-right" />
            </QueryProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
