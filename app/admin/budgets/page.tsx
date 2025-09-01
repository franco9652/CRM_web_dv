"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Search } from "lucide-react"
import { getAllBudgets, Budget } from "@/services/budgets"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function BudgetsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchBudgets = async () => {
      try {
        const data = await getAllBudgets()
        setBudgets(data)
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudieron cargar los presupuestos",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchBudgets()
  }, [toast])

  const filteredBudgets = budgets.filter((budget) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      budget.customerName?.toLowerCase().includes(searchLower) ||
      budget.projectAddress?.toLowerCase().includes(searchLower) ||
      budget.status?.toLowerCase().includes(searchLower) ||
      budget.ID?.toString().includes(searchTerm)
    )
  })

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
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Presupuestos</h1>
        <Button onClick={() => router.push("/admin/budgets/new")}>
          Nuevo Presupuesto
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Lista de Presupuestos</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar presupuestos..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Dirección</TableHead>
                <TableHead>Presupuesto</TableHead>
                <TableHead>Fecha Inicio</TableHead>
                <TableHead>Fecha Fin</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="w-0"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBudgets.length > 0 ? (
                filteredBudgets.map((budget) => (
                  <TableRow key={budget._id}>
                    <TableCell>{budget.ID}</TableCell>
                    <TableCell className="font-medium">
                      {budget.customerName}
                    </TableCell>
                    <TableCell>{budget.projectAddress}</TableCell>
                    <TableCell>
                      {formatCurrency(budget.estimatedBudget, budget.currency)}
                    </TableCell>
                    <TableCell>{formatDate(budget.startDate)}</TableCell>
                    <TableCell>{formatDate(budget.endDate)}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          budget.status === "APROBADO"
                            ? "bg-green-100 text-green-800"
                            : budget.status === "RECHAZADO"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {budget.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Acciones</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() =>
                              router.push(`/admin/budgets/${budget._id}`)
                            }
                          >
                            Ver detalles
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              router.push(`/admin/budgets/${budget._id}/edit`)
                            }
                          >
                            Editar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No se encontraron presupuestos.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}