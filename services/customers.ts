import axios from "axios";

// Fuerza el endpoint de producción siempre, para desarrollo y producción
const API_URL = "https://crmdbsoft.zeabur.app";

export interface CustomersResponse {
  page: number;
  totalPages: number;
  customers: Customer[];
}

export interface Customer {
  _id: string;
  userId: string;
  name: string;
  email: string;
  phone?: string;
  contactNumber?: string;
  dni?: string;
  cuit?: string;
  address?: string;
  workDirection?: string;
  worksActive?: any[];
  meetings?: any[];
  documents?: any[];
  active?: boolean;
  createdAt?: string;
  [key: string]: any;
}

export async function getCustomers(page?: number): Promise<CustomersResponse> {
  const res = await axios.get(`${API_URL}/customers`, {
    params: {
      page: page || 1
    }
  });
  if (res.data && Array.isArray(res.data)) {
    return {
      page: 1,
      totalPages: 1,
      customers: res.data
    }
  } else if (res.data && typeof res.data === 'object' && 'customers' in res.data) {
    return res.data as CustomersResponse;
  } else {
    const data: any = res.data || {};
    return {
      page: typeof data.page === 'number' ? data.page : 1,
      totalPages: typeof data.totalPages === 'number' ? data.totalPages : 1,
      customers: Array.isArray(data.customers) ? data.customers : (Array.isArray(data.result) ? data.result : [])
    }
  }
}

export async function createCustomer(customerData: Omit<Customer, '_id' | 'userId'>): Promise<Customer> {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const res = await axios.post(
      `${API_URL}/customerCreate`,
      customerData,
      token
        ? {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        : undefined
    );
    return res.data as Customer;
  } catch (error: any) {
    const data = error?.response?.data;
    if (data) {
      const backendError =
        (typeof data.error === 'string' && data.error.trim() ? data.error.trim() : null) ||
        (typeof data.message === 'string' && data.message.trim() ? data.message.trim() : null) ||
        null;
      const backendDetails =
        (typeof data.details === 'string' && data.details.trim() ? data.details.trim() : null) ||
        null;
      if (backendError) throw new Error(backendDetails ? `${backendError}: ${backendDetails}` : backendError);
    }
    throw new Error(error?.message || 'Error al conectar con el servidor');
  }
}

export async function getAllCustomers(): Promise<Customer[]> {
  // Obtener primera página para conocer el total
  const firstResponse = await getCustomers(1);

  if (firstResponse.totalPages === 1) {
    return firstResponse.customers;
  }

  // Crear promesas para todas las páginas restantes
  const pagePromises: Promise<CustomersResponse>[] = [Promise.resolve(firstResponse)];

  for (let page = 2; page <= firstResponse.totalPages; page++) {
    pagePromises.push(getCustomers(page));
  }

  // Ejecutar todas las promesas en paralelo
  const allResponses = await Promise.all(pagePromises);

  // Combinar todos los customers
  const allCustomers = allResponses.reduce((acc, response) => {
    return [...acc, ...response.customers];
  }, [] as Customer[]);

  return allCustomers;
}

/**
 * Obtiene los customers asociados a un usuario dado.
 * @param userId ID del usuario
 */
export async function getCustomersByUserId(userId?: string): Promise<{ message: string, customer: Customer[] }> {
  if (!userId) throw new Error("userId inválido");

  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const { data } = await axios.get<{ message: string, customer: Customer[] }>(
      `${API_URL}/getcustomersbyid/${userId}`,
      token
        ? {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        : undefined
    );
    return data;
  } catch (error: any) {
    const data = error?.response?.data;
    if (data) {
      const backendError =
        (typeof data.error === 'string' && data.error.trim() ? data.error.trim() : null) ||
        (typeof data.message === 'string' && data.message.trim() ? data.message.trim() : null) ||
        null;
      const backendDetails =
        (typeof data.details === 'string' && data.details.trim() ? data.details.trim() : null) ||
        null;
      if (backendError) throw new Error(backendDetails ? `${backendError}: ${backendDetails}` : backendError);
    }
    throw new Error(error?.message || 'Error al conectar con el servidor');
  }
}

export async function updateCustomer(customerId: string, customerData: Partial<Customer>): Promise<Customer> {
  if (!customerId) throw new Error("ID de cliente inválido");

  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const { data } = await axios.put<Customer>(
      `${API_URL}/updateCustomer/${customerId}`,
      customerData,
      token
        ? {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        : undefined
    );
    return data;
  } catch (error: any) {
    const data = error?.response?.data;
    if (data) {
      const backendError =
        (typeof data.error === 'string' && data.error.trim() ? data.error.trim() : null) ||
        (typeof data.message === 'string' && data.message.trim() ? data.message.trim() : null) ||
        null;
      const backendDetails =
        (typeof data.details === 'string' && data.details.trim() ? data.details.trim() : null) ||
        null;
      if (backendError) throw new Error(backendDetails ? `${backendError}: ${backendDetails}` : backendError);
    }
    throw new Error(error?.message || 'Error al conectar con el servidor');
  }
}

export async function deleteCustomer(customerId: string): Promise<{ message: string }> {
  if (!customerId) throw new Error("ID de cliente inválido");

  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const { data } = await axios.delete<{ message: string }>(
      `${API_URL}/deleteCustomer/${customerId}`,
      token
        ? {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        : undefined
    );
    return data;
  } catch (error: any) {
    const data = error?.response?.data;
    if (data) {
      const backendError =
        (typeof data.error === 'string' && data.error.trim() ? data.error.trim() : null) ||
        (typeof data.message === 'string' && data.message.trim() ? data.message.trim() : null) ||
        null;
      const backendDetails =
        (typeof data.details === 'string' && data.details.trim() ? data.details.trim() : null) ||
        null;
      if (backendError) throw new Error(backendDetails ? `${backendError}: ${backendDetails}` : backendError);
    }
    throw new Error(error?.message || 'Error al conectar con el servidor');
  }
}
