"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Building2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  FileText,
  LayoutDashboard,
  Settings,
  Users,
} from "lucide-react"

export default function AdminSidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(`${path}/`)
  }

  return (
    <div className={`border-r bg-background transition-all duration-300 ${collapsed ? "w-[70px]" : "w-[250px]"}`}>
      <div className="flex flex-col min-h-screen">
        <div className="flex h-14 items-center border-b px-4">
          <Link href="/admin/dashboard" className="flex items-center gap-2 font-semibold">
            <Building2 className="h-6 w-6" />
            {!collapsed && <span>Panel Admin</span>}
          </Link>
          <Button variant="ghost" size="icon" className="ml-auto h-8 w-8" onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
        <div className="flex-1 overflow-auto py-2">
          <nav className="grid items-start px-2 text-sm font-medium">
            <Link
              href="/admin/dashboard"
              className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
                isActive("/admin/dashboard")
                  ? "bg-muted text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-primary"
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              {!collapsed && <span>Dashboard</span>}
            </Link>
            <Link
              href="/admin/projects"
              className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
                isActive("/admin/projects")
                  ? "bg-muted text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-primary"
              }`}
            >
              <Building2 className="h-4 w-4" />
              {!collapsed && <span>Proyectos</span>}
            </Link>
            <Link
              href="/admin/clients"
              className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
                isActive("/admin/clients")
                  ? "bg-muted text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-primary"
              }`}
            >
              <Users className="h-4 w-4" />
              {!collapsed && <span>Clientes</span>}
            </Link>
            <Link
              href="/admin/documents"
              className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
                isActive("/admin/documents")
                  ? "bg-muted text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-primary"
              }`}
            >
              <FileText className="h-4 w-4" />
              {!collapsed && <span>Documentos</span>}
            </Link>
            <Link
              href="/admin/calendar"
              className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
                isActive("/admin/calendar")
                  ? "bg-muted text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-primary"
              }`}
            >
              <Calendar className="h-4 w-4" />
              {!collapsed && <span>Calendario</span>}
            </Link>
          </nav>
        </div>
        <div className="mt-auto border-t p-4">
          <Link
            href="/admin/settings"
            className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
              isActive("/admin/settings")
                ? "bg-muted text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-primary"
            }`}
          >
            <Settings className="h-4 w-4" />
            {!collapsed && <span>Configuración</span>}
          </Link>
        </div>
      </div>
    </div>
  )
}

