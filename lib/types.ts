export interface Service {
  id: string
  name: string
  duration: number // em minutos
  price: number
}

export interface TimeSlot {
  time: string
  available: boolean
}

export interface Appointment {
  id: string
  clientName: string
  clientPhone: string
  serviceId: string
  date: string // formato YYYY-MM-DD
  time: string // formato HH:mm
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  createdAt: string
}

export interface WorkingHours {
  dayOfWeek: number // 0 = domingo, 1 = segunda, etc.
  isOpen: boolean
  openTime: string
  closeTime: string
}

export interface BlockedDate {
  id: string
  date: string
  reason?: string
}
