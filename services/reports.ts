import axios from "axios";

const API_URL = "https://crmdbsoft.zeabur.app";

// Interfaces para los datos del reporte
export interface SiteData {
  employeesOnSite: number;
  materialsCount: number;
  materialsCost: number;
  laborCost: number;
  hadInspection: boolean;
  inspectionPassed: boolean | null;
  inspectionCost: number;
  otherCosts: number;
  totalSpent: number;
  remainingBudget: number;
}

export interface BudgetMetrics {
  totalEstimated: number;
  acceptedCount: number;
  pendingCount: number;
  deniedCount: number;
  currency: string;
}

export interface ReportMetrics {
  workName: string;
  address?: string;
  projectType?: string;
  statusWork?: string;
  startDate?: string;
  endDate?: string;
  daysElapsed: number;
  totalDaysPlanned: number;
  progressPct: number;
  employeesAssigned: number;
  documentsCount: number;
  budget: BudgetMetrics;
  siteData: SiteData;
  lastUpdate: string;
}

export interface ReportPreview {
  to: string;
  subject: string;
  metrics: ReportMetrics;
  html: string;
}

export interface Report {
  _id: string;
  ID: number;
  work: {
    _id: string;
    name: string;
    address?: string;
  };
  customer?: {
    _id: string;
    name: string;
    email: string;
  };
  subject: string;
  metrics: ReportMetrics;
  recipients: string[];
  cc: string[];
  bcc: string[];
  sendStatus: 'pending' | 'sent' | 'failed';
  messageId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SendReportInput {
  dryRun: boolean;
  cc?: string[];
  bcc?: string[];
  subjectOverride?: string;
}

export interface PreviewResponse {
  preview: ReportPreview;
}

export interface SendResponse {
  ok: boolean;
  reportId: string;
  messageId: string;
}

/**
 * Genera un preview del reporte sin enviarlo
 */
export async function getReportPreview(workId: string): Promise<PreviewResponse> {
  if (!workId) throw new Error("WorkId inválido");
  
  const response = await axios.post<PreviewResponse>(`${API_URL}/reports/works/${workId}/send`, {
    dryRun: true
  });
  
  return response.data;
}

/**
 * Envía el reporte por email
 */
export async function sendReport(
  workId: string, 
  options?: { cc?: string[]; bcc?: string[]; subjectOverride?: string }
): Promise<SendResponse> {
  if (!workId) throw new Error("WorkId inválido");
  
  const response = await axios.post<SendResponse>(`${API_URL}/reports/works/${workId}/send`, {
    dryRun: false,
    cc: options?.cc || [],
    bcc: options?.bcc || [],
    subjectOverride: options?.subjectOverride
  });
  
  return response.data;
}

/**
 * Obtiene un reporte por su ID
 */
export async function getReportById(reportId: string): Promise<Report> {
  if (!reportId) throw new Error("ReportId inválido");
  
  const response = await axios.get<Report>(`${API_URL}/reports/${reportId}`);
  return response.data;
}

/**
 * Lista los reportes de una obra
 */
export async function getReportsByWorkId(workId: string, limit: number = 20): Promise<Report[]> {
  if (!workId) throw new Error("WorkId inválido");
  
  const response = await axios.get<Report[]>(`${API_URL}/reports/works/${workId}`, {
    params: { limit }
  });
  
  return response.data;
}

/**
 * Formatea un número como moneda
 */
export function formatCurrency(amount: number, currency: string = 'ARS'): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * Calcula el porcentaje de gasto
 */
export function calculateSpentPercentage(spent: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((spent / total) * 100);
}
