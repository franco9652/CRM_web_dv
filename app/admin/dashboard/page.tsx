"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Building, Calendar, Users, DollarSign, AlertCircle } from "lucide-react"
import ProjectList from "@/components/admin/project-list"
import UpcomingMeetings from "@/components/admin/upcoming-meetings"
import RecentActivity from "@/components/admin/recent-activity"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"

export default function AdminDashboard() {
  const { user } = useAuth()
  const router = useRouter()

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Bienvenido, {user?.name}. Aquí tienes un resumen de todos los proyectos.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push("/admin/calendar")}>
            <Calendar className="mr-2 h-4 w-4" />
            Programar Reunión
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Proyectos Activos</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">+2 desde el mes pasado</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">+4 desde el mes pasado</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$1.2M</div>
            <p className="text-xs text-muted-foreground">+12% desde el mes pasado</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aprobaciones Pendientes</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7</div>
            <p className="text-xs text-muted-foreground">-2 desde la semana pasada</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="projects">
        <TabsList>
          <TabsTrigger value="projects">Proyectos</TabsTrigger>
          <TabsTrigger value="meetings">Reuniones</TabsTrigger>
          <TabsTrigger value="activity">Actividad Reciente</TabsTrigger>
        </TabsList>
        <TabsContent value="projects" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Avance de Proyectos</CardTitle>
                <CardDescription>Progreso general de todos los proyectos activos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <span className="font-medium">Torre Skyline</span>
                      </div>
                      <span>75%</span>
                    </div>
                    <Progress value={75} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <span className="font-medium">Complejo Riverside</span>
                      </div>
                      <span>45%</span>
                    </div>
                    <Progress value={45} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <span className="font-medium">Parque Oficinas Metro</span>
                      </div>
                      <span>90%</span>
                    </div>
                    <Progress value={90} />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Utilización de Presupuesto</CardTitle>
                <CardDescription>Resumen financiero de proyectos activos</CardDescription>
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
                    <Progress value={65} className="bg-muted [&>div]:bg-green-500" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <span className="font-medium">Complejo Riverside</span>
                      </div>
                      <span className="text-amber-500">En Presupuesto</span>
                    </div>
                    <Progress value={85} className="bg-muted [&>div]:bg-amber-500" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <span className="font-medium">Parque Oficinas Metro</span>
                      </div>
                      <span className="text-red-500">Sobre Presupuesto</span>
                    </div>
                    <Progress value={110} className="bg-muted [&>div]:bg-red-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Órdenes de Cambio</CardTitle>
                <CardDescription>Solicitudes recientes que requieren aprobación</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Torre Skyline</p>
                      <p className="text-sm text-muted-foreground">Solicitud de mejora de materiales</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => router.push(`/admin/projects/1/change-orders`)}>
                      Revisar
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Complejo Riverside</p>
                      <p className="text-sm text-muted-foreground">Extensión de plazo</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => router.push(`/admin/projects/2/change-orders`)}>
                      Revisar
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Parque Oficinas Metro</p>
                      <p className="text-sm text-muted-foreground">Alcance adicional</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => router.push(`/admin/projects/3/change-orders`)}>
                      Revisar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <ProjectList />
        </TabsContent>
        <TabsContent value="meetings">
          <UpcomingMeetings />
        </TabsContent>
        <TabsContent value="activity">
          <RecentActivity />
        </TabsContent>
      </Tabs>
    </div>
  )
}

