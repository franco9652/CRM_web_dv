"use client"

import type React from "react"

import { useCallback, useEffect, useState } from "react"
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
  
  // Estados para el formulario de subida
  const [documentFile, setDocumentFile] = useState<File | null>(null)
  const [documentProject, setDocumentProject] = useState("")
  const [documentProjectId, setDocumentProjectId] = useState("")
  const [documentCategory, setDocumentCategory] = useState("")
  const [documentName, setDocumentName] = useState("")
  const [documentDescription, setDocumentDescription] = useState("")
  
  // Actualizar documentos cuando cambian los clientes
  useEffect(() => {
    if (customers && customers.length > 0) {
      const docs = extractDocumentsFromCustomer(customers);
      setDocumentsList(docs);
    } else {
      setDocumentsList([]);
    }
  }, [customers]);

    const fetchWorks = async (customerId: string) => {
      if (!customerId) {
        setWorks([]);
        return;
      }
      
      setLoadingWorks(true);
      setWorksError("");
      try {
        const response = await getWorksByCustomerId(customerId);
        const data = response.works || [];
        setWorks(data);
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
      // Only fetch customers initially, works will be fetched when a customer is selected
      fetchData()
    }, [user?.id, user?.role])
    
    // When customers are loaded, select the first one by default if there's only one
    useEffect(() => {
      if (customers.length === 1 && !selectedCustomerId) {
        setSelectedCustomerId(customers[0]._id);
        fetchWorks(customers[0]._id);
      }
    }, [customers]);

  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");

  // Handle customer selection change
  const handleCustomerChange = useCallback((customerId: string) => {
    setSelectedCustomerId(customerId);
    setDocumentProjectId("");
    setDocumentProject("");
    fetchWorks(customerId);
  }, [user?.role]);

  // Memoized handlers
  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setDocumentName(e.target.value);
  }, []);
  
  const handleProjectChange = useCallback((value: string) => {
    const selectedWork = works.find(work => work._id === value);
    setDocumentProject(selectedWork?.name || '');
    setDocumentProjectId(value);
  }, [works]);
  
  const handleCategoryChange = useCallback((value: string) => {
    setDocumentCategory(value);
  }, []);
  
  const handleDescriptionChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDocumentDescription(e.target.value);
  }, []);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setDocumentFile(files[0]);
      // Update the document name if it's not set
      if (!documentName && files[0].name) {
        const fileName = files[0].name.split('.').slice(0, -1).join('.');
        setDocumentName(fileName);
      }
    }
  };

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
    
    // Prepare newDocument object from individual state values
    const newDocument = {
      name: documentName,
      project: documentProject,
      projectId: documentProjectId,
      category: documentCategory,
      description: documentDescription,
      file: documentFile,
    };

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
        
        // Add workId to the form data if available
        if (newDocument.projectId) {
          uploadData.append('workId', newDocument.projectId);
        }

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
      await fetchWorks(selectedCustomerId);
      
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

  const handleUploadDocument = useCallback(async () => {
    if (!documentProjectId) {
      toast({
        title: 'Error',
        description: 'Por favor seleccione un proyecto',
        variant: 'destructive',
      });
      return;
    }
    
    if (!documentFile) {
      toast({
        title: 'Error',
        description: 'Por favor seleccione un archivo',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);
      
      const formData = new FormData();
      formData.append('file', documentFile);
      
      const userId = user?.role === 'customer' ? user.customerId : user?._id;
      if (!userId) {
        throw new Error('ID de usuario o cliente no disponible');
      }
      
      formData.append('userId', userId);
      formData.append('workId', documentProjectId);
      
      if (documentName) formData.append('name', documentName);
      if (documentCategory) formData.append('category', documentCategory);
      if (documentDescription) formData.append('description', documentDescription);
      
      // Create a custom config with proper types
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      };

      // Add upload progress handler
      const progressHandler = (progressEvent: ProgressEvent) => {
        if (progressEvent.lengthComputable) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      };

      // Subir el archivo usando axios con manejo de progreso
      try {
        const response: any = await axios.post<{ url: string }>(
          `${process.env.NEXT_PUBLIC_API_URL || 'https://crmdbsoft.zeabur.app'}/${userId}/upload`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
            onUploadProgress: (progressEvent: { loaded: number; total: number }) => {
              if (progressEvent.total) {
                const percentCompleted = Math.round(
                  (progressEvent.loaded * 100) / progressEvent.total
                );
                setUploadProgress(percentCompleted);
              }
            }
          } as any // Usamos 'as any' temporalmente para evitar problemas de tipos
        );
        
        // Verificar si la subida fue exitosa
        if (response.data?.document?.url) {
          // Éxito en la subida
          toast({
            title: "¡Éxito!",
            description: "El archivo se ha subido correctamente.",
            variant: "default",
          });
          
          // Actualizar la lista de documentos
          if (customers && customers.length > 0) {
            const docs = extractDocumentsFromCustomer(customers);
            setDocumentsList(docs);
          }
          
          // Cerrar el diálogo y reiniciar el estado
          setIsUploadDialogOpen(false);
          setDocumentFile(null);
          setUploadProgress(0);
          setDocumentProject("");
          setDocumentProjectId("");
          setDocumentCategory("");
          setDocumentName("");
          setDocumentDescription("");
        } else {
          throw new Error("No se pudo subir el archivo");
        }
      } catch (error: any) {
        console.error("Error al subir el archivo:", error);
        toast({
          title: "Error",
          description: error.message || "Error al subir el archivo",
          variant: "destructive",
        });
      } finally {
        setIsUploading(false);
      }
    } catch (error: any) {
      console.error('Error uploading document:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Error al subir el documento',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  }, [documentProjectId, documentFile, documentName, documentCategory, documentDescription, user, token]);

  // Reset form when dialog is closed
  useEffect(() => {
    if (!isUploadDialogOpen) {
      setDocumentName('');
      setDocumentProject('');
      setDocumentProjectId('');
      setDocumentCategory('');
      setDocumentDescription('');
      setDocumentFile(null);
      // No resetear el cliente seleccionado para mejor UX
    } else if (customers.length > 0 && !selectedCustomerId) {
      // Si se abre el diálogo y hay clientes pero no hay uno seleccionado, seleccionar el primero
      setSelectedCustomerId(customers[0]._id);
      fetchWorks(customers[0]._id);
    }
  }, [isUploadDialogOpen, customers]);

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
                  value={documentName}
                  onChange={handleNameChange}
                  placeholder="Ej: Planos de planta baja"
                />
              </div>
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="doc-customer">Cliente</Label>
                  <Select
                    value={selectedCustomerId}
                    onValueChange={handleCustomerChange}
                    disabled={customers.length === 0}
                  >
                    <SelectTrigger id="doc-customer">
                      <SelectValue placeholder={customers.length > 0 ? "Seleccionar cliente" : "Cargando clientes..."} />
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
                  <Label htmlFor="doc-project">Proyecto</Label>
                  <Select
                    value={documentProjectId}
                    onValueChange={handleProjectChange}
                    disabled={!selectedCustomerId || works.length === 0}
                  >
                    <SelectTrigger id="doc-project">
                      <SelectValue placeholder={selectedCustomerId ? (works.length > 0 ? "Seleccionar proyecto" : "No hay proyectos") : "Seleccione un cliente"} />
                    </SelectTrigger>
                    <SelectContent>
                      {works.map((work) => (
                        <SelectItem key={work._id} value={work._id}>
                          {work.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="doc-category">Categoría</Label>
                <Select
                  value={documentCategory}
                  onValueChange={setDocumentCategory}
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
              <div className="grid gap-2">
                <Label htmlFor="doc-description">Descripción (opcional)</Label>
                <Textarea
                  id="doc-description"
                  value={documentDescription}
                  onChange={handleDescriptionChange}
                  placeholder="Breve descripción del contenido del documento"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="doc-file">Archivo</Label>
                <div className="flex items-center gap-2">
                  <Input 
                    id="doc-file" 
                    type="file" 
                    onChange={handleFileChange}
                    className="cursor-pointer"
                  />
                  {documentFile && (
                    <span className="text-sm text-muted-foreground">
                      {documentFile.name}
                    </span>
                  )}
                </div>
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

