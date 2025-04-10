"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertCircle, Calendar, CheckCircle2 } from "lucide-react"
import ClientProjectList from "@/components/client/client-project-list"
import ClientUpcomingMeetings from "@/components/client/client-upcoming-meetings"
import ClientDocuments from "@/components/client/client-documents"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"

// Datos de proyectos con hitos
const projectsWithMilestones = [
  {
    id: 1,
    name: "Torre Skyline",
    milestones: [
      { id: 1, date: "2023-01-20", description: "Inicio de excavación", completed: true },
      { id: 2, date: "2023-03-15", description: "Cimentación completada", completed: true },
      { id: 3, date: "2023-06-10", description: "Estructura hasta el piso 15 completada", completed: true },
      { id: 4, date: "2023-09-05", description: "Instalación de loza radiante en pisos 1-10", completed: true },
      { id: 5, date: "2023-12-20", description: "Fachada exterior completada", completed: true },
      { id: 6, date: "2024-02-15", description: "Instalaciones eléctricas completadas", completed: false },
      { id: 7, date: "2024-04-10", description: "Acabados interiores", completed: false },
    ],
  },
  {
    id: 2,
    name: "Complejo Riverside",
    milestones: [
      { id: 1, date: "2023-03-20", description: "Inicio de excavación", completed: true },
      { id: 2, date: "2023-05-15", description: "Cimentación completada", completed: true },
      { id: 3, date: "2023-08-10", description: "Estructura del edificio A completada", completed: true },
      { id: 4, date: "2023-11-25", description: "Instalación de sistemas hidráulicos", completed: false },
      { id: 5, date: "2024-02-15", description: "Fachada exterior", completed: false },
    ],
  },
  {
    id: 3,
    name: "Parque Oficinas Metro",
    milestones: [
      { id: 1, date: "2023-05-30", description: "Inicio de excavación", completed: true },
      { id: 2, date: "2023-07-15", description: "Cimentación completada", completed: true },
      { id: 3, date: "2023-09-10", description: "Estructura completada", completed: true },
      {
        id: 4,
        date: "2023-11-05",
        description: "Instalación de sistemas eléctricos y de climatización",
        completed: true,
      },
      { id: 5, date: "2023-12-20", description: "Fachada exterior completada", completed: true },
      { id: 6, date: "2024-02-15", description: "Acabados interiores completados", completed: true },
      { id: 7, date: "2024-03-10", description: "Instalación de mobiliario", completed: false },
    ],
  },
]

export default function ClientDashboard() {
  const { user } = useAuth()
  const router = useRouter()

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date)
  }

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
          <CardContent>
            <div className="space-y-4">
              {projectsWithMilestones.map((project) => {
                // Obtener los últimos 2 hitos completados para cada proyecto
                const recentCompletedMilestones = project.milestones
                  .filter((m) => m.completed)
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .slice(0, 2)

                return recentCompletedMilestones.length > 0 ? (
                  <div key={project.id} className="space-y-2">
                    <div className="font-medium">{project.name}</div>
                    {recentCompletedMilestones.map((milestone) => (
                      <div key={milestone.id} className="flex items-start gap-2 pl-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="text-sm">{milestone.description}</div>
                          <div className="text-xs text-muted-foreground">{formatDate(milestone.date)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null
              })}
            </div>
          </CardContent>
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

