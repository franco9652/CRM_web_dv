'use client'

import { useEffect } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

export const ClientTour = () => {
  useEffect(() => {
    const driverObj = driver({
      showProgress: true,
      showButtons: [
        'next',
        'previous',
        'close'
      ],
      nextBtnText: 'Siguiente',
      prevBtnText: 'Anterior',
      doneBtnText: 'Finalizar',
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
          element: '#projects-section',
          popover: {
            title: 'Gestión de Proyectos',
            description: 'Aquí puedes ver y gestionar todos tus proyectos. Puedes buscar, filtrar y ver el estado de cada uno.',
            side: 'left',
          },
        },
      ],
    });

    // Iniciar el tour automáticamente cuando el componente se monte
    driverObj.drive();

    // Limpiar al desmontar
    return () => {
      driverObj.destroy();
    };
  }, []);

  return null;
};

export default ClientTour;
