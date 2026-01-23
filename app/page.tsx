"use client";

import { Header } from '@/components/header'
import { BookingForm } from '@/components/booking-form'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">
            Agende seu Horário
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Escolha o serviço, data e horário que melhor se encaixam na sua agenda.
            Rápido, fácil e sem complicação.
          </p>
        </div>

        <BookingForm />
      </main>

      <footer className="border-t border-border mt-16 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2026 Barber Shop. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  )
}