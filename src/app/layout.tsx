import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Klarhet',
  description: 'Post-interview feedback — understand why, grow faster.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
