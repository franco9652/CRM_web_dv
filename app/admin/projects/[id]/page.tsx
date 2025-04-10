"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { ChevronLeft, CheckCircle2, FileText, Users, Plus } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

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
    description:
      "Edificio residencial de lujo de 25 pisos con 100 apartamentos, áreas comunes y estacionamiento subterráneo.",
    location: "Centro, Ciudad Metro",
    milestones: [
      { id: 1, date: "2023-01-20", description: "Inicio de excavación", completed: true },
      { id: 2, date: "2023-03-15", description: "Cimentación completada", completed: true },
      { id: 3, date: "2023-06-10", description: "Estructura hasta el piso 15 completada", completed: true },
      { id: 4, date: "2023-09-05", description: "Instalación de loza radiante en pisos 1-10", completed: true },
      { id: 5, date: "2023-12-20", description: "Fachada exterior completada", completed: true },
      { id: 6, date: "2024-02-15", description: "Instalaciones eléctricas completadas", completed: false },
      { id: 7, date: "2024-04-10", description: "Acabados interiores", completed: false },
    ],
    team: [
      { name: "Juan Pérez", role: "Director de Proyecto", contact: "juan@acme.com" },
      { name: "María López", role: "Arquitecta", contact: "maria@acme.com" },
      { name: "Carlos Rodríguez", role: "Ingeniero Estructural", contact: "carlos@acme.com" },
    ],
    documents: [
      { id: 1, name: "Planos de Planta", type: "PDF", uploadDate: "2024-01-15" },
      { id: 2, name: "Cronograma de Construcción", type: "PDF", uploadDate: "2024-01-20" },
      { id: 3, name: "Presupuesto Detallado", type: "XLSX", uploadDate: "2024-01-25" },
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
    description: "Desarrollo de uso mixto con oficinas, locales comerciales y apartamentos con vista al río.",
    location: "Distrito Riverside, Ciudad Metro",
    milestones: [
      { id: 1, date: "2023-03-20", description: "Inicio de excavación", completed: true },
      { id: 2, date: "2023-05-15", description: "Cimentación completada", completed: true },
      { id: 3, date: "2023-08-10", description: "Estructura del edificio A completada", completed: true },
      { id: 4, date: "2023-11-25", description: "Instalación de sistemas hidráulicos", completed: false },
      { id: 5, date: "2024-02-15", description: "Fachada exterior", completed: false },
    ],
    team: [
      { name: "Ana Martínez", role: "Directora de Proyecto", contact: "ana@acme.com" },
      { name: "Roberto Sánchez", role: "Arquitecto", contact: "roberto@acme.com" },
    ],
    documents: [
      { id: 1, name: "Planos Arquitectónicos", type: "PDF", uploadDate: "2024-02-10" },
      { id: 2, name: "Propuesta de Presupuesto", type: "XLSX", uploadDate: "2024-02-15" },
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
    description: "Complejo de oficinas corporativas con certificación LEED, espacios verdes y estacionamiento.",
    location: "Distrito Empresarial, Ciudad Metro",
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
    team: [
      { name: "Laura Gómez", role: "Directora de Proyecto", contact: "laura@acme.com" },
      { name: "Pedro Díaz", role: "Ingeniero Civil", contact: "pedro@acme.com" },
    ],
    documents: [
      { id: 1, name: "Especificaciones de Materiales", type: "PDF", uploadDate: "2024-03-05" },
      { id: 2, name: "Certificación LEED", type: "PDF", uploadDate: "2024-03-10" },
    ],
  },
  {
    id: 4,
    name: "Residencias Sunset",
    client: "Inversiones Wayne",
    startDate: "2022-11-05",
    endDate: "2023-12-20",
    budget: "$5.1M",
    progress: 100,
    status: "Completado",
    description: "Complejo residencial de lujo con vista al mar, piscinas y áreas recreativas.",
    location: "Zona Costera, Ciudad Metro",
    milestones: [
      { id: 1, date: "2022-11-15", description: "Inicio de excavación", completed: true },
      { id: 2, date: "2023-01-20", description: "Cimentación completada", completed: true },
      { id: 3, date: "2023-04-10", description: "Estructura completada", completed: true },
      { id: 4, date: "2023-06-15", description: "Instalaciones eléctricas y sanitarias", completed: true },
      { id: 5, date: "2023-08-20", description: "Fachada exterior completada", completed: true },
      { id: 6, date: "2023-10-15", description: "Acabados interiores completados", completed: true },
      { id: 7, date: "2023-12-10", description: "Entrega final del proyecto", completed: true },
    ],
    team: [
      { name: "Bruno Wayne", role: "Director de Proyecto", contact: "bruno@acme.com" },
      { name: "Diana Prince", role: "Arquitecta", contact: "diana@acme.com" },
    ],
    documents: [
      { id: 1, name: "Acta de Entrega", type: "PDF", uploadDate: "2023-12-15" },
      { id: 2, name: "Informe Final", type: "PDF", uploadDate: "2023-12-20" },
    ],
  },
  {
    id: 5,
    name: "Hotel Vista al Puerto",
    client: "Oscorp",
    startDate: "2024-02-15",
    endDate: "2025-08-30",
    budget: "$7.3M",
    progress: 0,
    status: "Planificación",
    description: "Hotel de lujo con 200 habitaciones, centro de convenciones y spa con vista al puerto.",
    location: "Puerto, Ciudad Metro",
    milestones: [
      { id: 1, date: "2024-03-01", description: "Aprobación de permisos", completed: false },
      { id: 2, date: "2024-04-15", description: "Inicio de excavación", completed: false },
      { id: 3, date: "2024-06-30", description: "Cimentación", completed: false },
    ],
    team: [
      { name: "Norman Osborn", role: "Director de Proyecto", contact: "norman@acme.com" },
      { name: "Otto Octavius", role: "Ingeniero Estructural", contact: "otto@acme.com" },
    ],
    documents: [
      { id: 1, name: "Planos Preliminares", type: "PDF", uploadDate: "2024-02-20" },
      { id: 2, name: "Estudio de Suelo", type: "PDF", uploadDate: "2024-02-25" },
    ],
  },
]

export default function ProjectDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [project, setProject] = useState(null)
  const [activeTab, setActiveTab] = useState("milestones")
  const [isAddMilestoneDialogOpen, setIsAddMilestoneDialogOpen] = useState(false)
  const [newMilestone, setNewMilestone] = useState({
    date: "",
    description: "",
  })

  useEffect(() => {
    // Asegurarse de que estamos en el cliente
    if (typeof window !== "undefined") {
      const projectId = Number(params.id)
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
    setIsAddMilestoneDialogOpen(false)
    setNewMilestone({ date: "", description: "" })

    // En una aplicación real, aquí se agregaría el hito
    alert("Funcionalidad de agregar hito deshabilitada temporalmente")
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Cargando proyecto...</h2>
          <Button className="mt-4" onClick={() => router.push("/admin/projects")}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Volver a Proyectos
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
          <h1 className="text-2xl font-bold">{project.name}</h1>
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
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del Proyecto</CardTitle>
          <CardDescription>Detalles generales y estado actual del proyecto</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Descripción</h3>
              <p className="text-muted-foreground">{project.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium mb-2">Detalles del Proyecto</h3>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Cliente:</dt>
                    <dd>{project.client}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Ubicación:</dt>
                    <dd>{project.location}</dd>
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
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Progreso general</span>
                      <span>{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} />
                  </div>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Hitos completados:</dt>
                      <dd>
                        {project.milestones.filter((m) => m.completed).length} de {project.milestones.length}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Próximo hito:</dt>
                      <dd>
                        {project.milestones.find((m) => !m.completed)?.description || "Todos los hitos completados"}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="milestones">Hitos</TabsTrigger>
          <TabsTrigger value="team">Equipo</TabsTrigger>
          <TabsTrigger value="documents">Documentos</TabsTrigger>
        </TabsList>

        {activeTab === "milestones" && (
          <Card className="mt-4">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Hitos del Proyecto</CardTitle>
              <DialogTrigger asChild>
                <Button onClick={() => setIsAddMilestoneDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar Hito
                </Button>
              </DialogTrigger>
            </CardHeader>
            <CardContent>
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
                {project.milestones.length === 0 && (
                  <div className="text-center py-6 text-muted-foreground">
                    No hay hitos definidos para este proyecto. Agrega el primer hito para comenzar a hacer seguimiento.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "team" && (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Equipo del Proyecto</CardTitle>
              <CardDescription>Miembros del equipo asignados a este proyecto</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {project.team.map((member, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 border rounded-md">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <Users className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{member.name}</p>
                      <p className="text-sm text-muted-foreground">{member.role}</p>
                      <p className="text-sm text-muted-foreground">{member.contact}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "documents" && (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Documentos del Proyecto</CardTitle>
              <CardDescription>Archivos y documentación relacionada con el proyecto</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {project.documents.map((document) => (
                  <div key={document.id} className="flex items-start gap-4 p-4 border rounded-md">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{document.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {document.type} • Subido el {formatDate(document.uploadDate)}
                      </p>
                    </div>
                    <Button size="sm" variant="outline">
                      Descargar
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </Tabs>

      <Dialog open={isAddMilestoneDialogOpen} onOpenChange={setIsAddMilestoneDialogOpen}>
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
            <Button variant="outline" onClick={() => setIsAddMilestoneDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddMilestone}>Agregar Hito</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

