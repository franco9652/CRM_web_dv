"use client"

import { useEffect, useState, useCallback } from "react"
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
import { 
  getAllMeetings, 
  createMeeting, 
  updateMeeting, 
  deleteMeeting, 
  type Meeting,
  type CreateMeetingData
} from "@/services/meetings"
import { getWorksByCustomerId, type WorksByCustomerResponse, type Work } from "@/services/works"
import { getAllCustomers, type Customer } from "@/services/customers"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"

// Local interface for the meeting form data, aligned with the Meeting interface
type MeetingFormData = Omit<Meeting, '_id' | 'createdAt' | 'updatedAt' | 'date'> & {
  date: Date;
  project: {
    _id: string;
    title: string;
    name: string;
    ID: string;
    userId: string[];
  };
  customer: {
    _id: string;
    name: string;
    email: string;
  };
};

export default function CalendarPage() {
  const { user } = useAuth();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [customers, setCustomers] = useState<Array<{
    _id: string;
    name: string;
    email: string;
  }>>([]);

  const [projects, setProjects] = useState<Array<{
    _id: string;
    title: string;
    name: string;
    ID: string;
    userId: string[];
  }>>([]);
  const [customerProjects, setCustomerProjects] = useState<Array<{
    _id: string;
    name: string;
    title: string;
    ID: string;
    userId: string[];
  }>>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);

  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [customerFilter, setCustomerFilter] = useState("Todos");
  const [typeFilter, setTypeFilter] = useState("Todos");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);

  // Form state for adding/editing a meeting
  const [newMeeting, setNewMeeting] = useState<MeetingFormData>({
    title: '',
    customer: {
      _id: '',
      name: '',
      email: ''
    },
    project: {
      _id: '',
      title: '',
      name: '',
      ID: '',
      userId: []
    },
    date: new Date(),
    time: '',
    duration: '',
    meetingType: 'Presencial',
    description: '',
    status: 'scheduled'
  });

  // Fetch all customers
  const fetchCustomers = useCallback(async () => {
    try {
      const allCustomers = await getAllCustomers();

      // Map to the expected format for the calendar
      setCustomers(allCustomers.map(customer => ({
        _id: customer._id,
        name: customer.name,
        email: customer.email || '',
        phone: customer.phone || (customer as any).contactNumber || '',
        address: customer.address || ''
      })));
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  }, []);

  // Fetch meetings and projects on component mount
  useEffect(() => {
    const fetchAndProcessMeetings = async () => {
      try {
        setLoading(true);
        const response = await getAllMeetings();
        const fetchedMeetings = response.meetings || [];
        setMeetings(fetchedMeetings);

        // Derive unique projects from meetings
        const uniqueProjects = new Map<string, Meeting['project']>();
        fetchedMeetings.forEach(meeting => {
          if (meeting.project?._id) {
            uniqueProjects.set(meeting.project._id, meeting.project);
          }
        });
        setProjects(Array.from(uniqueProjects.values()));

      } catch (error) {
        console.error('Error fetching meetings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
    fetchAndProcessMeetings();
  }, [fetchCustomers]);

  // Filter meetings based on search term, customer, and meeting type
  const filteredMeetings = meetings.filter((meeting) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      (meeting.title?.toLowerCase() || '').includes(searchLower) ||
      (meeting.customer?.name?.toLowerCase() || '').includes(searchLower) ||
      (meeting.project?.title?.toLowerCase() || '').includes(searchLower);

    const matchesCustomer = customerFilter === "Todos" || meeting.customer?.name === customerFilter;
    const matchesType = typeFilter === "Todos" || meeting.meetingType === typeFilter;

    return matchesSearch && matchesCustomer && matchesType;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredMeetings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedMeetings = filteredMeetings.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Format date for display
  const formatDate = (date: Date | string) => {
    const dateObj = date instanceof Date ? date : new Date(date);
    return new Intl.DateTimeFormat("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(dateObj)
  }

  const fetchMeetingsAndUpdateState = async () => {
    const response = await getAllMeetings();
    setMeetings(response.meetings || []);
  };

  // Handle adding a new meeting
  const handleAddMeeting = async () => {
    if (!newMeeting.customer._id || !newMeeting.project._id) {
      toast({
        title: "Error",
        description: "Por favor selecciona un cliente y un proyecto.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Prepare data for API - send only IDs for customer and project, and fix meeting type values
      const meetingDataForApi: CreateMeetingData = {
        title: newMeeting.title,
        customer: newMeeting.customer._id, // Send only the ID
        project: newMeeting.project._id,   // Send only the ID
        date: newMeeting.date,
        time: newMeeting.time,
        duration: newMeeting.duration,
        meetingType: newMeeting.meetingType === "Videollamada" ? "virtual" : "presencial", // Convert to backend values
        meetingLink: newMeeting.meetingType === "Videollamada" ? newMeeting.meetingLink : undefined,
        address: newMeeting.meetingType === "Presencial" ? newMeeting.address : undefined,
        description: newMeeting.description,
      };
      
      await createMeeting(meetingDataForApi);
      await fetchMeetingsAndUpdateState();

      toast({
        title: "Reunión creada",
        description: "La reunión se ha creado correctamente.",
        variant: "default",
      });

      resetForm();
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error('Error adding meeting:', error);
      toast({
        title: "Error",
        description: "No se pudo crear la reunión. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  }

  // Handle editing a meeting
  const { toast } = useToast();

  const handleEditMeeting = async () => {
    if (!selectedMeeting?._id) return;

    try {
      // Prepare data for API - send only IDs for customer and project, and fix meeting type values
      const meetingDataForApi: Partial<CreateMeetingData> = {
        title: newMeeting.title,
        customer: newMeeting.customer._id, // Send only the ID
        project: newMeeting.project._id,   // Send only the ID
        date: newMeeting.date,
        time: newMeeting.time,
        duration: newMeeting.duration,
        meetingType: newMeeting.meetingType === "Videollamada" ? "virtual" : "presencial", // Convert to backend values
        meetingLink: newMeeting.meetingType === "Videollamada" ? newMeeting.meetingLink : undefined,
        address: newMeeting.meetingType === "Presencial" ? newMeeting.address : undefined,
        description: newMeeting.description,
      };
      
      await updateMeeting(selectedMeeting._id, meetingDataForApi);
      await fetchMeetingsAndUpdateState();

      resetForm();
      setIsEditDialogOpen(false);

      toast({
        title: "Reunión actualizada",
        description: "La reunión se ha actualizado correctamente.",
        variant: "default",
      });
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
      await fetchMeetingsAndUpdateState();

      setSelectedMeeting(null);
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting meeting:', error);
    }
  }

  // Reset the form to initial state
  const resetForm = () => {
    setNewMeeting({
      title: '',
      customer: {
        _id: '',
        name: '',
        email: ''
      },
      project: {
        _id: '',
        title: '',
        name: '',
        ID: '',
        userId: []
      },
      date: new Date(),
      time: '',
      duration: '',
      meetingType: 'Presencial',
      description: '',
      status: 'scheduled'
    });
    setSelectedMeeting(null);
    setCustomerProjects([]);
  }

  // Fetch projects when customer changes
  const fetchCustomerProjects = async (customerId: string) => {
    if (!customerId) return;
    setLoadingProjects(true);
    try {
      const response = await getWorksByCustomerId(customerId);
      if (response && response.works) {
        setCustomerProjects(response.works.map(work => ({
          _id: work._id,
          name: work.name || work.title || 'Sin nombre',
          title: work.title || work.name || 'Sin título',
          ID: work.ID || '',
          userId: work.userId || []
        })));
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      setCustomerProjects([]);
    } finally {
      setLoadingProjects(false);
    }
  };

  const handleCustomerChange = (customerId: string) => {
    const selectedCustomer = customers.find(c => c._id === customerId);
    if (selectedCustomer) {
      setNewMeeting(prev => ({
        ...prev,
        customer: {
          _id: selectedCustomer._id,
          name: selectedCustomer.name,
          email: selectedCustomer.email || ''
        },
        project: {
          _id: '',
          title: '',
          name: '',
          ID: '',
          userId: []
        }
      }));
      fetchCustomerProjects(customerId);
    }
  };

  // Handle opening the edit dialog
  const openEditDialog = async (meeting: Meeting) => {
    setSelectedMeeting(meeting);

    // If there's a customer, load their projects first
    if (meeting.customer?._id) {
      setLoadingProjects(true);
      try {
        // Fetch projects for the customer
        const response = await getWorksByCustomerId(meeting.customer._id);
        const projects = response.works.map(work => ({
          _id: work._id,
          name: work.name || work.title || 'Sin nombre',
          title: work.title || work.name || 'Sin título',
          ID: work.ID || '',
          userId: work.userId || []
        }));

        setCustomerProjects(projects);

        // Find the current project in the fetched projects
        const currentProject = projects.find(p => p._id === meeting.project?._id);

        // Update the form with the meeting data and ensure the project is set correctly
        setNewMeeting({
          title: meeting.title,
          customer: {
            _id: meeting.customer._id,
            name: meeting.customer.name,
            email: meeting.customer.email || ''
          },
          project: currentProject ? {
            _id: currentProject._id,
            title: currentProject.title || currentProject.name || 'Sin título',
            name: currentProject.name || currentProject.title || 'Sin nombre',
            ID: currentProject.ID || '',
            userId: currentProject.userId || []
          } : { _id: "", title: "", name: "", ID: "", userId: [] },
          date: new Date(meeting.date),
          time: meeting.time || '',
          duration: meeting.duration || '',
          meetingType: meeting.meetingType === 'virtual' ? 'Videollamada' : 'Presencial',
          description: meeting.description || '',
          status: meeting.status || 'scheduled',
          meetingLink: meeting.meetingLink || '',
          address: meeting.address || '',
          participants: meeting.participants || [],
          location: meeting.location || '',
          link: meeting.link || '',
          type: meeting.type || '',
          attendees: meeting.attendees
        });

      } catch (error) {
        console.error('Error fetching projects:', error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los proyectos del cliente.",
          variant: "destructive",
        });

        // Still set the meeting data even if projects fail to load
        setNewMeeting({
          title: meeting.title,
          customer: {
            _id: meeting.customer._id,
            name: meeting.customer.name,
            email: meeting.customer.email || ''
          },
          project: meeting.project || {
            _id: "",
            title: "",
            name: "",
            ID: "",
            userId: []
          },
          date: new Date(meeting.date),
          time: meeting.time || '',
          duration: meeting.duration || '',
          meetingType: meeting.meetingType === 'virtual' ? 'Videollamada' : 'Presencial',
          description: meeting.description || '',
          status: meeting.status || 'scheduled',
          meetingLink: meeting.meetingLink || '',
          address: meeting.address || '',
          participants: meeting.participants || [],
          location: meeting.location || '',
          link: meeting.link || '',
          type: meeting.type || '',
          attendees: meeting.attendees
        });
      } finally {
        setLoadingProjects(false);
      }
    } else {
      // If no customer ID, just set the meeting data
      setNewMeeting({
        title: meeting.title,
        customer: {
          _id: meeting.customer._id,
          name: meeting.customer.name,
          email: meeting.customer.email || ''
        },
        project: meeting.project || {
          _id: "",
          title: "",
          name: "",
          ID: "",
          userId: []
        },
        date: new Date(meeting.date),
        time: meeting.time || '',
        duration: meeting.duration || '',
        meetingType: meeting.meetingType === 'virtual' ? 'Videollamada' : 'Presencial',
        description: meeting.description || '',
        status: meeting.status || 'scheduled',
        meetingLink: meeting.meetingLink || '',
        address: meeting.address || '',
        participants: meeting.participants || [],
        location: meeting.location || '',
        link: meeting.link || '',
        type: meeting.type || '',
        attendees: meeting.attendees
      });
    }
    setIsEditDialogOpen(true);
  };

  // Handle opening the delete dialog
  const openDeleteDialog = (meeting: Meeting) => {
    setSelectedMeeting(meeting);
    setIsDeleteDialogOpen(true);
  };

  const getProjectsForCustomer = (customerId: string) => {
    return meetings
      .filter(m => m.customer?._id === customerId)
      .filter((m, index, self) => index === self.findIndex(t => t.project?._id === m.project?._id))
      .map(m => m?.project);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Calendario</h1>
          <p className="text-muted-foreground">Gestiona todas las reuniones y eventos programados.</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={(isOpen) => { setIsAddDialogOpen(isOpen); if (!isOpen) resetForm(); }}>
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
                Completa el formulario para programar una nueva reunión.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Título de la Reunión</Label>
                <Input id="title" value={newMeeting.title} onChange={(e) => setNewMeeting({ ...newMeeting, title: e.target.value })} placeholder="Ej: Revisión de Diseño" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="customer">Cliente</Label>
                <Select
                  value={newMeeting.customer._id}
                  onValueChange={handleCustomerChange}
                >
                  <SelectTrigger id="customer">
                    <SelectValue placeholder="Seleccionar cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer._id} value={customer._id}>
                        {customer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="project">Proyecto</Label>
                <Select
                  value={newMeeting.project._id}
                  onValueChange={(value) => {
                    const selectedProject = customerProjects.find(p => p._id === value);
                    if (selectedProject) {
                      setNewMeeting(prev => ({
                        ...prev,
                        project: {
                          _id: selectedProject._id,
                          title: selectedProject.title || selectedProject.name || 'Sin título',
                          name: selectedProject.name || selectedProject.title || 'Sin nombre',
                          ID: selectedProject.ID || '',
                          userId: selectedProject.userId || []
                        }
                      }));
                    }
                  }}
                  disabled={!newMeeting.customer._id || loadingProjects}
                >
                  <SelectTrigger id="project">
                    {loadingProjects ? (
                      <span className="text-muted-foreground">Cargando proyectos...</span>
                    ) : !newMeeting.customer._id ? (
                      <span className="text-muted-foreground">Seleccione un cliente primero</span>
                    ) : customerProjects.length === 0 ? (
                      <span className="text-muted-foreground">No hay proyectos disponibles</span>
                    ) : (
                      <SelectValue placeholder="Seleccionar proyecto" />
                    )}
                  </SelectTrigger>
                  <SelectContent>
                    {Array.isArray(customerProjects) && customerProjects.map((project) => (
                      project && project._id ? (
                        <SelectItem key={project._id} value={project._id}>
                          {project.name || 'Sin nombre'}
                        </SelectItem>
                      ) : null
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="date">Fecha</Label>
                  <Input id="date" type="date" value={newMeeting.date.toISOString().split('T')[0]} onChange={(e) => setNewMeeting({ ...newMeeting, date: new Date(e.target.value) })} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="time">Hora</Label>
                  <Input id="time" type="time" value={newMeeting.time} onChange={(e) => setNewMeeting({ ...newMeeting, time: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="duration">Duración</Label>
                  <Input id="duration" placeholder="Ej: 1 hora" value={newMeeting.duration} onChange={(e) => setNewMeeting({ ...newMeeting, duration: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="meetingType">Tipo de Reunión</Label>
                  <Select value={newMeeting.meetingType} onValueChange={(value) => setNewMeeting({ ...newMeeting, meetingType: value })}>
                    <SelectTrigger id="meetingType"><SelectValue placeholder="Seleccionar tipo" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Videollamada">Videollamada</SelectItem>
                      <SelectItem value="Presencial">Presencial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {newMeeting.meetingType === "Presencial" ? (
                <div className="grid gap-2">
                  <Label htmlFor="address">Ubicación</Label>
                  <Input id="address" placeholder="Ej: Oficina Central, Sala de Juntas" value={newMeeting.address} onChange={(e) => setNewMeeting({ ...newMeeting, address: e.target.value })} />
                </div>
              ) : (
                <div className="grid gap-2">
                  <Label htmlFor="meetingLink">Enlace de la Reunión</Label>
                  <Input id="meetingLink" placeholder="Ej: https://meet.google.com/abc-defg-hij" value={newMeeting.meetingLink} onChange={(e) => setNewMeeting({ ...newMeeting, meetingLink: e.target.value })} />
                </div>
              )}
              <div className="grid gap-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea id="description" placeholder="Detalles adicionales sobre la reunión" value={newMeeting.description} onChange={(e) => setNewMeeting({ ...newMeeting, description: e.target.value })} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleAddMeeting}>Programar Reunión</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Reuniones Programadas</CardTitle>
          <CardDescription>Visualiza y gestiona todas las reuniones.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Buscar reuniones..." className="pl-8" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <Select value={customerFilter} onValueChange={setCustomerFilter}>
              <SelectTrigger className="w-full md:w-[180px]"><SelectValue placeholder="Filtrar por cliente" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Todos">Todos los Clientes</SelectItem>
                {customers.map((customer) => (
                  <SelectItem key={customer._id} value={customer.name}>{customer.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-[180px]"><SelectValue placeholder="Filtrar por tipo" /></SelectTrigger>
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
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow key="loading">
                    <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                      Cargando reuniones...
                    </TableCell>
                  </TableRow>
                ) : paginatedMeetings.length > 0 ? (
                  paginatedMeetings.map((meeting) => { return (
                  <TableRow key={meeting._id}>
                    <TableCell className="font-medium">
                      <div>{meeting.title}</div>
                      <div className="text-xs text-muted-foreground">{meeting.description?.substring(0, 50) ?? ''}...</div>
                    </TableCell>
                    <TableCell>
                      <div>{meeting?.project?.name}</div>
                      <div className="text-xs text-muted-foreground">{meeting?.customer?.name}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span>{formatDate(meeting.date)}</span>
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
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="sm"><MoreHorizontal className="h-4 w-4" /><span className="sr-only">Abrir menú</span></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => openEditDialog(meeting)}><Edit className="mr-2 h-4 w-4" />Editar Reunión</DropdownMenuItem>
                          {meeting.meetingType === "Videollamada" && meeting.meetingLink && (
                            <DropdownMenuItem onClick={() => window.open(meeting.meetingLink, "_blank")}><Video className="mr-2 h-4 w-4" />Unirse a la Reunión</DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={() => openDeleteDialog(meeting)}><Trash className="mr-2 h-4 w-4" />Cancelar Reunión</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                  )})
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                      No se encontraron reuniones.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4">
                <div className="text-sm text-muted-foreground">
                  Mostrando {Math.min(startIndex + 1, filteredMeetings.length)}-{Math.min(startIndex + itemsPerPage, filteredMeetings.length)} de {filteredMeetings.length} reuniones
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Anterior
                  </Button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    // Show first 2 pages, current page, and last 2 pages
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* DIALOGS (Edit and Delete) */}
      <Dialog open={isEditDialogOpen} onOpenChange={(isOpen) => { setIsEditDialogOpen(isOpen); if (!isOpen) resetForm(); }}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Editar Reunión</DialogTitle>
            <DialogDescription>Modifica los detalles de la reunión programada.</DialogDescription>
          </DialogHeader>
           {/* Form content is identical to Add Dialog, just pre-filled */}
           <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-title">Título de la Reunión</Label>
                <Input id="edit-title" value={newMeeting.title} onChange={(e) => setNewMeeting({ ...newMeeting, title: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-customer">Cliente</Label>
                <Select value={newMeeting.customer._id} onValueChange={(value) => {
                  const selectedCustomer = customers.find(c => c._id === value);
                  if (selectedCustomer) setNewMeeting(prev => ({ 
                    ...prev, 
                    customer: selectedCustomer, 
                    project: { _id: "", title: "", name: "", ID: "", userId: [] } 
                  }));
                }}>
                  <SelectTrigger id="edit-customer"><SelectValue placeholder="Seleccionar cliente" /></SelectTrigger>
                  <SelectContent>{customers.map((customer) => (<SelectItem key={customer._id} value={customer._id}>{customer.name}</SelectItem>))}</SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-project">Proyecto</Label>
                <Select 
                  value={newMeeting.project._id} 
                  onValueChange={(value) => {
                    const selectedProject = customerProjects.find(p => p._id === value);
                    if (selectedProject) {
                      setNewMeeting(prev => ({
                        ...prev, 
                        project: { 
                          _id: selectedProject._id, 
                          title: selectedProject.title || selectedProject.name || 'Sin título',
                          name: selectedProject.name || selectedProject.title || 'Sin nombre',
                          ID: selectedProject.ID || '',
                          userId: selectedProject.userId || []
                        }
                      }));
                    }
                  }} 
                  disabled={!newMeeting.customer._id || loadingProjects}
                >
                  <SelectTrigger id="edit-project">
                    {loadingProjects ? (
                      <span className="text-muted-foreground">Cargando proyectos...</span>
                    ) : !newMeeting.customer._id ? (
                      <span className="text-muted-foreground">Seleccione un cliente primero</span>
                    ) : customerProjects.length === 0 ? (
                      <span className="text-muted-foreground">No hay proyectos disponibles</span>
                    ) : (
                      <SelectValue placeholder="Seleccionar proyecto" />
                    )}
                  </SelectTrigger>
                  <SelectContent>
                    {customerProjects.map((project) => (
                      <SelectItem key={project._id} value={project._id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-date">Fecha</Label>
                  <Input id="edit-date" type="date" value={newMeeting.date.toISOString().split('T')[0]} onChange={(e) => setNewMeeting({ ...newMeeting, date: new Date(e.target.value) })} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-time">Hora</Label>
                  <Input id="edit-time" type="time" value={newMeeting.time} onChange={(e) => setNewMeeting({ ...newMeeting, time: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-duration">Duración</Label>
                  <Input id="edit-duration" value={newMeeting.duration} onChange={(e) => setNewMeeting({ ...newMeeting, duration: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-meetingType">Tipo de Reunión</Label>
                  <Select value={newMeeting.meetingType} onValueChange={(value) => setNewMeeting({ ...newMeeting, meetingType: value })}>
                    <SelectTrigger id="edit-meetingType"><SelectValue placeholder="Seleccionar tipo" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Videollamada">Videollamada</SelectItem>
                      <SelectItem value="Presencial">Presencial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {newMeeting.meetingType === "Presencial" ? (
                <div className="grid gap-2">
                  <Label htmlFor="edit-address">Ubicación</Label>
                  <Input id="edit-address" value={newMeeting.address} onChange={(e) => setNewMeeting({ ...newMeeting, address: e.target.value })} />
                </div>
              ) : (
                <div className="grid gap-2">
                  <Label htmlFor="edit-meetingLink">Enlace de la Reunión</Label>
                  <Input id="edit-meetingLink" value={newMeeting.meetingLink} onChange={(e) => setNewMeeting({ ...newMeeting, meetingLink: e.target.value })} />
                </div>
              )}
              <div className="grid gap-2">
                <Label htmlFor="edit-description">Descripción</Label>
                <Textarea id="edit-description" value={newMeeting.description} onChange={(e) => setNewMeeting({ ...newMeeting, description: e.target.value })} />
              </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleEditMeeting}>Guardar Cambios</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelar Reunión</DialogTitle>
            <DialogDescription>¿Estás seguro de que deseas cancelar esta reunión? Esta acción no se puede deshacer.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>No, Mantener</Button>
            <Button variant="destructive" onClick={handleDeleteMeeting}>Sí, Cancelar Reunión</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}