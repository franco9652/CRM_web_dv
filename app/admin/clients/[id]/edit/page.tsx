"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, Loader2, Save, User, Mail, Phone, MapPin, IdCard, X, Trash2 } from "lucide-react"
import { getCustomersByUserId, updateCustomer, deleteCustomer, Customer } from "@/services/customers"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth-provider"

export default function EditClientPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canDeleteClients = user?.role === "admin"

  const [customerId, setCustomerId] = useState<string>("")
  const [formData, setFormData] = useState<Partial<Customer>>({
    name: "",
    secondName: "",
    dni: "",
    cuit: "",
    cuil: "",
    address: "",
    workDirection: "",
    contactNumber: "",
    email: "",
    active: true,
  })

  useEffect(() => {
    if (params.id) {
      setLoading(true)
      getCustomersByUserId(params.id)
        .then((response) => {
          const currentClient = response.customer && response.customer.length > 0 ? response.customer[0] : null;
          if (currentClient) {
            setCustomerId(currentClient._id || "")
            setFormData({
              name: currentClient.name || "",
              secondName: currentClient.secondName || "",
              dni: currentClient.dni || "",
              cuit: currentClient.cuit || "",
              cuil: currentClient.cuil || "",
              address: currentClient.address || "",
              workDirection: currentClient.workDirection || "",
              contactNumber: currentClient.contactNumber || "",
              email: currentClient.email || "",
              active: currentClient.active ?? true,
            })
          } else {
            setError("Cliente no encontrado")
          }
          setLoading(false)
        })
        .catch((err) => {
          console.error("Error loading client:", err)
          setError("Error al cargar el cliente")
          setLoading(false)
        })
    }
  }, [params.id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!params.id) return

    setSaving(true)
    try {
      if (!customerId) throw new Error("ID de cliente no válido");
      await updateCustomer(customerId, formData)

      try {
        const verifyRes = await getCustomersByUserId(params.id)
        const updatedClient =
          verifyRes?.customer?.find((c) => c?._id === customerId) || verifyRes?.customer?.[0] || null

        const desiredWorkDirection = (formData.workDirection || "").toString().trim()
        const savedWorkDirection = (updatedClient?.workDirection || "").toString().trim()

        if (desiredWorkDirection && desiredWorkDirection !== savedWorkDirection) {
          toast({
            title: "Actualizado parcialmente",
            description: "Se guardó sin errores, pero el cambio en 'Dirección Laboral' no se reflejó al recargar. Revisar backend/endpoint updateCustomer.",
            variant: "destructive",
          })
          return
        }
      } catch {
        // ignore
      }

      toast({
        title: "Cliente actualizado",
        description: "Los datos del cliente se han actualizado correctamente."
      })
      router.push(`/admin/clients/${params.id}`)
      router.refresh()
    } catch (err: any) {
      console.error("Error updating client:", err)
      toast({
        title: "Error",
        description: err?.message || "No se pudo actualizar el cliente",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!customerId) return

    if (!canDeleteClients) {
      toast({
        title: "Acción no permitida",
        description: "No tienes permisos para eliminar clientes.",
        variant: "destructive",
      })
      setShowDeleteDialog(false)
      return
    }

    setDeleting(true)
    try {
      await deleteCustomer(customerId)
      toast({
        title: "Cliente eliminado",
        description: "El cliente se ha eliminado correctamente."
      })
      router.push('/admin/clients')
    } catch (err: any) {
      console.error("Error deleting client:", err)
      toast({
        title: "Error",
        description: err?.message || "No se pudo eliminar el cliente",
        variant: "destructive"
      })
    } finally {
      setDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <X className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="mt-2 text-sm text-red-700">{error}</p>
              <div className="mt-4">
                <Button variant="outline" onClick={() => router.back()}>
                  <ChevronLeft className="mr-2 h-4 w-4" /> Volver
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Editar Cliente</h1>
          <p className="text-muted-foreground">
            Actualiza la información del cliente
          </p>
        </div>
        <Button variant="outline" onClick={() => router.back()}>
          <ChevronLeft className="mr-2 h-4 w-4" /> Volver
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Información Personal</CardTitle>
            <CardDescription>
              Información básica del cliente
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Nombre del cliente"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="secondName">Apellido</Label>
                <Input
                  id="secondName"
                  name="secondName"
                  value={formData.secondName}
                  onChange={handleChange}
                  placeholder="Apellido del cliente"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dni">DNI</Label>
                <Input
                  id="dni"
                  name="dni"
                  value={formData.dni}
                  onChange={handleChange}
                  placeholder="Número de documento"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cuit">CUIT</Label>
                <Input
                  id="cuit"
                  name="cuit"
                  value={formData.cuit}
                  onChange={handleChange}
                  placeholder="CUIT"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cuil">CUIL</Label>
                <Input
                  id="cuil"
                  name="cuil"
                  value={formData.cuil}
                  onChange={handleChange}
                  placeholder="CUIL"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Información de Contacto</CardTitle>
            <CardDescription>
              Detalles de cómo contactar al cliente
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="correo@ejemplo.com"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactNumber">Teléfono de Contacto</Label>
                <Input
                  id="contactNumber"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  placeholder="+54 9 11 1234-5678"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Dirección Particular</Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Dirección particular"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="workDirection">Dirección Laboral</Label>
              <Input
                id="workDirection"
                name="workDirection"
                value={formData.workDirection}
                onChange={handleChange}
                placeholder="Dirección laboral"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Estado</CardTitle>
            <CardDescription>
              Configuración del estado del cliente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="active"
                name="active"
                checked={formData.active ?? false}
                onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="active" className="text-sm font-medium text-gray-700">
                Activo
              </label>
            </div>

          </CardContent>
        </Card>

        <div className="flex justify-between">
          {canDeleteClients ? (
            <Button
              type="button"
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
              disabled={saving || deleting}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar Cliente
            </Button>
          ) : (
            <div />
          )}
          <div className="flex space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={saving || deleting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={saving || deleting}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Guardar Cambios
                </>
              )}
            </Button>
          </div>
        </div>
      </form>

      {/* Diálogo de confirmación de eliminación */}
      {canDeleteClients && showDeleteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-2">¿Eliminar cliente?</h3>
            <p className="text-gray-600 mb-6">
              Esta acción no se puede deshacer. Se eliminará permanentemente el cliente y toda su información asociada.
            </p>
            <div className="flex justify-end space-x-4">
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(false)}
                disabled={deleting}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Eliminando...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Eliminar
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
