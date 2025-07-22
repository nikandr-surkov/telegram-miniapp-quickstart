import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '🎮 Points Game - Telegram Mini App',
  description: 'Collect points and have fun!',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="overflow-x-hidden">{children}</body>
    </html>
  )
}