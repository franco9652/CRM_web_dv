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
import axios from "axios"

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

// Función para extraer documentos del cliente
const extractDocumentsFromCustomer = (customers: Customer[]): any[] => {
  if (!customers || customers.length === 0) return [];
  
  return customers.flatMap(customer => {
    if (!customer.documents || !Array.isArray(customer.documents)) return [];
    
    return customer.documents.map((doc: any) => {
      // Extraer el nombre del archivo de la URL
      const fileName = doc.name || doc.url.split('/').pop() || 'Documento';
      // Extraer la extensión para el tipo
      const fileExtension = fileName.split('.').pop()?.toUpperCase() || 'PDF';
      
      return {
        id: doc._id,
        name: fileName,
        project: customer.name, // Usar el nombre del cliente como proyecto
        category: 'Documento',
        type: fileExtension,
        size: 'N/A',
        uploadDate: doc.uploadedAt ? new Date(doc.uploadedAt).toISOString().split('T')[0] : 'Desconocida',
        status: 'Disponible',
        requiresAction: false,
        url: doc.url
      };
    });
  });
};

export default function ClientDocumentsPage() {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [token, setToken] = useState<string | null>(null)
  
  useEffect(() => {
    // Get token from localStorage
    const authToken = localStorage.getItem('token')
    if (authToken) {
      setToken(authToken)
    }
  }, [])
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
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [documentsList, setDocumentsList] = useState<any[]>([])
  const [availableProjects, setAvailableProjects] = useState<string[]>([])
  
  
  // Actualizar documentos cuando cambian los clientes
  useEffect(() => {
    if (customers && customers.length > 0) {
      const docs = extractDocumentsFromCustomer(customers);
      setDocumentsList(docs);
      
      // Actualizar la lista de proyectos disponibles (nombres de clientes)
      const customerNames = [...new Set(customers.map(customer => customer.name))];
      setAvailableProjects(customerNames);
    } else {
      setDocumentsList([]);
      setAvailableProjects([]);
    }
  }, [customers]);

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
          if (!user._id) throw new Error("ID de cliente no válido")
          const response = await getWorksByCustomerId(user._id)
          data = response.works || []
        } else {
          throw new Error("Rol de usuario no soportado")
        }
        setWorks(data)
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
        const response = await getCustomersByUserId(user.id);
        // Ensure we're setting the customers array correctly
        if (Array.isArray(response)) {
          setCustomers(response);
        } else if (response && Array.isArray(response.customer)) {
          setCustomers(response.customer);
        } else {
          setCustomers([]);
        }
      } catch (err: any) {
        setCustomersError(err?.message ?? "Error al obtener clientes");
      } finally {
        setLoadingCustomers(false);
      }
    }
  
    useEffect(() => {
      fetchWorks()
      fetchData()
    }, [user?.id, user?.role])

  const [newDocument, setNewDocument] = useState<{
    name: string;
    project: string;
    category: string;
    description: string;
    file: File | null;
  }>({
    name: "",
    project: "",
    category: "",
    description: "",
    file: null,
  })

  const filteredDocuments = documentsList.filter((document) => {
    if (!document) return false;
    
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = searchTerm === '' || 
      (document.name && document.name.toLowerCase().includes(searchLower)) ||
      (document.project && document.project.toLowerCase().includes(searchLower));
    
    const matchesProject = projectFilter === "Todos" || document.project === projectFilter;
    const matchesCategory = categoryFilter === "Todas" || document.category === categoryFilter;
    
    return matchesSearch && matchesProject && matchesCategory;
  })

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
  const projects = ["Todos", ...Array.from(new Set(documentsList.map((doc) => doc?.project).filter(Boolean)))]

  // Extraer categorías únicas para el filtro
  const categories = ["Todas", ...Array.from(new Set(documentsList.map((doc) => doc?.category).filter(Boolean)))]

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewDocument(prev => ({ ...prev, file: e.target.files![0] }));
    }
  };

  const handleDownload = async (url: string, fileName: string) => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Network response was not ok');
      
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      
      toast({
        title: "Descarga iniciada",
        description: `El archivo ${fileName} se está descargando.`,
      });
    } catch (error) {
      console.error('Error downloading file:', error);
      toast({
        title: "Error",
        description: "No se pudo descargar el archivo. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  };

  interface UploadResponse {
    message: string;
    document: {
      fileName: string;
      originalName: string;
      mimeType: string;
      size: number;
      url: string;
    };
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !user?._id) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Define the return type for the upload promise
      type UploadResult = {
        name: string;
        url: string;
        size: number;
        type: string;
      };

      const uploadPromises: Promise<UploadResult>[] = Array.from(files).map(async (file) => {
        const uploadData = new FormData();
        uploadData.append('file', file);
        
        // Use customerId for customers, otherwise use user._id
        const userId = user?.role === 'customer' ? user.customerId : user?._id;
        if (!userId) {
          throw new Error('ID de usuario o cliente no disponible');
        }
        uploadData.append('userId', userId);

        if (!token) {
          throw new Error('No se encontró el token de autenticación');
        }

        // Create axios config with proper types
        const config = {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          },
          onUploadProgress: (progressEvent: { loaded: number; total: number }) => {
            if (progressEvent.total) {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              setUploadProgress(percentCompleted);
            }
          }
        };

        try {
          const response = await axios.post<UploadResponse>(
            `${process.env.NEXT_PUBLIC_API_URL || 'https://crmdbsoft.zeabur.app'}/${userId}/upload`,
            uploadData,
            config as any // Type assertion to bypass the type checking
          );

          if (response.data?.document?.url) {
            return {
              name: file.name,
              url: response.data.document.url,
              size: file.size,
              type: file.type
            };
          }
          throw new Error('No se pudo obtener la URL del archivo subido');
        } catch (error) {
          console.error(`Error uploading file ${file.name}:`, error);
          throw error; // Re-throw to be caught by the outer catch
        }
      });

      // Wait for all uploads to complete
      const results = await Promise.allSettled(uploadPromises);
      
      // Check if any uploads failed
      const failedUploads = results.filter(result => result.status === 'rejected');
      if (failedUploads.length > 0) {
        console.error('Algunos archivos no se pudieron subir:', failedUploads);
        throw new Error(`No se pudieron subir ${failedUploads.length} de ${results.length} archivos`);
      }
      
      // Refresh documents list
      await fetchWorks();
      
      // Show success message
      toast({
        title: 'Éxito',
        description: 'Documento(s) subido(s) correctamente',
      });
      
      // Reset the file input
      if (e.target) {
        e.target.value = '';
      }
    } catch (error: any) {
      console.error('Error uploading document:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Error al subir el documento",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleUploadDocument = () => {
    const fileInput = document.getElementById('doc-file') as HTMLInputElement;
    if (fileInput && fileInput.files && fileInput.files.length > 0) {
      const event = { target: fileInput } as unknown as React.ChangeEvent<HTMLInputElement>;
      handleFileUpload(event);
    } else {
      toast({
        title: 'Error',
        description: 'Por favor seleccione al menos un archivo',
        variant: 'destructive',
      });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Documentos</h1>
          <p className="text-sm text-muted-foreground">Gestiona y revisa los documentos de tus proyectos</p>
        </div>
        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Upload className="mr-2 h-4 w-4" /> Subir Documento
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Subir nuevo documento</DialogTitle>
              <DialogDescription>
                Completa la información del documento que deseas subir.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="doc-name">Nombre del Documento</Label>
                <Input
                  id="doc-name"
                  value={newDocument.name}
                  onChange={(e) => setNewDocument({ ...newDocument, name: e.target.value })}
                  placeholder="Ej: Planos de planta baja"
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
                        <a 
                          href={document.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0"
                        >
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">Ver</span>
                        </a>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-8 w-8 p-0"
                          onClick={() => handleDownload(document.url, document.name)}
                        >
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

