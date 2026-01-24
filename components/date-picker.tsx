'use client'

import { useMemo, useState, type ReactNode } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

// cria Date LOCAL estável (12:00 evita edge cases de timezone/DST)
function makeLocalDate(y: number, m0: number, d: number) {
  return new Date(y, m0, d, 12, 0, 0, 0)
}

function ymdFromLocal(y: number, m0: number, d: number) {
  const month = String(m0 + 1).padStart(2, '0')
  const dayStr = String(d).padStart(2, '0')
  return `${y}-${month}-${dayStr}`
}

// offset p/ semana começando na Segunda (Seg=0..Dom=6)
function mondayFirstOffset(firstOfMonth: Date) {
  return (firstOfMonth.getDay() + 6) % 7 // Dom(0)->6, Seg(1)->0 ...
}

interface DatePickerProps {
  selectedDate: string | null
  onSelect: (date: string) => void
}

export function DatePicker({ selectedDate, onSelect }: DatePickerProps) {
  // ancora no dia 1 ao meio-dia (evita bugs de fuso)
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date()
    return makeLocalDate(now.getFullYear(), now.getMonth(), 1)
  })

  const year = currentMonth.getFullYear()
  const month0 = currentMonth.getMonth()

  const daysInMonth = useMemo(() => {
    return makeLocalDate(year, month0 + 1, 0).getDate()
  }, [year, month0])

  const firstOfMonth = useMemo(() => makeLocalDate(year, month0, 1), [year, month0])
  const firstDayOffset = useMemo(() => mondayFirstOffset(firstOfMonth), [firstOfMonth])

  const today = useMemo(() => {
    const t = new Date()
    t.setHours(0, 0, 0, 0)
    return t
  }, [])

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ]

  // semana começa em Seg
  const dayNames = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']

  const previousMonth = () => {
    setCurrentMonth(makeLocalDate(year, month0 - 1, 1))
  }

  const nextMonth = () => {
    setCurrentMonth(makeLocalDate(year, month0 + 1, 1))
  }

  const isDateAvailable = (day: number) => {
    const date = makeLocalDate(year, month0, day)
    const compare = new Date(date)
    compare.setHours(0, 0, 0, 0)
    return compare >= today
  }

  const days = useMemo(() => {
    const nodes: ReactNode[] = []

    // espaços vazios antes do dia 1 (mesmo tamanho dos botões)
    for (let i = 0; i < firstDayOffset; i++) {
      nodes.push(<div key={`empty-${i}`} className="h-10 w-10" />)
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = ymdFromLocal(year, month0, day)
      const isAvailable = isDateAvailable(day)
      const isSelected = selectedDate === dateStr

      nodes.push(
        <button
          key={day}
          type="button"
          disabled={!isAvailable}
          onClick={() => isAvailable && onSelect(dateStr)}
          className={cn(
            // ✅ mantém o mesmo tamanho e centralizado
            'h-10 w-10 rounded-full text-sm font-medium transition-all duration-200',
            isAvailable && !isSelected && 'hover:bg-primary/20 text-foreground',
            !isAvailable && 'text-muted-foreground/40 cursor-not-allowed',
            isSelected && 'bg-primary text-primary-foreground'
          )}
        >
          {day}
        </button>
      )
    }

    return nodes
  }, [daysInMonth, firstDayOffset, month0, onSelect, selectedDate, year])

  // bloqueia voltar para meses antes do mês atual (considerando ano também)
  const canGoPrevious = useMemo(() => {
    const now = new Date()
    const nowY = now.getFullYear()
    const nowM = now.getMonth()

    if (year > nowY) return true
    if (year < nowY) return false
    return month0 > nowM
  }, [month0, year])

  return (
    <div className="bg-card rounded-lg border border-border p-4">
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={previousMonth}
          disabled={!canGoPrevious}
          className={cn(
            'p-2 rounded-full transition-colors',
            canGoPrevious ? 'hover:bg-secondary' : 'opacity-30 cursor-not-allowed'
          )}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <h3 className="font-medium text-foreground">
          {monthNames[month0]} {year}
        </h3>

        <button
          type="button"
          onClick={nextMonth}
          className="p-2 rounded-full hover:bg-secondary transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* ✅ Centraliza todo mundo na grade */}
      <div className="grid grid-cols-7 gap-1 mb-2 place-items-center">
        {dayNames.map((day) => (
          <div
            key={day}
            className="h-10 w-10 flex items-center justify-center text-xs text-muted-foreground font-medium"
          >
            {day}
          </div>
        ))}
      </div>

      {/* ✅ Centraliza os dias e os vazios */}
      <div className="grid grid-cols-7 gap-1 place-items-center">
        {days}
      </div>
    </div>
  )
}
