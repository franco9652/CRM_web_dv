"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Building, ExternalLink } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { getWorks, Work } from "@/services/works"

export default function ProjectList() {
  const router = useRouter()
  const [works, setWorks] = useState<Work[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [error, setError] = useState<string|null>(null)

  useEffect(() => {
    setLoading(true)
    getWorks(page)
      .then((data) => {
        setWorks(data.works)
        setTotalPages(data.totalPages)
        setLoading(false)
      })
      .catch((err) => {
        setError("Error al cargar los trabajos")
        setLoading(false)
      })
  }, [page])

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-"
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date)
  }

  const getStatusColor = (status?: string) => {
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
        <CardTitle>Trabajos/Proyectos</CardTitle>
        <CardDescription>Listado de todos los trabajos registrados en el sistema.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">Cargando trabajos...</div>
        ) : error ? (
          <div className="text-center text-red-500 py-8">{error}</div>
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>N°</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead className="hidden md:table-cell">Inicio</TableHead>
                    <TableHead className="hidden md:table-cell">Fin</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="hidden md:table-cell">Dirección</TableHead>
                    <TableHead className="hidden md:table-cell">Tipo</TableHead>
                    <TableHead className="hidden md:table-cell">Presupuesto</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {works.map((work) => (
                    <TableRow key={work._id}>
                      <TableCell>{work.number || '-'}</TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-muted-foreground" />
                          {work.name}
                        </div>
                      </TableCell>
                      <TableCell>{work.customerName || '-'}</TableCell>
                      <TableCell className="hidden md:table-cell">{formatDate(work.startDate)}</TableCell>
                      <TableCell className="hidden md:table-cell">{formatDate(work.endDate)}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(work.statusWork)}`}>
                          {work.statusWork || '-'}
                        </span>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{work.address || '-'}</TableCell>
                      <TableCell className="hidden md:table-cell">{work.projectType || '-'}</TableCell>
                      <TableCell className="hidden md:table-cell">{typeof work.budget === 'number' ? `$${work.budget.toLocaleString()}` : '-'}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          onClick={() => router.push(`/admin/projects/${work._id}`)}
                        >
                          <ExternalLink className="h-4 w-4" />
                          <span className="sr-only">Ver trabajo</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {/* Paginación */}
            <div className="flex justify-center mt-4 gap-2">
              <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage(page-1)}>
                Anterior
              </Button>
              <span className="px-2 py-1 text-sm">Página {page} de {totalPages}</span>
              <Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => setPage(page+1)}>
                Siguiente
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
