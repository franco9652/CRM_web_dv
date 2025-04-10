"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, Users, Video } from "lucide-react"
import { useRouter } from "next/navigation"

// Datos de reuniones de ejemplo
const meetings = [
  {
    id: 1,
    title: "Inicio de Proyecto",
    project: "Hotel Vista al Puerto",
    client: "Oscorp",
    date: "2024-03-20",
    time: "10:00 AM",
    duration: "1 hora",
    type: "Videollamada",
    attendees: 5,
    link: "https://meet.google.com/abc-defg-hij",
  },
  {
    id: 2,
    title: "Revisión de Diseño",
    project: "Torre Skyline",
    client: "Inmobiliaria Vista",
    date: "2024-03-22",
    time: "2:00 PM",
    duration: "1.5 horas",
    type: "Presencial",
    attendees: 8,
  },
  {
    id: 3,
    title: "Discusión de Presupuesto",
    project: "Complejo Riverside",
    client: "Desarrollos Globales",
    date: "2024-03-25",
    time: "11:00 AM",
    duration: "1 hora",
    type: "Videollamada",
    attendees: 4,
    link: "https://meet.google.com/xyz-uvwx-lmn",
  },
  {
    id: 4,
    title: "Actualización de Progreso",
    project: "Parque Oficinas Metro",
    client: "Corporación Stark",
    date: "2024-03-28",
    time: "3:30 PM",
    duration: "45 minutos",
    type: "Videollamada",
    attendees: 6,
    link: "https://meet.google.com/pqr-stu-vwx",
  },
]

export default function UpcomingMeetings() {
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
          <CardDescription>Programa y gestiona tus reuniones con clientes y miembros del equipo.</CardDescription>
        </div>
        <Button onClick={() => router.push("/admin/calendar")}>Programar Reunión</Button>
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
                <TableHead className="hidden md:table-cell">Asistentes</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {meetings.map((meeting) => (
                <TableRow key={meeting.id}>
                  <TableCell className="font-medium">
                    {meeting.title}
                    <div className="text-xs text-muted-foreground">{meeting.client}</div>
                  </TableCell>
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
                        <Users className="h-3 w-3 text-muted-foreground" />
                      )}
                      <span>{meeting.type}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{meeting.attendees}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      onClick={() => {
                        if (meeting.type === "Videollamada" && meeting.link) {
                          window.open(meeting.link, "_blank")
                        } else {
                          router.push(`/admin/meetings/${meeting.id}`)
                        }
                      }}
                    >
                      Unirse
                    </Button>
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

