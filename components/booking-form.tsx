'use client'

import { useState, useEffect } from 'react'
import { ServiceCard } from './service-card'
import { DatePicker } from './date-picker'
import { TimeSlots } from './time-slots'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Service } from '@/lib/types'
import { getServices, generateTimeSlots, addAppointment } from '@/lib/store'
import { CheckCircle, Calendar, Clock, User } from 'lucide-react'

type Step = 'service' | 'datetime' | 'info' | 'success'

export function BookingForm() {
  const [step, setStep] = useState<Step>('service')
  const [services, setServices] = useState<Service[]>([])
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [timeSlots, setTimeSlots] = useState<{ time: string; available: boolean }[]>([])
  const [clientName, setClientName] = useState('')
  const [clientPhone, setClientPhone] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    setServices(getServices())
  }, [])

  useEffect(() => {
    if (selectedDate && selectedService) {
      setTimeSlots(generateTimeSlots(selectedDate, selectedService.duration))
      setSelectedTime(null)
    }
  }, [selectedDate, selectedService])

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service)
  }

  const handleDateSelect = (date: string) => {
    setSelectedDate(date)
  }

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time)
  }

  const handleSubmit = () => {
    if (!selectedService || !selectedDate || !selectedTime || !clientName || !clientPhone) return
    
    setIsSubmitting(true)
    
    // Simular delay de API
    setTimeout(() => {
      addAppointment({
        clientName,
        clientPhone,
        serviceId: selectedService.id,
        date: selectedDate,
        time: selectedTime
      })
      setIsSubmitting(false)
      setStep('success')
    }, 1000)
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T12:00:00')
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    })
  }

  const resetForm = () => {
    setStep('service')
    setSelectedService(null)
    setSelectedDate(null)
    setSelectedTime(null)
    setClientName('')
    setClientPhone('')
  }

  if (step === 'success') {
    return (
      <div className="max-w-md mx-auto text-center py-12">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-green-500" />
        </div>
        <h2 className="font-serif text-2xl font-bold text-foreground mb-2">
          Agendamento Confirmado!
        </h2>
        <p className="text-muted-foreground mb-6">
          Seu horário foi reservado com sucesso. Aguardamos você!
        </p>
        
        <div className="bg-card rounded-lg border border-border p-4 mb-6 text-left">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-primary" />
              <span className="text-foreground">{clientName}</span>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-primary" />
              <span className="text-foreground capitalize">{selectedDate && formatDate(selectedDate)}</span>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-primary" />
              <span className="text-foreground">{selectedTime} - {selectedService?.name}</span>
            </div>
          </div>
        </div>
        
        <Button onClick={resetForm} className="w-full">
          Fazer Novo Agendamento
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {(['service', 'datetime', 'info'] as const).map((s, i) => (
          <div key={s} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                step === s
                  ? 'bg-primary text-primary-foreground'
                  : ['service', 'datetime', 'info'].indexOf(step) > i
                  ? 'bg-primary/20 text-primary'
                  : 'bg-secondary text-muted-foreground'
              }`}
            >
              {i + 1}
            </div>
            {i < 2 && (
              <div className={`w-12 h-0.5 mx-2 ${
                ['service', 'datetime', 'info'].indexOf(step) > i ? 'bg-primary' : 'bg-border'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      {step === 'service' && (
        <div>
          <h2 className="font-serif text-2xl font-bold text-foreground mb-2 text-center">
            Escolha o Serviço
          </h2>
          <p className="text-muted-foreground mb-6 text-center">
            Selecione o serviço que deseja agendar
          </p>
          
          <div className="grid gap-3 mb-6">
            {services.map(service => (
              <ServiceCard
                key={service.id}
                service={service}
                selected={selectedService?.id === service.id}
                onSelect={handleServiceSelect}
              />
            ))}
          </div>
          
          <Button
            onClick={() => setStep('datetime')}
            disabled={!selectedService}
            className="w-full"
          >
            Continuar
          </Button>
        </div>
      )}

      {step === 'datetime' && (
        <div>
          <h2 className="font-serif text-2xl font-bold text-foreground mb-2 text-center">
            Escolha Data e Horário
          </h2>
          <p className="text-muted-foreground mb-6 text-center">
            Selecione o melhor dia e horário para você
          </p>
          
          <div className="mb-6">
            <DatePicker
              selectedDate={selectedDate}
              onSelect={handleDateSelect}
            />
          </div>
          
          {selectedDate && (
            <div className="mb-6">
              <h3 className="font-medium text-foreground mb-3">Horários Disponíveis</h3>
              <TimeSlots
                slots={timeSlots}
                selectedTime={selectedTime}
                onSelect={handleTimeSelect}
              />
            </div>
          )}
          
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setStep('service')}
              className="flex-1"
            >
              Voltar
            </Button>
            <Button
              onClick={() => setStep('info')}
              disabled={!selectedDate || !selectedTime}
              className="flex-1"
            >
              Continuar
            </Button>
          </div>
        </div>
      )}

      {step === 'info' && (
        <div>
          <h2 className="font-serif text-2xl font-bold text-foreground mb-2 text-center">
            Seus Dados
          </h2>
          <p className="text-muted-foreground mb-6 text-center">
            Informe seus dados para confirmar o agendamento
          </p>
          
          {/* Resumo */}
          <div className="bg-card rounded-lg border border-border p-4 mb-6">
            <h3 className="font-medium text-foreground mb-3">Resumo do Agendamento</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Serviço:</span>
                <span className="text-foreground">{selectedService?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Data:</span>
                <span className="text-foreground capitalize">{selectedDate && formatDate(selectedDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Horário:</span>
                <span className="text-foreground">{selectedTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Duração:</span>
                <span className="text-foreground">{selectedService?.duration} minutos</span>
              </div>
              <div className="border-t border-border pt-2 mt-2 flex justify-between font-medium">
                <span className="text-foreground">Total:</span>
                <span className="text-primary">R$ {selectedService?.price.toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-4 mb-6">
            <div>
              <Label htmlFor="name">Nome Completo</Label>
              <Input
                id="name"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Digite seu nome"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="phone">Telefone / WhatsApp</Label>
              <Input
                id="phone"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                placeholder="(00) 00000-0000"
                className="mt-1"
              />
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setStep('datetime')}
              className="flex-1"
            >
              Voltar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!clientName || !clientPhone || isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? 'Confirmando...' : 'Confirmar Agendamento'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
