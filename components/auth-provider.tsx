"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { loginUser } from "@/services/auth"
import { getCustomersByUserId } from "@/services/customers"
import { getAllEmployees } from "@/services/employees"

type User = {
  id: string
  _id?: string
  name: string
  email: string
  // role: "admin" | "client" | "customer" | "employee"
  role: string
  department?: string
  position?: string
  contactName?: string
  customerId?: string
}

type AuthContextType = {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  const deriveNameFromEmail = (email?: string) => {
    if (!email) return ""
    const local = email.split("@")[0] || ""
    return local
      .split(/[._-]+/g)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ")
      .trim()
  }

  // Check for stored user and token on initial load
  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    const token = localStorage.getItem("token")
    const loginTimestamp = localStorage.getItem("loginTimestamp")

    if (storedUser && token && loginTimestamp) {
      // Verificar si la sesión ha expirado (2 horas = 7200000 ms)
      const now = Date.now()
      const sessionDuration = now - parseInt(loginTimestamp, 10)
      const twoHoursInMs = 2 * 60 * 60 * 1000 // 2 horas en milisegundos

      if (sessionDuration < twoHoursInMs) {
        // La sesión aún es válida
        const parsed = JSON.parse(storedUser) as User
        setUser(parsed)

        const needsNameFix = !!parsed?.email && (parsed?.name === parsed?.email || !parsed?.name)
        if (needsNameFix) {
          ;(async () => {
            let nextName = ""

            if (parsed?.role === "customer") {
              try {
                const customersRes = await getCustomersByUserId(parsed?._id || parsed?.id)
                const c = customersRes?.customer?.[0]
                if (c) {
                  nextName = `${(c.name || "").trim()} ${(c.secondName || "").trim()}`.trim()
                }
              } catch {}
            } else {
              try {
                const employees = await getAllEmployees()
                const emp = employees.find((e) => (e.email || "").toLowerCase() === (parsed.email || "").toLowerCase())
                if (emp?.name) {
                  nextName = emp.name
                }
              } catch {}
            }

            if (!nextName) {
              nextName = deriveNameFromEmail(parsed?.email)
            }

            if (nextName) {
              const updated = { ...parsed, name: nextName }
              localStorage.setItem("user", JSON.stringify(updated))
              setUser(updated)
            }
          })()
        }
      } else {
        // La sesión ha expirado, limpiar datos
        localStorage.removeItem("user")
        localStorage.removeItem("token")
        localStorage.removeItem("loginTimestamp")
        setUser(null)
      }
    }
    setIsLoading(false)
  }, [])

  // Verificar periódicamente si la sesión ha expirado
  useEffect(() => {
    if (!user) return

    const checkSessionExpiration = () => {
      const loginTimestamp = localStorage.getItem("loginTimestamp")
      if (!loginTimestamp) {
        logout()
        return
      }

      const now = Date.now()
      const sessionDuration = now - parseInt(loginTimestamp, 10)
      const twoHoursInMs = 2 * 60 * 60 * 1000

      if (sessionDuration >= twoHoursInMs) {
        // Sesión expirada
        alert("Tu sesión ha expirado. Por favor, inicia sesión nuevamente.")
        logout()
      }
    }

    // Verificar cada minuto
    const intervalId = setInterval(checkSessionExpiration, 60000)

    return () => clearInterval(intervalId)
  }, [user])

  // Protect routes based on authentication
  useEffect(() => {
    if (!isLoading) {
      // If not logged in and trying to access protected routes
      if (!user && (pathname.startsWith("/admin") || pathname.startsWith("/client"))) {
        router.push("/sign-in")
      }

      // If logged in as admin but trying to access client routes
      if (user?.role === "admin" && pathname.startsWith("/client")) {
        router.push("/admin/dashboard")
      }

      // If logged in as client but trying to access admin routes
      if (user?.role === "client" && pathname.startsWith("/admin")) {
        router.push("/client/dashboard")
      }
    }
  }, [user, pathname, isLoading, router])

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)

    try {
      const response = await loginUser(email, password)

      // Guardar el token y el timestamp de inicio de sesión
      localStorage.setItem("token", response.token)
      localStorage.setItem("loginTimestamp", Date.now().toString())

      const role = response.user?.role || response.role
      const responseEmail = (response.user?.email || email || "").trim()
      const responseNameRaw = ((response.user as any)?.name || "").trim()
      const responseLastNameRaw = ((response.user as any)?.secondName || (response.user as any)?.lastName || "").trim()

      const sanitizedName = responseNameRaw && !responseNameRaw.includes("@") ? responseNameRaw : ""
      let displayName = `${sanitizedName} ${responseLastNameRaw}`.trim()
      if (!displayName) {
        displayName = sanitizedName
      }

      if ((!displayName || displayName === responseEmail) && role === "customer") {
        try {
          const customersRes = await getCustomersByUserId(response.user?._id || response._id || response.userId)
          const c = customersRes?.customer?.[0]
          if (c) {
            displayName = `${(c.name || "").trim()} ${(c.secondName || "").trim()}`.trim()
          }
        } catch {}
      }

      if ((!displayName || displayName === responseEmail) && role !== "customer") {
        try {
          const employees = await getAllEmployees()
          const emp = employees.find((e) => (e.email || "").toLowerCase() === responseEmail.toLowerCase())
          if (emp?.name) {
            displayName = emp.name
          }
        } catch {}
      }

      if (!displayName || displayName === responseEmail) {
        displayName = deriveNameFromEmail(responseEmail) || responseEmail
      }

      const userData: User = {
        id: response.userId,
        name: displayName,
        email: responseEmail,
        role,
        _id: response.user?._id || response._id,
        customerId: role === "customer" ? response.customerId : undefined,
      }

      // Guardar datos del usuario
      localStorage.setItem("user", JSON.stringify(userData))
      setUser(userData)
      setIsLoading(false)
      return true
    } catch (error) {
      console.error("Error en login:", error)
      const errorMessage = error instanceof Error ? error.message : "Error desconocido al iniciar sesión"
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem("user")
    localStorage.removeItem("token")
    localStorage.removeItem("loginTimestamp")
    setUser(null)
    router.push("/sign-in")
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
