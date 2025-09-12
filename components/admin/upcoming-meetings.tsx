"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, Users, Video } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "../auth-provider"
import { getAllMeetings } from "@/services/meetings"
import { useEffect, useState } from "react"
import { Meeting } from "@/services/meetings"

export default function UpcomingMeetings() {
  const router = useRouter()
  const { user } = useAuth()
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const formatDate = (dateInput: string | Date) => {
    const date = dateInput instanceof Date ? dateInput : new Date(dateInput)
    return new Intl.DateTimeFormat("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date)
  }

  const fetchMeetings = async () => {
    try {
      setIsLoading(true)
      const response = await getAllMeetings()
      if (response && response.meetings) {
        // Sort meetings by date (newest first)
        const sortedMeetings = [...response.meetings].sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        )
        setMeetings(sortedMeetings)
      }
    } catch (error) {
      console.error("Error al obtener las reuniones:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchMeetings()
  }, [])

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
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Cargando reuniones...
                  </TableCell>
                </TableRow>
              ) : meetings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No hay reuniones programadas
                  </TableCell>
                </TableRow>
              ) : (
                meetings.map((meeting) => (
                  <TableRow key={meeting._id}>
                    <TableCell className="font-medium">
                      {meeting.title}
                      <div className="text-xs text-muted-foreground">{meeting.customer?.name || 'Sin cliente'}</div>
                    </TableCell>
                    <TableCell>{meeting.project?.title || meeting.project?.name || 'Sin proyecto'}</TableCell>
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
                        {meeting.meetingType?.toLowerCase() === 'virtual' ? (
                          <Video className="h-3 w-3 text-muted-foreground" />
                        ) : (
                          <Users className="h-3 w-3 text-muted-foreground" />
                        )}
                        <span>{meeting.meetingType || 'No especificado'}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {meeting.participants?.length || 0}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        onClick={() => {
                          if (meeting.meetingType?.toLowerCase() === 'virtual' && meeting.meetingLink) {
                            window.open(meeting.meetingLink, "_blank")
                          } else if (meeting.meetingType?.toLowerCase() === 'presencial' && meeting.address) {
                            window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(meeting.address)}`, "_blank")
                          } else {
                            router.push(`/admin/meetings/${meeting._id}`)
                          }
                        }}
                      >
                        {meeting.meetingType?.toLowerCase() === 'virtual' ? 'Unirse' : 'Ver detalles'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

