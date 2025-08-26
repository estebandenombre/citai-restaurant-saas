import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin Panel - Tably',
  description: 'Secure admin panel for managing upgrade requests',
  robots: 'noindex, nofollow', // Prevent indexing of admin pages
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="admin-layout">
      {children}
    </div>
  )
}
