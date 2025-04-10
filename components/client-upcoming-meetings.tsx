"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, Video } from "lucide-react"
import { useRouter } from "next/navigation"

// Datos de reuniones de ejemplo
const meetings = [
  {
    id: 1,
    title: "Revisión de Diseño",
    project: "Torre Skyline",
    date: "2024-03-22",
    time: "2:00 PM",
    duration: "1.5 horas",
    type: "Presencial",
    location: "Oficina del Proyecto",
  },
  {
    id: 2,
    title: "Discusión de Presupuesto",
    project: "Complejo Riverside",
    date: "2024-03-25",
    time: "11:00 AM",
    duration: "1 hora",
    type: "Videollamada",
    location: "Zoom",
  },
  {
    id: 3,
    title: "Actualización de Progreso",
    project: "Parque Oficinas Metro",
    date: "2024-03-28",
    time: "3:30 PM",
    duration: "45 minutos",
    type: "Videollamada",
    location: "Microsoft Teams",
  },
]

export default function ClientUpcomingMeetings() {
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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Próximas Reuniones</CardTitle>
          <CardDescription>Tus reuniones programadas con el equipo de construcción.</CardDescription>
        </div>
        <Button onClick={() => router.push("/client/meetings")}>Solicitar Reunión</Button>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reunión</TableHead>
                <TableHead>Proyecto</TableHead>
                <TableHead>Fecha y Hora</TableHead>
                <TableHead className="hidden md:table-cell">Tipo</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {meetings.map((meeting) => (
                <TableRow key={meeting.id}>
                  <TableCell className="font-medium">{meeting.title}</TableCell>
                  <TableCell>{meeting.project}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span>{formatDate(meeting.date)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span>
                          {meeting.time} ({meeting.duration})
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex items-center gap-1">
                      {meeting.type === "Videollamada" ? (
                        <Video className="h-3 w-3 text-muted-foreground" />
                      ) : (
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                      )}
                      <span>{meeting.type}</span>
                      <span className="text-xs text-muted-foreground">({meeting.location})</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {meeting.type === "Videollamada" ? (
                      <Button size="sm" onClick={() => window.open(meeting.location, "_blank")}>
                        Unirse
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => router.push(`/client/meetings/${meeting.id}`)}>
                        Detalles
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

