import type { Service, Appointment, WorkingHours, BlockedDate } from './types'

const DEFAULT_SERVICES: Service[] = [
  { id: '1', name: 'Corte de Cabelo', duration: 30, price: 45 },
  { id: '2', name: 'Barba', duration: 20, price: 30 },
  { id: '3', name: 'Corte + Barba', duration: 45, price: 65 },
  { id: '4', name: 'Hidratação', duration: 30, price: 40 },
  { id: '5', name: 'Pigmentação', duration: 60, price: 80 },
]

const DEFAULT_WORKING_HOURS: WorkingHours[] = [
  { dayOfWeek: 0, isOpen: false, openTime: '09:00', closeTime: '18:00' },
  { dayOfWeek: 1, isOpen: true, openTime: '09:00', closeTime: '19:00' },
  { dayOfWeek: 2, isOpen: true, openTime: '09:00', closeTime: '19:00' },
  { dayOfWeek: 3, isOpen: true, openTime: '09:00', closeTime: '19:00' },
  { dayOfWeek: 4, isOpen: true, openTime: '09:00', closeTime: '19:00' },
  { dayOfWeek: 5, isOpen: true, openTime: '09:00', closeTime: '19:00' },
  { dayOfWeek: 6, isOpen: true, openTime: '09:00', closeTime: '17:00' },
]

const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'barber123'
}

// Helper para localStorage
function getFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue
  const stored = localStorage.getItem(key)
  return stored ? JSON.parse(stored) : defaultValue
}

function setToStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(key, JSON.stringify(value))
}

// Services
export function getServices(): Service[] {
  return getFromStorage('barber_services', DEFAULT_SERVICES)
}

export function saveServices(services: Service[]): void {
  setToStorage('barber_services', services)
}

export function addService(service: Omit<Service, 'id'>): Service {
  const services = getServices()
  const newService = { ...service, id: Date.now().toString() }
  services.push(newService)
  saveServices(services)
  return newService
}

export function updateService(id: string, data: Partial<Service>): void {
  const services = getServices()
  const index = services.findIndex(s => s.id === id)
  if (index !== -1) {
    services[index] = { ...services[index], ...data }
    saveServices(services)
  }
}

export function deleteService(id: string): void {
  const services = getServices().filter(s => s.id !== id)
  saveServices(services)
}

// Appointments
export function getAppointments(): Appointment[] {
  return getFromStorage('barber_appointments', [])
}

export function saveAppointments(appointments: Appointment[]): void {
  setToStorage('barber_appointments', appointments)
}

export function addAppointment(appointment: Omit<Appointment, 'id' | 'createdAt' | 'status'>): Appointment {
  const appointments = getAppointments()
  const newAppointment: Appointment = {
    ...appointment,
    id: Date.now().toString(),
    status: 'pending',
    createdAt: new Date().toISOString()
  }
  appointments.push(newAppointment)
  saveAppointments(appointments)
  return newAppointment
}

export function updateAppointmentStatus(id: string, status: Appointment['status']): void {
  const appointments = getAppointments()
  const index = appointments.findIndex(a => a.id === id)
  if (index !== -1) {
    appointments[index].status = status
    saveAppointments(appointments)
  }
}

export function deleteAppointment(id: string): void {
  const appointments = getAppointments().filter(a => a.id !== id)
  saveAppointments(appointments)
}

export function getAppointmentsByDate(date: string): Appointment[] {
  return getAppointments().filter(a => a.date === date && a.status !== 'cancelled')
}

// Working Hours
export function getWorkingHours(): WorkingHours[] {
  return getFromStorage('barber_working_hours', DEFAULT_WORKING_HOURS)
}

export function saveWorkingHours(hours: WorkingHours[]): void {
  setToStorage('barber_working_hours', hours)
}

// Blocked Dates
export function getBlockedDates(): BlockedDate[] {
  return getFromStorage('barber_blocked_dates', [])
}

export function saveBlockedDates(dates: BlockedDate[]): void {
  setToStorage('barber_blocked_dates', dates)
}

export function addBlockedDate(date: string, reason?: string): BlockedDate {
  const dates = getBlockedDates()
  const newDate: BlockedDate = { id: Date.now().toString(), date, reason }
  dates.push(newDate)
  saveBlockedDates(dates)
  return newDate
}

export function removeBlockedDate(id: string): void {
  const dates = getBlockedDates().filter(d => d.id !== id)
  saveBlockedDates(dates)
}

// Auth
export function validateAdmin(username: string, password: string): boolean {
  return username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password
}

export function isAdminLoggedIn(): boolean {
  if (typeof window === 'undefined') return false
  return sessionStorage.getItem('barber_admin_logged') === 'true'
}

export function loginAdmin(): void {
  if (typeof window === 'undefined') return
  sessionStorage.setItem('barber_admin_logged', 'true')
}

export function logoutAdmin(): void {
  if (typeof window === 'undefined') return
  sessionStorage.removeItem('barber_admin_logged')
}

// Time slots
export function generateTimeSlots(date: string, serviceDuration: number): { time: string; available: boolean }[] {
  const workingHours = getWorkingHours()
  const dateObj = new Date(date + 'T12:00:00')
  const dayOfWeek = dateObj.getDay()
  const dayHours = workingHours.find(h => h.dayOfWeek === dayOfWeek)
  
  if (!dayHours || !dayHours.isOpen) return []
  
  const blockedDates = getBlockedDates()
  if (blockedDates.some(b => b.date === date)) return []
  
  const appointments = getAppointmentsByDate(date)
  const services = getServices()
  const slots: { time: string; available: boolean }[] = []
  
  const [openHour, openMin] = dayHours.openTime.split(':').map(Number)
  const [closeHour, closeMin] = dayHours.closeTime.split(':').map(Number)
  
  let currentMinutes = openHour * 60 + openMin
  const closeMinutes = closeHour * 60 + closeMin
  
  while (currentMinutes + serviceDuration <= closeMinutes) {
    const hours = Math.floor(currentMinutes / 60)
    const mins = currentMinutes % 60
    const timeStr = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
    
    // Check if slot is available
    const slotStart = currentMinutes
    const slotEnd = currentMinutes + serviceDuration
    
    const isBooked = appointments.some(apt => {
      const [aptHour, aptMin] = apt.time.split(':').map(Number)
      const aptStart = aptHour * 60 + aptMin
      const aptService = services.find(s => s.id === apt.serviceId)
      const aptEnd = aptStart + (aptService?.duration || 30)
      
      return (slotStart < aptEnd && slotEnd > aptStart)
    })
    
    slots.push({ time: timeStr, available: !isBooked })
    currentMinutes += 30 // slots de 30 em 30 minutos
  }
  
  return slots
}
