'use client'

import { useEffect, useCallback } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import { Button } from '@/components/ui/button';
import { HelpCircle } from 'lucide-react';

const TOUR_COMPLETED_KEY = 'client_tour_completed';

export const ClientTour = () => {
  const startTour = useCallback(() => {
    // Mark tour as not completed when starting the tour
    localStorage.setItem(TOUR_COMPLETED_KEY, 'false');
    
    const driverObj = driver({
      showProgress: true,
      nextBtnText: 'Siguiente',
      prevBtnText: 'Anterior',
      doneBtnText: 'Finalizar',
      onCloseClick: () => {
        // Mark as completed when user closes the tour
        localStorage.setItem(TOUR_COMPLETED_KEY, 'true');
        driverObj.destroy();
      },
      onDestroyed: () => {
        // Mark as completed when tour is destroyed
        localStorage.setItem(TOUR_COMPLETED_KEY, 'true');
      },
      steps: [
        {
          element: '#client-sidebar',
          popover: {
            title: 'Menú de Navegación',
            description: 'Desde aquí puedes acceder a las diferentes secciones de la aplicación. Actualmente estás en la sección de Proyectos.',
            side: 'right',
            align: 'start',
          },
        },
        {
          element: '#client-projects-section',
          popover: {
            title: 'Gestión de Proyectos',
            description: 'Aquí puedes ver y gestionar todos tus proyectos. Puedes buscar, filtrar y ver el estado de cada uno.',
          }
        },
        {
          element: '#client-documents-section',
          popover: {
            title: 'Gestión de Documentos',
            description: 'Aquí puedes ver y gestionar todos tus documentos. Puedes buscar, filtrar y ver el estado de cada uno.',
          }
        },
        {
          element: '#client-budgets-section',
          popover: {
            title: 'Gestión de Presupuestos',
            description: 'Aquí puedes ver y gestionar todos tus presupuestos. Puedes buscar, filtrar y ver el estado de cada uno.',
          }
        },
        {
          element: '#client-meetings-section',
          popover: {
            title: 'Gestión de Reuniones',
            description: 'Aquí puedes ver y gestionar todas tus reuniones. Puedes buscar, filtrar y ver el estado de cada uno.',
          }
        },
        {
          element: '#projects-section',
          popover: {
            title: 'Gestión de Proyectos',
            description: 'Aquí verás el resumen de todos los proyectos actuales, puedes buscar, filtrar y ver el detalle de cada uno.',
            side: 'left',
          },
        },
      ],
    });

    driverObj.drive();
  }, []);

  useEffect(() => {
    // Check if the tour has been completed before
    const tourCompleted = localStorage.getItem(TOUR_COMPLETED_KEY) === 'true';
    
    // Only start the tour automatically if it hasn't been completed before
    if (!tourCompleted) {
      startTour();
    }
  }, [startTour]);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button 
        variant="outline" 
        size="icon" 
        className="rounded-full h-12 w-12 shadow-lg"
        onClick={startTour}
        title="Mostrar tutorial"
      >
        <HelpCircle className="h-6 w-6" />
      </Button>
    </div>
  );
};

export default ClientTour;
