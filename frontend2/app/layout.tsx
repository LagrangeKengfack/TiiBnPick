import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { AuthProvider } from '@/context/AuthContext'
import { NotificationProvider } from '@/context/NotificationContext'
import { cookies } from 'next/headers'
import ThemeCookieSync from '@/components/theme-cookie-sync'
import { Toaster } from '@/components/ui/toaster'
import LocationTracker from '@/components/LocationTracker'

export const metadata: Metadata = {
  title: 'TiiBnTick',
  description: 'Plateforme intelligente de gestion et livraison',
  icons: {
    icon: [
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/icon.svg',
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Read theme cookie on the server to keep SSR class consistent
  // Support both API shapes: cookies may be a function (cookies()) or an object (cookies)
  const cookieStore: any = typeof cookies === 'function' ? await cookies() : cookies;
  let themeCookie = 'light';
  try {
    const getter = cookieStore?.get; // could be function
    const raw = typeof getter === 'function' ? getter.call(cookieStore, 'theme') : cookieStore?.get?.('theme');
    if (raw) {
      // raw can be string or { value }
      themeCookie = typeof raw === 'string' ? raw : (raw?.value ?? 'light');
    }
  } catch (e) {
    // fallback
    themeCookie = 'light';
  }

  return (
    <html lang="en" suppressHydrationWarning className={themeCookie === 'dark' ? 'dark' : 'light'} style={{ colorScheme: themeCookie as any }}>
      <body className={`font-sans antialiased`}>
        <ThemeProvider attribute="class">
          <AuthProvider>
            <NotificationProvider>
              <LocationTracker />
              {children}
              {/* Client component that keeps the cookie in sync when theme changes */}
              <ThemeCookieSync />
              <Toaster />
            </NotificationProvider>
          </AuthProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
