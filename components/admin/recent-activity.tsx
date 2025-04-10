"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building, Calendar, FileText, MessageSquare, User, Users } from "lucide-react"

// Datos de actividad de ejemplo
const activities = [
  {
    id: 1,
    type: "document",
    description: "Propuesta de presupuesto para Torre Skyline fue aprobada",
    user: "Juan Pérez",
    time: "hace 2 horas",
    project: "Torre Skyline",
  },
  {
    id: 2,
    type: "meeting",
    description: "Reunión de revisión de diseño programada con Desarrollos Globales",
    user: "Sara Jiménez",
    time: "hace 4 horas",
    project: "Complejo Riverside",
  },
  {
    id: 3,
    type: "comment",
    description: "Nuevo comentario sobre el cronograma del Parque Oficinas Metro",
    user: "Miguel Moreno",
    time: "Ayer a las 3:45 PM",
    project: "Parque Oficinas Metro",
  },
  {
    id: 4,
    type: "client",
    description: "Nueva cuenta de cliente creada para Oscorp",
    user: "Elena Díaz",
    time: "Ayer a las 11:30 AM",
    project: null,
  },
  {
    id: 5,
    type: "project",
    description: "Proyecto Hotel Vista al Puerto creado",
    user: "Roberto Wilson",
    time: "hace 2 días",
    project: "Hotel Vista al Puerto",
  },
  {
    id: 6,
    type: "document",
    description: "Nuevos planos subidos para Residencias Sunset",
    user: "Jennifer López",
    time: "hace 2 días",
    project: "Residencias Sunset",
  },
]

export default function RecentActivity() {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "document":
        return <FileText className="h-4 w-4" />
      case "meeting":
        return <Calendar className="h-4 w-4" />
      case "comment":
        return <MessageSquare className="h-4 w-4" />
      case "client":
        return <Users className="h-4 w-4" />
      case "project":
        return <Building className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case "document":
        return "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300"
      case "meeting":
        return "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300"
      case "comment":
        return "bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-300"
      case "client":
        return "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300"
      case "project":
        return "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Actividad Reciente</CardTitle>
        <CardDescription>Últimas acciones y actualizaciones en todos los proyectos.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {activities.map((activity) => (
            <div key={activity.id} className="flex">
              <div
                className={`mr-4 flex h-10 w-10 items-center justify-center rounded-full ${getActivityColor(activity.type)}`}
              >
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">{activity.description}</p>
                <div className="flex items-center pt-2 text-xs text-muted-foreground">
                  <User className="mr-1 h-3 w-3" />
                  <span>{activity.user}</span>
                  <span className="px-2">•</span>
                  <span>{activity.time}</span>
                  {activity.project && (
                    <>
                      <span className="px-2">•</span>
                      <Building className="mr-1 h-3 w-3" />
                      <span>{activity.project}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

