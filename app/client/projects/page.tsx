"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Building, Calendar, CheckCircle2, ChevronDown, ChevronUp, ExternalLink, Search } from "lucide-react"
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible"
import { getWorks, getWorksByCustomerId } from "@/services/works"
import type { Work } from "@/services/works"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/components/ui/use-toast"

// Define el tipo Milestone localmente
interface Milestone {
  id: number;
  date: string;
  description: string;
  completed: boolean;
}

export default function ClientProjectsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [works, setWorks] = useState<Work[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("Todos")
  const [expandedProjects, setExpandedProjects] = useState<number[]>([])

  const fetchWorks = async () => {
    if (!user?.role) {
      setError("No se encontró el rol del usuario actual")
      return
    }
    setLoading(true)
    setError("")
    try {
      let data: Work[] = []
      if (user.role === "admin") {
        // Obtener todos los proyectos para admin
        const response = await getWorks(1)
        data = response.works
      } else if (user.role === "client" || user.role === "customer" || user.role === "employee") {
        // Obtener solo los proyectos del cliente o empleado
        if (!user.id) throw new Error("ID de cliente no válido")
        const worksResult = await getWorksByCustomerId(user.id)
        data = worksResult as Work[]
      } else {
        throw new Error("Rol de usuario no soportado")
      }
      setWorks(data)
    } catch (err: any) {
      setError("Error al cargar los trabajos")
      toast({ title: "Error", description: err?.message || "No se pudieron cargar los trabajos", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWorks()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, user?.role])

  useEffect(() => {
    // Asegurarse de que estamos en el cliente antes de manipular el estado
    if (typeof window !== "undefined") {
      // Inicializar con el primer proyecto expandido si no hay ninguno expandido
      if (expandedProjects.length === 0 && works.length > 0) {
        setExpandedProjects([works[0].id])
      }
    }
  }, [works])

  // Filtrado local
  const filteredProjects = works.filter((work: Work) => {
    const matchesSearch = (work.projectName ?? "").toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "Todos" || work.statusWork === statusFilter
    return matchesSearch && matchesStatus
  })

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Planificación":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "En Progreso":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300"
      case "Completado":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "En Pausa":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  const toggleProjectExpansion = (projectId: number) => {
    setExpandedProjects((prev) => {
      if (prev.includes(projectId)) {
        return prev.filter((id) => id !== projectId)
      } else {
        return [...prev, projectId]
      }
    })
  }

  // Flag visual del rol del usuario
  const renderUserRoleFlag = () => {
    if (!user?.role) return null
    const roleLower = user.role.toLowerCase()
    const isAdmin = roleLower === "admin"
    return (
      <div style={{ position: "absolute", top: 16, right: 16, zIndex: 1000 }}>
        <span style={{
          background: isAdmin ? "#0070f3" : "#22c55e",
          color: "white",
          padding: "4px 12px",
          borderRadius: 8,
          fontWeight: 600,
          fontSize: 14,
          boxShadow: "0 2px 6px rgba(0,0,0,0.08)"
        }}>
          {isAdmin ? "ADMIN" : "CUSTOMER"} <span style={{fontWeight:400, fontSize:12}}>({user.role})</span>
        </span>
      </div>
    )
  }

  return (
    <div style={{ position: "relative" }}>
      {renderUserRoleFlag()}
      <div className="space-y-6 pb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Mis Proyectos</h1>
            <p className="text-muted-foreground">Visualiza y gestiona todos tus proyectos de construcción.</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Proyectos Activos</CardTitle>
            <CardDescription>Información detallada de todos tus proyectos de construcción actuales.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar proyectos..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todos">Todos los Estados</SelectItem>
                  <SelectItem value="Planificación">Planificación</SelectItem>
                  <SelectItem value="En Progreso">En Progreso</SelectItem>
                  <SelectItem value="En Pausa">En Pausa</SelectItem>
                  <SelectItem value="Completado">Completado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-4">
              {loading && <div className="text-center py-6">Cargando trabajos...</div>}
              {error && <div className="text-center py-6 text-red-500">{error}</div>}
              {filteredProjects.map((work) => (
                <Collapsible
                  key={work.id}
                  open={expandedProjects.includes(work.id)}
                  className="border rounded-lg overflow-hidden"
                >
                  <div className="p-4 bg-card">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Building className="h-5 w-5 text-muted-foreground" />
                        <h3 className="text-lg font-semibold">{work.projectName ?? ""}</h3>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(work.statusWork ?? "")}`}
                        >
                          {work.statusWork ?? ""}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => toggleProjectExpansion(work.id)}
                        >
                          {expandedProjects.includes(work.id) ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                          <span className="sr-only">Mostrar detalles</span>
                        </Button>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0" asChild>
                          <a href={`/client/projects/${work.id}`}>
                            <ExternalLink className="h-4 w-4" />
                            <span className="sr-only">Ver proyecto</span>
                          </a>
                        </Button>
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="flex flex-col md:flex-row justify-between text-sm text-muted-foreground mb-2">
                        <div>{work.address}</div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(work.startDate ?? "")}</span>
                          <span className="mx-1">-</span>
                          <span>{formatDate(work.endDate ?? "")}</span>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {work.milestones.filter((m: Milestone) => m.completed).length} de {work.milestones.length} hitos
                        completados
                      </div>
                    </div>
                  </div>
                  <CollapsibleContent>
                    <div className="p-4 border-t bg-muted/30">
                      <div className="mb-4">
                        <h4 className="font-medium mb-2">Descripción del Proyecto</h4>
                        <p className="text-sm text-muted-foreground">{work.description ?? ""}</p>
                      </div>

                      <h4 className="font-medium mb-3">Hitos del Proyecto</h4>
                      <div className="space-y-3">
                        {work.milestones && work.milestones.map((milestone: Milestone) => (
                          <div key={milestone.id} className="flex items-start gap-3">
                            <div className={`mt-0.5 ${milestone.completed ? "text-green-500" : "text-muted-foreground"}`}>
                              <CheckCircle2 className="h-4 w-4" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm">{milestone.description}</span>
                                {milestone.completed && (
                                  <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 px-2 py-0.5 rounded-full">
                                    Completado
                                  </span>
                                )}
                              </div>
                              <span className="text-xs text-muted-foreground">{formatDate(milestone.date)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              ))}
              {filteredProjects.length === 0 && (
                <div className="text-center py-6 text-muted-foreground border rounded-lg">
                  No se encontraron proyectos. Intenta ajustar tu búsqueda.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        <Button onClick={fetchWorks} variant="outline" size="sm" className="mb-4">Recargar</Button>
      </div>
    </div>
  )
}
