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
import { Loader2, MoreHorizontal, Search } from "lucide-react"
import { getBudgetsByCustomerId, Budget, BudgetsResponse } from "@/services/budgets"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function ClientBudgetsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchBudgets = async () => {

      console.log('user: ', user)
      if (user?.role === "employee") {
        try {
          const response: BudgetsResponse = await getBudgetsByCustomerId(user?.id)
          setBudgets(response.budgets || [])
        } catch (error:any) {
          if(error?.status === 400){
            toast({ title: "Error", description: error?.message || "No se pudieron cargar los presupuestos", variant: "destructive" })
          } else if(error?.status === 404){
            if (error && !error.includes("No se encontraron presupuestos para este usuario")) {
              toast({ title: "Error", description: error || "No se pudieron cargar los presupuestos", variant: "destructive" })
            }
          } else {
            console.error("Error al cargar los presupuestos:", error)
            toast({ title: "Error", description: error?.message || "No se pudieron cargar los presupuestos", variant: "destructive" })
          }
        } finally {
          setIsLoading(false)
        }
      }
      else if (!user?.customerId) {
        setIsLoading(false)
        return
      }
      else {

      try {
        const response: BudgetsResponse = await getBudgetsByCustomerId(user.customerId)
        setBudgets(response.budgets || [])
      } catch (error:any) {
        if(error?.status === 400){
          toast({ title: "Error", description: error?.message || "No se pudieron cargar los presupuestos", variant: "destructive" })
        } else if(error?.status === 404){
          if (error && !error.includes("No se encontraron presupuestos para este usuario")) {
            toast({ title: "Error", description: error || "No se pudieron cargar los presupuestos", variant: "destructive" })
          }
        } else {
          console.error("Error al cargar los presupuestos:", error)
          toast({ title: "Error", description: error?.message || "No se pudieron cargar los presupuestos", variant: "destructive" })
        }
      } finally {
        setIsLoading(false)
      }
    }
  }

    fetchBudgets()
  }, [toast, user?.customerId])

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
      <div className="text-center py-8 flex justify-center items-center p-6">
        <Loader2 className="animate-spin text-primary" size={24} />
        <p className="px-6">Cargando presupuestos...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Mis Presupuestos</h1>
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
                    <TableCell>{budget.projectAddress}</TableCell>
                    <TableCell>
                      {formatCurrency(budget.estimatedBudget, budget.currency)}
                    </TableCell>
                    <TableCell>{formatDate(budget.startDate)}</TableCell>
                    <TableCell>{formatDate(budget.endDate)}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          budget.status === "ACEPTADO"
                            ? "bg-green-100 text-green-800"
                            : budget.status === "DENEGADO"
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
                              router.push(`/client/budgets/${budget._id}`)
                            }
                          >
                            Ver detalles
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={7}
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