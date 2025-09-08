"use client"

import { useState, useEffect, useMemo } from "react"
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
import { Building, Calendar, ClipboardList, Loader2, MoreHorizontal, Plus, Search } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { getAllWorks, getWorks, Work } from "@/services/works"

// Estados de los proyectos
const projectStatus = [
  { value: "Todos", label: "Todos los Estados" },
  { value: "activo", label: "Activo" },
  { value: "En progreso", label: "En Progreso" },
  { value: "inactivo", label: "Inactivo" },
]

export default function ProjectsPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("Todos")
  const [projects, setProjects] = useState<Work[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    setLoading(true)
    getAllWorks()
      .then((data) => {
        setProjects(data)
        setLoading(false)
      })
      .catch(() => {
        setError("Error al cargar los trabajos")
        setLoading(false)
      })
  }, [])

  const filteredProjects = useMemo(() => 
    projects.filter(
      (project) =>
        (project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (project.customerName || "").toLowerCase().includes(searchTerm.toLowerCase())) &&
        (statusFilter === "Todos" || project.statusWork === statusFilter)
    ),
    [projects, searchTerm, statusFilter]
  )

  // Pagination logic
  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage)
  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredProjects.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredProjects, currentPage, itemsPerPage])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const formatDate = (dateString?: string | null) => {
    // Validar que la fecha existe y no está vacía
    if (!dateString || dateString.trim() === '') {
      return '-';
    }
  
    try {
      const date = new Date(dateString);
      
      // Verificar que la fecha es válida
      if (isNaN(date.getTime())) {
        console.warn(`Fecha inválida recibida: ${dateString}`);
        return '-';
      }
  
      return new Intl.DateTimeFormat("es-ES", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }).format(date);
    } catch (error) {
      console.error(`Error al formatear fecha: ${dateString}`, error);
      return '-';
    }
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
            <CardContent>
              <div className="flex items-center justify-center h-[50vh]">
                <div className="text-center py-8 flex justify-center items-center p-6">
                  <Loader2 className="animate-spin text-primary" size={24} />
                  <p className="px-6">Cargando proyectos...</p>          
                </div>
              </div>
            </CardContent>
          ) : error ? (
            <CardContent>
              <div className="text-center text-red-500 py-8">{error}</div>
            </CardContent>
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
                      <TableHead>Estado</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentItems.map((project) => (
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
                            {project.startDate ? (
                              <>
                                <span>{formatDate(project.startDate)}</span>
                                {project.endDate && (
                                  <>
                                    <span className="mx-1">-</span>
                                    <span>{formatDate(project.endDate)}</span>
                                  </>
                                )}
                                {!project.endDate && (
                                  <span className="text-muted-foreground ml-1">(sin fecha fin)</span>
                                )}
                              </>
                            ) : (
                              <span className="text-muted-foreground">Sin fecha de inicio</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{typeof project.budget === 'number' ? `$${project.budget.toLocaleString()}` : '-'}</TableCell>
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
                              <DropdownMenuItem onClick={() => router.push(`/admin/projects/${project._id}/budget`)}>
                                Gestionar Presupuesto
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => navigateToProjectDetails(project._id)}>
                                Ver Documentos
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => router.push(`/admin/calendar`)}>
                                Programar Reunión
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredProjects.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                          No se encontraron proyectos. Intenta ajustar tu búsqueda o crear un nuevo proyecto.
                        </TableCell>
                      </TableRow>
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-4">
                          <div className="flex items-center justify-between">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handlePageChange(currentPage - 1)}
                              disabled={currentPage === 1}
                            >
                              Anterior
                            </Button>
                            <span className="text-sm text-muted-foreground">
                              Página {currentPage} de {totalPages}
                            </span>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handlePageChange(currentPage + 1)}
                              disabled={currentPage === totalPages || totalPages === 0}
                            >
                              Siguiente
                            </Button>
                          </div>
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
