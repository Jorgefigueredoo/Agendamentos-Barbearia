'use client'

import type { Service } from '@/lib/types'
import { Clock, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ServiceCardProps {
  service: Service
  selected: boolean
  onSelect: (service: Service) => void
}

export function ServiceCard({ service, selected, onSelect }: ServiceCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(service)}
      className={cn(
        "w-full p-4 rounded-lg border-2 text-left transition-all duration-200",
        selected 
          ? "border-primary bg-primary/10" 
          : "border-border bg-card hover:border-primary/50"
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-medium text-foreground">{service.name}</h3>
          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {service.duration} min
            </span>
            <span className="text-primary font-semibold">
              R$ {service.price.toFixed(2)}
            </span>
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
