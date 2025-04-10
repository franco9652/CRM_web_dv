"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Building, Calendar, CheckCircle2, ChevronDown, ChevronUp, ExternalLink, Search } from "lucide-react"
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible"

// Datos de proyectos de ejemplo
const projects = [
  {
    id: 1,
    name: "Torre Skyline",
    location: "Centro, Ciudad Metro",
    startDate: "2023-01-15",
    endDate: "2024-06-30",
    budget: "$4.2M",
    progress: 75,
    status: "En Progreso",
    description:
      "Edificio residencial de lujo de 25 pisos con 100 apartamentos, áreas comunes y estacionamiento subterráneo.",
    milestones: [
      { id: 1, date: "2023-01-20", description: "Inicio de excavación", completed: true },
      { id: 2, date: "2023-03-15", description: "Cimentación completada", completed: true },
      { id: 3, date: "2023-06-10", description: "Estructura hasta el piso 15 completada", completed: true },
      { id: 4, date: "2023-09-05", description: "Instalación de loza radiante en pisos 1-10", completed: true },
      { id: 5, date: "2023-12-20", description: "Fachada exterior completada", completed: true },
      { id: 6, date: "2024-02-15", description: "Instalaciones eléctricas completadas", completed: false },
      { id: 7, date: "2024-04-10", description: "Acabados interiores", completed: false },
    ],
  },
  {
    id: 2,
    name: "Complejo Riverside",
    location: "Distrito Riverside, Ciudad Metro",
    startDate: "2023-03-10",
    endDate: "2024-09-15",
    budget: "$3.8M",
    progress: 45,
    status: "En Progreso",
    description: "Desarrollo de uso mixto con oficinas, locales comerciales y apartamentos con vista al río.",
    milestones: [
      { id: 1, date: "2023-03-20", description: "Inicio de excavación", completed: true },
      { id: 2, date: "2023-05-15", description: "Cimentación completada", completed: true },
      { id: 3, date: "2023-08-10", description: "Estructura del edificio A completada", completed: true },
      { id: 4, date: "2023-11-25", description: "Instalación de sistemas hidráulicos", completed: false },
      { id: 5, date: "2024-02-15", description: "Fachada exterior", completed: false },
    ],
  },
  {
    id: 3,
    name: "Parque Oficinas Metro",
    location: "Distrito Empresarial, Ciudad Metro",
    startDate: "2023-05-22",
    endDate: "2024-04-10",
    budget: "$2.5M",
    progress: 90,
    status: "En Progreso",
    description: "Complejo de oficinas corporativas con certificación LEED, espacios verdes y estacionamiento.",
    milestones: [
      { id: 1, date: "2023-05-30", description: "Inicio de excavación", completed: true },
      { id: 2, date: "2023-07-15", description: "Cimentación completada", completed: true },
      { id: 3, date: "2023-09-10", description: "Estructura completada", completed: true },
      {
        id: 4,
        date: "2023-11-05",
        description: "Instalación de sistemas eléctricos y de climatización",
        completed: true,
      },
      { id: 5, date: "2023-12-20", description: "Fachada exterior completada", completed: true },
      { id: 6, date: "2024-02-15", description: "Acabados interiores completados", completed: true },
      { id: 7, date: "2024-03-10", description: "Instalación de mobiliario", completed: false },
    ],
  },
]

export default function ClientProjectsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("Todos")
  const [expandedProjects, setExpandedProjects] = useState<number[]>([])

  useEffect(() => {
    // Asegurarse de que estamos en el cliente antes de manipular el estado
    if (typeof window !== "undefined") {
      // Inicializar con el primer proyecto expandido si no hay ninguno expandido
      if (expandedProjects.length === 0 && projects.length > 0) {
        setExpandedProjects([projects[0].id])
      }
    }
  }, [])

  const filteredProjects = projects.filter(
    (project) =>
      (project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.location.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (statusFilter === "Todos" || project.status === statusFilter),
  )

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

  // Reemplazar la función toggleProjectExpansion con esta implementación más directa
  const toggleProjectExpansion = (projectId: number) => {
    setExpandedProjects((prev) => {
      if (prev.includes(projectId)) {
        return prev.filter((id) => id !== projectId)
      } else {
        return [...prev, projectId]
      }
    })
  }

  return (
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
            {filteredProjects.map((project) => (
              <Collapsible
                key={project.id}
                open={expandedProjects.includes(project.id)}
                className="border rounded-lg overflow-hidden"
              >
                <div className="p-4 bg-card">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Building className="h-5 w-5 text-muted-foreground" />
                      <h3 className="text-lg font-semibold">{project.name}</h3>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(project.status)}`}
                      >
                        {project.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => toggleProjectExpansion(project.id)}
                      >
                        {expandedProjects.includes(project.id) ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                        <span className="sr-only">Mostrar detalles</span>
                      </Button>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0" asChild>
                        <a href={`/client/projects/${project.id}`}>
                          <ExternalLink className="h-4 w-4" />
                          <span className="sr-only">Ver proyecto</span>
                        </a>
                      </Button>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="flex flex-col md:flex-row justify-between text-sm text-muted-foreground mb-2">
                      <div>{project.location}</div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(project.startDate)}</span>
                        <span className="mx-1">-</span>
                        <span>{formatDate(project.endDate)}</span>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {project.milestones.filter((m) => m.completed).length} de {project.milestones.length} hitos
                      completados
                    </div>
                  </div>
                </div>
                <CollapsibleContent>
                  <div className="p-4 border-t bg-muted/30">
                    <div className="mb-4">
                      <h4 className="font-medium mb-2">Descripción del Proyecto</h4>
                      <p className="text-sm text-muted-foreground">{project.description}</p>
                    </div>

                    <h4 className="font-medium mb-3">Hitos del Proyecto</h4>
                    <div className="space-y-3">
                      {project.milestones.map((milestone) => (
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
    </div>
  )
}

