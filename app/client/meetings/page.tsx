"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Clock, Search, Video } from "lucide-react"
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
import { Textarea } from "@/components/ui/textarea"

// Datos de reuniones de ejemplo
const meetings = [
  {
    id: 1,
    title: "Revisión de Diseño",
    project: "Torre Skyline",
    date: "2024-03-22",
    time: "14:00",
    duration: "1.5 horas",
    type: "Presencial",
    location: "Oficina del Proyecto",
    description: "Revisión de los planos finales y aprobación de materiales.",
    participants: ["Juan Pérez", "María López", "Carlos Rodríguez"],
  },
  {
    id: 2,
    title: "Discusión de Presupuesto",
    project: "Complejo Riverside",
    date: "2024-03-25",
    time: "11:00",
    duration: "1 hora",
    type: "Videollamada",
    location: "Zoom",
    description: "Análisis de costos y ajustes al presupuesto inicial.",
    participants: ["Ana Martínez", "Roberto Sánchez"],
  },
  {
    id: 3,
    title: "Actualización de Progreso",
    project: "Parque Oficinas Metro",
    date: "2024-03-28",
    time: "15:30",
    duration: "45 minutos",
    type: "Videollamada",
    location: "Microsoft Teams",
    description: "Informe de avance de obra y planificación de próximas etapas.",
    participants: ["Laura Gómez", "Pedro Díaz", "Sofía Ramírez"],
  },
  {
    id: 4,
    title: "Inspección de Obra",
    project: "Torre Skyline",
    date: "2024-04-05",
    time: "10:00",
    duration: "2 horas",
    type: "Presencial",
    location: "Sitio de Construcción",
    description: "Visita al sitio para verificar avances y calidad de construcción.",
    participants: ["Juan Pérez", "Carlos Rodríguez", "Elena Torres"],
  },
  {
    id: 5,
    title: "Selección de Acabados",
    project: "Complejo Riverside",
    date: "2024-04-10",
    time: "16:00",
    duration: "1.5 horas",
    type: "Presencial",
    location: "Showroom de Materiales",
    description: "Selección final de acabados interiores y materiales decorativos.",
    participants: ["Ana Martínez", "Laura Gómez", "Miguel Soto"],
  },
]

export default function ClientMeetingsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [projectFilter, setProjectFilter] = useState("Todos")
  const [typeFilter, setTypeFilter] = useState("Todos")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newMeeting, setNewMeeting] = useState({
    project: "",
    title: "",
    date: "",
    time: "",
    description: "",
  })

  const filteredMeetings = meetings.filter(
    (meeting) =>
      (meeting.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        meeting.project.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (projectFilter === "Todos" || meeting.project === projectFilter) &&
      (typeFilter === "Todos" || meeting.type === typeFilter),
  )

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date)
  }

  // Extraer proyectos únicos para el filtro
  const projects = ["Todos", ...Array.from(new Set(meetings.map((meeting) => meeting.project)))]

  // Tipos de reuniones para el filtro
  const meetingTypes = ["Todos", "Presencial", "Videollamada"]

  const handleRequestMeeting = () => {
    // Aquí iría la lógica para enviar la solicitud de reunión
    setIsDialogOpen(false)
    // Reiniciar el formulario
    setNewMeeting({
      project: "",
      title: "",
      date: "",
      time: "",
      description: "",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reuniones</h1>
          <p className="text-muted-foreground">Gestiona tus reuniones con el equipo de construcción.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Calendar className="mr-2 h-4 w-4" />
              Solicitar Reunión
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Solicitar Nueva Reunión</DialogTitle>
              <DialogDescription>
                Completa el formulario para solicitar una reunión con el equipo de construcción.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="project">Proyecto</Label>
                <Select
                  value={newMeeting.project}
                  onValueChange={(value) => setNewMeeting({ ...newMeeting, project: value })}
                >
                  <SelectTrigger id="project">
                    <SelectValue placeholder="Seleccionar proyecto" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects
                      .filter((p) => p !== "Todos")
                      .map((project) => (
                        <SelectItem key={project} value={project}>
                          {project}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="title">Asunto de la Reunión</Label>
                <Input
                  id="title"
                  value={newMeeting.title}
                  onChange={(e) => setNewMeeting({ ...newMeeting, title: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="date">Fecha Propuesta</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newMeeting.date}
                    onChange={(e) => setNewMeeting({ ...newMeeting, date: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="time">Hora Propuesta</Label>
                  <Input
                    id="time"
                    type="time"
                    value={newMeeting.time}
                    onChange={(e) => setNewMeeting({ ...newMeeting, time: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  placeholder="Describe el propósito de la reunión"
                  value={newMeeting.description}
                  onChange={(e) => setNewMeeting({ ...newMeeting, description: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleRequestMeeting}>Enviar Solicitud</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Próximas Reuniones</CardTitle>
          <CardDescription>
            Visualiza y gestiona tus reuniones programadas con el equipo de construcción.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar reuniones..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={projectFilter} onValueChange={setProjectFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filtrar por proyecto" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project} value={project}>
                    {project}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                {meetingTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reunión</TableHead>
                  <TableHead>Proyecto</TableHead>
                  <TableHead>Fecha y Hora</TableHead>
                  <TableHead className="hidden md:table-cell">Tipo</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMeetings.map((meeting) => (
                  <TableRow key={meeting.id}>
                    <TableCell className="font-medium">
                      <div>{meeting.title}</div>
                      <div className="text-xs text-muted-foreground">{meeting.description.substring(0, 50)}...</div>
                    </TableCell>
                    <TableCell>{meeting.project}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span>{formatDate(meeting.date)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span>
                            {meeting.time} ({meeting.duration})
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center gap-1">
                        {meeting.type === "Videollamada" ? (
                          <Video className="h-3 w-3 text-muted-foreground" />
                        ) : (
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                        )}
                        <span>{meeting.type}</span>
                        <span className="text-xs text-muted-foreground">({meeting.location})</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {meeting.type === "Videollamada" ? (
                        <Button size="sm">Unirse</Button>
                      ) : (
                        <Button size="sm" variant="outline">
                          Detalles
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {filteredMeetings.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                      No se encontraron reuniones. Intenta ajustar tu búsqueda o solicita una nueva reunión.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

