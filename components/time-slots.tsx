'use client'

import { cn } from '@/lib/utils'

interface TimeSlotsProps {
  slots: { time: string; available: boolean }[]
  selectedTime: string | null
  onSelect: (time: string) => void
}

export function TimeSlots({ slots, selectedTime, onSelect }: TimeSlotsProps) {
  if (slots.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Nenhum horário disponível para esta data.
      </div>
    )
  }
  
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
      {slots.map(slot => (
        <button
          key={slot.time}
          type="button"
          disabled={!slot.available}
          onClick={() => slot.available && onSelect(slot.time)}
          className={cn(
            "py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 border",
            slot.available && selectedTime !== slot.time && "border-border bg-card hover:border-primary text-foreground",
            !slot.available && "border-border/50 bg-secondary/50 text-muted-foreground/50 cursor-not-allowed line-through",
            selectedTime === slot.time && "border-primary bg-primary text-primary-foreground"
          )}
        >
          {slot.time}
        </button>
      ))}
    </div>
  )
}
