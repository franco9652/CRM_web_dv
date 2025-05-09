"use client"

import type React from "react"

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
import { Building, Download, Eye, FileText, MoreHorizontal, Plus, Search, Upload } from "lucide-react"
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

// Datos de documentos de ejemplo
const initialDocuments = [
  {
    id: 1,
    name: "Torre Skyline - Planos de Planta",
    project: "Torre Skyline",
    category: "Planos",
    type: "PDF",
    size: "5.2 MB",
    uploadDate: "2024-03-15",
    uploadedBy: "Juan Pérez",
    status: "Aprobado",
  },
  {
    id: 2,
    name: "Complejo Riverside - Propuesta de Presupuesto",
    project: "Complejo Riverside",
    category: "Presupuesto",
    type: "XLSX",
    size: "1.8 MB",
    uploadDate: "2024-03-10",
    uploadedBy: "María López",
    status: "Pendiente",
  },
  {
    id: 3,
    name: "Parque Oficinas Metro - Especificaciones de Materiales",
    project: "Parque Oficinas Metro",
    category: "Especificaciones",
    type: "PDF",
    size: "3.5 MB",
    uploadDate: "2024-03-05",
    uploadedBy: "Carlos Rodríguez",
    status: "Aprobado",
  },
  {
    id: 4,
    name: "Torre Skyline - Cronograma de Construcción",
    project: "Torre Skyline",
    category: "Cronograma",
    type: "PDF",
    size: "2.1 MB",
    uploadDate: "2024-02-28",
    uploadedBy: "Ana Martínez",
    status: "Pendiente",
  },
  {
    id: 5,
    name: "Complejo Riverside - Maquetas de Diseño",
    project: "Complejo Riverside",
    category: "Diseño",
    type: "ZIP",
    size: "15.7 MB",
    uploadDate: "2024-02-20",
    uploadedBy: "Roberto Sánchez",
    status: "Aprobado",
  },
  {
    id: 6,
    name: "Residencias Sunset - Permisos Municipales",
    project: "Residencias Sunset",
    category: "Legal",
    type: "PDF",
    size: "4.3 MB",
    uploadDate: "2024-02-15",
    uploadedBy: "Laura Gómez",
    status: "Aprobado",
  },
]

// Proyectos disponibles para el selector
const availableProjects = [
  "Torre Skyline",
  "Complejo Riverside",
  "Parque Oficinas Metro",
  "Residencias Sunset",
  "Hotel Vista al Puerto",
]

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

export default function DocumentsPage() {
  const [documents, setDocuments] = useState(initialDocuments)
  const [searchTerm, setSearchTerm] = useState("")
  const [projectFilter, setProjectFilter] = useState("Todos")
  const [categoryFilter, setCategoryFilter] = useState("Todas")
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)

  const [newDocument, setNewDocument] = useState({
    name: "",
    project: "",
    category: "",
    description: "",
    file: null as File | null,
  })

  const filteredDocuments = documents.filter(
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
      case "Pendiente":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300"
      case "Rechazado":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  // Extraer proyectos únicos para el filtro
  const projects = ["Todos", ...Array.from(new Set(documents.map((doc) => doc.project)))]

  // Extraer categorías únicas para el filtro
  const categories = ["Todas", ...Array.from(new Set(documents.map((doc) => doc.category)))]

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

    const id = documents.length > 0 ? Math.max(...documents.map((d) => d.id)) + 1 : 1
    const now = new Date()

    const newDoc = {
      id,
      name: newDocument.name,
      project: newDocument.project,
      category: newDocument.category,
      type: newDocument.file.name.split(".").pop()?.toUpperCase() || "PDF",
      size: `${(newDocument.file.size / (1024 * 1024)).toFixed(1)} MB`,
      uploadDate: now.toISOString().split("T")[0],
      uploadedBy: "Juan Pérez", // Usuario actual
      status: "Pendiente",
    }

    setDocuments([newDoc, ...documents])
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
          <p className="text-muted-foreground">Gestiona todos los documentos relacionados con los proyectos.</p>
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
                Sube un nuevo documento al sistema. Los documentos pueden ser compartidos con clientes y colaboradores.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="doc-name">Nombre del Documento</Label>
                <Input
                  id="doc-name"
                  value={newDocument.name}
                  onChange={(e) => setNewDocument({ ...newDocument, name: e.target.value })}
                  placeholder="Ej: Torre Skyline - Planos de Planta"
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
                  Formatos aceptados: PDF, DOCX, XLSX, DWG, JPG, PNG, ZIP (máx. 50MB)
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
          <CardTitle>Gestión de Documentos</CardTitle>
          <CardDescription>Visualiza, organiza y comparte documentos con clientes y colaboradores.</CardDescription>
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
                  <TableHead className="hidden md:table-cell">Tamaño</TableHead>
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
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        {document.project}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{document.category}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex flex-col">
                        <span>{formatDate(document.uploadDate)}</span>
                        <span className="text-xs text-muted-foreground">{document.uploadedBy}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center gap-1">
                        <span>{document.type}</span>
                        <span className="text-xs text-muted-foreground">({document.size})</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(document.status)}`}
                      >
                        {document.status}
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
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            Ver Documento
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="mr-2 h-4 w-4" />
                            Descargar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Plus className="mr-2 h-4 w-4" />
                            Agregar Versión
                          </DropdownMenuItem>
                          <DropdownMenuItem>Compartir con Cliente</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600 focus:text-red-600">
                            Eliminar Documento
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredDocuments.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                      No se encontraron documentos. Intenta ajustar tu búsqueda o sube un nuevo documento.
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

