import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname

  // Check if the path is protected (admin or client routes)
  const isProtectedRoute = path.startsWith("/admin") || path.startsWith("/client")

  // Para rutas protegidas, redirigir a sign-in
  // Nota: No podemos acceder a localStorage desde el middleware, así que
  // la verificación real de autenticación se hace en el componente AuthProvider
  if (isProtectedRoute) {
    // Permitimos que la ruta continúe y dejamos que el AuthProvider
    // maneje la redirección si el usuario no está autenticado
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*", "/client/:path*"],
}

