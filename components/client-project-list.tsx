"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Building, Calendar, CheckCircle2, ChevronDown, ChevronUp, ExternalLink } from "lucide-react"
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible"

// Datos de proyectos de ejemplo con hitos
const projects = [
  {
    id: 1,
    name: "Torre Skyline",
    location: "Centro, Ciudad Metro",
    startDate: "2023-01-15",
    endDate: "2024-06-30",
    budget: "$4.2M",
    spent: "$2.7M",
    budgetStatus: "Bajo Presupuesto",
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
    nextMilestones: [
      { id: 1, date: "2024-02-15", description: "Instalaciones eléctricas completadas" },
      { id: 2, date: "2024-04-10", description: "Acabados interiores" },
    ],
    team: [
      { name: "Juan Pérez", role: "Director de Proyecto", contact: "juan@acme.com" },
      { name: "María López", role: "Arquitecta", contact: "maria@acme.com" },
      { name: "Carlos Rodríguez", role: "Ingeniero Estructural", contact: "carlos@acme.com" },
    ],
  },
  {
    id: 2,
    name: "Complejo Riverside",
    location: "Distrito Riverside, Ciudad Metro",
    startDate: "2023-03-10",
    endDate: "2024-09-15",
    budget: "$3.8M",
    spent: "$3.2M",
    budgetStatus: "En Presupuesto",
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
    nextMilestones: [
      { id: 1, date: "2023-11-25", description: "Instalación de sistemas hidráulicos" },
      { id: 2, date: "2024-02-15", description: "Fachada exterior" },
    ],
    team: [
      { name: "Ana Martínez", role: "Directora de Proyecto", contact: "ana@acme.com" },
      { name: "Roberto Sánchez", role: "Arquitecto", contact: "roberto@acme.com" },
    ],
  },
  {
    id: 3,
    name: "Parque Oficinas Metro",
    location: "Distrito Empresarial, Ciudad Metro",
    startDate: "2023-05-22",
    endDate: "2024-04-10",
    budget: "$2.5M",
    spent: "$2.2M",
    budgetStatus: "En Presupuesto",
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
    nextMilestones: [{ id: 1, date: "2024-03-10", description: "Instalación de mobiliario" }],
    team: [
      { name: "Laura Gómez", role: "Directora de Proyecto", contact: "laura@acme.com" },
      { name: "Pedro Díaz", role: "Ingeniero Civil", contact: "pedro@acme.com" },
    ],
  },
]

export default function ClientProjectList() {
  const [expandedProjects, setExpandedProjects] = useState<number[]>([])

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

  const getBudgetStatusColor = (status: string) => {
    switch (status) {
      case "Bajo Presupuesto":
        return "text-green-500"
      case "En Presupuesto":
        return "text-amber-500"
      case "Sobre Presupuesto":
        return "text-red-500"
      default:
        return "text-gray-500"
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
    <Card>
      <CardHeader>
        <CardTitle>Proyectos Activos</CardTitle>
        <CardDescription>Información detallada de todos tus proyectos de construcción actuales.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {projects.map((project) => (
            // Reemplazar el componente Collapsible y su contenido con esta implementación
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-3">Descripción del Proyecto</h4>
                      <p className="text-sm text-muted-foreground mb-4">{project.description}</p>

                      <h4 className="font-medium mb-2">Información Financiera</h4>
                      <div className="space-y-1 mb-4">
                        <div className="flex justify-between text-sm">
                          <span>Presupuesto Total:</span>
                          <span>{project.budget}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Gastado hasta la fecha:</span>
                          <span>{project.spent}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Estado:</span>
                          <span className={getBudgetStatusColor(project.budgetStatus)}>{project.budgetStatus}</span>
                        </div>
                      </div>

                      <h4 className="font-medium mb-2">Equipo del Proyecto</h4>
                      <div className="space-y-2">
                        {project.team.map((member, index) => (
                          <div key={index} className="text-sm">
                            <div className="font-medium">{member.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {member.role} • {member.contact}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-3">Hitos del Proyecto</h4>
                      <div className="space-y-3 mb-4">
                        {project.milestones.map((milestone) => (
                          <div key={milestone.id} className="flex items-start gap-3">
                            <div
                              className={`mt-0.5 ${milestone.completed ? "text-green-500" : "text-muted-foreground"}`}
                            >
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

                      <h4 className="font-medium mb-2">Próximos Hitos</h4>
                      <div className="space-y-2">
                        {project.nextMilestones.map((milestone, index) => (
                          <div key={index} className="flex items-center justify-between text-sm">
                            <span>{milestone.description}</span>
                            <span className="text-xs text-muted-foreground">{formatDate(milestone.date)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

