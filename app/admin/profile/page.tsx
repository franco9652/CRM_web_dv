"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Loader2, Mail, User, Building, Briefcase, Calendar } from "lucide-react"
import { getAllCustomers } from "@/services/customers"
import { getAllWorks } from "@/services/works"
import type { Customer } from "@/services/customers"
import type { Work } from "@/services/works"

export default function AdminProfilePage() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalWorks: 0,
    activeWorks: 0,
    recentCustomers: [] as Customer[],
    recentWorks: [] as Work[]
  })

  useEffect(() => {
    let mounted = true
    const loadData = async () => {
      if (!user) return
      setIsLoading(true)
      setError(null)
      
      try {
        // Cargar estadísticas generales del sistema
        const [customersRes, worksRes] = await Promise.all([
          getAllCustomers(),
          getAllWorks()
        ])

        if (!mounted) return

        const activeWorks = worksRes.filter(w => 
          (w.statusWork || "").toLowerCase().includes("progreso") || 
          (w.statusWork || "").toLowerCase().includes("activo")
        )

        setStats({
          totalCustomers: customersRes.length,
          totalWorks: worksRes.length,
          activeWorks: activeWorks.length,
          recentCustomers: customersRes.slice(0, 5),
          recentWorks: worksRes.slice(0, 5)
        })
      } catch (err: any) {
        if (!mounted) return
        const message = err?.message || "Error al cargar los datos del perfil"
        setError(message)
      } finally {
        if (mounted) setIsLoading(false)
      }
    }
    
    loadData()
    return () => {
      mounted = false
    }
  }, [user])

  if (!user) {
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mi Perfil</h1>
        <p className="text-muted-foreground">Información personal y estadísticas del sistema</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Información Personal */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <User className="h-5 w-5" /> Información Personal
            </CardTitle>
            <CardDescription>Datos de tu cuenta de administrador</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="text-sm text-muted-foreground">Nombre completo</div>
              <div className="font-medium">{user.name}</div>
            </div>
            <Separator />
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{user.email}</span>
            </div>
            {user.position && (
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{user.position}</span>
              </div>
            )}
            {user.department && (
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{user.department}</span>
              </div>
            )}
            <div className="text-sm text-muted-foreground">
              Rol: <span className="font-medium capitalize">{user.role}</span>
            </div>
          </CardContent>
        </Card>

        {/* Estadísticas del Sistema */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Calendar className="h-5 w-5" /> Estadísticas del Sistema
            </CardTitle>
            <CardDescription>Resumen general de la plataforma</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center p-4 rounded-lg border">
                <div className="text-2xl font-bold text-primary">{stats.totalCustomers}</div>
                <div className="text-sm text-muted-foreground">Clientes Totales</div>
              </div>
              <div className="text-center p-4 rounded-lg border">
                <div className="text-2xl font-bold text-primary">{stats.totalWorks}</div>
                <div className="text-sm text-muted-foreground">Proyectos Totales</div>
              </div>
              <div className="text-center p-4 rounded-lg border">
                <div className="text-2xl font-bold text-green-600">{stats.activeWorks}</div>
                <div className="text-sm text-muted-foreground">Proyectos Activos</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Clientes Recientes */}
      <Card>
        <CardHeader>
          <CardTitle>Clientes Recientes</CardTitle>
          <CardDescription>Últimos clientes registrados en el sistema</CardDescription>
        </CardHeader>
        <CardContent>
          {stats.recentCustomers.length === 0 ? (
            <div className="text-sm text-muted-foreground">No hay clientes registrados.</div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {stats.recentCustomers.map((customer) => (
                <div key={customer._id} className="rounded-lg border p-3">
                  <div className="font-medium">{customer.name}</div>
                  <div className="text-sm text-muted-foreground">{customer.email}</div>
                  {customer.phone && (
                    <div className="text-xs text-muted-foreground">{customer.phone}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Proyectos Recientes */}
      <Card>
        <CardHeader>
          <CardTitle>Proyectos Recientes</CardTitle>
          <CardDescription>Últimos proyectos creados en el sistema</CardDescription>
        </CardHeader>
        <CardContent>
          {stats.recentWorks.length === 0 ? (
            <div className="text-sm text-muted-foreground">No hay proyectos registrados.</div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {stats.recentWorks.map((work) => (
                <div key={work._id} className="rounded-lg border p-3">
                  <div className="font-medium">{work.name}</div>
                  <div className="text-sm text-muted-foreground">{work.customerName}</div>
                  <div className="text-xs text-muted-foreground">
                    {work.projectType || "Proyecto"} • {work.statusWork || "Sin estado"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
