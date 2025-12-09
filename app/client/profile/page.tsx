"use client"

import { useEffect, useMemo, useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { getCustomersByUserId, type Customer } from "@/services/customers"
import { getWorksByCustomerId, type Work } from "@/services/works"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Loader2, Mail, MapPin, Phone, Briefcase } from "lucide-react"

export default function ClientProfilePage() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [works, setWorks] = useState<Work[]>([])

  const userId = user?._id || user?.id

  useEffect(() => {
    let mounted = true
    const loadData = async () => {
      if (!userId) return
      setIsLoading(true)
      setError(null)
      try {
        const customersRes = await getCustomersByUserId(userId)
        const firstCustomer = customersRes.customer?.[0] || null

        let worksRes: Work[] = []
        if (firstCustomer?._id) {
          try {
            const worksByCustomer = await getWorksByCustomerId(firstCustomer._id)
            worksRes = worksByCustomer?.works || []
          } catch (workErr: any) {
            if (
              workErr.response?.status === 404 &&
              (workErr.response?.data?.message === "No works found for this customer" ||
                workErr.response?.data?.message === "No works found")
            ) {
              worksRes = []
            } else {
              throw workErr
            }
          }
        }

        if (!mounted) return
        setCustomer(firstCustomer)
        setWorks(worksRes)
      } catch (err: any) {
        if (!mounted) return
        const message = err?.message || "Error al cargar el perfil"
        setError(message)
      } finally {
        if (mounted) setIsLoading(false)
      }
    }
    loadData()
    return () => {
      mounted = false
    }
  }, [userId])

  const worksInProgress = useMemo(
    () => works.filter((w) => (w.statusWork || "").toLowerCase().includes("progreso")),
    [works]
  )

  if (!userId) {
    return (
      <div className="flex items-center justify-center h-[50vh] text-muted-foreground">
        Debes iniciar sesión para ver tu perfil.
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh] gap-3 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" /> Cargando perfil...
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[50vh] text-red-500">
        {error}
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <Card className="md:col-span-1">
        <CardHeader>
          <CardTitle className="text-xl">Perfil de Cliente</CardTitle>
          <CardDescription>Información básica de la empresa</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <div className="text-sm text-muted-foreground">ubicación</div>
            <div className="font-medium">{customer?.workDirection}</div>
          </div>
          <Separator />
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{customer?.email || user?.email || "Sin correo"}</span>
          </div>
          {(customer?.phone || customer?.contactNumber) && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{customer?.phone || customer?.contactNumber}</span>
            </div>
          )}
          {customer?.address && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{customer.address}</span>
            </div>
          )}
          {customer?.cuit && (
            <div className="text-sm text-muted-foreground">CUIT: {customer.cuit}</div>
          )}
          {customer?.dni && (
            <div className="text-sm text-muted-foreground">DNI: {customer.dni}</div>
          )}
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Briefcase className="h-5 w-5" /> Proyectos asociados
          </CardTitle>
          <CardDescription>
            {works.length === 0 ? "Aún no hay proyectos asociados" : `${works.length} proyecto(s) encontrado(s)`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {works.length === 0 ? (
            <div className="text-sm text-muted-foreground">No hay trabajos para mostrar.</div>
          ) : (
            <div className="grid gap-4">
              {works.map((w) => (
                <div key={w._id} className="rounded-lg border p-3">
                  <div className="font-medium">{w.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {w.projectType || "Proyecto"} • {w.statusWork || "Sin estado"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {w.address || "Sin dirección"}
                  </div>
                </div>
              ))}
            </div>
          )}
          {worksInProgress.length > 0 && (
            <div className="mt-6">
              <div className="text-sm font-medium mb-2">En progreso</div>
              <div className="flex flex-col gap-2">
                {worksInProgress.slice(0, 3).map((w) => (
                  <div key={w._id} className="text-sm text-muted-foreground">
                    • {w.name} — {w.statusWork}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}


