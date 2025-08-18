"use client"
// QUITAMOS ESTA VISTA DEL ROL CLIENTE
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertCircle, Calendar, CheckCircle2, Loader2 } from "lucide-react"
import ClientProjectList from "@/components/client/client-project-list"
import ClientUpcomingMeetings from "@/components/client/client-upcoming-meetings"
import ClientDocuments from "@/components/client/client-documents"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { getWorks, Work } from "@/services/works"

export default function ClientDashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const [loadingWorks, setLoadingWorks] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [projects, setprojects] = useState<Work[]>([])

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Fecha no especificada"
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date)
  }

  useEffect(() => {
    setLoadingWorks(true)
    getWorks()
      .then((data) => {
        setprojects(data.works)
        setLoadingWorks(false)
      })
      .catch(() => {
        setError("Error al cargar los proyectos")
        setLoadingWorks(false)
      })
  }, [user?.id])

  const projectsCompleted = projects?.filter((project) => project.statusWork === "En progreso" || project.statusWork === "En Progreso")
  const projectsSplice = projectsCompleted?.slice(0, 3)

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Bienvenido, {user?.name}. Aquí tienes un resumen de tus proyectos.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push("/client/meetings")}>
            <Calendar className="mr-2 h-4 w-4" />
            Solicitar Reunión
          </Button>
        </div>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Actualización Importante</AlertTitle>
        <AlertDescription>
          Tu proyecto "Torre Skyline" tiene un nuevo documento que requiere tu revisión y aprobación.
        </AlertDescription>
      </Alert>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Hitos de Proyectos</CardTitle>
            <CardDescription>Avances recientes en tus proyectos</CardDescription>
          </CardHeader>
          { loadingWorks ? (
            <div className="text-center py-8 flex items-center p-6">
              <Loader2 className="animate-spin text-primary" size={24} />
              <p>Cargando trabajos...</p>
            </div>
          ) : error ? (
            <div className="text-center text-red-500 py-8">{error}</div>
          ) :
            <CardContent>
              <div className="space-y-4">
                {
                  projectsSplice.map((project) => {
                    return projectsSplice.length > 0 ? (
                      <div key={project.id} className="space-y-2">
                        <div className="font-medium">{project.name}</div>
                          <div key={project.id} className="flex items-start gap-2 pl-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <div>
                              <div className="text-sm">{project.statusWork}</div>
                              <div className="text-xs text-muted-foreground">{formatDate(project.startDate)}</div>
                            </div>
                          </div>
                      </div>
                    ) : null
                  })
                }
              </div>
            </CardContent>
          }
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Próximas Fechas Límite</CardTitle>
            <CardDescription>Fechas importantes para tus proyectos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Calendar className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Fecha límite de selección de materiales</p>
                  <p className="text-sm text-muted-foreground">Torre Skyline • 25 de marzo, 2024</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Calendar className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Finalización de Fase 1</p>
                  <p className="text-sm text-muted-foreground">Complejo Riverside • 10 de abril, 2024</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Calendar className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Inspección Final</p>
                  <p className="text-sm text-muted-foreground">Parque Oficinas Metro • 15 de abril, 2024</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Resumen de Presupuesto</CardTitle>
            <CardDescription>Estado financiero de tus proyectos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <span className="font-medium">Torre Skyline</span>
                  </div>
                  <span className="text-green-500">Bajo Presupuesto</span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>$2.7M gastados</span>
                  <span>$4.2M total</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <span className="font-medium">Complejo Riverside</span>
                  </div>
                  <span className="text-amber-500">En Presupuesto</span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>$3.2M gastados</span>
                  <span>$3.8M total</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="projects">
        <TabsList>
          <TabsTrigger value="projects">Proyectos</TabsTrigger>
          <TabsTrigger value="meetings">Reuniones</TabsTrigger>
          <TabsTrigger value="documents">Documentos</TabsTrigger>
        </TabsList>
        <TabsContent value="projects">
          <ClientProjectList />
        </TabsContent>
        <TabsContent value="meetings">
          <ClientUpcomingMeetings />
        </TabsContent>
        <TabsContent value="documents">
          <ClientDocuments />
        </TabsContent>
      </Tabs>
    </div>
  )
}

