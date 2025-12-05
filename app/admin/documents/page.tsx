"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Customer, getAllCustomers } from "@/services/customers"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { getWorksByCustomerId } from "@/services/works"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Building, Download, Eye, FileText, Loader2, MoreHorizontal, Plus, Search, Upload, User, Trash2 } from "lucide-react"
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import axios from 'axios';

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
  const [documents, setDocuments] = useState(initialDocuments);
  const [searchTerm, setSearchTerm] = useState("");

  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [token, setToken] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(true);

  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [customerWorks, setCustomerWorks] = useState<Array<{ _id: string, name: string }>>([]);
  const [isLoadingWorks, setIsLoadingWorks] = useState(false);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<{ customerId: string, fileName: string, documentName: string, documentId: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [newDocument, setNewDocument] = useState({
    name: "",
    project: "",
    workId: "",
    category: "",
    description: "",
    file: null as File | null,
    url: ""
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
      case "Pendiente":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300"
      case "Rechazado":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
  }


  useEffect(() => {
    const authToken = localStorage.getItem('token')
    if (authToken) {
      setToken(authToken)
    }

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
        setNewDocument(prev => ({
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
          description: 'No hay proyectos para este cliente',
          variant: 'destructive',
        });
        setCustomerWorks([]);
      } finally {
        setIsLoadingWorks(false);
      }
    };

    fetchCustomerWorks();
  }, [selectedCustomer, toast])

  interface UploadResponse {
    message: string
    document: {
      fileName: string
      originalName: string
      mimeType: string
      size: number
      url: string
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewDocument({
        ...newDocument,
        file: e.target.files[0],
        url: ''
      })
    }
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

  const handleViewDetails = (document: any) => {
    // Open the document URL in a new tab
    if (document.url) {
      window.open(document.url, '_blank');
    } else {
      toast({
        title: "Error",
        description: "No se pudo abrir el documento. El enlace no está disponible.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteDocument = (customerId: string, documentUrl: string | undefined, documentName: string, documentId: string) => {
    const fileNameFromUrl = (() => {
      try {
        if (!documentUrl) return "";
        const cleanUrl = documentUrl.split('?')[0];
        const last = cleanUrl.split('/').pop();
        return last || "";
      } catch {
        return "";
      }
    })();

    setDocumentToDelete({ customerId, fileName: fileNameFromUrl, documentName, documentId });
    setIsDeleteDialogOpen(true);
  };

  const deleteDocument = async () => {
    if (!documentToDelete || !token) return;

    setIsDeleting(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'https://crmdbsoft.zeabur.app'}/${documentToDelete.customerId}/documents/${documentToDelete.documentId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            documentId: documentToDelete.documentId
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al eliminar el documento');
      }

      setCustomers(prevCustomers =>
        prevCustomers.map(customer => {
          if (customer._id === documentToDelete.customerId) {
            return {
              ...customer,
              documents: (customer.documents || []).filter((doc: any) => {
                return doc._id !== documentToDelete.documentId;
              })
            };
          }
          return customer;
        })
      );

      toast({
        title: "Éxito",
        description: `El documento "${documentToDelete.documentName}" ha sido eliminado correctamente.`,
        variant: "default",
      });

      setIsDeleteDialogOpen(false);
      setDocumentToDelete(null);
    } catch (error) {
      console.error('Error deleting document!!:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo eliminar el documento. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

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
        uploadData.append('userId', userId)

        // Agregar proyecto, categoría y descripción al FormData
        if (newDocument.project) {
          uploadData.append('project', newDocument.project)
        }
        if (newDocument.workId) {
          uploadData.append('workId', newDocument.workId)
        }
        if (newDocument.category) {
          uploadData.append('category', newDocument.category)
        }
        if (newDocument.description) {
          uploadData.append('description', newDocument.description)
        }

        if (!token) {
          throw new Error('No se encontró el token de autenticación')
        }

        if (!selectedCustomer) {
          throw new Error('Por favor seleccione un cliente');
        }

        const response: any = await axios.post<UploadResponse>(
          `${process.env.NEXT_PUBLIC_API_URL || 'https://crmdbsoft.zeabur.app'}/${selectedCustomer}/upload`,
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

        if (response.data?.document?.url) {
          return {
            name: file.name,
            url: response.data.document.url,
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

      toast({
        title: 'Éxito',
        description: 'Documentos subidos correctamente',
        variant: 'default',
      })

      try {
        const updatedCustomers = await getAllCustomers();
        setCustomers(updatedCustomers);
      } catch (error) {
        console.error('Error refreshing customers after upload:', error);
      }

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

  const handleUploadDocument = () => {
    if (!newDocument.project || !newDocument.category) {
      toast({
        title: 'Error',
        description: 'Por favor complete los campos de proyecto y categoría',
        variant: 'destructive',
      });
      return;
    }

    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
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
                placeholder="Buscar por cliente, archivo o trabajo..."
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
                  <TableHead>Cliente</TableHead>
                  <TableHead>Documentos</TableHead>
                  <TableHead className="w-[100px]">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers
                  .filter(customer => {
                    // First check if customer has documents
                    if (!customer.documents || customer.documents.length === 0) return false;

                    // If no search term, show all customers with documents
                    if (!searchTerm) return true;

                    // Check if customer name matches search term
                    const customerNameMatch = customer.name.toLowerCase().includes(searchTerm.toLowerCase());

                    // Check if any document matches search term (by name or project)
                    const documentMatch = customer.documents.some((doc: any) =>
                      doc.name.toLowerCase().includes(searchTerm.toLowerCase())
                    );

                    return customerNameMatch || documentMatch;
                  })
                  .map((customer) => (
                    <TableRow key={customer._id}>
                      <TableCell className="font-medium align-top pt-6">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          {customer.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        {customer.documents && customer.documents.length > 0 ? (
                          <div className="space-y-2">
                            {customer.documents.map((doc) => (
                              <div key={doc._id} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded">
                                <div className="flex items-center gap-2">
                                  <FileText className="h-4 w-4 text-muted-foreground" />
                                  <span className="font-medium">{doc.name}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {new Date(doc.uploadedAt).toLocaleDateString('es-AR')}
                                  </span>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => handleViewDetails(doc)}
                                    title="Ver documento"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => handleDownload(doc.url, doc.name)}
                                    title="Descargar"
                                  >
                                    <Download className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => handleDeleteDocument(customer._id, doc.url, doc.name, doc._id)}
                                    title="Eliminar documento"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-muted-foreground text-sm py-2">
                            No hay documentos cargados
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="align-top pt-6">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedCustomer(customer._id);
                            setIsUploadDialogOpen(true);
                          }}
                        >
                          <Upload className="mr-2 h-4 w-4" />
                          Subir
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                {isLoadingCustomers ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-12">
                      <div className="flex justify-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : customers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-6 text-muted-foreground">
                      No se encontraron clientes.
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el documento{" "}
              <strong>"{documentToDelete?.documentName}"</strong> del sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteDocument}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Eliminando...
                </>
              ) : (
                "Eliminar"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}