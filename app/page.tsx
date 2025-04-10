"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Building2 } from "lucide-react"

export default function Home() {
  const router = useRouter()
  const { user, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        if (user.role === "admin") {
          router.push("/admin/dashboard")
        } else {
          router.push("/client/dashboard")
        }
      } else {
        router.push("/sign-in")
      }
    }
  }, [user, isLoading, router])

  // Mostrar pantalla de carga mientras se verifica la autenticación
  return (
    <div className="flex h-screen flex-col items-center justify-center bg-background">
      <Building2 className="h-16 w-16 text-primary mb-4" />
      <h1 className="text-2xl font-bold mb-2">Constructora Acme</h1>
      <p className="text-muted-foreground mb-8">Sistema de Gestión de Proyectos</p>
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
    </div>
  )
}

