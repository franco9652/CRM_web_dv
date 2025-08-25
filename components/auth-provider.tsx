"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { loginUser } from "@/services/auth"

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

  // Check for stored user and token on initial load
  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    const token = localStorage.getItem("token")
    if (storedUser && token) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

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
      
      // Guardar el token
      localStorage.setItem("token", response.token)
      console.log('ACA LOS DATOS DEL RESPONSE LOGIN:\n', response)

      const userData: User = {
        id: response.userId,
        name: response.user?.name || email,
        email: response.user?.email || email,
        role: response.user?.role || response.role,
        _id: response.user?._id || response._id
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
