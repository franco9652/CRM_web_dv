"use client"

import { useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Clock, Loader2, Search, Video } from "lucide-react"
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
import { getMeetingsByUsername } from "@/services/meetings"
import { getWorksByCustomerId } from "@/services/works"
import { useAuth } from "@/components/auth-provider"

import type { Meeting } from "@/services/meetings";

export default function ClientMeetingsPage() {
  const { user } = useAuth()
  const [meetings, setMeetings] = useState<Array<Partial<Meeting>>>([])
  const [loading, setLoading] = useState(true)
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
  const [projects, setProjects] = useState<Array<{id: string, name: string}>>([])
  const [loadingProjects, setLoadingProjects] = useState(false)

  const fetchProjects = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setLoadingProjects(true);
      const response = await getWorksByCustomerId(user.id);
      if (response && response.works) {
        setProjects(response.works.map(work => ({
          id: work._id,
          name: work.name
        })));
      }
    } catch (error) {
      console.error("Error al obtener los proyectos:", error);
    } finally {
      setLoadingProjects(false);
    }
  }, [user?.id]);

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        setLoading(true);
        const response = await getMeetingsByUsername(user?.email || "");
        if (response && response.meetings) {
          setMeetings(response.meetings);
        }
      } catch (error) {
        console.error("Error al obtener las reuniones:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMeetings();
    fetchProjects();
  }, [user?.email, fetchProjects])

  const filteredMeetings = meetings.filter((meeting) => {
    const titleMatch = meeting.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const projectMatch = meeting.project && 
                        meeting.project.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const projectFilterMatch = projectFilter === "Todos" || 
                             (meeting.project && meeting.project._id === projectFilter);
    const typeFilterMatch = typeFilter === "Todos" || meeting.meetingType === typeFilter;
    
    return (titleMatch || projectMatch) && projectFilterMatch && typeFilterMatch;
  })

  const formatDate = (dateString: string | Date ) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date)
  }

  // Proyectos para el filtro (incluye "Todos" y los proyectos existentes en las reuniones)
  const projectOptions = ["Todos", ...Array.from(new Set(
    meetings
      .map(meeting => (typeof meeting.project === 'object' && meeting.project?.title) || '')
      .filter(Boolean)
  ))]

  // Tipos de reuniones para el filtro
  const meetingTypes = ["Todos", "Presencial", "Videollamada"]

  const handleRequestMeeting = () => {
    // Aquí iría la lógica para enviar la solicitud de reunión
    // Por ahora, solo cerramos el diálogo y reiniciamos el formulario
    setIsDialogOpen(false)
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
                    {loadingProjects ? (
                      <div className="px-2 py-1.5 text-sm text-muted-foreground">Cargando proyectos...</div>
                    ) : projects.length > 0 ? (
                      projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))
                    ) : (
                      <div className="px-2 py-1.5 text-sm text-muted-foreground">No hay proyectos disponibles</div>
                    )}
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
                {filteredMeetings.length === 0 && !loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <Calendar className="h-12 w-12 text-muted-foreground" />
                        <p className="text-lg font-medium">No hay reuniones programadas</p>
                        <p className="text-sm text-muted-foreground">
                          No se encontraron reuniones para mostrar en este momento.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : !loading ? (
                  filteredMeetings.map((meeting) => (
                    <TableRow key={meeting._id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-2">
                          <div className="flex-shrink-0">
                            {meeting.meetingType === "Videollamada" ? (
                              <Video className="h-5 w-5 text-blue-500" />
                            ) : (
                              <Calendar className="h-5 w-5 text-green-500" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium">{meeting.title}</div>
                            <div className="text-sm text-muted-foreground">
                              {meeting.project ? meeting.project.name : 'Sin proyecto'}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(meeting?.date || '')}</TableCell>
                      <TableCell>{meeting.time}</TableCell>
                      <TableCell>{meeting.duration}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            meeting.meetingType === "Videollamada"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {meeting.meetingType}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <div className="text-center py-8 flex justify-center items-center p-6">
                        <Loader2 className="animate-spin text-primary" size={24} />
                        <p className="px-6">Cargando reuniones...</p>
                    </div>
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

