'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getBlockedDates, addBlockedDate, removeBlockedDate } from '@/lib/store'
import type { BlockedDate } from '@/lib/types'
import { Plus, Trash2, CalendarOff, X } from 'lucide-react'

export default function AdminBlockedPage() {
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([])
  const [isAdding, setIsAdding] = useState(false)
  const [newDate, setNewDate] = useState('')
  const [newReason, setNewReason] = useState('')

  const loadDates = () => {
    setBlockedDates(getBlockedDates())
  }

  useEffect(() => {
    loadDates()
  }, [])

  const handleAdd = () => {
    if (!newDate) return
    addBlockedDate(newDate, newReason || undefined)
    setNewDate('')
    setNewReason('')
    setIsAdding(false)
    loadDates()
  }

  const handleRemove = (id: string) => {
    removeBlockedDate(id)
    loadDates()
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T12:00:00')
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const today = new Date().toISOString().split('T')[0]

  // Sort dates
  const sortedDates = [...blockedDates].sort((a, b) => a.date.localeCompare(b.date))
  const futureDates = sortedDates.filter(d => d.date >= today)
  const pastDates = sortedDates.filter(d => d.date < today)

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-2xl font-bold text-foreground">Dias Bloqueados</h1>
          <p className="text-muted-foreground">Bloqueie dias específicos para não receber agendamentos</p>
        </div>
        <Button onClick={() => setIsAdding(true)} disabled={isAdding}>
          <Plus className="w-4 h-4 mr-2" />
          Bloquear Dia
        </Button>
      </div>

      {/* Add Form */}
      {isAdding && (
        <div className="bg-card rounded-lg border border-border p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-foreground">Bloquear Novo Dia</h3>
            <button onClick={() => setIsAdding(false)} className="text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date">Data</Label>
              <Input
                id="date"
                type="date"
                value={newDate}
                min={today}
                onChange={(e) => setNewDate(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="reason">Motivo (opcional)</Label>
              <Input
                id="reason"
                value={newReason}
                onChange={(e) => setNewReason(e.target.value)}
                placeholder="Ex: Feriado, Férias, etc."
                className="mt-1"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button onClick={handleAdd}>Bloquear</Button>
            <Button variant="outline" onClick={() => setIsAdding(false)}>Cancelar</Button>
          </div>
        </div>
      )}

      {/* Blocked Dates List */}
      {blockedDates.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <CalendarOff className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Nenhum dia bloqueado</p>
        </div>
      ) : (
        <div className="space-y-6">
          {futureDates.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Próximos Bloqueios</h3>
              <div className="space-y-2">
                {futureDates.map(date => (
                  <div 
                    key={date.id}
                    className="bg-card rounded-lg border border-border p-4 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium text-foreground capitalize">{formatDate(date.date)}</p>
                      {date.reason && (
                        <p className="text-sm text-muted-foreground">{date.reason}</p>
                      )}
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleRemove(date.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {pastDates.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Bloqueios Passados</h3>
              <div className="space-y-2 opacity-60">
                {pastDates.map(date => (
                  <div 
                    key={date.id}
                    className="bg-card rounded-lg border border-border p-4 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium text-foreground capitalize">{formatDate(date.date)}</p>
                      {date.reason && (
                        <p className="text-sm text-muted-foreground">{date.reason}</p>
                      )}
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleRemove(date.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mt-6 p-4 bg-primary/10 rounded-lg">
        <p className="text-sm text-muted-foreground">
          <strong className="text-foreground">Dica:</strong> Use esta funcionalidade para bloquear feriados, férias 
          ou qualquer dia em que você não poderá atender. Os clientes não conseguirão agendar nessas datas.
        </p>
      </div>
    </div>
  )
}
