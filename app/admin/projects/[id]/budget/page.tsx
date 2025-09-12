'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Budget, getAllBudgets } from '@/services/budgets';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, Edit, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function ProjectBudgetsPage() {
  const { id: workId } = useParams();
  const router = useRouter();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBudgets = async () => {
      try {
        setIsLoading(true);
        const data = await getAllBudgets();
        const filteredBudgets = data.filter(
          (budget) => budget.workId === workId
        );
        
        setBudgets(filteredBudgets);
      } catch (err) {
        console.error('Error fetching budgets:', err);
        setError('Failed to load budgets. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBudgets();
  }, [workId]);

  if (isLoading) {
    return (
      <div className="text-center py-8 flex justify-center items-center p-6">
      <Loader2 className="animate-spin text-primary" size={24} />
      <p className="px-6">Cargando...</p>
    </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-md">
        <p>{error}</p>
        <Button variant="outline" onClick={() => window.location.reload()} className="mt-2">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
        <Button asChild>
          <Link href={`/admin/budgets/new`}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo presupuesto
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Presupuestos del proyecto</CardTitle>
        </CardHeader>
        <CardContent>
          {budgets.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No se encontraron presupuestos para este proyecto.</p>
              <Button className="mt-4" asChild>
                <Link href={`/admin/budgets/new`}>
                  Crear tu primer presupuesto
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {budgets.map((budget) => (
                <Card key={budget._id} className="hover:bg-accent/50 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">Presupuesto #{budget.ID}</h3>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            budget.status === 'ACEPTADO' ? 'bg-green-100 text-green-800' :
                            budget.status === 'DENEGADO' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {budget.status}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          <strong>Cliente:</strong> {budget.customerName}
                        </p>
                        <p className="text-sm text-muted-foreground mb-1">
                          <strong>Email:</strong> {budget.email}
                        </p>
                        <p className="text-sm text-muted-foreground mb-1">
                          <strong>Dirección:</strong> {budget.projectAddress}
                        </p>
                        <p className="text-sm text-muted-foreground mb-1">
                          <strong>Tipo:</strong> {budget.projectType?.charAt(0).toUpperCase() + budget.projectType?.slice(1)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-xl text-primary">
                          {budget.currency} {budget.estimatedBudget?.toLocaleString() || '0.00'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(budget.budgetDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Detalles del Proyecto</p>
                        <p className="text-sm text-muted-foreground">
                          <strong>m²:</strong> {budget.m2}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          <strong>Niveles:</strong> {budget.levels}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          <strong>Habitaciones:</strong> {budget.rooms}
                        </p>
                        {budget.demolition && (
                          <p className="text-sm text-orange-600 font-medium">Incluye demolición</p>
                        )}
                        {budget.advancePayment && (
                          <p className="text-sm text-blue-600 font-medium">Incluye adelanto</p>
                        )}
                      </div>

                      <div className="space-y-1">
                        <p className="text-sm font-medium">Fechas</p>
                        <p className="text-sm text-muted-foreground">
                          <strong>Inicio:</strong> {budget.startDate ? new Date(budget.startDate).toLocaleDateString() : 'No definida'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          <strong>Fin:</strong> {budget.endDate ? new Date(budget.endDate).toLocaleDateString() : 'No definida'}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <p className="text-sm font-medium">Materiales</p>
                        {budget.materials && budget.materials.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {budget.materials.slice(0, 3).map((material, index) => (
                              <span key={index} className="text-xs bg-gray-100 px-2 py-1 rounded">
                                {material}
                              </span>
                            ))}
                            {budget.materials.length > 3 && (
                              <span className="text-xs text-muted-foreground">
                                +{budget.materials.length - 3} más
                              </span>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">No especificados</p>
                        )}
                      </div>
                    </div>

                    {(budget.approvals && budget.approvals.length > 0) || (budget.subcontractors && budget.subcontractors.length > 0) ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        {budget.approvals && budget.approvals.length > 0 && (
                          <div className="space-y-1">
                            <p className="text-sm font-medium">Aprobaciones</p>
                            <div className="flex flex-wrap gap-1">
                              {budget.approvals.map((approval, index) => (
                                <span key={index} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                  {approval}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {budget.subcontractors && budget.subcontractors.length > 0 && (
                          <div className="space-y-1">
                            <p className="text-sm font-medium">Subcontratistas</p>
                            <div className="flex flex-wrap gap-1">
                              {budget.subcontractors.map((subcontractor, index) => (
                                <span key={index} className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                  {subcontractor}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : null}

                    <div className="flex justify-between items-center pt-4 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/admin/budgets/${budget._id}`);
                        }}
                      >
                        Ver Detalles
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/admin/budgets/${budget._id}/edit`);
                        }}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
