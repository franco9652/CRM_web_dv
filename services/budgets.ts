import axios from "axios";

// Fuerza el endpoint de producción siempre, para desarrollo y producción
const API_URL = "https://crmdbsoft.zeabur.app";

export interface Budget {
  _id: string;
  userId: string;
  customerId: string;
  items: Array<{
    description: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  status: 'draft' | 'sent' | 'accepted' | 'rejected';
  createdAt: string;
  updatedAt: string;
  [key: string]: any;
}

export interface BudgetsResponse {
  page: number;
  totalPages: number;
  budgets: Budget[];
}

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