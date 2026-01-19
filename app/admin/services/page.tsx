'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getServices, addService, updateService, deleteService } from '@/lib/store'
import type { Service } from '@/lib/types'
import { Plus, Pencil, Trash2, X, Package } from 'lucide-react'

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [isEditing, setIsEditing] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [formData, setFormData] = useState({ name: '', duration: 30, price: 0 })

  const loadServices = () => {
    setServices(getServices())
  }

  useEffect(() => {
    loadServices()
  }, [])

  const handleAdd = () => {
    if (!formData.name) return
    addService(formData)
    setFormData({ name: '', duration: 30, price: 0 })
    setIsAdding(false)
    loadServices()
  }

  const handleUpdate = (id: string) => {
    updateService(id, formData)
    setIsEditing(null)
    setFormData({ name: '', duration: 30, price: 0 })
    loadServices()
  }

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este serviço?')) {
      deleteService(id)
      loadServices()
    }
  }

  const startEdit = (service: Service) => {
    setIsEditing(service.id)
    setFormData({ name: service.name, duration: service.duration, price: service.price })
    setIsAdding(false)
  }

  const cancelEdit = () => {
    setIsEditing(null)
    setIsAdding(false)
    setFormData({ name: '', duration: 30, price: 0 })
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-2xl font-bold text-foreground">Serviços</h1>
          <p className="text-muted-foreground">Gerencie os serviços oferecidos</p>
        </div>
        <Button onClick={() => { setIsAdding(true); setIsEditing(null) }} disabled={isAdding}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Serviço
        </Button>
      </div>

      {/* Add Form */}
      {isAdding && (
        <div className="bg-card rounded-lg border border-border p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-foreground">Novo Serviço</h3>
            <button onClick={cancelEdit} className="text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="name">Nome do Serviço</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Corte de Cabelo"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="duration">Duração (min)</Label>
              <Input
                id="duration"
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="price">Preço (R$)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                className="mt-1"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button onClick={handleAdd}>Adicionar</Button>
            <Button variant="outline" onClick={cancelEdit}>Cancelar</Button>
          </div>
        </div>
      )}

      {/* Services List */}
      {services.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Nenhum serviço cadastrado</p>
        </div>
      ) : (
        <div className="space-y-3">
          {services.map(service => (
            <div key={service.id} className="bg-card rounded-lg border border-border p-4">
              {isEditing === service.id ? (
                <div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-2">
                      <Label>Nome do Serviço</Label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Duração (min)</Label>
                      <Input
                        type="number"
                        value={formData.duration}
                        onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Preço (R$)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button onClick={() => handleUpdate(service.id)}>Salvar</Button>
                    <Button variant="outline" onClick={cancelEdit}>Cancelar</Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div>
                      <h3 className="font-medium text-foreground">{service.name}</h3>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {service.duration} min
                    </div>
                    <div className="text-sm font-medium text-primary">
                      R$ {service.price.toFixed(2)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => startEdit(service)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleDelete(service.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
