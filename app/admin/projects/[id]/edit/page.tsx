"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, Loader2 } from "lucide-react"
import { getWorkById, updateWork, Work, UpdateWorkInput } from "@/services/works"
import { useToast } from "@/hooks/use-toast"

export default function ProjectEditPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { toast } = useToast()
  const [project, setProject] = useState<Work | null>(null)
  const [formData, setFormData] = useState<UpdateWorkInput>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (params.id) {
      setLoading(true)
      getWorkById(params.id)
        .then((data) => {
          if (data) {
            setProject(data)
            setFormData({
              name: data.name,
              address: data.address,
              startDate: data.startDate ? new Date(data.startDate).toISOString().split('T')[0] : '',
              endDate: data.endDate ? new Date(data.endDate).toISOString().split('T')[0] : '',
              budget: data.budget,
              statusWork: data.statusWork,
              customerName: data.customerName,
              projectType: data.projectType,
            })
          } else {
            setError("Proyecto no encontrado")
          }
        })
        .catch(() => {
          setError("Error al cargar el proyecto")
        })
        .finally(() => {
          setLoading(false)
        })
    }
  }, [params.id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (project?._id) {
        await updateWork(project._id, formData)
        toast({
          title: "Proyecto actualizado",
          description: "Los cambios se han guardado correctamente.",
        })
        router.push(`/admin/projects/${project._id}`)
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "No se pudieron guardar los cambios.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center">
        <p className="text-red-500">{error}</p>
        <Button onClick={() => router.back()} className="mt-4">
          <ChevronLeft className="mr-2 h-4 w-4" /> Volver
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Editar Proyecto: {project?.name}</h1>
      </div>
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Información del Proyecto</CardTitle>
            <CardDescription>Modifica los detalles del proyecto.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre del Proyecto</Label>
                <Input id="name" name="name" value={formData.name || ""} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerName">Nombre del Cliente</Label>
                <Input id="customerName" name="customerName" value={formData.customerName || ""} onChange={handleChange} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Dirección</Label>
              <Textarea id="address" name="address" value={formData.address || ""} onChange={handleChange} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Fecha de Inicio</Label>
                <Input id="startDate" name="startDate" type="date" value={formData.startDate || ""} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">Fecha de Finalización</Label>
                <Input id="endDate" name="endDate" type="date" value={formData.endDate || ""} onChange={handleChange} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="space-y-2">
                <Label htmlFor="budget">Presupuesto</Label>
                <Input id="budget" name="budget" type="number" value={formData.budget || ""} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="statusWork">Estado</Label>
                <Select name="statusWork" value={formData.statusWork || ""} onValueChange={(value) => handleSelectChange("statusWork", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="activo">Activo</SelectItem>
                    <SelectItem value="En progreso">En progreso</SelectItem>
                    <SelectItem value="completado">Completado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
             <div className="space-y-2">
                <Label htmlFor="projectType">Tipo de Proyecto</Label>
                <Input id="projectType" name="projectType" value={formData.projectType || ""} onChange={handleChange} />
              </div>
          </CardContent>
        </Card>
        <div className="flex justify-end mt-6">
          <Button type="submit" disabled={saving}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Guardar Cambios
          </Button>
        </div>
      </form>
    </div>
  )
}
