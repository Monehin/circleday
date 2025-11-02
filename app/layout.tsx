import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { Toaster } from 'sonner'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const interDisplay = Inter({ 
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-display',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'CircleDay - Never miss a celebration',
    template: '%s | CircleDay'
  },
  description: 'Celebrate birthdays, anniversaries, and special moments with the people you care about.',
  keywords: ['birthdays', 'celebrations', 'reminders', 'events', 'anniversaries'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${interDisplay.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster 
            position="top-right"
            expand={false}
            richColors
            closeButton
          />
        </ThemeProvider>
      </body>
    </html>
  )
}

