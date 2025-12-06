import axios from "axios";

const API_URL = "https://crmdbsoft.zeabur.app";

export interface SendReportInput {
  cc?: string[];
  subjectOverride?: string;
  dryRun?: boolean;
}

export interface SendReportResponse {
  ok: boolean;
  reportId: string;
  message: string;
}

export interface Report {
  _id: string;
  workId: string;
  createdAt: string;
  updatedAt?: string;
  [key: string]: any;
}

export interface WorkReportsResponse {
  reports: Report[];
}

/**
 * Envía un reporte por email para un work específico
 * @param workId - ID del work
 * @param data - Datos opcionales: cc (array de emails), subjectOverride, dryRun
 */
export async function sendWorkReport(
  workId: string,
  data?: SendReportInput
): Promise<SendReportResponse> {
  if (!workId) throw new Error("WorkId inválido");
  
  try {
    const response = await axios.post<SendReportResponse>(
      `${API_URL}/reports/works/${workId}/send`,
      data || {}
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    throw new Error('Error al enviar el reporte');
  }
}

/**
 * Obtiene un reporte específico por ID
 * @param reportId - ID del reporte
 */
export async function getReportById(reportId: string): Promise<Report> {
  if (!reportId) throw new Error("ReportId inválido");
  
  try {
    const response = await axios.get<Report>(`${API_URL}/reports/${reportId}`);
    return response.data;
  } catch (error: any) {
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    throw new Error('Error al obtener el reporte');
  }
}

/**
 * Obtiene todos los reportes de un work específico
 * @param workId - ID del work
 */
export async function getWorkReports(workId: string): Promise<Report[]> {
  if (!workId) throw new Error("WorkId inválido");
  
  try {
    const response = await axios.get<WorkReportsResponse>(
      `${API_URL}/reports/works/${workId}`
    );
    // El backend puede retornar un array directamente o un objeto con propiedad reports
    if (Array.isArray(response.data)) {
      return response.data;
    } else if (response.data && Array.isArray(response.data.reports)) {
      return response.data.reports;
    }
    return [];
  } catch (error: any) {
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    throw new Error('Error al obtener los reportes del work');
  }
}
