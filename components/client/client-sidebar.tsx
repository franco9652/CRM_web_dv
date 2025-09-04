"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Building2, Calendar, ChevronLeft, ChevronRight, FileBadge, FileText, LayoutDashboard, Settings } from "lucide-react"

export default function ClientSidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(`${path}/`)
  }

  return (
    <div id="client-sidebar" className={`border-r bg-background transition-all duration-300 ${collapsed ? "w-[70px]" : "w-[250px]"}`}>
      <div className="flex flex-col min-h-screen">
        <div className="flex h-14 items-center border-b px-4">
          <Link href="/client/dashboard" className="flex items-center gap-2 font-semibold">
            <Building2 className="h-6 w-6" />
            {!collapsed && <span>BuildTrack</span>}
          </Link>
          <Button variant="ghost" size="icon" className="ml-auto h-8 w-8" onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
        <div className="flex-1 overflow-auto py-2">
          <nav className="grid items-start px-2 text-sm font-medium">
            <Link
              href="/client/projects"
              className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
                isActive("/client/projects")
                  ? "bg-muted text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-primary"
              }`}
            >
              <Building2 className="h-4 w-4" />
              {!collapsed && <span>Proyectos</span>}
            </Link>
            <Link
              href="/client/documents"
              className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
                isActive("/client/documents")
                  ? "bg-muted text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-primary"
              }`}
            >
              <FileText className="h-4 w-4" />
              {!collapsed && <span>Documentos</span>}
            </Link>
            <Link
              href="/client/budgets"
              className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
                isActive("/client/budgets")
                  ? "bg-muted text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-primary"
              }`}
            >
              <FileBadge className="h-4 w-4" />
              {!collapsed && <span>Presupuestos</span>}
            </Link>
            <Link
              href="/client/meetings"
              className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
                isActive("/client/meetings")
                  ? "bg-muted text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-primary"
              }`}
            >
              <Calendar className="h-4 w-4" />
              {!collapsed && <span>Reuniones</span>}
            </Link>
          </nav>
        </div>
      </div>
    </div>
  )
}

