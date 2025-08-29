import axios from "axios";

// Fuerza el endpoint de producción siempre, para desarrollo y producción
const API_URL = "https://crmdbsoft.zeabur.app";

export interface Budget {
  _id: string;
  workId: string;
  customerId: string;
  customerName: string;
  email: string;
  projectAddress: string;
  projectType: string;
  m2: string;
  levels: string;
  rooms: string;
  materials: string[];
  demolition: boolean;
  approvals: string[];
  budgetDate: string;
  subcontractors: string[];
  startDate: string;
  endDate: string;
  estimatedBudget: number;
  currency: string;
  advancePayment: boolean;
  documentation: string[];
  status: string;
  ID: number;
  __v: number;
  [key: string]: any;
}

export type BudgetsResponse = Budget[];

/**
 * Obtiene todos los presupuestos
 */
export async function getAllBudgets(): Promise<BudgetsResponse> {
  const { data } = await axios.get(`${API_URL}/budgets`);
  return data as BudgetsResponse;
}

/**
 * Obtiene los presupuestos de un usuario específico
 * @param userId ID del usuario
 */
export async function getBudgetsByUserId(
  userId: string
): Promise<BudgetsResponse> {
  if (!userId) throw new Error("userId inválido");

  const { data } = await axios.get(`${API_URL}/budgets/user/${userId}`);
  return data as BudgetsResponse;
}