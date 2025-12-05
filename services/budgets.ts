import axios from "axios";

type ApiError = {
  response?: {
    data?: {
      message?: string;
      error?: string;
    };
  };
  message?: string;
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

export interface BudgetsResponse {
  message: string;
  budgets: Budget[];
}

export type BudgetsList = Budget[];

/**
 * Obtiene todos los presupuestos
 */
export async function getAllBudgets(): Promise<BudgetsList> {
  const { data } = await axios.get(`${API_URL}/budgets`);
  return data as BudgetsList;
}

/**
 * Obtiene los presupuestos de un usuario específico
 * @param customerId ID del usuario
 */
export async function getBudgetsByCustomerId(
  customerId: string
): Promise<BudgetsResponse> {
  if (!customerId) throw new Error("customerId inválido");

  const { data } = await axios.get(`${API_URL}/budgetgetbyuser/${customerId}`);
  return data as BudgetsResponse;
}

/**
 * Crea un nuevo presupuesto
 * @param budgetData Datos del presupuesto a crear
 */
export interface BudgetResponse {
  message: string;
  budget: Budget;
}

/**
 * Obtiene un presupuesto por su ID
 * @param budgetId ID del presupuesto
 */
export async function getBudgetById(budgetId: string): Promise<BudgetResponse> {
  if (!budgetId) throw new Error("ID de presupuesto inválido");

  try {
    const { data } = await axios.get(`${API_URL}/budgetgetbyid/${budgetId}`);
    return data as BudgetResponse;
  } catch (error: unknown) {
    const apiError = error as ApiError;
    if (apiError?.response?.data?.message) {
      console.error('Error fetching budget:', apiError.response.data.message);
      throw new Error(apiError.response.data.message);
    }
    console.error('Unknown error fetching budget:', error);
    throw new Error('Error desconocido al obtener el presupuesto');
  }
}

interface DeleteBudgetResponse {
  message: string;
  deletedBudget: Budget;
}

/**
 * Elimina un presupuesto por su ID
 * @param budgetId ID del presupuesto a eliminar
 * @returns Objeto con mensaje y el presupuesto eliminado
 */
export async function deleteBudget(budgetId: string): Promise<DeleteBudgetResponse> {
  if (!budgetId) throw new Error("ID de presupuesto inválido");

  try {
    const { data } = await axios.delete<DeleteBudgetResponse>(`${API_URL}/budgets/${budgetId}`);
    return data;
  } catch (error: unknown) {
    const apiError = error as ApiError;
    const errorMessage = apiError?.response?.data?.error ||
      apiError?.response?.data?.message ||
      apiError?.message ||
      'Error desconocido al eliminar el presupuesto';

    console.error('Error deleting budget:', errorMessage);
    throw new Error(errorMessage);
  }
}

/**
 * Actualiza un presupuesto por su ID
 * @param budgetId ID del presupuesto a actualizar
 * @param budgetData Datos del presupuesto a actualizar
 */
export async function updateBudget(budgetId: string, budgetData: Partial<Budget>): Promise<BudgetResponse> {
  if (!budgetId) throw new Error("ID de presupuesto inválido");

  try {
    const { data } = await axios.put(`${API_URL}/budgetsPut/${budgetId}`, budgetData);
    return data as BudgetResponse;
  } catch (error: unknown) {
    const apiError = error as ApiError;
    if (apiError?.response?.data?.error) {
      console.error('Error updating budget:', apiError.response.data.error);
      throw new Error(apiError.response.data.error);
    }
    if (apiError?.response?.data?.message) {
      console.error('Error updating budget:', apiError.response.data.message);
      throw new Error(apiError.response.data.message);
    }
    console.error('Unknown error updating budget:', error);
    throw new Error('Error desconocido al actualizar el presupuesto');
  }
}

/**
 * Crea un nuevo presupuesto
 * @param budgetData Datos del presupuesto a crear
 */
export async function createBudget(budgetData: Omit<Budget, '_id' | '__v' | 'ID'>): Promise<Budget> {
  try {
    const { data } = await axios.post(`${API_URL}/budget`, budgetData);
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