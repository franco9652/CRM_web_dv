import axios from "axios";

// Fuerza el endpoint de producción siempre, para desarrollo y producción
const API_URL = "https://crmdbsoft.zeabur.app";

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

export async function getWorks(page = 1): Promise<WorksResponse> {
  const res = await axios.get(`${API_URL}/works`, {
    params: { page },
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

// Obtener trabajos por customerId (CORREGIDO: ahora usa /workgetbyid/:id)
export async function getWorksByCustomerId(customerId: string): Promise<Work[]> {
  if (!customerId) throw new Error("CustomerId inválido");
  const res = await axios.get(`${API_URL}/workgetbyid/${customerId}`);
  return res.data as Work[];
}
