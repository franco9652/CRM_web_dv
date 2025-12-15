"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { loginUser } from "@/services/auth"
import { getCustomersByUserId } from "@/services/customers"
import { getAllEmployees } from "@/services/employees"
import { getMe } from "@/services/me"

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

  const decodeJwtPayload = (token?: string): Record<string, any> | null => {
    try {
      if (!token) return null
      const parts = token.split(".")
      if (parts.length < 2) return null
      const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/")
      const padded = base64 + "==".slice(0, (4 - (base64.length % 4)) % 4)
      const json = decodeURIComponent(
        atob(padded)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      )
      return JSON.parse(json)
    } catch {
      return null
    }
  }

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
        const jwtPayload = decodeJwtPayload(token)
        const jwtName = (jwtPayload?.name || "").toString().trim()
        const jwtLastName = (jwtPayload?.lastName || jwtPayload?.lastname || jwtPayload?.secondName || "").toString().trim()
        const jwtDisplayName = `${jwtName} ${jwtLastName}`.trim()

        const parsedWithJwt = jwtDisplayName ? { ...parsed, name: jwtDisplayName } : parsed
        if (jwtDisplayName && parsed?.name !== jwtDisplayName) {
          localStorage.setItem("user", JSON.stringify(parsedWithJwt))
        }

        setUser(parsedWithJwt)

        ;(async () => {
          try {
            const me = await getMe(token)
            const name = (me?.user?.name || "").toString().trim()
            const lastName = (me?.user?.lastName || "").toString().trim()
            const meDisplayName = `${name} ${lastName}`.trim()
            if (meDisplayName) {
              const updated = {
                ...parsedWithJwt,
                name: meDisplayName,
                customerId: (me?.user as any)?.customerId || parsedWithJwt.customerId,
              }
              localStorage.setItem("user", JSON.stringify(updated))
              setUser(updated)
            }
          } catch {
            // ignore
          }
        })()

        const emailLocal = (parsed?.email || "").split("@")[0]?.trim().toLowerCase()
        const currentNameLower = (parsed?.name || "").trim().toLowerCase()
        const derivedLower = deriveNameFromEmail(parsed?.email).trim().toLowerCase()

        const looksLikeEmailName =
          (!!emailLocal && currentNameLower === emailLocal) || (!!derivedLower && currentNameLower === derivedLower)

        const needsNameFix =
          !!parsedWithJwt?.email &&
          (parsedWithJwt?.name === parsedWithJwt?.email || !parsedWithJwt?.name || looksLikeEmailName)
        if (needsNameFix) {
          ;(async () => {
            let nextName = ""

            if (parsedWithJwt?.role === "customer") {
              try {
                const customersRes = await getCustomersByUserId(parsedWithJwt?._id || parsedWithJwt?.id)
                const c = customersRes?.customer?.[0]
                if (c) {
                  nextName = `${(c.name || "").trim()} ${(c.secondName || "").trim()}`.trim()
                }
              } catch {}
            } else {
              try {
                const employees = await getAllEmployees()
                const emp = employees.find((e) => {
                  const byUserId =
                    !!(e as any)?.userId && ((e as any).userId === (parsedWithJwt?._id || parsedWithJwt?.id))
                  const byEmail = (e.email || "").toLowerCase() === (parsedWithJwt.email || "").toLowerCase()
                  return byUserId || byEmail
                })
                if (emp?.name) {
                  const empLast = ((emp as any).lastName || (emp as any).lastname || (emp as any).secondName || "").trim()
                  nextName = `${(emp.name || "").trim()} ${empLast}`.trim()
                }
              } catch {}
            }

            if (!nextName) {
              nextName = deriveNameFromEmail(parsedWithJwt?.email)
            }

            if (nextName) {
              const updated = { ...parsedWithJwt, name: nextName }
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

      if (user?.role === "employee" && pathname.startsWith("/client")) {
        router.push("/admin/dashboard")
      }

      // Si no es admin, no debería acceder a /client/dashboard
      if (user?.role !== "admin" && pathname.startsWith("/client/dashboard")) {
        router.push("/client/projects")
      }

      // If logged in as client but trying to access admin routes
      if ((user?.role === "client" || user?.role === "customer") && pathname.startsWith("/admin")) {
        router.push("/client/projects")
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
      const responseEmailLocal = (responseEmail.split("@")[0] || "").trim().toLowerCase()
      const responseNameRaw = ((response.user as any)?.name || "").trim()
      const responseLastNameRaw = (
        (response.user as any)?.secondName ||
        (response.user as any)?.lastName ||
        (response.user as any)?.lastname ||
        ""
      ).trim()

      const jwtPayload = decodeJwtPayload(response.token)
      const jwtName = (jwtPayload?.name || "").toString().trim()
      const jwtLastName = (jwtPayload?.lastName || jwtPayload?.lastname || jwtPayload?.secondName || "").toString().trim()
      const jwtDisplayName = `${jwtName} ${jwtLastName}`.trim()

      const sanitizedName = responseNameRaw && !responseNameRaw.includes("@") ? responseNameRaw : ""
      let displayName = jwtDisplayName || `${sanitizedName} ${responseLastNameRaw}`.trim()
      if (!displayName) {
        displayName = sanitizedName
      }

      const displayNameLower = (displayName || "").trim().toLowerCase()
      const looksLikeEmailNameLogin =
        (!!responseEmailLocal && displayNameLower === responseEmailLocal) ||
        (!!responseEmailLocal && displayNameLower === deriveNameFromEmail(responseEmail).trim().toLowerCase())

      if ((!displayName || displayName === responseEmail || looksLikeEmailNameLogin) && role === "customer") {
        try {
          const customersRes = await getCustomersByUserId(response.user?._id || response._id || response.userId)
          const c = customersRes?.customer?.[0]
          if (c) {
            displayName = `${(c.name || "").trim()} ${(c.secondName || "").trim()}`.trim()
          }
        } catch {}
      }

      if ((!displayName || displayName === responseEmail || looksLikeEmailNameLogin) && role !== "customer") {
        try {
          const employees = await getAllEmployees()
          const emp = employees.find((e) => {
            const byUserId = !!(e as any)?.userId && ((e as any).userId === (response.user?._id || response._id || response.userId))
            const byEmail = (e.email || "").toLowerCase() === responseEmail.toLowerCase()
            return byUserId || byEmail
          })
          if (emp?.name) {
            const empLast = ((emp as any).lastName || (emp as any).lastname || (emp as any).secondName || "").trim()
            displayName = `${(emp.name || "").trim()} ${empLast}`.trim()
          }
        } catch {}
      }

      if (!displayName || displayName === responseEmail) {
        displayName = deriveNameFromEmail(responseEmail) || responseEmail
      }

      try {
        const me = await getMe(response.token)
        const name = (me?.user?.name || "").toString().trim()
        const lastName = (me?.user?.lastName || "").toString().trim()
        const meDisplayName = `${name} ${lastName}`.trim()
        if (meDisplayName) {
          displayName = meDisplayName
        }
      } catch {
        // ignore
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
