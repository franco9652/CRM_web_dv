"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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
import { Building, Calendar, ClipboardList, MoreHorizontal, Plus, Search } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { getWorks, Work } from "@/services/works"

// Estados de los proyectos
const projectStatus = [
  { value: "Todos", label: "Todos los Estados" },
  { value: "Planificación", label: "Planificación" },
  { value: "En Progreso", label: "En Progreso" },
  { value: "En Pausa", label: "En Pausa" },
  { value: "Completado", label: "Completado" },
]

export default function ProjectsPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("Todos")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<number | null>(null)
  const [newMilestone, setNewMilestone] = useState({
    date: "",
    description: "",
  })
  const [projects, setProjects] = useState<Work[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    setLoading(true)
    getWorks(page)
      .then((data) => {
        setProjects(data.works)
        setTotalPages(data.totalPages)
        setLoading(false)
      })
      .catch((err) => {
        setError("Error al cargar los trabajos")
        setLoading(false)
      })
  }, [page])

  const filteredProjects = projects.filter(
    (project) =>
      (project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (project.customerName || "").toLowerCase().includes(searchTerm.toLowerCase())) &&
      (statusFilter === "Todos" || project.statusWork === statusFilter),
  )

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date)
  }

  const getStatusColor = (status?: string) => {
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

  const navigateToProjectDetails = (projectId: string) => {
    router.push(`/admin/projects/${projectId}`)
  }

  const navigateToAddMilestone = (projectId: string) => {
    router.push(`/admin/projects/${projectId}/milestones`)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Proyectos</h1>
          <p className="text-muted-foreground">Gestiona todos tus proyectos de construcción en un solo lugar.</p>
        </div>
        <Button onClick={() => router.push("/admin/projects/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Proyecto
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gestión de Proyectos</CardTitle>
          <CardDescription>Ver y gestionar todos los proyectos de construcción.</CardDescription>
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
                {projectStatus.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {loading ? (
            <div className="text-center py-8">Cargando trabajos...</div>
          ) : error ? (
            <div className="text-center text-red-500 py-8">{error}</div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre del Proyecto</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Cronograma</TableHead>
                      <TableHead>Presupuesto</TableHead>
                      <TableHead>Progreso</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProjects.map((project) => (
                      <TableRow key={project._id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4 text-muted-foreground" />
                            {project.name}
                          </div>
                        </TableCell>
                        <TableCell>{project.customerName || '-'}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <span>{formatDate(project.startDate ?? "")}</span>
                            <span className="mx-1">-</span>
                            <span>{formatDate(project.endDate ?? "")}</span>
                          </div>
                        </TableCell>
                        <TableCell>{typeof project.budget === 'number' ? `$${project.budget.toLocaleString()}` : '-'}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={project.progress || 0} className="h-2 w-[60px]" />
                            <span className="text-xs">{project.progress || 0}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(project.statusWork)}`}>
                            {project.statusWork || '-'}
                          </span>
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
                              <DropdownMenuItem onClick={() => navigateToProjectDetails(project._id)}>
                                Ver Detalles
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => router.push(`/admin/projects/${project._id}/edit`)}>
                                Editar Proyecto
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => navigateToAddMilestone(project._id)}>
                                <ClipboardList className="mr-2 h-4 w-4" />
                                Agregar Hito
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => router.push(`/admin/projects/${project._id}/milestones`)}>
                                Ver Hitos
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => router.push(`/admin/projects/${project._id}/budget`)}>
                                Gestionar Presupuesto
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => router.push(`/admin/projects/${project._id}/documents`)}>
                                Ver Documentos
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => router.push(`/admin/projects/${project._id}/schedule`)}>
                                Programar Reunión
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredProjects.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                          No se encontraron proyectos. Intenta ajustar tu búsqueda o crear un nuevo proyecto.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
