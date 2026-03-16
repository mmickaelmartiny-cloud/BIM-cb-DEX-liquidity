import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "cbDOGE DEX Monitor",
  description: "Real-time DEX liquidity monitoring for cbDOGE on Base",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
