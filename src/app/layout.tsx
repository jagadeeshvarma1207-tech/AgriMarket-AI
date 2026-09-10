import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AgriMarket AI — Farm Fresh, AI Graded',
  description: 'A direct farmer-to-consumer agricultural marketplace powered by AI quality assessment. Buy fresh fruits and vegetables directly from local farmers.',
  keywords: 'farm fresh, agriculture, marketplace, AI quality, farmers market, organic produce',
  openGraph: {
    title: 'AgriMarket AI',
    description: 'Farm Fresh, AI Graded — Direct farmer-to-consumer marketplace',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>{children}</body>
    </html>
  )
}
