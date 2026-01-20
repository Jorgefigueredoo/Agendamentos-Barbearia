'use client'

import { Button } from '@/components/ui/button'

type Slot = {
  time: string;       // pode vir "2026-01-20T13:30:00"
  available: boolean;
}

type Props = {
  slots: Slot[]
  selectedTime: string | null
  onSelect: (time: string) => void
}

function formatSlotLabel(time: string) {
  // Se vier ISO LocalDateTime: "YYYY-MM-DDTHH:mm:ss"
  if (time.includes('T')) return time.substring(11, 16) // "HH:mm"
  return time // fallback
}

export function TimeSlots({ slots, selectedTime, onSelect }: Props) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
      {slots.map((slot) => {
        const label = formatSlotLabel(slot.time)

        return (
          <Button
            key={slot.time}
            type="button"
            variant={selectedTime === slot.time ? 'default' : 'outline'}
            disabled={!slot.available}
            onClick={() => onSelect(slot.time)}
          >
            {label}
          </Button>
        )
      })}
    </div>
  )
}
