'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Budget, getAllBudgets } from '@/services/budgets';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus } from 'lucide-react';
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
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
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
          <Link href={`/admin/projects/${workId}/budget/new`}>
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
                <Link href={`/admin/projects/${workId}/budget/new`}>
                  Crear tu primer presupuesto
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {budgets.map((budget) => (
                <Card key={budget._id} className="hover:bg-accent/50 transition-colors cursor-pointer"
                  onClick={() => router.push(`/admin/budgets/${budget._id}`)}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">Presupuesto #{budget.ID}</h3>
                        <p className="text-sm text-muted-foreground">
                          {budget.customerName} • {budget.projectAddress}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Status: <span className="capitalize">{budget.status.toLowerCase()}</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{budget.currency} {budget.estimatedBudget?.toLocaleString() || '0.00'}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(budget.budgetDate).toLocaleDateString()}
                        </p>
                      </div>
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
