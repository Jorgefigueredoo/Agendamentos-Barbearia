'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getWorkingHours, saveWorkingHours } from '@/lib/store'
import type { WorkingHours } from '@/lib/types'
import { Check } from 'lucide-react'

const dayNames = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado'
]

export default function AdminHoursPage() {
  const [hours, setHours] = useState<WorkingHours[]>([])
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setHours(getWorkingHours())
  }, [])

  const handleToggleDay = (dayOfWeek: number) => {
    setHours(hours.map(h => 
      h.dayOfWeek === dayOfWeek ? { ...h, isOpen: !h.isOpen } : h
    ))
    setSaved(false)
  }

  const handleTimeChange = (dayOfWeek: number, field: 'openTime' | 'closeTime', value: string) => {
    setHours(hours.map(h => 
      h.dayOfWeek === dayOfWeek ? { ...h, [field]: value } : h
    ))
    setSaved(false)
  }

  const handleSave = () => {
    saveWorkingHours(hours)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-2xl font-bold text-foreground">Horário de Funcionamento</h1>
          <p className="text-muted-foreground">Configure os dias e horários de atendimento</p>
        </div>
        <Button onClick={handleSave}>
          {saved ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              Salvo!
            </>
          ) : (
            'Salvar Alterações'
          )}
        </Button>
      </div>

      <div className="space-y-3">
        {hours.map(day => (
          <div 
            key={day.dayOfWeek}
            className="bg-card rounded-lg border border-border p-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center gap-4 sm:w-48">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={day.isOpen}
                    onChange={() => handleToggleDay(day.dayOfWeek)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-secondary rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-foreground after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
                <span className="font-medium text-foreground">{dayNames[day.dayOfWeek]}</span>
              </div>

              {day.isOpen ? (
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Label className="text-sm text-muted-foreground whitespace-nowrap">Abre às</Label>
                    <Input
                      type="time"
                      value={day.openTime}
                      onChange={(e) => handleTimeChange(day.dayOfWeek, 'openTime', e.target.value)}
                      className="w-28"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-sm text-muted-foreground whitespace-nowrap">Fecha às</Label>
                    <Input
                      type="time"
                      value={day.closeTime}
                      onChange={(e) => handleTimeChange(day.dayOfWeek, 'closeTime', e.target.value)}
                      className="w-28"
                    />
                  </div>
                </div>
              ) : (
                <span className="text-muted-foreground text-sm">Fechado</span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-primary/10 rounded-lg">
        <p className="text-sm text-muted-foreground">
          <strong className="text-foreground">Dica:</strong> Os horários disponíveis para agendamento são gerados automaticamente 
          com base nessas configurações. Os clientes só poderão agendar nos dias e horários configurados como abertos.
        </p>
      </div>
    </div>
  )
}
