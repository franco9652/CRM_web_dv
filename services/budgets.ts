import axios from "axios";

type ApiError = {
  response?: {
    data?: {
      message?: string;
    };
  };
};

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

/**
 * Crea un nuevo presupuesto
 * @param budgetData Datos del presupuesto a crear
 */
export async function createBudget(budgetData: Omit<Budget, '_id' | '__v' | 'ID'>): Promise<Budget> {
  try {
    const { data } = await axios.post(`${API_URL}/budgets`, budgetData);
    return data as Budget;
  } catch (error: unknown) {
    const apiError = error as ApiError;
    if (apiError?.response?.data?.message) {
      console.error('Error creating budget:', apiError.response.data.message, apiError.response.data);
      throw new Error(apiError.response.data.message);
    }
    console.error('Unknown error creating budget:', error);
    throw new Error('Error desconocido al crear el presupuesto');
  }
}