import axios from "axios";

// Fuerza el endpoint de producción siempre, para desarrollo y producción
const API_URL = "https://crmdbsoft.zeabur.app";

export interface CreateWorkInput {
  ID: string;
  name: string;
  userId: string;
  address?: string;
  startDate?: string;
  endDate?: string;
  budget?: number;
  employeeInWork?: string[];
  documents?: string[];
  number?: string;
  customerName: string;
  email?: string;
  emailCustomer?: string;
  statusWork?: string;
  workUbication?: string;
  projectType?: string;
  customerId: string;
}

export interface UpdateWorkInput {
  name?: string;
  address?: string;
  startDate?: string;
  endDate?: string;
  budget?: number;
  employeeInWork?: string[];
  documents?: string[];
  number?: string;
  customerName?: string;
  email?: string;
  emailCustomer?: string;
  statusWork?: string;
  workUbication?: string;
  projectType?: string;
}

export interface Work {
  _id: string;
  name: string;
  customerName: string;
  address?: string;
  startDate?: string;
  endDate?: string;
  budget?: number;
  statusWork?: string;
  number?: string;
  projectType?: string;
  [key: string]: any;
}

export interface WorksResponse {
  page: number;
  totalPages: number;
  works: Work[];
}

export async function getWorks(page?: number): Promise<WorksResponse> {
  const res = await axios.get(`${API_URL}/works`, {
    params: {
      page: page || 1
    }
  });
  // Manejo robusto: si la respuesta no tiene la estructura esperada, la adapto
  if (res.data && Array.isArray(res.data)) {
    // Si el backend responde un array directamente
    return {
      page: 1,
      totalPages: 1,
      works: res.data
    }
  } else if (res.data && typeof res.data === 'object' && 'works' in res.data) {
    // Respuesta esperada
    return res.data as WorksResponse;
  } else {
    // Respuesta inesperada, intento adaptarla
    const data: any = res.data || {};
    return {
      page: typeof data.page === 'number' ? data.page : 1,
      totalPages: typeof data.totalPages === 'number' ? data.totalPages : 1,
      works: Array.isArray(data.works) ? data.works : (Array.isArray(data.result) ? data.result : [])
    }
  }
}

// Función simple que hace una sola llamada con página 1 y confía en obtener todos
export async function getAllWorks(): Promise<Work[]> {
  // Hacer una llamada con página 1 y obtener el total de páginas
  const firstResponse = await getWorks(1);

  // Si solo hay una página, devolver directamente
  if (firstResponse.totalPages === 1) {
    return firstResponse.works;
  }

  // Si hay múltiples páginas, hacer llamadas paralelas para mejor rendimiento
  const pagePromises: Promise<WorksResponse>[] = [];

  for (let page = 1; page <= firstResponse.totalPages; page++) {
    pagePromises.push(getWorks(page));
  }

  const allResponses = await Promise.all(pagePromises);

  // Combinar todos los works de todas las páginas
  const allWorks = allResponses.reduce((acc, response) => {
    return [...acc, ...response.works];
  }, [] as Work[]);

  return allWorks;
}

export async function createWork(workData: CreateWorkInput): Promise<{ message: string }> {
  try {
    const response = await axios.post<{ message: string }>(`${API_URL}/workCreate`, workData);
    return response.data;
  } catch (error: any) {
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    throw new Error('Error al conectar con el servidor');
  }
}

// Obtener trabajos por customerId con información del cliente
export interface WorksByCustomerResponse {
  message: string;
  customerInfo: {
    id: string;
    name: string;
    email: string;
  };
  works: Work[];
}

export async function getWorksByCustomerId(userId: string): Promise<WorksByCustomerResponse> {
  if (!userId) throw new Error("CustomerId inválido");
  const res = await axios.get(`${API_URL}/workgetbycustomerid/${userId}`);
  return res.data as WorksByCustomerResponse;
}

export async function getWorkById(workId: string): Promise<Work | null> {
  if (!workId) throw new Error("WorkId inválido");
  const res = await axios.get(`${API_URL}/workgetbyid/${workId}`);
  return res.data as Work;
}

export async function updateWork(workId: string, workData: UpdateWorkInput): Promise<Work> {
  if (!workId) throw new Error("WorkId inválido");
  const res = await axios.patch(`${API_URL}/workUpdate/${workId}`, workData);
  return res.data as Work;
}

export async function deleteWork(workId: string): Promise<{ message: string }> {
  if (!workId) throw new Error("WorkId inválido");
  try {
    const res = await axios.delete(`${API_URL}/workDelete/${workId}`);
    return res.data as { message: string };
  } catch (error: any) {
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    throw new Error('Error al conectar con el servidor');
  }
}
