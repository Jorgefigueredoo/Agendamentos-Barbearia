'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getWorkingHours, getBlockedDates } from '@/lib/store'

interface DatePickerProps {
  selectedDate: string | null
  onSelect: (date: string) => void
}

export function DatePicker({ selectedDate, onSelect }: DatePickerProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  
  const workingHours = getWorkingHours()
  const blockedDates = getBlockedDates()
  
  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate()
  
  const firstDayOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  ).getDay()
  
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ]
  
  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
  
  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }
  
  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }
  
  const isDateAvailable = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    const dateStr = date.toISOString().split('T')[0]
    
    // Past date
    if (date < today) return false
    
    // Check working hours
    const dayOfWeek = date.getDay()
    const dayHours = workingHours.find(h => h.dayOfWeek === dayOfWeek)
    if (!dayHours || !dayHours.isOpen) return false
    
    // Check blocked dates
    if (blockedDates.some(b => b.date === dateStr)) return false
    
    return true
  }
  
  const formatDateString = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    return date.toISOString().split('T')[0]
  }
  
  const days = []
  
  // Empty cells for days before first day of month
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(<div key={`empty-${i}`} className="h-10" />)
  }
  
  // Day cells
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = formatDateString(day)
    const isAvailable = isDateAvailable(day)
    const isSelected = selectedDate === dateStr
    
    days.push(
      <button
        key={day}
        type="button"
        disabled={!isAvailable}
        onClick={() => isAvailable && onSelect(dateStr)}
        className={cn(
          "h-10 w-10 rounded-full text-sm font-medium transition-all duration-200",
          isAvailable && !isSelected && "hover:bg-primary/20 text-foreground",
          !isAvailable && "text-muted-foreground/40 cursor-not-allowed",
          isSelected && "bg-primary text-primary-foreground"
        )}
      >
        {day}
      </button>
    )
  }
  
  const canGoPrevious = currentMonth.getMonth() >= today.getMonth() && 
                        currentMonth.getFullYear() >= today.getFullYear()
  
  return (
    <div className="bg-card rounded-lg border border-border p-4">
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={previousMonth}
          disabled={!canGoPrevious}
          className={cn(
            "p-2 rounded-full transition-colors",
            canGoPrevious ? "hover:bg-secondary" : "opacity-30 cursor-not-allowed"
          )}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h3 className="font-medium text-foreground">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>
        <button
          type="button"
          onClick={nextMonth}
          className="p-2 rounded-full hover:bg-secondary transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
      
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map(day => (
          <div key={day} className="h-10 flex items-center justify-center text-xs text-muted-foreground font-medium">
            {day}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {days}
      </div>
    </div>
  )
}
