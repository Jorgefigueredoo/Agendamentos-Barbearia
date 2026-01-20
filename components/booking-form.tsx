'use client'

import { useState, useEffect } from 'react'
import { ServiceCard } from './service-card'
import { DatePicker } from './date-picker'
import { TimeSlots } from './time-slots'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CheckCircle, Calendar, Clock, User } from 'lucide-react'

import { api, type Servico, type HorarioDisponivel } from '@/lib/api'


type Step = 'service' | 'datetime' | 'info' | 'success'

export function BookingForm() {
  const [step, setStep] = useState<Step>('service')

  // catálogo vindo da API
  const [services, setServices] = useState<Servico[]>([])
  const [selectedService, setSelectedService] = useState<Servico | null>(null)

  // seleção do usuário
  const [selectedDate, setSelectedDate] = useState<string | null>(null) // YYYY-MM-DD
  const [selectedTime, setSelectedTime] = useState<string | null>(null) // startTime completo: YYYY-MM-DDTHH:mm:ss

  // slots vindos do backend
  const [slotsFromApi, setSlotsFromApi] = useState<HorarioDisponivel[]>([])
  const [timeSlots, setTimeSlots] = useState<{ time: string; available: boolean }[]>([])

  // cliente
  const [clientName, setClientName] = useState('')
  const [clientPhone, setClientPhone] = useState('')
  const [notes, setNotes] = useState('')

  // UI states
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingSlots, setIsLoadingSlots] = useState(false)
  const [isLoadingServices, setIsLoadingServices] = useState(false)
  const [error, setError] = useState<string>('')

  // ------- helpers -------
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T12:00:00')
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    })
  }

  const formatTimeFromIso = (iso: string) => {
    // iso tipo "2026-01-20T13:30:00"
    return iso.substring(11, 16) // "13:30"
  }

  const formatPrice = (priceCents?: number) => {
    const value = (priceCents ?? 0) / 100
    return value.toFixed(2).replace('.', ',')
  }

  // ------- carregar serviços -------
  useEffect(() => {
    setIsLoadingServices(true)
    setError('')

    api.listarServicos()
      .then((data) => setServices(data))
      .catch((e: any) => setError(e?.message || 'Erro ao carregar serviços'))
      .finally(() => setIsLoadingServices(false))
  }, [])

  // ------- carregar disponibilidade quando escolher data+serviço -------
  useEffect(() => {
    async function loadAvailability() {
      if (!selectedDate || !selectedService) return

      setIsLoadingSlots(true)
      setError('')
      setSelectedTime(null)
      setTimeSlots([])
      setSlotsFromApi([])

      try {
        const slots = await api.listarDisponibilidade({
          date: selectedDate,       // YYYY-MM-DD
          serviceId: selectedService.id,
          barberId: 'any'
        })

        setSlotsFromApi(slots)

        // TimeSlots espera { time, available }
        // Vamos guardar "time" como startTime completo (ISO LocalDateTime)
        const mapped = slots.map((s) => ({
          time: s.startTime,
          available: true
        }))

        setTimeSlots(mapped)
      } catch (e: any) {
        setError(e?.message || 'Erro ao carregar horários')
      } finally {
        setIsLoadingSlots(false)
      }
    }

    loadAvailability()
  }, [selectedDate, selectedService])

  // ------- handlers -------
  const handleServiceSelect = (service: Servico) => {
    setSelectedService(service)
    // reset do restante
    setSelectedDate(null)
    setSelectedTime(null)
    setTimeSlots([])
    setSlotsFromApi([])
    setError('')
  }

  const handleDateSelect = (date: string) => {
    setSelectedDate(date)
  }

  const handleTimeSelect = (time: string) => {
    // "time" aqui é o startTime completo (ISO LocalDateTime)
    setSelectedTime(time)
  }

  const handleSubmit = async () => {
    if (!selectedService || !selectedDate || !selectedTime || !clientName || !clientPhone) return

    setIsSubmitting(true)
    setError('')

    try {
      // se o barberId for "any", o backend retornou barbeiroId dentro do slot.
      const chosenSlot = slotsFromApi.find((s) => s.startTime === selectedTime)
      if (!chosenSlot) {
        setError('Selecione um horário válido.')
        setIsSubmitting(false)
        return
      }

      await api.criarAgendamento({
        servicoId: selectedService.id,
        barbeiroId: chosenSlot.barbeiroId,
        startTime: chosenSlot.startTime, // já no formato aceito pelo backend
        clientName,
        clientPhone,
        notes
      })

      setStep('success')
    } catch (e: any) {
      setError(e?.message || 'Erro ao criar agendamento')
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setStep('service')
    setSelectedService(null)
    setSelectedDate(null)
    setSelectedTime(null)
    setClientName('')
    setClientPhone('')
    setNotes('')
    setTimeSlots([])
    setSlotsFromApi([])
    setError('')
  }

  // ------- success screen -------
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
              <span className="text-foreground">
                {selectedTime ? formatTimeFromIso(selectedTime) : ''} - {selectedService?.name}
              </span>
            </div>
          </div>
        </div>

        <Button onClick={resetForm} className="w-full">
          Fazer Novo Agendamento
        </Button>
      </div>
    )
  }

  // ------- main form -------
  return (
    <div className="max-w-3xl mx-auto">
      {/* erro */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-300 bg-red-500/10 p-3 text-red-600">
          {error}
        </div>
      )}

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
              <div
                className={`w-12 h-0.5 mx-2 ${
                  ['service', 'datetime', 'info'].indexOf(step) > i ? 'bg-primary' : 'bg-border'
                }`}
              />
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

          {isLoadingServices ? (
            <p className="text-center text-muted-foreground">Carregando serviços...</p>
          ) : (
            <div className="grid gap-3 mb-6">
              {services.map((service) => (
                <ServiceCard
                  key={service.id}
                  service={{
                    // Adapter para o tipo que seu ServiceCard espera
                    id: service.id,
                    name: service.name,
                    duration: service.durationMin,
                    price: (service.priceCents ?? 0) / 100
                  } as any}
                  selected={selectedService?.id === service.id}
                  onSelect={() => handleServiceSelect(service)}
                />
              ))}
            </div>
          )}

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
            <DatePicker selectedDate={selectedDate} onSelect={handleDateSelect} />
          </div>

          {selectedDate && (
            <div className="mb-6">
              <h3 className="font-medium text-foreground mb-3">Horários Disponíveis</h3>

              {isLoadingSlots ? (
                <p className="text-sm text-muted-foreground">Carregando horários...</p>
              ) : timeSlots.length === 0 ? (
                <p className="text-sm text-muted-foreground">Sem horários disponíveis.</p>
              ) : (
                <TimeSlots
                  slots={timeSlots.map((s) => ({
                    ...s,
                    // se o TimeSlots exibe `time` direto, você pode mostrar só HH:mm nele
                    // mas mantendo o valor real (startTime) para seleção.
                    // se seu TimeSlots já formata, pode remover isso.
                  }))}
                  selectedTime={selectedTime}
                  onSelect={handleTimeSelect}
                />
              )}
            </div>
          )}

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep('service')} className="flex-1">
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
                <span className="text-foreground capitalize">
                  {selectedDate && formatDate(selectedDate)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Horário:</span>
                <span className="text-foreground">
                  {selectedTime ? formatTimeFromIso(selectedTime) : ''}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Duração:</span>
                <span className="text-foreground">{selectedService?.durationMin} minutos</span>
              </div>
              <div className="border-t border-border pt-2 mt-2 flex justify-between font-medium">
                <span className="text-foreground">Total:</span>
                <span className="text-primary">R$ {formatPrice(selectedService?.priceCents)}</span>
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
                placeholder="81999999999"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="notes">Observação (opcional)</Label>
              <Input
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ex: corte degradê"
                className="mt-1"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep('datetime')} className="flex-1">
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
