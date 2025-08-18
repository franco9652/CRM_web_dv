"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle2, Clock, Download, Eye, FileText, Search, Upload } from "lucide-react"
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
import { useAuth } from "@/components/auth-provider"
import { getWorks, getWorksByCustomerId, Work } from "@/services/works"
import { useToast } from "@/hooks/use-toast"
import { Customer, getCustomersByUserId } from "@/services/customers"

// Datos de documentos de ejemplo
const documents = [
  {
    id: 1,
    name: "Torre Skyline - Planos de Planta",
    project: "Torre Skyline",
    category: "Planos",
    type: "PDF",
    size: "5.2 MB",
    uploadDate: "2024-03-15",
    status: "Aprobado",
    requiresAction: false,
  },
  {
    id: 2,
    name: "Complejo Riverside - Propuesta de Presupuesto",
    project: "Complejo Riverside",
    category: "Presupuesto",
    type: "XLSX",
    size: "1.8 MB",
    uploadDate: "2024-03-10",
    status: "Pendiente de Aprobación",
    requiresAction: true,
  },
  {
    id: 3,
    name: "Parque Oficinas Metro - Especificaciones de Materiales",
    project: "Parque Oficinas Metro",
    category: "Especificaciones",
    type: "PDF",
    size: "3.5 MB",
    uploadDate: "2024-03-05",
    status: "Aprobado",
    requiresAction: false,
  },
  {
    id: 4,
    name: "Torre Skyline - Cronograma de Construcción",
    project: "Torre Skyline",
    category: "Cronograma",
    type: "PDF",
    size: "2.1 MB",
    uploadDate: "2024-02-28",
    status: "Pendiente de Aprobación",
    requiresAction: true,
  },
  {
    id: 5,
    name: "Complejo Riverside - Maquetas de Diseño",
    project: "Complejo Riverside",
    category: "Diseño",
    type: "ZIP",
    size: "15.7 MB",
    uploadDate: "2024-02-20",
    status: "Aprobado",
    requiresAction: false,
  },
]

// Proyectos disponibles para el selector
const availableProjects = ["Torre Skyline", "Complejo Riverside", "Parque Oficinas Metro"]

// Categorías disponibles para el selector
const availableCategories = [
  "Planos",
  "Presupuesto",
  "Especificaciones",
  "Cronograma",
  "Diseño",
  "Legal",
  "Contratos",
  "Informes",
]

export default function ClientDocumentsPage() {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const { user } = useAuth()
  const [works, setWorks] = useState<Work[]>([])
  const [worksError, setWorksError] = useState("")
  const [loadingWorks, setLoadingWorks] = useState(true)
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(true)
  const [customersError, setCustomersError] = useState("")
  const [projectFilter, setProjectFilter] = useState("Todos")
  const [categoryFilter, setCategoryFilter] = useState("Todas")
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [documentsList, setDocumentsList] = useState(documents)

    const fetchWorks = async () => {
      if (!user?.role) {
        setWorksError("No se encontró el rol del usuario actual")
        return
      }
      setLoadingWorks(true)
      setWorksError("")
      try {
        let data: any = []
        if (user.role === "admin") {
          // Obtener todos los proyectos para admin
          const response = await getWorks(1)
          data = response.works
        } else if (user.role === "client" || user.role === "customer" || user.role === "employee") {
          // Obtener solo los proyectos del cliente o empleado
          if (!user.id) throw new Error("ID de cliente no válido")
          const worksResult = await getWorksByCustomerId("678ac8bbcaa29603b2663cba")
          // const worksResult = await getWorksByCustomerId(user.id)
          data = worksResult as Work[]
        } else {
          throw new Error("Rol de usuario no soportado")
        }
        setWorks(data.works)
      } catch (err: any) {
        if(err?.status === 400){
          setWorksError(`"Error al cargar los proyectos. ID cliente erroneo"`)
        } else if (err?.status === 404){
          setWorksError("No se encontraron proyectos")
        } else {
          setWorksError("Error al cargar los proyectos")
        }
        toast({ title: "Error", description: err?.message || "No se pudieron cargar los trabajos", variant: "destructive" })
      } finally {
        setLoadingWorks(false)
      }
    }
  
    async function fetchData() {
      if (!user?.id) return
      try {
        const data = await getCustomersByUserId(user.id);
        setCustomers(data);
      } catch (err: any) {
        setCustomersError(err.message ?? "Error al obtener customers");
      } finally {
        setLoadingCustomers(false);
      }
    }
  
    useEffect(() => {
      fetchWorks()
      fetchData()
    }, [user?.id, user?.role])

  const [newDocument, setNewDocument] = useState({
    name: "",
    project: "",
    category: "",
    description: "",
    file: null as File | null,
  })

  const filteredDocuments = documentsList.filter(
    (document) =>
      (document.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        document.project.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (projectFilter === "Todos" || document.project === projectFilter) &&
      (categoryFilter === "Todas" || document.category === categoryFilter),
  )

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
      case "Aprobado":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "Pendiente de Aprobación":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300"
      case "Rechazado":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Aprobado":
        return <CheckCircle2 className="h-3 w-3" />
      case "Pendiente de Aprobación":
        return <Clock className="h-3 w-3" />
      default:
        return null
    }
  }

  // Extraer proyectos únicos para el filtro
  const projects = ["Todos", ...Array.from(new Set(documentsList.map((doc) => doc.project)))]

  // Extraer categorías únicas para el filtro
  const categories = ["Todas", ...Array.from(new Set(documentsList.map((doc) => doc.category)))]

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewDocument({ ...newDocument, file: e.target.files[0] })
    }
  }

  const handleUploadDocument = () => {
    if (!newDocument.name || !newDocument.project || !newDocument.category || !newDocument.file) {
      alert("Por favor complete todos los campos requeridos")
      return
    }

    const id = documentsList.length > 0 ? Math.max(...documentsList.map((d) => d.id)) + 1 : 1
    const now = new Date()

    const newDoc = {
      id,
      name: newDocument.name,
      project: newDocument.project,
      category: newDocument.category,
      type: newDocument.file.name.split(".").pop()?.toUpperCase() || "PDF",
      size: `${(newDocument.file.size / (1024 * 1024)).toFixed(1)} MB`,
      uploadDate: now.toISOString().split("T")[0],
      status: "Pendiente de Aprobación",
      requiresAction: false,
    }

    setDocumentsList([newDoc, ...documentsList])
    setNewDocument({
      name: "",
      project: "",
      category: "",
      description: "",
      file: null,
    })
    setIsUploadDialogOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Documentos</h1>
          <p className="text-muted-foreground">Accede a todos los documentos relacionados con tus proyectos.</p>
        </div>
        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Upload className="mr-2 h-4 w-4" />
              Subir Documento
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Subir Nuevo Documento</DialogTitle>
              <DialogDescription>
                Sube un nuevo documento para compartir con el equipo de construcción.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="doc-name">Nombre del Documento</Label>
                <Input
                  id="doc-name"
                  value={newDocument.name}
                  onChange={(e) => setNewDocument({ ...newDocument, name: e.target.value })}
                  placeholder="Ej: Aprobación de Materiales"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="doc-project">Proyecto</Label>
                  <Select
                    value={newDocument.project}
                    onValueChange={(value) => setNewDocument({ ...newDocument, project: value })}
                  >
                    <SelectTrigger id="doc-project">
                      <SelectValue placeholder="Seleccionar proyecto" />
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
                <div className="grid gap-2">
                  <Label htmlFor="doc-category">Categoría</Label>
                  <Select
                    value={newDocument.category}
                    onValueChange={(value) => setNewDocument({ ...newDocument, category: value })}
                  >
                    <SelectTrigger id="doc-category">
                      <SelectValue placeholder="Seleccionar categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="doc-description">Descripción (opcional)</Label>
                <Textarea
                  id="doc-description"
                  value={newDocument.description}
                  onChange={(e) => setNewDocument({ ...newDocument, description: e.target.value })}
                  placeholder="Breve descripción del contenido del documento"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="doc-file">Archivo</Label>
                <Input id="doc-file" type="file" onChange={handleFileChange} />
                <p className="text-xs text-muted-foreground">
                  Formatos aceptados: PDF, DOCX, XLSX, JPG, PNG, ZIP (máx. 50MB)
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleUploadDocument}>Subir Documento</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Documentos del Proyecto</CardTitle>
          <CardDescription>Visualiza y gestiona todos los documentos relacionados con tus proyectos.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar documentos..."
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
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filtrar por categoría" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Documento</TableHead>
                  <TableHead>Proyecto</TableHead>
                  <TableHead className="hidden md:table-cell">Categoría</TableHead>
                  <TableHead className="hidden md:table-cell">Subido</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDocuments.map((document) => (
                  <TableRow key={document.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        {document.name}
                      </div>
                      <div className="text-xs text-muted-foreground md:hidden">
                        {document.type} • {document.size}
                      </div>
                    </TableCell>
                    <TableCell>{document.project}</TableCell>
                    <TableCell className="hidden md:table-cell">{document.category}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex flex-col">
                        <span>{formatDate(document.uploadDate)}</span>
                        <span className="text-xs text-muted-foreground">
                          {document.type} • {document.size}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(document.status)}`}
                      >
                        {getStatusIcon(document.status)}
                        {document.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">Ver</span>
                        </Button>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                          <Download className="h-4 w-4" />
                          <span className="sr-only">Descargar</span>
                        </Button>
                        {document.requiresAction && <Button size="sm">Revisar</Button>}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredDocuments.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                      No se encontraron documentos. Intenta ajustar tu búsqueda.
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

