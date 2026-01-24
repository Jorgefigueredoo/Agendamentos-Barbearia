'use client'

import type { Barbeiro } from '@/lib/api'
import { Check, Scissors } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BarberCardProps {
  barber: Barbeiro
  selected: boolean
  onSelect: (barber: Barbeiro) => void
}

export function BarberCard({ barber, selected, onSelect }: BarberCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(barber)}
      className={cn(
        "w-full p-4 rounded-lg border-2 text-left transition-all duration-200",
        selected 
          ? "border-primary bg-primary/10" 
          : "border-border bg-card hover:border-primary/50"
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <div className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center transition-colors",
            selected ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
          )}>
            <Scissors className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-medium text-foreground">{barber.name}</h3>
            <p className="text-sm text-muted-foreground">Profissional</p>
          </div>
        </div>
        {selected && (
          <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
            <Check className="w-4 h-4 text-primary-foreground" />
          </div>
        )}
      </div>
    </button>
  )
}