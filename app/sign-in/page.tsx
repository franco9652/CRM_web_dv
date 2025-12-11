"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Building2, Eye, EyeOff } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { recoverPassword } from "@/services/auth"

export default function SignIn() {
  const router = useRouter()
  const { login } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isRecovering, setIsRecovering] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      await login(email, password)
      // Redirección manual basada en el rol del usuario
      if (email.includes("admin")) {
        router.push("/admin/dashboard")
      } else {
        router.push("/client/projects")
      }
    } catch (error) {
      console.error("Error al iniciar sesión:", error)
      setError(error instanceof Error ? error.message : "Error al iniciar sesión")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRecover = async () => {
    setError("")
    setSuccess("")
    if (!email) {
      setError("Ingresa tu correo para recuperarla")
      return
    }
    try {
      setIsRecovering(true)
      const res = await recoverPassword(email)
      setSuccess(res?.message || "Hemos enviado un correo con tu nueva contraseña")
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo realizar la recuperación")
    } finally {
      setIsRecovering(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-2">
            <Building2 className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Constructora Acme</CardTitle>
          <CardDescription>Sistema de Gestión de Proyectos</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="usuario@acme.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            {error && (
              <div className="text-sm text-red-500 p-2 bg-red-50 rounded border border-red-200">
                {error}
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
            </Button>
          </CardFooter>
        </form>
        <div className="px-6 pb-6 -mt-2 flex items-center justify-between">
          <button
            type="button"
            className="text-sm text-primary hover:underline disabled:opacity-50"
            onClick={handleRecover}
            disabled={isRecovering}
          >
            {isRecovering ? "Enviando correo..." : "¿Olvidaste tu contraseña?"}
          </button>
          {success && (
            <span className="text-sm text-green-600">{success}</span>
          )}
        </div>
      </Card>
    </div>
  )
}
