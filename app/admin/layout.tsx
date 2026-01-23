'use client'

import React, { useEffect, useState } from "react"
import { useRouter, usePathname } from 'next/navigation'
import { AdminSidebar } from '@/components/admin/admin-sidebar'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    if (pathname === '/admin/login') {
      setIsChecking(false)
      return
    }

    const token = localStorage.getItem("token")
    if (!token) {
      router.replace('/admin/login')
      return
    }

    setIsChecking(false)
  }, [pathname, router])

  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  if (isChecking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />
      <main className="lg:ml-64 pt-14 lg:pt-0 min-h-screen">
        {children}
      </main>
    </div>
  )
}
