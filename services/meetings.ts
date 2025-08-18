import axios from "axios";

// Fuerza el endpoint de producción siempre, para desarrollo y producción
const API_URL = "https://crmdbsoft.zeabur.app";

export interface Meeting {
  _id: string;
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  location?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  customer: string; // Customer ID
  project?: string; // Project ID (optional)
  createdAt: string;
  updatedAt: string;
  [key: string]: any;
}

export interface MeetingsResponse {
  message: string;
  meetings: Meeting[];
}

/**
 * Obtiene las reuniones asociadas a un nombre de usuario
 * @param username Nombre de usuario (email) del cliente
 */
export async function getMeetingsByUsername(username: string): Promise<MeetingsResponse> {
  if (!username) {
    throw new Error("El nombre de usuario es requerido");
  }

  try {
    const { data } = await axios.get<MeetingsResponse>(
      `${API_URL}/meetings/username/${encodeURIComponent(username)}`
    );
    return data;
  } catch (error) {
    console.error('Error al obtener las reuniones:', error);
    throw error; // Puedes manejar el error de forma más específica si lo prefieres
  }
}