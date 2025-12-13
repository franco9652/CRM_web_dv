"use client"
// QUITAMOS ESTA VISTA DEL ROL CLIENTE
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function ClientDashboard() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    router.replace("/client/projects")
  }, [router])

  return null
}

