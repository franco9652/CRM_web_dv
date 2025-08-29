"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, Loader2, User, Mail, Phone, MapPin, IdCard, MapPinned, FileText, Pencil } from "lucide-react"
import { getCustomersByUserId, Customer } from "@/services/customers"
import { Tabs, TabsList, TabsTrigger } from "@radix-ui/react-tabs"

export default function ClientDetailsPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const [client, setClient] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("documents")

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

  useEffect(() => {
    if (params.id) {
      setLoading(true)
      getCustomersByUserId(params.id)
        .then((response) => {
          const currentClient = response.customer && response.customer.length > 0 ? response.customer[0] : null;
          if (currentClient) {
            setClient(currentClient)
          } else {
            setError("Cliente no encontrado")
          }
          setLoading(false)
        })
        .catch(() => {
          setError("Error al cargar el cliente")
          setLoading(false)
        })
    }
  }, [params.id])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="text-center py-8 flex justify-center items-center p-6">
          <Loader2 className="animate-spin text-primary" size={24} />
          <p className="px-6">Cargando cliente...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="text-center">
          <h2 className="text-xl font-semibold">{error}</h2>
          <Button className="mt-4" onClick={() => router.push("/admin/clients")}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Volver a Clientes
          </Button>
        </div>
      </div>
    )
  }

  if (!client) {
    return null
  }

  function downloadDocument(document: any): void {
    const url = document.url;
    const link = document.createElement("a");
    link.href = url;
    link.download = document.originalName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => router.push("/admin/clients")}>
            <ChevronLeft className="mr-1 h-4 w-4" />
            Volver
          </Button>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => router.push(`/admin/clients/${params.id}/edit`)}
          className="ml-auto"
        >
          <Pencil className="mr-1 h-4 w-4" />
          Editar
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del Cliente</CardTitle>
          <span
            className={` w-24 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium 
            ${
              client?.active === true
                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                : client?.active === false
                  ? "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300"
                  : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
            }`}
          >
            {client?.active === true ? "Activo" : "Inactivo"}
          </span>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center">
              <User className="h-5 w-5 text-muted-foreground mr-3" />
              <span>{'Nombre: ' + client.name}</span>
            </div>
            <div className="flex items-center">
              <Mail className="h-5 w-5 text-muted-foreground mr-3" />
              <span>{'Email: ' + client.email}</span>
            </div>
            {client.phone && (
              <div className="flex items-center">
                <Phone className="h-5 w-5 text-muted-foreground mr-3" />
                <span>{'Telefono: ' + client.phone}</span>
              </div>
            )}
            {client.address && (
              <div className="flex items-center">
                <MapPin className="h-5 w-5 text-muted-foreground mr-3" />
                <span>{'Direccion: ' + client.address}</span>
              </div>
            )}
            <div className="flex items-center">
              <Phone className="h-5 w-5 text-muted-foreground mr-3" />
              <span>{'Contacto: ' + client.contactNumber}</span>
            </div>
            <div className="flex items-center">
              <IdCard className="h-5 w-5 text-muted-foreground mr-3" />
              <span>{'DNI: ' + client.dni}</span>
            </div>
            <div className="flex items-center">
              <IdCard className="h-5 w-5 text-muted-foreground mr-3" />
              <span>{'CUIT: ' + client.cuit}</span>
            </div>
            <div className="flex items-center">
              <MapPinned className="h-5 w-5 text-muted-foreground mr-3" />
              <span>{'Direccion de Trabajo: ' + client.workDirection}</span>
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
              <CardTitle>Documentos</CardTitle>
              <CardDescription>Archivos y documentación relacionados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {
                  client?.documents?.length === 0 ? (
                    <p>No hay documentos disponibles para este cliente.</p>
                  ) : (
                  client?.documents?.map((document: any) => (
                    <div key={document._id} className="flex items-start gap-4 p-4 border rounded-md">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <FileText className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{document.fileName}</p>
                        <p className="font-medium">{document.originalName}</p>
                        <p className="text-sm text-muted-foreground">
                          {document.mimeType} • Subido el {formatDate(document.uploadedAt)}
                        </p>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => downloadDocument(document)}>
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
