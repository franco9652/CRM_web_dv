"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, ArrowLeft, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { type Work, getWorkById } from "@/services/works"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Loader2 } from "lucide-react"

const formatDate = (dateString: string) => {
  if (!dateString) return "Fecha no disponible";
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('es-ES', options);
};

const getStatusColor = (status: string | undefined) => {
  switch (status) {
    case "En Progreso":
      return "text-blue-500";
    case "Completado":
      return "text-green-500";
    case "Retrasado":
      return "text-red-500";
    default:
      return "text-gray-500";
  }
};

export default function ProjectDetailPage() {
  const today = new Date()
  const todayString = today.toISOString().split('T')[0]
  const params = useParams();
  const work_id = params.work_id as string;
  const [work, setWork] = useState<Work | null>(null)
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (work_id) {
      const fetchWork = async () => {
        try {
          setLoading(true);
          const fetchedWork = await getWorkById(work_id);
          setWork(fetchedWork?.work);
        } catch (error) {
          console.error("Error al obtener el proyecto:", error);
          setWork(null);
        } finally {
          setLoading(false);
        }
      };
      fetchWork();
    }
  }, [work_id])


  if (loading) {
    return (
    <div className="text-center py-8 flex justify-center items-center p-6 h-screen">
    <Loader2 className="animate-spin text-primary" size={44} />
    <p className="px-6 text-2xl font-bold">Cargando proyecto...</p>
  </div>
    )
  }

  if (!work) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <h2 className="text-2xl font-bold mb-4">Proyecto no encontrado</h2>
        <p className="text-muted-foreground mb-8">El proyecto que buscas no existe o fue eliminado.</p>
        <Button asChild>
          <Link href="/client/projects">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a la lista de proyectos
          </Link>
        </Button>
      </div>
    )
  }

  // Procesar coordenadas para el enlace de Google Maps
  let googleMapsUrl = null;
  if (work?.workUbication) {
    const parts = work.workUbication.split(', ');
    if (parts.length === 2) {
      const lat = parseFloat(parts[0]);
      const lng = parseFloat(parts[1]);
      if (!isNaN(lat) && !isNaN(lng)) {
        googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
      }
    }
  }

  return (
    <div className="space-y-4">
          <Button variant="ghost" asChild>
            <Link href="/client/projects">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Link>
          </Button>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{work?.name}</h1>
        </div>
        <div className={`text-lg font-semibold ${getStatusColor(work?.statusWork)}`}>{work?.statusWork}</div>
      </div>
      <p className="text-muted-foreground">{work?.customerName}</p>

      <Card>
        <CardHeader>
          <CardTitle>Resumen del Proyecto</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-6">
          <div className="flex items-center gap-4">
            <Calendar className="h-8 w-8 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Fecha de Inicio</p>
              <p className="font-medium">{formatDate(work?.startDate ?? todayString)}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Calendar className="h-8 w-8 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Fecha de Fin</p>
              <p className="font-medium">{formatDate(work?.endDate ?? todayString)}</p>
            </div>
          </div>
          <div className="flex flex-col items-center gap-4">
            <span className="text-sm font-medium">{work?.projectType}</span>

          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Información Financiera</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Presupuesto Total</span>
              <span className="font-semibold">{work?.budget}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Detalle</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Tipo de Proyecto</span>
              <span className="font-semibold">{work?.projectType}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Dirección</span>
              {googleMapsUrl ? (
                <div className="flex flex-col">
                <span className="font-semibold">{work?.address}</span>
                  <a 
                    href={googleMapsUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="font-semibold text-primary hover:underline"
                    >
                    Ver en mapa 📍
                  </a>
                </div>                
              ) : (
                <span className="font-semibold">{work?.address || 'No disponible'}</span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
