import { Header } from '@/components/header'
import { BookingForm } from '@/components/booking-form'
import { Scissors, MapPin, Phone, Clock } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Scissors className="w-4 h-4" />
              Agendamento Online
            </div>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 text-balance">
              Estilo e Tradição em Cada Corte
            </h1>
            <p className="text-lg text-muted-foreground mb-8 text-pretty">
              Reserve seu horário de forma rápida e prática. 
              Atendimento personalizado com os melhores profissionais.
            </p>
          </div>
        </div>
      </section>
      
      {/* Booking Section */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <BookingForm />
        </div>
      </section>
      
      {/* Info Section */}
      <section className="py-12 md:py-16 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-medium text-foreground mb-2">Localização</h3>
              <p className="text-sm text-muted-foreground">
                Rua das Barbearias, 123<br />
                Centro - São Paulo, SP
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <Phone className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-medium text-foreground mb-2">Contato</h3>
              <p className="text-sm text-muted-foreground">
                (11) 99999-9999<br />
                contato@barbershop.com
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-medium text-foreground mb-2">Horário</h3>
              <p className="text-sm text-muted-foreground">
                Seg - Sex: 09h às 19h<br />
                Sábado: 09h às 17h
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-6 border-t border-border">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm text-muted-foreground">
            © 2026 Barber Shop. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}
