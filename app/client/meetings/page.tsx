"use client"

import { useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Clock, Loader2, Search, Video, Edit, Trash, MoreHorizontal, Link, MapPin } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { getMeetingsByUsername, updateMeeting, deleteMeeting, type CreateMeetingData } from "@/services/meetings"
import { getWorksByCustomerId } from "@/services/works"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"

import type { Meeting } from "@/services/meetings";

export default function ClientMeetingsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [meetings, setMeetings] = useState<Array<Partial<Meeting>>>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [projectFilter, setProjectFilter] = useState("Todos")
  const [typeFilter, setTypeFilter] = useState("Todos")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedMeeting, setSelectedMeeting] = useState<Partial<Meeting> | null>(null)
  const [newMeeting, setNewMeeting] = useState({
    project: "",
    title: "",
    date: "",
    time: "",
    description: "",
  })
  const [editMeeting, setEditMeeting] = useState({
    project: "",
    title: "",
    date: "",
    time: "",
    duration: "",
    meetingType: "Presencial",
    description: "",
    meetingLink: "",
    address: "",
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

  // Handle editing a meeting
  const handleEditMeeting = async () => {
    if (!selectedMeeting?._id) return;

    try {
      // Prepare data for API - send only IDs for customer and project, and fix meeting type values
      const meetingDataForApi: Partial<CreateMeetingData> = {
        title: editMeeting.title,
        project: editMeeting.project,   // Send only the ID
        date: new Date(editMeeting.date),
        time: editMeeting.time,
        duration: editMeeting.duration,
        meetingType: editMeeting.meetingType === "Videollamada" ? "virtual" : "presencial", // Convert to backend values
        meetingLink: editMeeting.meetingType === "Videollamada" ? editMeeting.meetingLink : undefined,
        address: editMeeting.meetingType === "Presencial" ? editMeeting.address : undefined,
        description: editMeeting.description,
      };
      
      await updateMeeting(selectedMeeting._id, meetingDataForApi);
      
      // Refresh meetings list
      const response = await getMeetingsByUsername(user?.email || "");
      if (response && response.meetings) {
        setMeetings(response.meetings);
      }
      
      toast({
        title: "Reunión actualizada",
        description: "La reunión se ha actualizado correctamente.",
        variant: "default",
      });
      
      resetEditForm();
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error('Error updating meeting:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la reunión. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  }

  // Handle deleting a meeting
  const handleDeleteMeeting = async () => {
    if (!selectedMeeting?._id) return;

    try {
      await deleteMeeting(selectedMeeting._id);
      
      // Refresh meetings list
      const response = await getMeetingsByUsername(user?.email || "");
      if (response && response.meetings) {
        setMeetings(response.meetings);
      }
      
      toast({
        title: "Reunión eliminada",
        description: "La reunión se ha eliminado correctamente.",
        variant: "default",
      });
      
      setSelectedMeeting(null);
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting meeting:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la reunión. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  }

  // Reset the edit form to initial state
  const resetEditForm = () => {
    setEditMeeting({
      project: "",
      title: "",
      date: "",
      time: "",
      duration: "",
      meetingType: "Presencial",
      description: "",
      meetingLink: "",
      address: "",
    });
    setSelectedMeeting(null);
  }

  // Handle opening the edit dialog
  const openEditDialog = (meeting: Partial<Meeting>) => {
    setSelectedMeeting(meeting);
    setEditMeeting({
      project: meeting.project?._id || "",
      title: meeting.title || "",
      date: meeting.date ? (typeof meeting.date === 'string' ? meeting.date.split('T')[0] : new Date(meeting.date).toISOString().split('T')[0]) : "",
      time: meeting.time || "",
      duration: meeting.duration || "",
      meetingType: meeting.meetingType === 'virtual' ? 'Videollamada' : 'Presencial',
      description: meeting.description || "",
      meetingLink: meeting.meetingLink || "",
      address: meeting.address || "",
    });
    setIsEditDialogOpen(true);
  };

  // Handle opening the delete dialog
  const openDeleteDialog = (meeting: Partial<Meeting>) => {
    setSelectedMeeting(meeting);
    setIsDeleteDialogOpen(true);
  };

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
                              {meeting.description?.substring(0, 50) ?? ''}...
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>{meeting.project ? meeting.project.name : 'Sin proyecto'}</div>
                        <div className="text-xs text-muted-foreground">
                          {meeting.customer ? meeting.customer.name : 'Sin cliente'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <span>{formatDate(meeting?.date || '')}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span>{meeting.time} ({meeting.duration})</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex items-center gap-1">
                          {meeting.meetingType === "Videollamada" ? <Video className="h-3 w-3 text-muted-foreground" /> : <MapPin className="h-3 w-3 text-muted-foreground" />}
                          <span>{meeting.meetingType}</span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {meeting.meetingType === "Videollamada" ? (
                            <div className="flex items-center gap-1">
                              <Link className="h-3 w-3" />
                              <span className="truncate max-w-[150px]">{meeting.meetingLink}</span>
                            </div>
                          ) : ( meeting.address )}
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
                            {meeting.meetingType === "Videollamada" && meeting.meetingLink && (
                              <DropdownMenuItem onClick={() => window.open(meeting.meetingLink, "_blank")}>
                                <Video className="mr-2 h-4 w-4" />
                                Unirse a la Reunión
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={() => openDeleteDialog(meeting)}>
                              <Trash className="mr-2 h-4 w-4" />
                              Cancelar Reunión
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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

      {/* Edit Meeting Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={(isOpen) => { setIsEditDialogOpen(isOpen); if (!isOpen) resetEditForm(); }}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Editar Reunión</DialogTitle>
            <DialogDescription>
              Modifica los detalles de la reunión programada.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-title">Título de la Reunión</Label>
              <Input
                id="edit-title"
                value={editMeeting.title}
                onChange={(e) => setEditMeeting({ ...editMeeting, title: e.target.value })}
                placeholder="Ej: Revisión de Diseño"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-project">Proyecto</Label>
              <Select
                value={editMeeting.project}
                onValueChange={(value) => setEditMeeting({ ...editMeeting, project: value })}
              >
                <SelectTrigger id="edit-project">
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
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-date">Fecha</Label>
                <Input
                  id="edit-date"
                  type="date"
                  value={editMeeting.date}
                  onChange={(e) => setEditMeeting({ ...editMeeting, date: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-time">Hora</Label>
                <Input
                  id="edit-time"
                  type="time"
                  value={editMeeting.time}
                  onChange={(e) => setEditMeeting({ ...editMeeting, time: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-duration">Duración</Label>
                <Input
                  id="edit-duration"
                  placeholder="Ej: 1 hora"
                  value={editMeeting.duration}
                  onChange={(e) => setEditMeeting({ ...editMeeting, duration: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-meetingType">Tipo de Reunión</Label>
                <Select
                  value={editMeeting.meetingType}
                  onValueChange={(value) => setEditMeeting({ ...editMeeting, meetingType: value })}
                >
                  <SelectTrigger id="edit-meetingType">
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Videollamada">Videollamada</SelectItem>
                    <SelectItem value="Presencial">Presencial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {editMeeting.meetingType === "Presencial" ? (
              <div className="grid gap-2">
                <Label htmlFor="edit-address">Ubicación</Label>
                <Input
                  id="edit-address"
                  placeholder="Ej: Oficina Central, Sala de Juntas"
                  value={editMeeting.address}
                  onChange={(e) => setEditMeeting({ ...editMeeting, address: e.target.value })}
                />
              </div>
            ) : (
              <div className="grid gap-2">
                <Label htmlFor="edit-meetingLink">Enlace de la Reunión</Label>
                <Input
                  id="edit-meetingLink"
                  placeholder="Ej: https://meet.google.com/abc-defg-hij"
                  value={editMeeting.meetingLink}
                  onChange={(e) => setEditMeeting({ ...editMeeting, meetingLink: e.target.value })}
                />
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Descripción</Label>
              <Textarea
                id="edit-description"
                placeholder="Detalles adicionales sobre la reunión"
                value={editMeeting.description}
                onChange={(e) => setEditMeeting({ ...editMeeting, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEditMeeting}>
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Meeting Dialog */}
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

