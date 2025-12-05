import axios from "axios";

// Fuerza el endpoint de producción siempre, para desarrollo y producción
const API_URL = "https://crmdbsoft.zeabur.app";

export interface Employee {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  position?: string;
  department?: string;
  hireDate?: Date;
  status: 'active' | 'inactive' | 'on_leave';
  [key: string]: any; // For any additional fields
}

export interface EmployeesResponse {
  page: number;
  totalPages: number;
  employees: Employee[];
}

/**
 * Obtiene todos los empleados con paginación
 * @param page Número de página (opcional, por defecto 1)
 */
export async function getEmployees(page: number = 1): Promise<EmployeesResponse> {
  try {
    const { data } = await axios.get<EmployeesResponse>(`${API_URL}/employees`, {
      params: { page }
    });
    return data;
  } catch (error) {
    console.error('Error al obtener la lista de empleados:', error);
    throw new Error('No se pudieron cargar los empleados. Por favor, inténtalo de nuevo más tarde.');
  }
}

/**
 * Obtiene todos los empleados de todas las páginas disponibles
 * @returns Un array con todos los empleados
 */
export async function getAllEmployees(): Promise<Employee[]> {
  try {
    // Obtener primera página para conocer el total de páginas
    const firstResponse = await getEmployees(1);

    if (firstResponse.totalPages <= 1) {
      return firstResponse.employees;
    }

    // Crear promesas para todas las páginas restantes
    const pagePromises: Promise<EmployeesResponse>[] = [Promise.resolve(firstResponse)];

    for (let page = 2; page <= firstResponse.totalPages; page++) {
      pagePromises.push(getEmployees(page));
    }

    // Ejecutar todas las promesas en paralelo
    const allResponses = await Promise.all(pagePromises);

    // Combinar todos los empleados
    const allEmployees = allResponses.reduce((acc, response) => {
      return [...acc, ...(response.employees || [])];
    }, [] as Employee[]);

    return allEmployees;
  } catch (error) {
    console.error('Error al obtener todos los empleados:', error);
    throw new Error('No se pudieron cargar todos los empleados. Por favor, inténtalo de nuevo más tarde.');
  }
}

// Alias para mantener compatibilidad con código existente
export { getEmployees as getAllEmployeesPaginated };