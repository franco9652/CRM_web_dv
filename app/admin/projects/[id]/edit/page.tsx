"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { ChevronLeft, Loader2, User, Mail, Trash2 } from "lucide-react"
import { getWorkById, updateWork, deleteWork, Work, UpdateWorkInput } from "@/services/works"
import { getCustomers } from "@/services/customers"
import { useToast } from "@/hooks/use-toast"

export default function ProjectEditPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { toast } = useToast()
  const [project, setProject] = useState<Work | null>(null)
  const [formData, setFormData] = useState<UpdateWorkInput>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [customers, setCustomers] = useState<Array<{_id: string, name: string, email: string}>>([])
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false)

  // Fetch customers
  useEffect(() => {
    const fetchCustomers = async () => {
      setIsLoadingCustomers(true);
      try {
        const response = await getCustomers();
        // Assuming getCustomers returns an array of customers with _id, name, and email
        setCustomers(Array.isArray(response) ? response : response.customers || []);
      } catch (err) {
        console.error('Error loading customers:', err);
        toast({
          title: "Error",
          description: "No se pudieron cargar los clientes",
          variant: "destructive",
        });
      } finally {
        setIsLoadingCustomers(false);
      }
    };

    fetchCustomers();
  }, [toast]);

  // Fetch project data
  useEffect(() => {
    if (params.id) {
      setLoading(true)
      getWorkById(params.id)
        .then((data) => {
          if (data) {
            setProject(data.work)
            setFormData({
              name: data.work.name || '',
              address: data.work.address || '',
              startDate: data.work.startDate ? new Date(data.work.startDate).toISOString().split('T')[0] : '',
              endDate: data.work.endDate ? new Date(data.work.endDate).toISOString().split('T')[0] : '',
              budget: data.work.budget || 0,
              statusWork: data.work.statusWork || 'activo',
              customerName: data.work.customerName || '',
              projectType: data.work.projectType || '',
              email: data.work.email || '',
              emailCustomer: data.work.emailCustomer || '',
              number: data.work.number || '',
              workUbication: data.work.workUbication || ''
            })
          } else {
            setError("Proyecto no encontrado")
          }
        })
        .catch((error) => {
          console.error('Error loading project:', error)
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

  const handleDelete = async () => {
    if (!project?._id || !project.ID) return
    
    setDeleting(true)
    try {
      await deleteWork(project.ID)
      toast({
        title: "Proyecto eliminado",
        description: "El proyecto ha sido eliminado correctamente.",
      })
      router.push('/admin/projects')
    } catch (err) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el proyecto.",
        variant: "destructive",
      })
    } finally {
      setDeleting(false)
    }
  }

  if (loading || isLoadingCustomers) {
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
                <Label>Cliente</Label>
                <Select 
                  value={formData.customerName}
                  onValueChange={(value) => {
                    const selectedCustomer = customers.find(c => c.name === value);
                    setFormData(prev => ({
                      ...prev,
                      customerName: value,
                      emailCustomer: selectedCustomer?.email || ''
                    }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer._id} value={customer.name}>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>{customer.name}</span>
                          {customer.email && (
                            <span className="text-muted-foreground text-xs flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {customer.email}
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="emailCustomer">Email del Cliente</Label>
                <Input 
                  id="emailCustomer" 
                  name="emailCustomer" 
                  type="email" 
                  value={formData.emailCustomer || ""} 
                  onChange={handleChange} 
                  placeholder="Email del cliente"
                />
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
                <Select 
                  value={formData.projectType || ""} 
                  onValueChange={(value) => handleSelectChange("projectType", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo de proyecto" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="residencial">Residencial</SelectItem>
                    <SelectItem value="comercial">Comercial</SelectItem>
                    <SelectItem value="industrial">Industrial</SelectItem>
                    <SelectItem value="Construcción">Construcción</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" value={formData.email || ""} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emailCustomer">Email del Cliente</Label>
                <Input id="emailCustomer" name="emailCustomer" type="email" value={formData.emailCustomer || ""} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="number">Número</Label>
                <Input id="number" name="number" value={formData.number || ""} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="workUbication">Ubicación del Trabajo</Label>
                <Input id="workUbication" name="workUbication" value={formData.workUbication || ""} onChange={handleChange} />
              </div>
          </CardContent>
        </Card>
        <div className="flex justify-between mt-6">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={deleting || saving}>
                {deleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                Eliminar Proyecto
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción no se puede deshacer. Se eliminará permanentemente el proyecto "{project?.name}" y todos sus datos asociados.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  disabled={deleting}
                >
                  {deleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Eliminar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          
          <Button type="submit" disabled={saving || deleting}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Guardar Cambios
          </Button>
        </div>
      </form>
    </div>
  )
}
