"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronLeft, FileText, Users, Loader2, Upload, Building, User } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { getWorkById, getWorksByCustomerId, Work } from "@/services/works"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Customer, getAllCustomers } from "@/services/customers"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"
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

const initialDocuments: Array<{
  id: number | string;
  name: string;
  project: string;
  category: string;
  type: string;
  size: string;
  uploadDate: string;
  uploadedBy: string;
  status: string;
  url?: string;
}> = [];

export default function ProjectDetailsPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const [project, setProject] = useState<Work | null>(null)
  const [activeTab, setActiveTab] = useState("documents")
  const [documents, setDocuments] = useState(initialDocuments);
  const [allDocuments, setAllDocuments] = useState(initialDocuments);
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(true);
  const [customerWorks, setCustomerWorks] = useState<Array<{ _id: string, name: string }>>([]);
  const [isLoadingWorks, setIsLoadingWorks] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { user } = useAuth();
  const { toast } = useToast();

  const [newDocument, setNewDocument] = useState<any>({

    project: "",
    workId: "",
    category: "",
    description: "",
    url: "",
  });

  interface UploadResponse {
    message: string
    name: string
    url: string
    fileName?: string
    originalName?: string
    mimeType?: string
    size?: number
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewDocument({
        ...newDocument,
        file: e.target.files[0],
        url: '' // Initialize with empty string, will be set after upload
      })
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    if (!user || !user._id) return
    const userId = user._id.toString()

    setIsUploading(true)
    setUploadProgress(0)

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const uploadData = new FormData()
        uploadData.append('file', file)

        if (!selectedCustomer) {
          throw new Error('Por favor seleccione un cliente');
        }

        if (!token) {
          throw new Error('No se encontró el token de autenticación')
        }

        // Enviar customerId (requerido por el backend)
        uploadData.append('customerId', selectedCustomer)

        // Agregar workId si está disponible
        if (newDocument.workId) {
          uploadData.append('workId', newDocument.workId)
        }

        // Agregar categoría y descripción si están disponibles
        if (newDocument.category) {
          uploadData.append('category', newDocument.category)
        }
        if (newDocument.description) {
          uploadData.append('description', newDocument.description)
        }

        const response: any = await axios.post<UploadResponse>(
          `${process.env.NEXT_PUBLIC_API_URL || 'https://crmdbsoft.zeabur.app'}/api/documents/upload`,
          uploadData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              'Authorization': `Bearer ${token}`
            },
            onUploadProgress: (progressEvent: any) => {
              if (progressEvent.lengthComputable) {
                const percentCompleted = Math.round(
                  (progressEvent.loaded * 100) / progressEvent.total
                )
                setUploadProgress(percentCompleted)
              }
            },
          } as any
        )

        if (response.data?.url) {
          return {
            name: response.data.name || file.name,
            url: response.data.url,
            size: file.size,
            type: file.type
          }
        }
        throw new Error('No se pudo obtener la URL del archivo subido')
      })

      const uploadedFiles = await Promise.all(uploadPromises)

      // Update documents state with new files
      const newDocs = uploadedFiles.map((file, index) => ({
        id: documents.length + index + 1,
        name: file.name,
        project: newDocument.project,
        category: newDocument.category,
        type: file.name.split('.').pop()?.toUpperCase() || 'FILE',
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        uploadDate: new Date().toISOString().split('T')[0],
        uploadedBy: user.name || 'Usuario',
        status: 'Pendiente',
        url: file.url
      }))

      setDocuments(prev => [...prev, ...newDocs])

      // Actualizar también la lista combinada
      setAllDocuments(prev => [...prev, ...newDocs])

      toast({
        title: 'Éxito',
        description: 'Documentos subidos correctamente',
        variant: 'default',
      })

      // Reset form
      setNewDocument({
        name: "",
        project: "",
        workId: "",
        category: "",
        description: "",
        file: null,
        url: ""
      })

    } catch (error) {
      console.error('Error uploading file:', error)
      toast({
        title: 'Error',
        description: 'Error al subir los documentos',
        variant: 'destructive',
      })
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
      setIsUploadDialogOpen(false)
    }
  }

  // Función para combinar documentos del proyecto y del cliente
  const combineDocuments = (projectData: Work | null, customersData: Customer[]) => {
    if (!projectData) return [];

    const combinedDocs: any[] = [];

    // Agregar documentos del proyecto
    if (projectData.documents && Array.isArray(projectData.documents)) {
      projectData.documents.forEach((doc: any) => {
        combinedDocs.push({
          ...doc,
          source: 'project',
          displayName: doc.fileName || doc.originalName || doc.name
        });
      });
    }

    // Buscar el cliente correspondiente al proyecto
    const projectCustomer = customersData.find(customer =>
      customer._id === projectData.customerId ||
      customer.name === projectData.customerName
    );

    // Agregar documentos del cliente si existe
    if (projectCustomer && projectCustomer.documents && Array.isArray(projectCustomer.documents)) {
      projectCustomer.documents.forEach((doc: any) => {
        combinedDocs.push({
          ...doc,
          source: 'customer',
          displayName: doc.name,
          fileName: doc.name,
          originalName: doc.name,
          mimeType: doc.name.split('.').pop()?.toUpperCase() || 'FILE',
          uploadedAt: doc.uploadedAt
        });
      });
    }

    return combinedDocs;
  };

  const getWorkData = async () => {
    setLoading(true)
    getWorkById(params.id)
      .then((data) => {
        setProject(data?.work)
        setLoading(false)
      })
      .catch(() => {
        setError("Error al cargar el proyecto")
        setLoading(false)
      })
  }

  useEffect(() => {
    getWorkData()
  }, [params.id])

  // Actualizar documentos combinados cuando cambien el proyecto o los clientes
  useEffect(() => {
    if (project && customers.length > 0) {
      const combinedDocs = combineDocuments(project, customers);
      setAllDocuments(combinedDocs);
    }
  }, [project, customers])

  useEffect(() => {
    // Get token from localStorage
    const authToken = localStorage.getItem('token')
    if (authToken) {
      setToken(authToken)
    }

    // Fetch customers
    const fetchCustomers = async () => {
      if (!authToken) return;

      setIsLoadingCustomers(true);
      try {
        const customers = await getAllCustomers();
        setCustomers(customers);
      } catch (error) {
        console.error('Error fetching customers:', error);
        toast({
          title: 'Error',
          description: 'No se pudieron cargar los clientes',
          variant: 'destructive',
        });
      } finally {
        setIsLoadingCustomers(false);
      }
    };

    fetchCustomers();
  }, [])

  useEffect(() => {
    const fetchCustomerWorks = async () => {
      if (!selectedCustomer) {
        setCustomerWorks([]);
        setNewDocument((prev: any) => ({
          ...prev,
          project: "",
          workId: "",
          url: "",
          name: "",
          category: "",
          description: "",
          file: null
        }));
        return;
      }

      setIsLoadingWorks(true);
      try {
        const response = await getWorksByCustomerId(selectedCustomer);
        if (response.works && Array.isArray(response.works)) {
          setCustomerWorks(response.works.map(work => ({
            _id: work._id,
            name: work.name
          })));
        } else {
          setCustomerWorks([]);
        }
      } catch (error) {
        console.error('Error fetching customer works:', error);
        toast({
          title: 'Error',
          description: 'No se pudieron cargar los proyectos del cliente',
          variant: 'destructive',
        });
        setCustomerWorks([]);
      } finally {
        setIsLoadingWorks(false);
      }
    };

    fetchCustomerWorks();
  }, [selectedCustomer, toast])

  const formatDate = (dateString?: string | null) => {
    if (!dateString || dateString.trim() === '') {
      return '-';
    }
    try {
      const date = new Date(dateString)
      return new Intl.DateTimeFormat("es-ES", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }).format(date)
    } catch (error) {
      console.error(`Error al formatear fecha: ${dateString}`, error);
      return '-';
    }
  }

  // Procesar coordenadas para el enlace de Google Maps
  let googleMapsUrl = null;
  if (project?.workUbication) {
    const parts = project.workUbication.split(', ');
    if (parts.length === 2) {
      const lat = parseFloat(parts[0]);
      const lng = parseFloat(parts[1]);
      if (!isNaN(lat) && !isNaN(lng)) {
        googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
      }
    }
  }

  if (loading && !error) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="text-center py-8 flex justify-center items-center p-6">
          <Loader2 className="animate-spin text-primary" size={24} />
          <p className="px-6">Cargando proyectos...</p>
        </div>
      </div>
    )
  } else if (error) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Error al cargar el proyecto</h2>
          <Button className="mt-4" onClick={() => router.push("/admin/projects")}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Volver a Proyectos
          </Button>
        </div>
      </div>
    )
  }

  const handleDownload = async (url: string, fileName: string) => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('No se pudo descargar el archivo');

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => router.push("/admin/projects")}>
            <ChevronLeft className="mr-1 h-4 w-4" />
            Volver
          </Button>
          <h1 className="text-2xl font-bold">{project?.name}</h1>
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium 
            ${project?.statusWork === "activo"
                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                : project?.statusWork === "En progreso"
                  ? "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300"
                  : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
              }`}
          >
            {project?.statusWork}
          </span>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del Proyecto</CardTitle>
          <CardDescription>Detalles generales y estado actual del proyecto</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Tipo de proyecto</h3>
              <p className="text-muted-foreground">{project?.projectType}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium mb-2">Detalles del Proyecto</h3>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Cliente:</dt>
                    <dd>{project?.customerName}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Ubicación:</dt>
                    {
                      googleMapsUrl ? (
                        <div className="flex flex-col">
                          <span className="font-semibold">{project?.workUbication}</span>
                          <a
                            href={googleMapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-primary hover:underline"
                          >
                            Ver en mapa 📍
                          </a>
                        </div>
                      ) : (
                        <span className="font-semibold">{project?.address || 'No disponible'}</span>
                      )}
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Fecha de inicio:</dt>
                    <dd>{formatDate(project?.startDate)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Fecha de finalización:</dt>
                    <dd>{formatDate(project?.endDate)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Presupuesto:</dt>
                    <dd>{project?.budget}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          {/* <TabsTrigger value="team">Equipo</TabsTrigger> */}
          <TabsTrigger value="documents">Documentos</TabsTrigger>
        </TabsList>

        {/* {activeTab === "team" && (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Equipo del Proyecto</CardTitle>
              <CardDescription>Miembros del equipo asignados a este proyecto</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {project?.team.map((member: any, index: any) => (
                  <div key={index} className="flex items-start gap-4 p-4 border rounded-md">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <Users className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{member.name}</p>
                      <p className="text-sm text-muted-foreground">{member.role}</p>
                      <p className="text-sm text-muted-foreground">{member.contact}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )} */}

        {activeTab === "documents" && (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Documentos del Proyecto</CardTitle>
              <CardDescription>Archivos y documentación relacionada con el proyecto</CardDescription>
            </CardHeader>
            <CardContent>
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
                      <Label htmlFor="customer-select">Cliente</Label>
                      <Select
                        value={selectedCustomer}
                        onValueChange={setSelectedCustomer}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione un cliente" />
                        </SelectTrigger>
                        <SelectContent>
                          {customers.map((customer) => (
                            <SelectItem key={customer._id} value={customer._id}>
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                {customer.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="doc-project">Proyecto</Label>
                        <Select
                          value={newDocument.workId}
                          onValueChange={(value) => {
                            const selectedWork = customerWorks.find(work => work._id === value);
                            setNewDocument({
                              ...newDocument,
                              workId: value,
                              project: selectedWork?.name || "",
                              url: newDocument.url || ""
                            });
                          }}
                          disabled={!selectedCustomer || isLoadingWorks || customerWorks.length === 0}
                        >
                          <SelectTrigger id="doc-project">
                            <SelectValue placeholder={
                              !selectedCustomer
                                ? "Primero seleccione un cliente"
                                : isLoadingWorks
                                  ? "Cargando proyectos..."
                                  : customerWorks.length === 0
                                    ? "No hay proyectos para este cliente"
                                    : "Seleccionar proyecto"
                            } />
                          </SelectTrigger>
                          <SelectContent>
                            {customerWorks.map((work) => (
                              <SelectItem key={work._id} value={work._id}>
                                <div className="flex items-center gap-2">
                                  <Building className="h-4 w-4" />
                                  {work.name}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="doc-category">Categoría</Label>
                        <Select
                          value={newDocument.category}
                          onValueChange={(value) => setNewDocument({ ...newDocument, category: value, url: newDocument.url || "" })}
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
                        onChange={(e) => setNewDocument({ ...newDocument, description: e.target.value, url: newDocument.url || "" })}
                        placeholder="Breve descripción del contenido del documento"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="file-upload">Archivo</Label>
                      <Input
                        id="file-upload"
                        type="file"
                        onChange={(e) => {
                          handleFileChange(e);
                          handleFileUpload(e);
                        }}
                        multiple
                      />
                      <p className="text-xs text-muted-foreground">
                        Formatos aceptados: PDF, DOCX, XLSX, DWG, JPG, PNG, ZIP (máx. 50MB)
                      </p>
                      {isUploading && (
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                          <div
                            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          ></div>
                        </div>
                      )}
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsUploadDialogOpen(false)}
                      disabled={isUploading}
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={() => document.getElementById('file-upload')?.click()}
                      disabled={isUploading || !selectedCustomer || !newDocument.workId}
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Subiendo...
                        </>
                      ) : (
                        'Seleccionar y Subir Documento'
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <div className="space-y-4">
                {
                  allDocuments.length === 0 ? (
                    <p>No hay documentos disponibles para este proyecto.</p>
                  ) : (
                    allDocuments.map((document: any, index: number) => (
                      <div key={document._id || `doc-${index}`} className="flex items-start gap-4 p-4 border rounded-md">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <FileText className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{document.displayName || document.fileName || document.originalName || document.name}</p>
                            {/* <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                            document.source === 'project' 
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                              : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                          }`}>
                            {document.source === 'project' ? 'Proyecto' : 'Cliente'}
                          </span> */}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {document.mimeType || 'FILE'} • Subido el {formatDate(document.uploadedAt)}
                          </p>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => handleDownload(document.url, document.name)}>
                          Descargar
                        </Button>
                      </div>
                    ))
                  )
                }
              </div>
            </CardContent>
          </Card>
        )}
      </Tabs>
    </div>
  )
}

