import axios from "axios";

// Fuerza el endpoint de producción siempre, para desarrollo y producción
const API_URL = "https://crmdbsoft.zeabur.app";

export type MeUser = {
  userId?: string;
  email?: string;
  role?: string;
  userType?: string;
  name?: string | null;
  lastName?: string | null;
  secondName?: string | null;
  profileId?: string | null;
  customerId?: string | null;
  companyId?: string | null;
  [key: string]: any;
};

export type MeResponse = {
  message: string;
  user: MeUser;
};

export async function getMe(token?: string): Promise<MeResponse> {
  const authToken = token || localStorage.getItem("token") || "";
  const { data } = await axios.get<MeResponse>(`${API_URL}/me`, {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });
  return data;
}
