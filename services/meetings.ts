import axios from "axios";

// Fuerza el endpoint de producción siempre, para desarrollo y producción
const API_URL = "https://crmdbsoft.zeabur.app";

export interface Meeting {
  _id?: string;
  title: string;
  customer: {
    _id: string;
    name: string;
    email: string;
  };
  project: {
    _id: string;
    title: string;
    name: string;
    ID: string;
    userId: string[];
  };
  date: Date | string;
  time: string;
  duration: string;
  meetingType: string;
  meetingLink?: string;
  address?: string;
  description?: string;
  status?: 'scheduled' | 'completed' | 'cancelled';
  createdAt?: string;
  updatedAt?: string;
  participants?: string[];
  location?: string;
  link?: string;
  type?: string;
  attendees?: number;
}

// Interface for creating/updating meetings (what the backend expects)
export interface CreateMeetingData {
  title: string;
  customer: string; // Just the ID
  project: string;  // Just the ID
  date: Date | string;
  time: string;
  duration: string;
  meetingType: string;
  meetingLink?: string;
  address?: string;
  description?: string;
}

export interface MeetingsResponse {
  message: string;
  meetings: Meeting[];
  error?: string;
  details?: string;
}

export async function getAllMeetings(): Promise<MeetingsResponse> {
  try {
    const token = localStorage.getItem('token');
    const { data } = await axios.get<MeetingsResponse>(
      `${API_URL}/meetings`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return data;
  } catch (error) {
    console.error('Error al obtener las reuniones:', error);
    throw error;
  }
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
    throw error;
  }
}

export async function createMeeting(meetingData: CreateMeetingData): Promise<Meeting> {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    const response = await axios.post<Meeting>(
      `${API_URL}/meetingsCreate`,
      meetingData,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error: any) {
    console.error('Error creating meeting:', error);
    throw new Error(error.response?.data?.message || 'Error al crear la reunión');
  }
}

export async function updateMeeting(id: string, meetingData: Partial<CreateMeetingData>): Promise<Meeting> {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    const response = await axios.put<Meeting>(
      `${API_URL}/meetingsUpdate/${id}`,
      meetingData,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error: any) {
    console.error('Error updating meeting:', error);
    throw new Error(error.response?.data?.message || 'Error al actualizar la reunión');
  }
}

export async function deleteMeeting(id: string): Promise<void> {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    await axios.delete(`${API_URL}/meetingsDelete/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  } catch (error: any) {
    console.error('Error deleting meeting:', error);
    throw new Error(error.response?.data?.message || 'Error al eliminar la reunión');
  }
}