'use client'

import Link from 'next/link'
import { Scissors } from 'lucide-react'

export function Header() {
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
            <Scissors className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-serif text-xl font-bold text-foreground">Barber Shop</h1>
            <p className="text-xs text-muted-foreground">Estilo & Tradição</p>
          </div>
        </Link>
        <Link 
          href="/admin/login"
          className="text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          Área do Barbeiro
        </Link>
      </div>
    </header>
  )
}
