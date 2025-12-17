"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, FileText, Calendar, Home, Ruler, Layers, Hammer, CheckCircle2, XCircle, Loader2, Edit, Trash2 } from "lucide-react"
import { getBudgetById, deleteBudget } from "@/services/budgets"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function AdminBudgetDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [budget, setBudget] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const fetchBudget = async () => {
      if (!id) return
      
      try {
        const response = await getBudgetById(id as string)
        setBudget(response.budget)
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudo cargar el presupuesto",
          variant: "destructive",
        })
        router.push("/admin/budgets")
      } finally {
        setIsLoading(false)
      }
    }

    fetchBudget()
  }, [id, router, toast])

  const handleDelete = async () => {
    if (!budget?._id) return
    
    setIsDeleting(true)
    try {
      await deleteBudget(budget._id)
      toast({
        title: "Éxito",
        description: "Presupuesto eliminado correctamente",
      })
      router.push("/admin/budgets")
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el presupuesto",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: currency || 'ARS',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-AR')
  }

  if (isLoading) {
    return (
      <div className="text-center py-8 flex justify-center items-center p-6">
        <Loader2 className="animate-spin text-primary" size={24} />
        <p className="px-6">Cargando presupuesto...</p>
      </div>
    )
  }

  if (!budget) return null

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        className="pl-0"
        onClick={() => router.push("/admin/budgets")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Volver a la lista
      </Button>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Detalle del Presupuesto #{budget.ID}</h1>
        <div className="flex items-center gap-3">
          <Badge
            className={`px-3 py-1 text-sm ${
              budget.status === "ACEPTADO"
                ? "bg-green-100 text-green-800"
                : budget.status === "DENEGADO"
                ? "bg-red-100 text-red-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {budget.status}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/admin/budgets/${budget._id}/edit`)}
          >
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" disabled={isDeleting}>
                <Trash2 className="mr-2 h-4 w-4" />
                {isDeleting ? "Eliminando..." : "Eliminar"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción no se puede deshacer. Se eliminará permanentemente el presupuesto #{budget.ID}.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Eliminar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Información Básica */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <span>Información Básica</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Cliente</p>
              <p className="font-medium">{budget.customerName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p>{budget.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Fecha del Presupuesto</p>
              <p>{formatDate(budget.budgetDate)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tipo de Proyecto</p>
              <p className="capitalize">{budget.projectType}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Presupuesto Estimado</p>
              <p className="font-medium">{formatCurrency(budget.estimatedBudget, budget.currency)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pago Adelantado</p>
              <div className="flex items-center gap-2">
                {budget.advancePayment ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Sí</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 text-red-500" />
                    <span>No</span>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dirección del Proyecto */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5 text-muted-foreground" />
              <span>Dirección del Proyecto</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>{budget.projectAddress}</p>
          </CardContent>
        </Card>

        {/* Fechas */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <span>Fechas</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Fecha de Inicio</p>
              <p>{formatDate(budget.startDate)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Fecha de Finalización</p>
              <p>{formatDate(budget.endDate)}</p>
            </div>
          </CardContent>
        </Card>

        {/* Detalles Técnicos */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Ruler className="h-5 w-5 text-muted-foreground" />
              <span>Detalles Técnicos</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Metros Cuadrados</p>
              <p>{budget.m2} m²</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Niveles</p>
              <p>{budget.levels}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Habitaciones</p>
              <p>{budget.rooms}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">ID de Trabajo</p>
              <p className="font-mono text-sm">{budget.workId}</p>
            </div>
          </CardContent>
        </Card>

        {/* Materiales */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-muted-foreground" />
              <span>Materiales</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {budget?.materials?.map((material: string, index: number) => (
                <Badge key={index} variant="outline" className="capitalize">
                  {material}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Aprobaciones Requeridas */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
              <span>Aprobaciones Requeridas</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-1">
              {budget?.approvals?.map((approval: string, index: number) => (
                <li key={index} className="capitalize">{approval}</li>
              ))}
              {budget?.approvals?.length === 0 && <li className="text-muted-foreground">No se requieren aprobaciones especiales</li>}
            </ul>
          </CardContent>
        </Card>

        {/* Demolición */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Hammer className="h-5 w-5 text-muted-foreground" />
              <span>Demolición</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {budget.demolition ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>Se requiere demolición</span>
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 text-red-500" />
                  <span>No se requiere demolición</span>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Subcontratistas */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Hammer className="h-5 w-5 text-muted-foreground" />
              <span>Subcontratistas</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-1">
              {budget?.subcontractors?.map((sub: string, index: number) => (
                <li key={index} className="capitalize">{sub}</li>
              ))}
              {budget?.subcontractors?.length === 0 && <li className="text-muted-foreground">No se requieren subcontratistas</li>}
            </ul>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
