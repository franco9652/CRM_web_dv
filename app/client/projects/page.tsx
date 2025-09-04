"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Building, Calendar, ChevronDown, ChevronUp, ExternalLink, Loader2, Search } from "lucide-react"
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible"
import { getWorks, getWorksByCustomerId } from "@/services/works"
import type { Work } from "@/services/works"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/components/ui/use-toast"
import { Customer, getCustomersByUserId } from "@/services/customers"
import ClientTour from "@/components/client/client-tour"

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
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [works, setWorks] = useState<Work[]>([])
  const [loadingWorks, setLoadingWorks] = useState(true)
  const [worksError, setWorksError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("Todos")
  const [expandedProjects, setExpandedProjects] = useState<string[]>([])
  const [loadingCustomers, setLoadingCustomers] = useState(true)
  const [customersError, setCustomersError] = useState("")
  // console.log('loading customers:', loadingCustomers)
  // console.log('customersError: ', customersError)

  const fetchWorks = async () => {
    if (!user?.role) {
      setWorksError("No se encontró el rol del usuario actual")
      return
    }
    setLoadingWorks(true)
    setWorksError("")
    try {
      let data: any = []
      if (user.role === "admin") {
        // Obtener todos los proyectos para admin
        const response = await getWorks()
        data = response.works
      } else if (user.role === "client" || user.role === "customer" || user.role === "employee") {
        // Obtener solo los proyectos del cliente o empleado
        if (!user._id) throw new Error("ID de cliente no válido")
        const response = await getWorksByCustomerId(user._id)
        data = response.works || []
      } else {
        throw new Error("Rol de usuario no soportado")
      }
      setWorks(data)
    } catch (err: any) {
      if(err?.status === 400){
        setWorksError(`"Error al cargar los proyectos. ID cliente erroneo"`)
      } else if (err?.status === 404){
        setWorksError("No se encontraron proyectos")
        setLoadingWorks(false)
      } else {
        setWorksError("Error al cargar los proyectos")
        setLoadingWorks(false)
      }
      toast({ title: "Error", description: err?.message || "No se pudieron cargar los trabajos", variant: "destructive" })
    } finally {
      setLoadingWorks(false)
    }
  }

  async function fetchData() {
    if (!user?.id) return
    setLoadingCustomers(true)
    try {
      const data = await getCustomersByUserId(user.id);
      setCustomers(data.customer);
    } catch (err: any) {
      setCustomersError(err.message ?? "Error al obtener customers");
      setLoadingCustomers(false);

    } finally {
      setLoadingCustomers(false);
    }
  }

  useEffect(() => {
    fetchData()
    // fetchWorks()
  }, [user?.id, user?.role])

  useEffect(() => {
    fetchWorks()
  }, [user?.id, user?.role, customers])

  useEffect(() => {
    // Asegurarse de que estamos en el cliente antes de manipular el estado
    if (typeof window !== "undefined") {
      // Inicializar con el primer proyecto expandido si no hay ninguno expandido
      if (expandedProjects.length === 0 && works.length > 0) {
        setExpandedProjects([works[0]._id])
      }
    }
  }, [works])

  // Filtrado local
  const filteredProjects = works?.filter((work: Work) => {
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

  const toggleProjectExpansion = (projectId: string) => {
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
    const roleLower = user?.role.toLowerCase()
    // console.log('user.role = ', user.role)
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
          {isAdmin ? "ADMIN" : user?.role.toLocaleUpperCase()} <span style={{fontWeight:400, fontSize:12}}>({user.role})</span>
        </span>
      </div>
    )
  }

  return (
    <div style={{ position: "relative" }}>
      <ClientTour />
      {renderUserRoleFlag()}
      <div id="projects-section" className="space-y-6 pb-6">
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
                  <SelectItem value="En progreso">En Progreso</SelectItem>
                  <SelectItem value="En Pausa">En Pausa</SelectItem>
                  <SelectItem value="Completado">Completado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-4">
              {
                loadingWorks && <div className="text-center py-8 flex justify-center items-center p-6">
                  <Loader2 className="animate-spin text-primary" size={24} />
                  <p className="px-6">Cargando trabajos...</p>
                </div>
              }
              {worksError && <div className="text-center py-6 text-red-500">{worksError}</div>}
              {filteredProjects?.map((work) => (
                <Collapsible
                  key={work._id}
                  open={expandedProjects.includes(work._id)}
                  className="border rounded-lg overflow-hidden"
                >
                  <div className="p-4 bg-card">
                    <div className="flex items-center gap-4">
                      <Building className="h-6 w-6 text-muted-foreground" />
                      <div>
                        <h3 className="font-semibold">{work.name}</h3>
                        <p className="text-sm text-muted-foreground">Cliente: {work.customerName}</p>
                      </div>
                      <div className="flex items-center gap-4 ml-auto">
                        <div className={`text-sm font-medium ${getStatusColor(work.statusWork ?? "")}`}>{work.statusWork ?? ""}</div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(work.endDate ?? "")}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0" asChild>
                            <a href={`/client/projects/${work._id}`}>
                              <ExternalLink className="h-4 w-4" />
                              <span className="sr-only">Ver proyecto</span>
                            </a>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => toggleProjectExpansion(work._id)}
                          >
                            {expandedProjects.includes(work._id) ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                            <span className="sr-only">Expandir</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <CollapsibleContent>
                    <div className="p-4 border-t bg-muted/30">
                      <div className="mb-4">
                        <h4 className="font-medium mb-2">Nombre del Proyecto</h4>
                        <p className="text-sm">{work.name ?? ""}</p>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              ))}
              {!worksError && !loadingWorks && filteredProjects?.length === 0 && (
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
