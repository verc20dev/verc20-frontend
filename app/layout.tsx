import type { Metadata } from 'next'
import { Noto_Sans_Mono } from 'next/font/google'
import './globals.css'
import '@rainbow-me/rainbowkit/styles.css';
import { Providers } from "@/app/providers";
import { Navbar } from "@/components/navbar";
import Footer from "@/components/footer";
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from '@vercel/analytics/react';

const sansMono = Noto_Sans_Mono({
  subsets: ['latin'],
  variable: '--font-sans-mono',
})

export const metadata: Metadata = {
  title: 'vERC-20',
  description: 'A leading platform for Ethereum inscriptions',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${sansMono.variable}`}>
      <head/>
      <body className="min-h-screen bg-background font-sans antialiased">
        <Providers themeProps={{attribute: "class", defaultTheme: "dark"}}>
          <div className="relative flex flex-col h-screen">
            <Navbar/>
            <main className="container mx-auto max-w-7xl px-6 flex-grow">
              {children}
            </main>
            <footer className="w-full static sm:fixed bottom-0 left-0 z-20">
              <Footer/>
            </footer>
          </div>
        </Providers>
        <SpeedInsights/>
        <Analytics/>
      </body>
    </html>
  )
}
