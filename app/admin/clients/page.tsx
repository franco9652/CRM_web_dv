"use client"

import { useEffect, useState, useMemo, FormEvent } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building, Loader2, MoreHorizontal, Search, UserPlus, Trash2 } from "lucide-react"
import { getAllCustomers, getCustomersByUserId, createCustomer, updateCustomer, deleteCustomer, Customer } from "@/services/customers"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"

export default function ClientsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    secondName: "",
    dni: "",
    cuit: "",
    cuil: "",
    address: "",
    workDirection: "",
    contactNumber: "",
    email: "",
    password: "",
    active: true,
    clienteActivo: true,
    firstRegister: true,
    documents: [],
    worksActive: [],
    meetings: [],
    createdAt: new Date()
  })
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [passwordError, setPasswordError] = useState("")
  const [dniError, setDniError] = useState("")
  const [cuitError, setCuitError] = useState("")
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(true)
  const [customersCount, setCustomersCount] = useState(0)
  const [customersError, setCustomersError] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const [deletingClientId, setDeletingClientId] = useState<string | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [clientToDelete, setClientToDelete] = useState<Customer | null>(null)
  const [updatingClientId, setUpdatingClientId] = useState<string | null>(null)

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
        const response = await getCustomersByUserId(user.id)
        data = response.customer
      } else {
        throw new Error("Rol de usuario no soportado")
      }
      setCustomers(data)
    } catch (err: any) {
      if (err?.status === 400) {
        setCustomersError(`"Error al cargar los clientes. ID cliente erroneo"`)
      } else if (err?.status === 404) {
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

  const filteredClients = useMemo(() =>
    customers.filter(
      (client) =>
      (client.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (client.contactNumber || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (client.email || "").toLowerCase().includes(searchTerm.toLowerCase()))
    ),
    [customers, searchTerm]
  )

  const totalPages = Math.ceil(filteredClients.length / itemsPerPage)
  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredClients.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredClients, currentPage, itemsPerPage])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const validatePassword = (password: string) => {
    if (!password) {
      return "La contraseña no puede estar vacía."
    }
    if (password.length < 8) {
      return "La contraseña debe tener al menos 8 caracteres."
    }
    if (!/[A-Z]/.test(password)) {
      return "La contraseña debe incluir al menos una letra mayúscula."
    }
    if (!/[!@#$%^&*()_\-+={}\[\]|:;\"'<>,.?/~`]/.test(password)) {
      return "La contraseña debe incluir al menos un símbolo (por ejemplo !@#$%)."
    }
    return ""
  }

  const validateDNI = (dni: string) => {
    if (!dni) {
      return "El DNI no puede estar vacío."
    }
    // Remove periods from DNI
    const cleanDNI = dni.replace(/\./g, '')
    // Check if it contains only digits
    if (!/^\d+$/.test(cleanDNI)) {
      return "El DNI solo debe contener números (se permiten puntos)."
    }
    // Check if it has 7 or 8 digits
    if (cleanDNI.length !== 7 && cleanDNI.length !== 8) {
      return "El DNI debe tener 7 u 8 dígitos."
    }
    return ""
  }

  const validateCUIT = (cuit: string) => {
    if (!cuit) {
      return "El CUIT no puede estar vacío."
    }
    // Remove hyphens from CUIT
    const cleanCUIT = cuit.replace(/-/g, '')
    // Check if it contains only digits
    if (!/^\d+$/.test(cleanCUIT)) {
      return "El CUIT solo debe contener números (se permiten guiones)."
    }
    // Check if it has exactly 11 digits
    if (cleanCUIT.length !== 11) {
      return "El CUIT debe tener exactamente 11 dígitos."
    }
    // Check if the prefix is valid
    const prefix = cleanCUIT.substring(0, 2)
    const validPrefixes = ['20', '23', '24', '27', '30', '33', '34']
    if (!validPrefixes.includes(prefix)) {
      return "Prefijo de CUIT inválido. Prefijos válidos: 20, 23, 24, 27, 30, 33, 34"
    }
    return ""
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    // Validate password
    const passwordValidation = validatePassword(newCustomer.password)
    if (passwordValidation) {
      setPasswordError(passwordValidation)
      return
    }

    // Validate DNI
    const dniValidation = validateDNI(newCustomer.dni)
    if (dniValidation) {
      setDniError(dniValidation)
      return
    }

    // Validate CUIT
    const cuitValidation = validateCUIT(newCustomer.cuit)
    if (cuitValidation) {
      setCuitError(cuitValidation)
      return
    }

    setIsSubmitting(true)
    setPasswordError("")
    setDniError("")
    setCuitError("")


    try {
      // Create a new customer object with all fields from the form
      const customerData = {
        ...newCustomer,
        phone: newCustomer.contactNumber,  // Map contactNumber to phone for the API
      }

      // Call the createCustomer function
      const createdCustomer = await createCustomer(customerData)

      // Show success message
      toast({
        title: "Cliente creado",
        description: `El cliente ${newCustomer?.name} ha sido creado exitosamente.`,
        variant: "default",
      })

      // Close the dialog and reset the form
      setIsDialogOpen(false)
      setNewCustomer({
        name: "",
        secondName: "",
        dni: "",
        cuit: "",
        cuil: "",
        address: "",
        workDirection: "",
        contactNumber: "",
        email: "",
        password: "",
        active: true,
        clienteActivo: true,
        firstRegister: true,
        documents: [],
        worksActive: [],
        meetings: [],
        createdAt: new Date()
      })

      // Refresh the customers list
      fetchCustomers()
    } catch (error) {
      console.error("Error creating customer:", error)
      toast({
        title: "Error",
        description: "No se pudo crear el cliente. Por favor, intente nuevamente.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteClient = async () => {
    if (!clientToDelete?._id) return

    setDeletingClientId(clientToDelete._id)
    try {
      await deleteCustomer(clientToDelete._id)
      toast({
        title: "Cliente eliminado",
        description: "El cliente se ha eliminado correctamente."
      })
      // Refresh the customers list
      fetchCustomers()
    } catch (err: any) {
      console.error("Error deleting client:", err)
      toast({
        title: "Error",
        description: err?.message || "No se pudo eliminar el cliente",
        variant: "destructive"
      })
    } finally {
      setDeletingClientId(null)
      setShowDeleteDialog(false)
      setClientToDelete(null)
    }
  }

  const handleToggleStatus = async (client: Customer) => {
    if (!client._id) return

    setUpdatingClientId(client._id)
    try {
      const newActiveStatus = !client.active
      await updateCustomer(client._id, { active: newActiveStatus })
      toast({
        title: client.active ? "Cliente desactivado" : "Cliente activado",
        description: `El cliente se ha ${newActiveStatus ? 'activado' : 'desactivado'} correctamente.`
      })
      // Refresh the customers list
      fetchCustomers()
    } catch (err: any) {
      console.error("Error updating client status:", err)
      toast({
        title: "Error",
        description: err?.message || "No se pudo actualizar el estado del cliente",
        variant: "destructive"
      })
    } finally {
      setUpdatingClientId(null)
    }
  }

  const openDeleteDialog = (client: Customer) => {
    setClientToDelete(client)
    setShowDeleteDialog(true)
  }

  useEffect(() => {
    fetchCustomers()
  }, [user])

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
          <p className="text-muted-foreground">Gestiona tus cuentas de clientes y su acceso a proyectos.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Crear Cliente
                </>
              )}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Agregar Nuevo Cliente</DialogTitle>
              <DialogDescription>
                Crea una nueva cuenta de cliente. Recibirán un correo con instrucciones de acceso.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="name">Nombre <span className="text-red-500">*</span></Label>
                  <Input
                    id="name"
                    value={newCustomer.name}
                    onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="secondName">Apellido</Label>
                  <Input
                    id="secondName"
                    value={newCustomer.secondName}
                    onChange={(e) => setNewCustomer({ ...newCustomer, secondName: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="dni">DNI <span className="text-red-500">*</span></Label>
                    {dniError && <span className="text-xs text-red-500">{dniError}</span>}
                  </div>
                  <Input
                    id="dni"
                    value={newCustomer.dni}
                    onChange={(e) => {
                      setNewCustomer({ ...newCustomer, dni: e.target.value })
                      // Clear error when user starts typing
                      if (dniError) {
                        setDniError("")
                      }
                    }}
                    className={dniError ? "border-red-500" : ""}
                    placeholder="ej: 12.345.678 o 12345678"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Debe tener 7 u 8 dígitos (se permiten puntos).
                  </p>
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="cuit">CUIT <span className="text-red-500">*</span></Label>
                    {cuitError && <span className="text-xs text-red-500">{cuitError}</span>}
                  </div>
                  <Input
                    id="cuit"
                    value={newCustomer.cuit}
                    onChange={(e) => {
                      setNewCustomer({ ...newCustomer, cuit: e.target.value })
                      // Clear error when user starts typing
                      if (cuitError) {
                        setCuitError("")
                      }
                    }}
                    className={cuitError ? "border-red-500" : ""}
                    placeholder="ej: 20-12345678-9 o 20123456789"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Debe tener exactamente 11 dígitos (se permiten guiones).
                  </p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="cuil">CUIL</Label>
                  <Input
                    id="cuil"
                    value={newCustomer.cuil}
                    onChange={(e) => setNewCustomer({ ...newCustomer, cuil: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="address">Domicilio <span className="text-red-500">*</span></Label>
                  <Input
                    id="address"
                    value={newCustomer.address}
                    onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="workDirection">Dirección Laboral <span className="text-red-500">*</span></Label>
                  <Input
                    id="workDirection"
                    value={newCustomer.workDirection}
                    onChange={(e) => setNewCustomer({ ...newCustomer, workDirection: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="contactNumber">Teléfono de Contacto <span className="text-red-500">*</span></Label>
                  <Input
                    id="contactNumber"
                    value={newCustomer.contactNumber}
                    onChange={(e) => setNewCustomer({ ...newCustomer, contactNumber: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                  <Input
                    id="email"
                    type="email"
                    value={newCustomer.email}
                    onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Contraseña <span className="text-red-500">*</span></Label>
                    {passwordError && <span className="text-xs text-red-500">{passwordError}</span>}
                  </div>
                  <Input
                    id="password"
                    type="password"
                    value={newCustomer.password}
                    onChange={(e) => {
                      setNewCustomer({ ...newCustomer, password: e.target.value })
                      // Clear error when user starts typing
                      if (passwordError) {
                        setPasswordError("")
                      }
                    }}
                    className={passwordError ? "border-red-500" : ""}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    La contraseña debe tener al menos 8 caracteres, una mayúscula y un símbolo.
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting || !!passwordError || !!dniError || !!cuitError}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creando...
                    </>
                  ) : (
                    'Agregar Cliente'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gestión de Clientes</CardTitle>
          <CardDescription>Ver y gestionar todas las cuentas de clientes en el sistema.</CardDescription>
        </CardHeader>
        {loadingCustomers && (
          <CardContent>
            <div className="flex items-center justify-center h-[50vh]">
              <div className="text-center py-8 flex justify-center items-center p-6">
                <Loader2 className="animate-spin text-primary" size={24} />
                <p className="px-6">Cargando clientes...</p>
              </div>
            </div>
          </CardContent>
        )}
        {!loadingCustomers && (
          <CardContent>
            <div className="flex items-center mb-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar clientes..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Teléfono</TableHead>
                    <TableHead>Correo Electrónico</TableHead>
                    <TableHead className="hidden md:table-cell">Teléfono</TableHead>
                    <TableHead className="hidden md:table-cell">Proyectos</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentItems.map((client) => (
                    <TableRow key={client.userId}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-muted-foreground" />
                          {client.name}
                        </div>
                      </TableCell>
                      <TableCell>{client.contactNumber}</TableCell>
                      <TableCell>{client.email}</TableCell>
                      <TableCell className="hidden md:table-cell">{client.phone}</TableCell>
                      <TableCell className="hidden md:table-cell">{client.active ? "Activo" : "Inactivo"}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${client.active
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                            }`}
                        >
                          {client.active ? "Activo" : "Inactivo"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Abrir menú</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => (window.location.href = `/admin/clients/${client.userId}`)}>
                              Ver Detalles
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => (window.location.href = `/admin/clients/${client.userId}/edit`)}>
                              Editar Cliente
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleToggleStatus(client)}
                              disabled={updatingClientId === client._id}
                            >
                              {updatingClientId === client._id ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Actualizando...
                                </>
                              ) : (
                                client.active ? "Desactivar" : "Activar"
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600 focus:text-red-600"
                              onClick={() => openDeleteDialog(client)}
                            >
                              Eliminar Cliente
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!loadingCustomers && customersError && filteredClients?.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                        No se encontraron clientes. Intenta ajustar tu búsqueda o agrega un nuevo cliente.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-2 mt-4">
                <div className="text-sm text-muted-foreground">
                  Mostrando {Math.min(currentPage * itemsPerPage, filteredClients.length)} de {filteredClients.length} clientes
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Anterior
                  </Button>
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      // Show pages around current page
                      let pageNum = 0;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(pageNum)}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Diálogo de confirmación de eliminación */}
      {showDeleteDialog && clientToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-2">¿Eliminar cliente?</h3>
            <p className="text-gray-600 mb-2">
              Estás a punto de eliminar a <strong>{clientToDelete.name}</strong>.
            </p>
            <p className="text-gray-600 mb-6">
              Esta acción no se puede deshacer. Se eliminará permanentemente el cliente y toda su información asociada.
            </p>
            <div className="flex justify-end space-x-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteDialog(false)
                  setClientToDelete(null)
                }}
                disabled={!!deletingClientId}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteClient}
                disabled={!!deletingClientId}
              >
                {deletingClientId ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Eliminando...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Eliminar
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
