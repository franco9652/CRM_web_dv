"use client"

import { useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Lock, Mail, HelpCircle, MessageCircle, Info, ChevronRight, Phone, Braces } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function SettingsPage() {
  const { user } = useAuth()
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handlePasswordChange = async () => {
    setIsChangingPassword(true);
    try {
      if (!currentPassword || !newPassword || !confirmPassword) {
        alert("Por favor completa todos los campos");
        return;
      }

      if (newPassword !== confirmPassword) {
        alert("Las contraseñas nuevas no coinciden");
        return;
      }

      if (newPassword.length < 6) {
        alert("La nueva contraseña debe tener al menos 6 caracteres");
        return;
      }

      if (newPassword === currentPassword) {
        alert("La nueva contraseña debe ser diferente a la actual");
        return;
      }

      const token = localStorage.getItem('token');

      if (!token) {
        alert("No estás autenticado. Por favor inicia sesión nuevamente.");
        return;
      }

      const response = await fetch('https://crmdbsoft.zeabur.app/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      });

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || 'Error al cambiar la contraseña');
      return;
    }
    alert('Contraseña actualizada correctamente');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowPasswordDialog(false);

  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    alert('Error de conexión. Por favor intenta nuevamente.');
  } finally {
    setIsChangingPassword(false);
  }
  };

  const handleWhatsAppClick = () => {
    window.open("https://wa.me/5491158800708", "_blank")
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold">Configuración</h1>
        <p className="text-muted-foreground">
          Gestiona la configuración de tu cuenta y preferencias
        </p>
      </div>

      {/* Sección de Cuenta */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            Cuenta
          </CardTitle>
          <CardDescription>
            Gestiona tu información de acceso y seguridad
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Cambiar Contraseña */}
          <div
            className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/50 cursor-pointer transition-colors"
            onClick={() => setShowPasswordDialog(true)}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Lock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="font-medium">Cambiar Contraseña</div>
                <div className="text-sm text-muted-foreground">
                  Actualiza tu contraseña de acceso
                </div>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </div>

          <Separator />

          {/* Email */}
          <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="font-medium">Email</div>
                <div className="text-sm text-muted-foreground">
                  {user?.email || "No disponible"}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sección de Soporte */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" />
            Soporte
          </CardTitle>
          <CardDescription>
            Ponte en contacto con nuestro equipo de soporte
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Ayuda */}
          <div
            className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/50 cursor-pointer transition-colors"
            onClick={() => window.location.href = "mailto:soporte@constructoraacme.com"}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="font-medium">Ayuda</div>
                <div className="text-sm text-muted-foreground">
                  Contacta con nuestro equipo de soporte
                </div>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </div>

          <Separator />

          {/* WhatsApp */}
          <div
            className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/50 cursor-pointer transition-colors"
            onClick={handleWhatsAppClick}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <MessageCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="font-medium">WhatsApp</div>
                <div className="text-sm text-muted-foreground">
                  +54 9 11 5880-0708
                </div>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>

      {/* Sección de Aplicación */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-primary" />
            Aplicación
          </CardTitle>
          <CardDescription>
            Información sobre la aplicación
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Info className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="font-medium">Versión</div>
                <div className="text-sm text-muted-foreground">
                  1.0.0
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardContent>
          <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Braces className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="font-medium">Desarrollado Por</div>
                <div className="text-sm text-muted-foreground">
                  Davinci CRM Team
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialog para cambiar contraseña */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Cambiar Contraseña</DialogTitle>
            <DialogDescription>
              Actualiza tu contraseña para mantener tu cuenta segura
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Contraseña Actual</Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Ingresa tu contraseña actual"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">Nueva Contraseña</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Ingresa tu nueva contraseña"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirmar Nueva Contraseña</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirma tu nueva contraseña"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handlePasswordChange} disabled={isChangingPassword}>
              {isChangingPassword ? "Cambiando..." : "Guardar Cambios"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
