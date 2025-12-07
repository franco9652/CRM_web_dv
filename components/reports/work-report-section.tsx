"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts"
import {
  FileText,
  Send,
  RefreshCw,
  Users,
  Package,
  Wrench,
  ClipboardCheck,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Loader2,
  Mail,
  Clock,
  Eye
} from "lucide-react"
import {
  getReportPreview,
  sendReport,
  getReportsByWorkId,
  formatCurrency,
  calculateSpentPercentage,
  type ReportPreview,
  type Report,
  type ReportMetrics
} from "@/services/reports"

interface WorkReportSectionProps {
  workId: string
  workName: string
  customerEmail?: string
}

const CHART_COLORS = {
  materials: "#3b82f6",
  labor: "#10b981",
  inspection: "#f59e0b",
  other: "#8b5cf6",
  remaining: "#e5e7eb"
}

export function WorkReportSection({ workId, workName, customerEmail }: WorkReportSectionProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [sendingEmail, setSendingEmail] = useState(false)
  const [preview, setPreview] = useState<ReportPreview | null>(null)
  const [reports, setReports] = useState<Report[]>([])
  const [loadingReports, setLoadingReports] = useState(false)
  const [showEmailDialog, setShowEmailDialog] = useState(false)
  const [showPreviewDialog, setShowPreviewDialog] = useState(false)
  const [ccEmails, setCcEmails] = useState("")
  const [bccEmails, setBccEmails] = useState("")

  // Cargar historial de reportes
  const loadReportHistory = async () => {
    setLoadingReports(true)
    try {
      const data = await getReportsByWorkId(workId, 10)
      setReports(data)
    } catch (error) {
      console.error("Error loading reports:", error)
    } finally {
      setLoadingReports(false)
    }
  }

  // Generar preview del reporte
  const generatePreview = async () => {
    setLoading(true)
    try {
      const data = await getReportPreview(workId)
      console.log("📊 Respuesta del backend:", JSON.stringify(data, null, 2))
      console.log("📊 Preview:", data.preview)
      console.log("📊 Metrics:", data.preview?.metrics)
      console.log("📊 SiteData:", data.preview?.metrics?.siteData)
      setPreview(data.preview)
      toast({
        title: "Reporte generado",
        description: "Los datos del reporte se han actualizado correctamente.",
      })
    } catch (error: any) {
      console.error("Error generating preview:", error)
      const errorMessage = error.response?.data?.error || "Error al generar el reporte"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Enviar reporte por email
  const handleSendReport = async () => {
    setSendingEmail(true)
    try {
      const cc = ccEmails.split(",").map(e => e.trim()).filter(e => e)
      const bcc = bccEmails.split(",").map(e => e.trim()).filter(e => e)
      
      const result = await sendReport(workId, { cc, bcc })
      
      toast({
        title: "Reporte enviado",
        description: `El reporte se ha enviado correctamente a ${preview?.to || customerEmail}`,
      })
      
      setShowEmailDialog(false)
      setCcEmails("")
      setBccEmails("")
      
      // Recargar historial
      loadReportHistory()
    } catch (error: any) {
      console.error("Error sending report:", error)
      const errorMessage = error.response?.data?.error || "Error al enviar el reporte"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setSendingEmail(false)
    }
  }

  useEffect(() => {
    loadReportHistory()
  }, [workId])

  // Datos para el gráfico de gastos
  const getExpenseChartData = (metrics: ReportMetrics) => {
    const { siteData } = metrics
    return [
      { name: "Materiales", value: siteData.materialsCost, color: CHART_COLORS.materials },
      { name: "Mano de obra", value: siteData.laborCost, color: CHART_COLORS.labor },
      { name: "Inspección", value: siteData.inspectionCost, color: CHART_COLORS.inspection },
      { name: "Otros", value: siteData.otherCosts, color: CHART_COLORS.other },
    ].filter(item => item.value > 0)
  }

  // Datos para el gráfico de presupuesto
  const getBudgetChartData = (metrics: ReportMetrics) => {
    const { siteData, budget } = metrics
    return [
      { name: "Gastado", value: siteData.totalSpent, color: "#ef4444" },
      { name: "Disponible", value: siteData.remainingBudget, color: "#22c55e" },
    ]
  }

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }).format(new Date(dateString))
  }

  return (
    <div className="space-y-6">
      {/* Header con acciones */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-semibold">Reportes de Obra</h3>
          <p className="text-sm text-muted-foreground">
            Genera y envía reportes con métricas de la obra al cliente
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={generatePreview}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            {preview ? "Actualizar datos" : "Generar reporte"}
          </Button>
          {preview && (
            <>
              <Button
                variant="outline"
                onClick={() => setShowPreviewDialog(true)}
              >
                <Eye className="mr-2 h-4 w-4" />
                Ver email
              </Button>
              <Button 
                onClick={() => setShowEmailDialog(true)}
                disabled={!customerEmail && !preview.to}
              >
                <Send className="mr-2 h-4 w-4" />
                Enviar al cliente
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Contenido del reporte */}
      {preview && preview.metrics ? (
        <div className="grid gap-6">
          {/* Cards de métricas principales */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{preview.metrics.siteData?.employeesOnSite ?? preview.metrics.employeesAssigned ?? 0}</p>
                    <p className="text-xs text-muted-foreground">Empleados asignados</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                    <Package className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{preview.metrics.siteData?.materialsCount ?? preview.metrics.documentsCount ?? 0}</p>
                    <p className="text-xs text-muted-foreground">{preview.metrics.siteData ? 'Materiales' : 'Documentos'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-amber-100 dark:bg-amber-900 rounded-lg">
                    <TrendingUp className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{preview.metrics.progressPct ?? 0}%</p>
                    <p className="text-xs text-muted-foreground">Progreso</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                    <Clock className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{preview.metrics.daysElapsed ?? 0}</p>
                    <p className="text-xs text-muted-foreground">Días transcurridos</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Gráficos - Solo mostrar si hay siteData */}
          {preview.metrics.siteData ? (
            <div className="grid md:grid-cols-2 gap-6">
              {/* Gráfico de distribución de gastos */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Distribución de Gastos</CardTitle>
                  <CardDescription>Desglose por categoría</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={getExpenseChartData(preview.metrics)}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          labelLine={false}
                        >
                          {getExpenseChartData(preview.metrics).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value: number) => formatCurrency(value, preview.metrics.budget?.currency || 'ARS')}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Gráfico de presupuesto */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Estado del Presupuesto</CardTitle>
                  <CardDescription>
                    Total: {formatCurrency(preview.metrics.budget?.totalEstimated || 0, preview.metrics.budget?.currency || 'ARS')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="h-[180px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={getBudgetChartData(preview.metrics)}
                          layout="vertical"
                        >
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                          <XAxis type="number" tickFormatter={(value) => formatCurrency(value, preview.metrics.budget?.currency || 'ARS')} />
                          <YAxis type="category" dataKey="name" width={80} />
                          <Tooltip formatter={(value: number) => formatCurrency(value, preview.metrics.budget?.currency || 'ARS')} />
                          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                            {getBudgetChartData(preview.metrics).map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Gastado</span>
                        <span className="font-medium">
                          {calculateSpentPercentage(preview.metrics.siteData?.totalSpent || 0, preview.metrics.budget?.totalEstimated || 0)}%
                        </span>
                      </div>
                      <Progress 
                        value={calculateSpentPercentage(preview.metrics.siteData?.totalSpent || 0, preview.metrics.budget?.totalEstimated || 0)} 
                        className="h-2"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            /* Card de presupuesto simple cuando no hay siteData */
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Información del Presupuesto
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(preview.metrics.budget?.totalEstimated || 0, preview.metrics.budget?.currency || 'ARS')}
                    </p>
                    <p className="text-xs text-muted-foreground">Presupuesto total</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{preview.metrics.budget?.acceptedCount || 0}</p>
                    <p className="text-xs text-muted-foreground">Aceptados</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold text-amber-600">{preview.metrics.budget?.pendingCount || 0}</p>
                    <p className="text-xs text-muted-foreground">Pendientes</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold text-red-600">{preview.metrics.budget?.deniedCount || 0}</p>
                    <p className="text-xs text-muted-foreground">Denegados</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tabla de costos detallados - Solo si hay siteData */}
          {preview.metrics.siteData && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Resumen de Costos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-blue-500" />
                        <span>Materiales ({preview.metrics.siteData.materialsCount} items)</span>
                      </div>
                      <span className="font-medium">
                        {formatCurrency(preview.metrics.siteData.materialsCost, preview.metrics.budget?.currency || 'ARS')}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-green-500" />
                        <span>Mano de obra ({preview.metrics.siteData.employeesOnSite} empleados)</span>
                      </div>
                      <span className="font-medium">
                        {formatCurrency(preview.metrics.siteData.laborCost, preview.metrics.budget?.currency || 'ARS')}
                      </span>
                    </div>
                    {preview.metrics.siteData.hadInspection && (
                      <div className="flex justify-between items-center py-2 border-b">
                        <div className="flex items-center gap-2">
                          <ClipboardCheck className="h-4 w-4 text-amber-500" />
                          <span>Inspección</span>
                          {preview.metrics.siteData.inspectionPassed !== null && (
                            preview.metrics.siteData.inspectionPassed ? (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Aprobada
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                <XCircle className="h-3 w-3 mr-1" />
                                No aprobada
                              </Badge>
                            )
                          )}
                        </div>
                        <span className="font-medium">
                          {formatCurrency(preview.metrics.siteData.inspectionCost, preview.metrics.budget?.currency || 'ARS')}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between items-center py-2 border-b">
                      <div className="flex items-center gap-2">
                        <Wrench className="h-4 w-4 text-purple-500" />
                        <span>Otros gastos</span>
                      </div>
                      <span className="font-medium">
                        {formatCurrency(preview.metrics.siteData.otherCosts, preview.metrics.budget?.currency || 'ARS')}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center py-2 text-lg">
                      <span className="font-semibold">Total gastado</span>
                      <span className="font-bold text-red-600">
                        {formatCurrency(preview.metrics.siteData.totalSpent, preview.metrics.budget?.currency || 'ARS')}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 text-lg">
                      <span className="font-semibold">Presupuesto restante</span>
                      <span className="font-bold text-green-600">
                        {formatCurrency(preview.metrics.siteData.remainingBudget, preview.metrics.budget?.currency || 'ARS')}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Inspección */}
              {!preview.metrics.siteData.hadInspection && (
                <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950 dark:border-amber-800">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="h-5 w-5 text-amber-600" />
                      <div>
                        <p className="font-medium text-amber-800 dark:text-amber-200">Sin inspección registrada</p>
                        <p className="text-sm text-amber-600 dark:text-amber-400">
                          No se realizó inspección en este período de reporte.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="py-12">
            <div className="text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-medium mb-2">No hay datos de reporte</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Genera un reporte para ver las métricas actuales de la obra
              </p>
              <Button onClick={generatePreview} disabled={loading}>
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="mr-2 h-4 w-4" />
                )}
                Generar reporte
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Historial de reportes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Historial de Reportes Enviados
          </CardTitle>
          <CardDescription>Últimos reportes enviados al cliente</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingReports ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : reports.length > 0 ? (
            <div className="space-y-3">
              {reports.map((report) => (
                <div
                  key={report._id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${
                      report.sendStatus === 'sent' 
                        ? 'bg-green-100 dark:bg-green-900' 
                        : report.sendStatus === 'failed'
                        ? 'bg-red-100 dark:bg-red-900'
                        : 'bg-amber-100 dark:bg-amber-900'
                    }`}>
                      {report.sendStatus === 'sent' ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                      ) : report.sendStatus === 'failed' ? (
                        <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                      ) : (
                        <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{report.subject}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(report.createdAt)} • {report.recipients.join(", ")}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {formatCurrency(report.metrics?.siteData?.totalSpent || 0, report.metrics?.budget?.currency || 'ARS')}
                    </p>
                    <p className="text-xs text-muted-foreground">gastado</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Mail className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No hay reportes enviados aún</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog para enviar email */}
      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enviar Reporte por Email</DialogTitle>
            <DialogDescription>
              El reporte se enviará a {preview?.to || customerEmail}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="cc">CC (opcional)</Label>
              <Input
                id="cc"
                placeholder="email1@ejemplo.com, email2@ejemplo.com"
                value={ccEmails}
                onChange={(e) => setCcEmails(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Separa múltiples emails con comas
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bcc">BCC (opcional)</Label>
              <Input
                id="bcc"
                placeholder="archivo@empresa.com"
                value={bccEmails}
                onChange={(e) => setBccEmails(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEmailDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSendReport} disabled={sendingEmail}>
              {sendingEmail ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              Enviar reporte
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para preview del email */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Vista Previa del Email</DialogTitle>
            <DialogDescription>
              Asunto: {preview?.subject}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-auto border rounded-lg bg-white">
            {preview?.html && (
              <iframe
                srcDoc={preview.html}
                title="Email Preview"
                className="w-full h-[500px] border-0"
              />
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPreviewDialog(false)}>
              Cerrar
            </Button>
            <Button onClick={() => {
              setShowPreviewDialog(false)
              setShowEmailDialog(true)
            }}>
              <Send className="mr-2 h-4 w-4" />
              Enviar al cliente
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
