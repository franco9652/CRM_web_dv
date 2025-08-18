"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Building, Calendar, Users, DollarSign, AlertCircle, Loader2, Clock, CheckCircle, PauseCircle } from "lucide-react"
import ProjectList from "@/components/admin/project-list"
import UpcomingMeetings from "@/components/admin/upcoming-meetings"
import RecentActivity from "@/components/admin/recent-activity"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { Customer, getAllCustomers, getCustomers, getCustomersByUserId } from "@/services/customers"
import { getAllWorks, getWorks, getWorksByCustomerId, Work } from "@/services/works"
import { useEffect, useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { Budget, getAllBudgets, getBudgetsByUserId } from "@/services/budgets"

export default function AdminDashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [works, setWorks] = useState<Work[]>([])
  const [loadingWorks, setLoadingWorks] = useState(true)
  const [worksError, setWorksError] = useState("")
  const [worksCount, setWorksCount] = useState(0)
  const [loadingCustomers, setLoadingCustomers] = useState(true)
  const [customersCount, setCustomersCount] = useState(0)
  const [customersError, setCustomersError] = useState("")
  const [futureProjectsCount, setFutureProjectsCount] = useState(0);
  const [futureCustomersCount, setFutureCustomersCount] = useState(0);
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [loadingBudgets, setLoadingBudgets] = useState(true)
  const [budgetsError, setBudgetsError] = useState("")
  const [budgetsCount, setBudgetsCount] = useState(0)
  const [futureBudgetsCount, setFutureBudgetsCount] = useState(0);
  const [statusCounts, setStatusCounts] = useState<{ [key: string]: number }>({
    'En progreso': 0,
    'activo': 0,
    'inactivo': 0
  });

      const fetchWorks = async () => {
        if (!user?.role) {
          setWorksError("No se encontró el rol del usuario actual")
          return
        }
        setLoadingWorks(true)
        setWorksError("")
        try {
          let data: any = []
          if (user.role === "admin") {
            // Obtener todos los proyectos para admin
            const response = await getAllWorks()
            data = response
          } else if (user.role === "client" || user.role === "customer" || user.role === "employee") {
            // Obtener solo los proyectos del cliente o empleado
            if (!user.id) throw new Error("ID de cliente no válido")
            const worksResult = await getWorksByCustomerId(user.id)
            // const worksResult = await getWorksByCustomerId("678ac8bbcaa29603b2663cba")
            data = worksResult as Work[]
          } else {
            throw new Error("Rol de usuario no soportado")
          }
          setWorks(data)
        } catch (err: any) {
          if(err?.status === 400){
            setWorksError(`"Error al cargar los proyectos. ID cliente erroneo"`)
          } else if (err?.status === 404){
            setWorksError("No se encontraron proyectos")
            setLoadingWorks(false)
          } else {
            setWorksError("Error al cargar los proyectos")
            setLoadingWorks(false)
          }
          toast({ title: "Error", description: err?.message || "No se pudieron cargar los trabajos", variant: "destructive" })
        } finally {
          setLoadingWorks(false)
        }
      }

      const fetchCustomers = async () => {
        if (!user?.role) {
          setCustomersError("No se encontró el rol del usuario actual")
          return
        }
        setLoadingCustomers(true)
        setCustomersError("")
        try {
          let data: any = []
          if (user.role === "admin") {
            // Obtener todos los clientes para admin
            const response = await getAllCustomers()
            data = response
          } else if (user.role === "client" || user.role === "customer" || user.role === "employee") {
            // Obtener solo los clientes del cliente o empleado
            if (!user.id) throw new Error("ID de cliente no válido")
            const customersResult = await getCustomersByUserId(user.id)
            // const customersResult = await getCustomersByUserId("678ac8bbcaa29603b2663cba")
            data = customersResult as Customer[]
          } else {
            throw new Error("Rol de usuario no soportado")
          }
          setCustomers(data)
        } catch (err: any) {
          if(err?.status === 400){
            setCustomersError(`"Error al cargar los clientes. ID cliente erroneo"`)
          } else if (err?.status === 404){
            setCustomersError("No se encontraron clientes")
            setLoadingCustomers(false)
          } else {
            setCustomersError("Error al cargar los clientes")
            setLoadingCustomers(false)
          }
          toast({ title: "Error", description: err?.message || "No se pudieron cargar los clientes", variant: "destructive" })
        } finally {
          setLoadingCustomers(false)
        }
      }

      const fetchBudgets = async () => {
        if (!user?.role) {
          setBudgetsError("No se encontró el rol del usuario actual")
          return
        }
        setLoadingBudgets(true)
        setBudgetsError("")
        try {
          let data: any = []
          if (user.role === "admin") {
            // Obtener todos los presupuestos para admin
            const response = await getAllBudgets()
            data = response
          } else if (user.role === "client" || user.role === "customer" || user.role === "employee") {
            // Obtener solo los presupuestos del cliente o empleado
            if (!user.id) throw new Error("ID de cliente no válido")
            const budgetsResult = await getBudgetsByUserId(user.id)
            // const budgetsResult = await getBudgetsByUserId("678ac8bbcaa29603b2663cba")
            data = budgetsResult?.budgets || []
          } else {
            throw new Error("Rol de usuario no soportado")
          }
          setBudgets(data)
        } catch (err: any) {
          if(err?.status === 400){
            setBudgetsError(`"Error al cargar los presupuestos. ID cliente erroneo"`)
          } else if (err?.status === 404){
            setBudgetsError("No se encontraron presupuestos")
            setLoadingBudgets(false)
          } else {
            setBudgetsError("Error al cargar los presupuestos")
            setLoadingBudgets(false)
          }
          toast({ title: "Error", description: err?.message || "No se pudieron cargar los presupuestos", variant: "destructive" })
        } finally {
          setLoadingBudgets(false)
        }
      }
    
      useEffect(() => {
        fetchBudgets()
        fetchWorks()
        fetchCustomers()
      }, [user?.id, user?.role])

      useEffect(() => {
        if (works?.length > 0) {
          setWorksCount(works?.length);
          // Count projects with startDate after 2025-02-03
          const targetDate = new Date('2025-01-03T00:00:00.000Z');
          const futureProjectsCount = works?.filter(work => {
            if (!work?.startDate) return false; 
            const workStartDate = new Date(work.startDate);
            return workStartDate > targetDate;
          }).length;
          setFutureProjectsCount(futureProjectsCount);
        }
      }, [works]);

      useEffect(() => {
        if (customers?.length > 0) {
          setCustomersCount(customers?.length);
          // Count customers with createdAt after 2025-02-03
          const targetDate = new Date('2025-01-03T00:00:00.000Z');
          const futureCustomersCount = customers?.filter(customer => {
            if (!customer?.createdAt) return false; 
            const customerCreatedAt = new Date(customer.createdAt);
            return customerCreatedAt > targetDate;
          }).length;
          setFutureCustomersCount(futureCustomersCount);
        }
      }, [customers]);

      useEffect(() => {
        if (works && works?.length > 0) {
          const counts = works.reduce((acc, work) => {
            const status = work.statusWork || 'Inactivo';
            acc[status] = (acc[status] || 0) + 1;
            return acc;
          }, {} as { [key: string]: number });
          
          // Ensure all statuses are in the result, even if count is 0
          setStatusCounts({
            'En progreso': counts['En progreso'] || 0,
            'activo': counts['activo'] || 0,
            'inactivo': counts['inactivo'] || 0
          });
        } else {
          setStatusCounts({
            'En progreso': 0,
            'activo': 0,
            'inactivo': 0
          });
        }
      }, [works]);

      useEffect(() => {
        if (budgets && budgets?.length > 0) {
          setBudgetsCount(budgets?.length);
          // Count budgets with createdAt after 2025-02-03
          const targetDate = new Date('2025-01-03T00:00:00.000Z');
          const futureBudgetsCount = budgets?.filter(budget => {
            if (!budget?.createdAt) return false; 
            const budgetCreatedAt = new Date(budget.createdAt);
            return budgetCreatedAt > targetDate;
          }).length;
          setFutureBudgetsCount(futureBudgetsCount);
        }
      }, [budgets]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Bienvenido, {user?.name}. Aquí tienes un resumen de todos los proyectos.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push("/admin/calendar")}>
            <Calendar className="mr-2 h-4 w-4" />
            Programar Reunión
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {loadingWorks && !worksError && (
          <div className="text-center py-8 flex justify-center items-center p-6">
          <Loader2 className="animate-spin text-primary" size={24} />
          <p className="px-6">Cargando proyectos...</p>
        </div>
        )}
        { !loadingWorks && worksError && <div className="text-center py-6 text-red-500">{worksError}</div>}
        {
          !loadingWorks && !worksError && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Proyectos Activos</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{worksCount}</div>
              <p className="text-xs text-muted-foreground">{futureProjectsCount} Proyectos activos desde los ultimos 6 meses</p>
            </CardContent>
          </Card>
          )
        }
        {loadingCustomers && !customersError && (
          <div className="text-center py-8 flex justify-center items-center p-6">
          <Loader2 className="animate-spin text-primary" size={24} />
          <p className="px-6">Cargando clientes...</p>
        </div>
        )}
        { !loadingCustomers && customersError && <div className="text-center py-6 text-red-500">{customersError}</div>}
        {
          !loadingCustomers && !customersError && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customersCount}</div>
            <p className="text-xs text-muted-foreground">{futureCustomersCount} Clientes desde el mes pasado</p>
          </CardContent>
        </Card>
        )}
        {loadingBudgets && !budgetsError && (
          <div className="text-center py-8 flex justify-center items-center p-6">
          <Loader2 className="animate-spin text-primary" size={24} />
          <p className="px-6">Cargando presupuestos...</p>
        </div>
        )}
        { !loadingBudgets && budgetsError && <div className="text-center py-6 text-red-500">{budgetsError}</div>}
        {
          !loadingBudgets && !budgetsError && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Presupuestos Totales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{budgetsCount}</div>
            <p className="text-xs text-muted-foreground">{futureBudgetsCount} Presupuestos en los ultimos 6 meses</p>
          </CardContent>
        </Card>
        )}

      </div>

      <Tabs defaultValue="projects">
        <TabsList>
          <TabsTrigger value="projects">Proyectos</TabsTrigger>
          <TabsTrigger value="meetings">Reuniones</TabsTrigger>
          <TabsTrigger value="activity">Lista de empleados</TabsTrigger>
        </TabsList>
        <TabsContent value="projects" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Información de Proyectos</CardTitle>
                <CardDescription>Información general de todos los proyectos activos</CardDescription>
              </CardHeader>
              <CardContent>
              {
              !loadingWorks && !worksError && (
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Estado de Proyectos</CardTitle>
                    <div className="flex gap-1">
                      <Clock className="h-4 w-4 text-blue-500" />
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <PauseCircle className="h-4 w-4 text-gray-500" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground flex items-center">
                          <Clock className="mr-1 h-3 w-3 text-blue-500" /> En progreso
                        </span>
                        <span className="font-medium">{statusCounts['En progreso'] || 0}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground flex items-center">
                          <CheckCircle className="mr-1 h-3 w-3 text-green-500" /> Activo
                        </span>
                        <span className="font-medium">{statusCounts['Activo'] || 0}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground flex items-center">
                          <PauseCircle className="mr-1 h-3 w-3 text-gray-500" /> Inactivo
                        </span>
                        <span className="font-medium">{statusCounts['Inactivo'] || 0}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                )
              }
              </CardContent>
            </Card>
          </div>
          <ProjectList />
        </TabsContent>
        <TabsContent value="meetings">
          <UpcomingMeetings />
        </TabsContent>
        <TabsContent value="activity">
          <RecentActivity />
        </TabsContent>
      </Tabs>
    </div>
  )
}

