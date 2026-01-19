'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { 
  getAppointments, 
  getServices, 
  updateAppointmentStatus,
  deleteAppointment 
} from '@/lib/store'
import type { Appointment, Service } from '@/lib/types'
import { Calendar, Check, X, Trash2, Clock, User, Phone } from 'lucide-react'
import { cn } from '@/lib/utils'

type FilterStatus = 'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [filter, setFilter] = useState<FilterStatus>('all')
  const [dateFilter, setDateFilter] = useState<string>('')

  const loadData = () => {
    setAppointments(getAppointments())
    setServices(getServices())
  }

  useEffect(() => {
    loadData()
  }, [])

  const getServiceName = (serviceId: string) => {
    return services.find(s => s.id === serviceId)?.name || 'Serviço não encontrado'
  }

  const handleStatusChange = (id: string, status: Appointment['status']) => {
    updateAppointmentStatus(id, status)
    loadData()
  }

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este agendamento?')) {
      deleteAppointment(id)
      loadData()
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T12:00:00')
    return date.toLocaleDateString('pt-BR', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit'
    })
  }

  const filteredAppointments = appointments
    .filter(a => filter === 'all' || a.status === filter)
    .filter(a => !dateFilter || a.date === dateFilter)
    .sort((a, b) => {
      // Sort by date and time
      const dateCompare = a.date.localeCompare(b.date)
      if (dateCompare !== 0) return dateCompare
      return a.time.localeCompare(b.time)
    })

  const statusColors: Record<Appointment['status'], string> = {
    pending: 'bg-yellow-500/20 text-yellow-500',
    confirmed: 'bg-blue-500/20 text-blue-500',
    completed: 'bg-green-500/20 text-green-500',
    cancelled: 'bg-red-500/20 text-red-500'
  }

  const statusLabels: Record<Appointment['status'], string> = {
    pending: 'Pendente',
    confirmed: 'Confirmado',
    completed: 'Concluído',
    cancelled: 'Cancelado'
  }

  const todayStr = new Date().toISOString().split('T')[0]
  const todayAppointments = appointments.filter(a => a.date === todayStr && a.status !== 'cancelled')
  const pendingCount = appointments.filter(a => a.status === 'pending').length

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="font-serif text-2xl font-bold text-foreground">Agendamentos</h1>
        <p className="text-muted-foreground">Gerencie os agendamentos da barbearia</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-card rounded-lg border border-border p-4">
          <p className="text-sm text-muted-foreground">Hoje</p>
          <p className="text-2xl font-bold text-foreground">{todayAppointments.length}</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <p className="text-sm text-muted-foreground">Pendentes</p>
          <p className="text-2xl font-bold text-yellow-500">{pendingCount}</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <p className="text-sm text-muted-foreground">Esta Semana</p>
          <p className="text-2xl font-bold text-foreground">
            {appointments.filter(a => {
              const aptDate = new Date(a.date)
              const today = new Date()
              const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
              return aptDate >= weekAgo && a.status !== 'cancelled'
            }).length}
          </p>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <p className="text-sm text-muted-foreground">Total</p>
          <p className="text-2xl font-bold text-foreground">{appointments.length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex gap-2">
          {(['all', 'pending', 'confirmed', 'completed', 'cancelled'] as const).map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                filter === status 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              )}
            >
              {status === 'all' ? 'Todos' : statusLabels[status]}
            </button>
          ))}
        </div>
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="px-3 py-1.5 rounded-lg bg-secondary text-secondary-foreground text-sm border-0"
        />
        {dateFilter && (
          <button
            onClick={() => setDateFilter('')}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Limpar filtro
          </button>
        )}
      </div>

      {/* Appointments List */}
      {filteredAppointments.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Nenhum agendamento encontrado</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAppointments.map(appointment => (
            <div 
              key={appointment.id}
              className="bg-card rounded-lg border border-border p-4"
            >
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="text-foreground font-medium">{appointment.clientName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{appointment.clientPhone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-foreground">{formatDate(appointment.date)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-foreground">{appointment.time}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <span className="text-sm text-primary font-medium">
                    {getServiceName(appointment.serviceId)}
                  </span>
                  <span className={cn("px-2 py-1 rounded text-xs font-medium", statusColors[appointment.status])}>
                    {statusLabels[appointment.status]}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {appointment.status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusChange(appointment.id, 'confirmed')}
                        className="h-8"
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusChange(appointment.id, 'cancelled')}
                        className="h-8 text-destructive hover:text-destructive"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                  {appointment.status === 'confirmed' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusChange(appointment.id, 'completed')}
                      className="h-8"
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Concluir
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(appointment.id)}
                    className="h-8 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
