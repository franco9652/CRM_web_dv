"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Building, ExternalLink } from "lucide-react"
import { useRouter } from "next/navigation"

// Mock project data
const projects = [
  {
    id: 1,
    name: "Torre Skyline",
    client: "Inmobiliaria Vista",
    startDate: "2023-01-15",
    endDate: "2024-06-30",
    budget: "$4.2M",
    progress: 75,
    status: "En Progreso",
  },
  {
    id: 2,
    name: "Complejo Riverside",
    client: "Desarrollos Globales",
    startDate: "2023-03-10",
    endDate: "2024-09-15",
    budget: "$3.8M",
    progress: 45,
    status: "En Progreso",
  },
  {
    id: 3,
    name: "Parque Oficinas Metro",
    client: "Corporación Stark",
    startDate: "2023-05-22",
    endDate: "2024-04-10",
    budget: "$2.5M",
    progress: 90,
    status: "En Progreso",
  },
  {
    id: 4,
    name: "Residencias Sunset",
    client: "Inversiones Wayne",
    startDate: "2022-11-05",
    endDate: "2023-12-20",
    budget: "$5.1M",
    progress: 100,
    status: "Completado",
  },
]

export default function ProjectList() {
  const router = useRouter()

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
      case "Planificación":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "En Progreso":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300"
      case "Completado":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "En Pausa":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Proyectos Activos</CardTitle>
        <CardDescription>Resumen de todos los proyectos de construcción actuales.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre del Proyecto</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead className="hidden md:table-cell">Cronograma</TableHead>
                <TableHead className="hidden md:table-cell">Presupuesto</TableHead>
                <TableHead>Progreso</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      {project.name}
                    </div>
                  </TableCell>
                  <TableCell>{project.client}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {formatDate(project.startDate)} - {formatDate(project.endDate)}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{project.budget}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={project.progress} className="h-2 w-[60px]" />
                      <span className="text-xs">{project.progress}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(project.status)}`}
                    >
                      {project.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0"
                      onClick={() => router.push(`/admin/projects/${project.id}`)}
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span className="sr-only">Ver proyecto</span>
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

