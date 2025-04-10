"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { Calendar, Clock, Edit, Link, MapPin, MoreHorizontal, Plus, Search, Trash, Users, Video } from "lucide-react"

// Datos de reuniones de ejemplo
const initialMeetings = [
  {
    id: 1,
    title: "Inicio de Proyecto",
    project: "Hotel Vista al Puerto",
    client: "Oscorp",
    date: "2024-03-20",
    time: "10:00",
    duration: "1 hora",
    type: "Videollamada",
    location: "",
    link: "https://meet.google.com/abc-defg-hij",
    participants: ["Juan Pérez", "María López", "Norman Osborn"],
    description: "Reunión inicial para discutir los detalles del proyecto y establecer expectativas.",
  },
  {
    id: 2,
    title: "Revisión de Diseño",
    project: "Torre Skyline",
    client: "Inmobiliaria Vista",
    date: "2024-03-22",
    time: "14:00",
    duration: "1.5 horas",
    type: "Presencial",
    location: "Oficina Central, Piso 5, Sala de Juntas",
    link: "",
    participants: ["Juan Pérez", "Carlos Rodríguez", "Ana Martínez", "Juan Gómez"],
    description: "Revisión de los planos finales y aprobación de materiales.",
  },
  {
    id: 3,
    title: "Discusión de Presupuesto",
    project: "Complejo Riverside",
    client: "Desarrollos Globales",
    date: "2024-03-25",
    time: "11:00",
    duration: "1 hora",
    type: "Videollamada",
    location: "",
    link: "https://zoom.us/j/123456789",
    participants: ["Juan Pérez", "Roberto Sánchez", "María López"],
    description: "Análisis de costos y ajustes al presupuesto inicial.",
  },
  {
    id: 4,
    title: "Actualización de Progreso",
    project: "Parque Oficinas Metro",
    client: "Corporación Stark",
    date: "2024-03-28",
    time: "15:30",
    duration: "45 minutos",
    type: "Videollamada",
    location: "",
    link: "https://teams.microsoft.com/l/meetup-join/123456789",
    participants: ["Juan Pérez", "Laura Gómez", "Antonio Stark"],
    description: "Informe de avance de obra y planificación de próximas etapas.",
  },
  {
    id: 5,
    title: "Inspección de Obra",
    project: "Torre Skyline",
    client: "Inmobiliaria Vista",
    date: "2024-04-05",
    time: "10:00",
    duration: "2 horas",
    type: "Presencial",
    location: "Sitio de Construcción, Torre Skyline, Av. Principal 123",
    link: "",
    participants: ["Juan Pérez", "Carlos Rodríguez", "Elena Torres", "Juan Gómez"],
    description: "Visita al sitio para verificar avances y calidad de construcción.",
  },
]

// Modificar los datos de clientes para el selector
const clients = [
  { id: 1, name: "Inmobiliaria Vista", projects: ["Torre Skyline"] },
  { id: 2, name: "Desarrollos Globales", projects: ["Complejo Riverside"] },
  { id: 3, name: "Corporación Stark", projects: ["Parque Oficinas Metro"] },
  { id: 4, name: "Inversiones Wayne", projects: ["Residencias Sunset"] },
  { id: 5, name: "Oscorp", projects: ["Hotel Vista al Puerto"] },
]

// Reemplazar la definición de projects por la de arriba
// const projects = [
//   { id: 1, name: "Torre Skyline", client: "Inmobiliaria Vista" },
//   { id: 2, name: "Complejo Riverside", client: "Desarrollos Globales" },
//   { id: 3, name: "Parque Oficinas Metro", client: "Corporación Stark" },
//   { id: 4, name: "Residencias Sunset", client: "Inversiones Wayne" },
//   { id: 5, name: "Hotel Vista al Puerto", client: "Oscorp" },
// ]

// Datos de proyectos para el selector
// const projects = [
//   { id: 1, name: "Torre Skyline", client: "Inmobiliaria Vista" },
//   { id: 2, name: "Complejo Riverside", client: "Desarrollos Globales" },
//   { id: 3, name: "Parque Oficinas Metro", client: "Corporación Stark" },
//   { id: 4, name: "Residencias Sunset", client: "Inversiones Wayne" },
//   { id: 5, name: "Hotel Vista al Puerto", client: "Oscorp" },
// ]

export default function CalendarPage() {
  const [meetings, setMeetings] = useState(initialMeetings)
  const [searchTerm, setSearchTerm] = useState("")
  const [projectFilter, setProjectFilter] = useState("Todos")
  const [typeFilter, setTypeFilter] = useState("Todos")

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const [selectedMeeting, setSelectedMeeting] = useState<any>(null)

  // Modificar el estado de newMeeting para incluir client en lugar de project
  const [newMeeting, setNewMeeting] = useState({
    title: "",
    client: "",
    project: "",
    date: "",
    time: "",
    duration: "",
    type: "Videollamada",
    location: "",
    link: "",
    participants: "",
    description: "",
  })

  // Agregar estado para los proyectos disponibles basados en el cliente seleccionado
  const [availableProjects, setAvailableProjects] = useState<string[]>([])

  // Actualizar la función de filtrado para que filtre por cliente en lugar de proyecto
  const filteredMeetings = meetings.filter(
    (meeting) =>
      (meeting.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        meeting.project.toLowerCase().includes(searchTerm.toLowerCase()) ||
        meeting.client.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (projectFilter === "Todos" || meeting.client === projectFilter) &&
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

  // Modificar la función handleAddMeeting
  const handleAddMeeting = () => {
    const id = meetings.length > 0 ? Math.max(...meetings.map((m) => m.id)) + 1 : 1

    const meeting = {
      id,
      title: newMeeting.title,
      project: newMeeting.project,
      client: newMeeting.client,
      date: newMeeting.date,
      time: newMeeting.time,
      duration: newMeeting.duration,
      type: newMeeting.type,
      location: newMeeting.type === "Presencial" ? newMeeting.location : "",
      link: newMeeting.type === "Videollamada" ? newMeeting.link : "",
      participants: newMeeting.participants.split(",").map((p) => p.trim()),
      description: newMeeting.description,
    }

    setMeetings([...meetings, meeting])
    resetForm()
    setIsAddDialogOpen(false)
  }

  // Modificar la función handleEditMeeting
  const handleEditMeeting = () => {
    if (!selectedMeeting) return

    const updatedMeetings = meetings.map((meeting) => {
      if (meeting.id === selectedMeeting.id) {
        return {
          ...meeting,
          title: newMeeting.title,
          project: newMeeting.project,
          client: newMeeting.client,
          date: newMeeting.date,
          time: newMeeting.time,
          duration: newMeeting.duration,
          type: newMeeting.type,
          location: newMeeting.type === "Presencial" ? newMeeting.location : "",
          link: newMeeting.type === "Videollamada" ? newMeeting.link : "",
          participants: newMeeting.participants.split(",").map((p) => p.trim()),
          description: newMeeting.description,
        }
      }
      return meeting
    })

    setMeetings(updatedMeetings)
    resetForm()
    setIsEditDialogOpen(false)
  }

  const handleDeleteMeeting = () => {
    if (!selectedMeeting) return

    const updatedMeetings = meetings.filter((meeting) => meeting.id !== selectedMeeting.id)
    setMeetings(updatedMeetings)
    setSelectedMeeting(null)
    setIsDeleteDialogOpen(false)
  }

  // Modificar la función resetForm
  const resetForm = () => {
    setNewMeeting({
      title: "",
      client: "",
      project: "",
      date: "",
      time: "",
      duration: "",
      type: "Videollamada",
      location: "",
      link: "",
      participants: "",
      description: "",
    })
    setAvailableProjects([])
  }

  // Agregar función para manejar el cambio de cliente
  const handleClientChange = (clientName: string) => {
    const selectedClient = clients.find((c) => c.name === clientName)
    setNewMeeting({ ...newMeeting, client: clientName, project: "" })

    if (selectedClient) {
      setAvailableProjects(selectedClient.projects)
    } else {
      setAvailableProjects([])
    }
  }

  // Modificar la función openEditDialog
  const openEditDialog = (meeting: any) => {
    setSelectedMeeting(meeting)

    // Encontrar los proyectos disponibles para el cliente seleccionado
    const selectedClient = clients.find((c) => c.name === meeting.client)
    const projects = selectedClient ? selectedClient.projects : []

    setNewMeeting({
      title: meeting.title,
      client: meeting.client,
      project: meeting.project,
      date: meeting.date,
      time: meeting.time,
      duration: meeting.duration,
      type: meeting.type,
      location: meeting.location,
      link: meeting.link,
      participants: meeting.participants.join(", "),
      description: meeting.description,
    })

    setAvailableProjects(projects)
    setIsEditDialogOpen(true)
  }

  const openDeleteDialog = (meeting: any) => {
    setSelectedMeeting(meeting)
    setIsDeleteDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Calendario</h1>
          <p className="text-muted-foreground">Gestiona todas las reuniones y eventos programados.</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Programar Reunión
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Programar Nueva Reunión</DialogTitle>
              <DialogDescription>
                Completa el formulario para programar una nueva reunión con clientes o miembros del equipo.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Título de la Reunión</Label>
                <Input
                  id="title"
                  value={newMeeting.title}
                  onChange={(e) => setNewMeeting({ ...newMeeting, title: e.target.value })}
                  placeholder="Ej: Revisión de Diseño"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="client">Cliente</Label>
                <Select value={newMeeting.client} onValueChange={handleClientChange}>
                  <SelectTrigger id="client">
                    <SelectValue placeholder="Seleccionar cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.name}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="project">Proyecto</Label>
                <Select
                  value={newMeeting.project}
                  onValueChange={(value) => setNewMeeting({ ...newMeeting, project: value })}
                  disabled={availableProjects.length === 0}
                >
                  <SelectTrigger id="project">
                    <SelectValue
                      placeholder={
                        availableProjects.length === 0 ? "Seleccione un cliente primero" : "Seleccionar proyecto"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {availableProjects.map((project) => (
                      <SelectItem key={project} value={project}>
                        {project}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="date">Fecha</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newMeeting.date}
                    onChange={(e) => setNewMeeting({ ...newMeeting, date: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="time">Hora</Label>
                  <Input
                    id="time"
                    type="time"
                    value={newMeeting.time}
                    onChange={(e) => setNewMeeting({ ...newMeeting, time: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="duration">Duración</Label>
                  <Input
                    id="duration"
                    placeholder="Ej: 1 hora"
                    value={newMeeting.duration}
                    onChange={(e) => setNewMeeting({ ...newMeeting, duration: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="type">Tipo de Reunión</Label>
                  <Select
                    value={newMeeting.type}
                    onValueChange={(value) => setNewMeeting({ ...newMeeting, type: value })}
                  >
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Videollamada">Videollamada</SelectItem>
                      <SelectItem value="Presencial">Presencial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {newMeeting.type === "Presencial" ? (
                <div className="grid gap-2">
                  <Label htmlFor="location">Ubicación</Label>
                  <Input
                    id="location"
                    placeholder="Ej: Oficina Central, Sala de Juntas"
                    value={newMeeting.location}
                    onChange={(e) => setNewMeeting({ ...newMeeting, location: e.target.value })}
                  />
                </div>
              ) : (
                <div className="grid gap-2">
                  <Label htmlFor="link">Enlace de la Reunión</Label>
                  <Input
                    id="link"
                    placeholder="Ej: https://meet.google.com/abc-defg-hij"
                    value={newMeeting.link}
                    onChange={(e) => setNewMeeting({ ...newMeeting, link: e.target.value })}
                  />
                </div>
              )}
              <div className="grid gap-2">
                <Label htmlFor="participants">Participantes</Label>
                <Input
                  id="participants"
                  placeholder="Nombres separados por comas"
                  value={newMeeting.participants}
                  onChange={(e) => setNewMeeting({ ...newMeeting, participants: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  placeholder="Detalles adicionales sobre la reunión"
                  value={newMeeting.description}
                  onChange={(e) => setNewMeeting({ ...newMeeting, description: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddMeeting}>Programar Reunión</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Reuniones Programadas</CardTitle>
          <CardDescription>
            Visualiza y gestiona todas las reuniones con clientes y miembros del equipo.
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
            {/* Modificar el filtro de proyectos para que sea un filtro de clientes */}
            <Select value={projectFilter} onValueChange={setProjectFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filtrar por cliente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Todos">Todos los Clientes</SelectItem>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.name}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Todos">Todos los Tipos</SelectItem>
                <SelectItem value="Videollamada">Videollamada</SelectItem>
                <SelectItem value="Presencial">Presencial</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reunión</TableHead>
                  <TableHead>Proyecto / Cliente</TableHead>
                  <TableHead>Fecha y Hora</TableHead>
                  <TableHead className="hidden md:table-cell">Tipo</TableHead>
                  <TableHead className="hidden md:table-cell">Participantes</TableHead>
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
                    <TableCell>
                      <div>{meeting.project}</div>
                      <div className="text-xs text-muted-foreground">{meeting.client}</div>
                    </TableCell>
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
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                        )}
                        <span>{meeting.type}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {meeting.type === "Videollamada" ? (
                          <div className="flex items-center gap-1">
                            <Link className="h-3 w-3" />
                            <span className="truncate max-w-[150px]">{meeting.link}</span>
                          </div>
                        ) : (
                          meeting.location
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3 text-muted-foreground" />
                        <span>{meeting.participants.length}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1 truncate max-w-[150px]">
                        {meeting.participants.join(", ")}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Abrir menú</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => openEditDialog(meeting)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar Reunión
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Users className="mr-2 h-4 w-4" />
                            Gestionar Participantes
                          </DropdownMenuItem>
                          {meeting.type === "Videollamada" && (
                            <DropdownMenuItem onClick={() => window.open(meeting.link, "_blank")}>
                              <Video className="mr-2 h-4 w-4" />
                              Unirse a la Reunión
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600 focus:text-red-600"
                            onClick={() => openDeleteDialog(meeting)}
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            Cancelar Reunión
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredMeetings.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                      No se encontraron reuniones. Intenta ajustar tu búsqueda o programa una nueva reunión.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Diálogo para editar reunión */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Editar Reunión</DialogTitle>
            <DialogDescription>Modifica los detalles de la reunión programada.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-title">Título de la Reunión</Label>
              <Input
                id="edit-title"
                value={newMeeting.title}
                onChange={(e) => setNewMeeting({ ...newMeeting, title: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-client">Cliente</Label>
              <Select
                value={newMeeting.client}
                onValueChange={(value) => {
                  handleClientChange(value)
                }}
              >
                <SelectTrigger id="edit-client">
                  <SelectValue placeholder="Seleccionar cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.name}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-project">Proyecto</Label>
              <Select
                value={newMeeting.project}
                onValueChange={(value) => setNewMeeting({ ...newMeeting, project: value })}
                disabled={availableProjects.length === 0}
              >
                <SelectTrigger id="edit-project">
                  <SelectValue
                    placeholder={
                      availableProjects.length === 0 ? "Seleccione un cliente primero" : "Seleccionar proyecto"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {availableProjects.map((project) => (
                    <SelectItem key={project} value={project}>
                      {project}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-date">Fecha</Label>
                <Input
                  id="edit-date"
                  type="date"
                  value={newMeeting.date}
                  onChange={(e) => setNewMeeting({ ...newMeeting, date: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-time">Hora</Label>
                <Input
                  id="edit-time"
                  type="time"
                  value={newMeeting.time}
                  onChange={(e) => setNewMeeting({ ...newMeeting, time: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-duration">Duración</Label>
                <Input
                  id="edit-duration"
                  value={newMeeting.duration}
                  onChange={(e) => setNewMeeting({ ...newMeeting, duration: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-type">Tipo de Reunión</Label>
                <Select
                  value={newMeeting.type}
                  onValueChange={(value) => setNewMeeting({ ...newMeeting, type: value })}
                >
                  <SelectTrigger id="edit-type">
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Videollamada">Videollamada</SelectItem>
                    <SelectItem value="Presencial">Presencial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {newMeeting.type === "Presencial" ? (
              <div className="grid gap-2">
                <Label htmlFor="edit-location">Ubicación</Label>
                <Input
                  id="edit-location"
                  value={newMeeting.location}
                  onChange={(e) => setNewMeeting({ ...newMeeting, location: e.target.value })}
                />
              </div>
            ) : (
              <div className="grid gap-2">
                <Label htmlFor="edit-link">Enlace de la Reunión</Label>
                <Input
                  id="edit-link"
                  value={newMeeting.link}
                  onChange={(e) => setNewMeeting({ ...newMeeting, link: e.target.value })}
                />
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="edit-participants">Participantes</Label>
              <Input
                id="edit-participants"
                placeholder="Nombres separados por comas"
                value={newMeeting.participants}
                onChange={(e) => setNewMeeting({ ...newMeeting, participants: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Descripción</Label>
              <Textarea
                id="edit-description"
                value={newMeeting.description}
                onChange={(e) => setNewMeeting({ ...newMeeting, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEditMeeting}>Guardar Cambios</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo para confirmar eliminación */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelar Reunión</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas cancelar esta reunión? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              No, Mantener
            </Button>
            <Button variant="destructive" onClick={handleDeleteMeeting}>
              Sí, Cancelar Reunión
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

