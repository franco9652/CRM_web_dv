"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle2, ChevronLeft, ClipboardList, Plus } from "lucide-react"

// Datos de proyectos de ejemplo
const initialProjects = [
  {
    id: 1,
    name: "Torre Skyline",
    client: "Inmobiliaria Vista",
    startDate: "2023-01-15",
    endDate: "2024-06-30",
    budget: "$4.2M",
    progress: 75,
    status: "En Progreso",
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
    client: "Desarrollos Globales",
    startDate: "2023-03-10",
    endDate: "2024-09-15",
    budget: "$3.8M",
    progress: 45,
    status: "En Progreso",
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
    client: "Corporación Stark",
    startDate: "2023-05-22",
    endDate: "2024-04-10",
    budget: "$2.5M",
    progress: 90,
    status: "En Progreso",
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

export default function ProjectMilestonesPage() {
  const params = useParams()
  const router = useRouter()
  const [project, setProject] = useState(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newMilestone, setNewMilestone] = useState({
    date: "",
    description: "",
  })

  useEffect(() => {
    // Verificar que estamos en el cliente
    if (typeof window !== "undefined") {
      const projectId = Number(params.id)
      // Buscar el proyecto por ID
      const foundProject = initialProjects.find((p) => p.id === projectId)
      if (foundProject) {
        setProject(foundProject)
      }
    }
  }, [params.id])

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date)
  }

  const handleAddMilestone = () => {
    // Simplemente cerrar el diálogo para evitar problemas de estado
    setIsDialogOpen(false)
    setNewMilestone({ date: "", description: "" })

    // En una aplicación real, aquí se agregaría el hito
    alert("Funcionalidad de agregar hito deshabilitada temporalmente")
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Proyecto no encontrado</h2>
          <p className="text-muted-foreground mt-2">El proyecto solicitado no existe o no está disponible.</p>
          <Button className="mt-4" onClick={() => router.push("/admin/projects")}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => router.push("/admin/projects")}>
            <ChevronLeft className="mr-1 h-4 w-4" />
            Volver
          </Button>
          <h1 className="text-2xl font-bold">Hitos del Proyecto: {project.name}</h1>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Agregar Hito
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Agregar Nuevo Hito</DialogTitle>
              <DialogDescription>Registra un nuevo hito o avance importante en el proyecto.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="milestone-date">Fecha</Label>
                <Input
                  id="milestone-date"
                  type="date"
                  value={newMilestone.date}
                  onChange={(e) => setNewMilestone({ ...newMilestone, date: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="milestone-description">Descripción</Label>
                <Textarea
                  id="milestone-description"
                  placeholder="Describe el hito o avance completado"
                  value={newMilestone.description}
                  onChange={(e) => setNewMilestone({ ...newMilestone, description: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddMilestone}>Agregar Hito</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Gestión de Hitos
          </CardTitle>
          <CardDescription>
            Administra los hitos y avances del proyecto. El progreso general se calcula automáticamente en base a los
            hitos completados.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Información del Proyecto</h3>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Cliente:</dt>
                    <dd>{project.client}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Fecha de inicio:</dt>
                    <dd>{formatDate(project.startDate)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Fecha de finalización:</dt>
                    <dd>{formatDate(project.endDate)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Presupuesto:</dt>
                    <dd>{project.budget}</dd>
                  </div>
                </dl>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-2">Estado Actual</h3>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Estado:</dt>
                    <dd>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium 
                        ${
                          project.status === "Completado"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                            : project.status === "En Progreso"
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300"
                              : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                        }`}
                      >
                        {project.status}
                      </span>
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Progreso general:</dt>
                    <dd>{project.progress}%</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Hitos completados:</dt>
                    <dd>
                      {project.milestones.filter((m) => m.completed).length} de {project.milestones.length}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-medium mb-4">Hitos del Proyecto</h3>
              <div className="space-y-4">
                {project.milestones.map((milestone) => (
                  <div key={milestone.id} className="flex items-start gap-4 p-4 border rounded-md">
                    <div className={`mt-1 flex-shrink-0 ${milestone.completed ? "text-green-500" : "text-gray-300"}`}>
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <p className="font-medium">{milestone.description}</p>
                        <span className="text-sm text-muted-foreground">{formatDate(milestone.date)}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Estado: {milestone.completed ? "Completado" : "Pendiente"}
                      </p>
                    </div>
                    {!milestone.completed && (
                      <Button size="sm" variant="outline">
                        Marcar como completado
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

