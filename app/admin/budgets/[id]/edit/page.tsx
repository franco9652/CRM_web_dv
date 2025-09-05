"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Loader2, Save, X } from "lucide-react"
import { getBudgetById, updateBudget } from "@/services/budgets"
import { getAllCustomers, Customer } from "@/services/customers"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"

// Define types for form fields
type ProjectType = "casa" | "edificio" | "local" | "remodelacion" | "ampliacion";
type BudgetStatus = "ACEPTADO" | "DENEGADO" | "PENDIENTE";

// Form state type
interface BudgetFormData {
  customerId: string;
  customerName: string;
  email: string;
  projectAddress: string;
  projectType: ProjectType;
  m2: string;
  levels: string;
  rooms: string;
  materials: string[];
  demolition: boolean;
  approvals: string[];
  budgetDate: string;
  subcontractors: string[];
  startDate: string;
  endDate: string;
  estimatedBudget: string;
  currency: string;
  advancePayment: boolean;
  documentation: string[];
  status: BudgetStatus;
}

export default function EditBudgetPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [budget, setBudget] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  
  const [formData, setFormData] = useState<BudgetFormData>({
    customerId: "",
    customerName: "",
    email: "",
    projectAddress: "",
    projectType: "casa",
    m2: "",
    levels: "1",
    rooms: "",
    materials: [],
    demolition: false,
    approvals: [],
    budgetDate: "",
    subcontractors: [],
    startDate: "",
    endDate: "",
    estimatedBudget: "",
    currency: "ARS",
    advancePayment: false,
    documentation: [],
    status: "PENDIENTE"
  })

  // Available options with proper typing
  const projectTypes: ProjectType[] = ["casa", "edificio", "local", "remodelacion", "ampliacion"];
  const materialOptions = ["Steel Framing", "Ladrillo", "Hormigón", "Madera", "Durlock", "Vidrio"] as const;
  const approvalOptions = ["planos", "higiene", "municipal", "seguridad", "otros"] as const;
  const subcontractorOptions = ["electricidad", "plomería", "gasista", "albañilería", "pintura"] as const;
  const currencyOptions = ["ARS", "USD", "EUR"] as const;
  const statusOptions: BudgetStatus[] = ["ACEPTADO", "DENEGADO", "PENDIENTE"];

  // Fetch customers on component mount
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const data = await getAllCustomers()
        setCustomers(data)
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudieron cargar los clientes",
          variant: "destructive",
        })
      }
    }
    fetchCustomers()
  }, [toast])

  useEffect(() => {
    const fetchBudget = async () => {
      if (!id) return
      
      try {
        const response = await getBudgetById(id as string)
        const budgetData = response.budget
        setBudget(budgetData)
        setFormData({
          customerId: budgetData.customerId || "",
          customerName: budgetData.customerName || "",
          email: budgetData.email || "",
          projectAddress: budgetData.projectAddress || "",
          projectType: (budgetData.projectType as ProjectType) || "casa",
          m2: budgetData.m2 || "",
          levels: budgetData.levels || "1",
          rooms: budgetData.rooms || "",
          materials: budgetData.materials || [],
          demolition: budgetData.demolition || false,
          approvals: budgetData.approvals || [],
          budgetDate: budgetData.budgetDate ? budgetData.budgetDate.split('T')[0] : "",
          subcontractors: budgetData.subcontractors || [],
          startDate: budgetData.startDate ? budgetData.startDate.split('T')[0] : "",
          endDate: budgetData.endDate ? budgetData.endDate.split('T')[0] : "",
          estimatedBudget: budgetData.estimatedBudget?.toString() || "",
          currency: budgetData.currency || "ARS",
          advancePayment: budgetData.advancePayment || false,
          documentation: budgetData.documentation || [],
          status: (budgetData.status as BudgetStatus) || "PENDIENTE"
        })
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

  // Update customer details when selected
  useEffect(() => {
    if (formData.customerId) {
      const customer = customers.find(c => c._id === formData.customerId)
      if (customer) {
        setSelectedCustomer(customer)
        setFormData(prev => ({
          ...prev,
          email: customer.email || "",
          customerName: `${customer.name} ${customer.secondName || ''}`.trim(),
        }));
      }
    }
  }, [formData.customerId, customers])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, type } = e.target as HTMLInputElement;
    
    // Handle different input types
    let newValue: string | boolean | ProjectType | BudgetStatus;
    
    if (type === 'checkbox') {
      newValue = (e.target as HTMLInputElement).checked;
    } else if (name === 'projectType') {
      newValue = (e.target as HTMLSelectElement).value as ProjectType;
    } else if (name === 'status') {
      newValue = (e.target as HTMLSelectElement).value as BudgetStatus;
    } else {
      newValue = (e.target as HTMLInputElement | HTMLTextAreaElement).value;
    }

    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }))
  }

  const handleCheckboxChange = (name: string, value: string, checked: boolean) => {
    setFormData(prev => {
      const currentArray = [...(prev[name as keyof typeof prev] as string[])]
      const updatedArray = checked
        ? [...currentArray, value]
        : currentArray.filter(item => item !== value)
      
      return {
        ...prev,
        [name]: updatedArray
      }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!budget?._id) return

    setIsSaving(true)
    try {
      // Prepare the data for submission
      const updateData = {
        ...formData,
        estimatedBudget: parseFloat(formData.estimatedBudget),
        m2: formData.m2, // Keep as string to match Budget interface
        levels: formData.levels, // Keep as string to match Budget interface
        rooms: formData.rooms, // Keep as string to match Budget interface
        customerName: selectedCustomer ? `${selectedCustomer.name} ${selectedCustomer.secondName || ''}`.trim() : formData.customerName,
        budgetDate: new Date(formData.budgetDate).toISOString(),
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString()
      }

      await updateBudget(budget._id, updateData)
      toast({
        title: "Éxito",
        description: "Presupuesto actualizado correctamente",
      })
      router.push(`/admin/budgets/${budget._id}`)
    } catch (error) {
      console.error("Error updating budget:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el presupuesto. Intente nuevamente.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
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
        onClick={() => router.back()}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Volver
      </Button>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Editar Presupuesto #{budget.ID}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del Presupuesto</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Customer Selection */}
              <div className="space-y-2">
                <Label htmlFor="customerId">Cliente *</Label>
                <Select 
                  value={formData.customerId} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, customerId: value }))}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione un cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer._id} value={customer._id}>
                        {customer.name} {customer.secondName} - {customer.dni}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Project Information */}
              <div className="space-y-2">
                <Label htmlFor="projectType">Tipo de Proyecto</Label>
                <Select 
                  value={formData.projectType}
                  onValueChange={(value: ProjectType) => setFormData(prev => ({ 
                    ...prev, 
                    projectType: value 
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione tipo de proyecto" />
                  </SelectTrigger>
                  <SelectContent>
                    {projectTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="projectAddress">Dirección del Proyecto *</Label>
                <Input
                  id="projectAddress"
                  name="projectAddress"
                  value={formData.projectAddress}
                  onChange={handleInputChange}
                  required
                  placeholder="Ej: Av. Corrientes 1234"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="m2">Metros Cuadrados (m²) *</Label>
                <Input
                  id="m2"
                  name="m2"
                  type="number"
                  min="1"
                  step="0.01"
                  value={formData.m2}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="levels">Niveles *</Label>
                <Input
                  id="levels"
                  name="levels"
                  type="number"
                  min="1"
                  value={formData.levels}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rooms">Habitaciones *</Label>
                <Input
                  id="rooms"
                  name="rooms"
                  type="number"
                  min="1"
                  value={formData.rooms}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* Dates */}
              <div className="space-y-2">
                <Label htmlFor="budgetDate">Fecha del Presupuesto *</Label>
                <Input
                  id="budgetDate"
                  name="budgetDate"
                  type="date"
                  value={formData.budgetDate}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="startDate">Fecha de Inicio Estimada *</Label>
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">Fecha de Finalización Estimada *</Label>
                <Input
                  id="endDate"
                  name="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* Budget Information */}
              <div className="space-y-2">
                <Label htmlFor="estimatedBudget">Presupuesto Estimado *</Label>
                <div className="flex gap-2">
                  <Input
                    id="estimatedBudget"
                    name="estimatedBudget"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.estimatedBudget}
                    onChange={handleInputChange}
                    required
                    className="flex-1"
                  />
                  <Select 
                    value={formData.currency}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}
                  >
                    <SelectTrigger className="w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currencyOptions.map((currency) => (
                        <SelectItem key={currency} value={currency}>
                          {currency}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Estado *</Label>
                <Select 
                  value={formData.status}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status.charAt(0) + status.slice(1).toLowerCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Checkbox Groups */}
              <div className="space-y-4">
                <Label>Materiales</Label>
                <div className="grid grid-cols-2 gap-2">
                  {materialOptions.map((material) => (
                    <div key={material} className="flex items-center space-x-2">
                      <Checkbox
                        id={`material-${material}`}
                        checked={formData.materials.includes(material)}
                        onCheckedChange={(checked) => 
                          handleCheckboxChange('materials', material, checked as boolean)
                        }
                      />
                      <label
                        htmlFor={`material-${material}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {material}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <Label>Aprobaciones Requeridas</Label>
                <div className="grid grid-cols-2 gap-2">
                  {approvalOptions.map((approval) => (
                    <div key={approval} className="flex items-center space-x-2">
                      <Checkbox
                        id={`approval-${approval}`}
                        checked={formData.approvals.includes(approval)}
                        onCheckedChange={(checked) => 
                          handleCheckboxChange('approvals', approval, checked as boolean)
                        }
                      />
                      <label
                        htmlFor={`approval-${approval}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {approval.charAt(0).toUpperCase() + approval.slice(1)}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <Label>Subcontratistas</Label>
                <div className="grid grid-cols-2 gap-2">
                  {subcontractorOptions.map((subcontractor) => (
                    <div key={subcontractor} className="flex items-center space-x-2">
                      <Checkbox
                        id={`subcontractor-${subcontractor}`}
                        checked={formData.subcontractors.includes(subcontractor)}
                        onCheckedChange={(checked) => 
                          handleCheckboxChange('subcontractors', subcontractor, checked as boolean)
                        }
                      />
                      <label
                        htmlFor={`subcontractor-${subcontractor}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {subcontractor.charAt(0).toUpperCase() + subcontractor.slice(1)}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Additional Options */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="demolition"
                    checked={formData.demolition}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({ ...prev, demolition: checked as boolean }))
                    }
                  />
                  <label
                    htmlFor="demolition"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Incluye demolición
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="advancePayment"
                    checked={formData.advancePayment}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({ ...prev, advancePayment: checked as boolean }))
                    }
                  />
                  <label
                    htmlFor="advancePayment"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Incluye adelanto
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isSaving}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
