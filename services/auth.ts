const API_URL = process.env.NODE_ENV === "development" 
  ? "/api" // Proxy local en desarrollo
  : "https://crmdbsoft.zeabur.app"; // URL directa en producción

export interface LoginResponse {
  token: string;
  userId: string;
  role: string;
  supabaseUserId?: string;
  message?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: "admin" | "client";
  };
}

export async function loginUser(email: string, password: string): Promise<LoginResponse> {
  console.log(" Intentando login con:", { email });
  
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    console.log(" Status:", response.status);
    const responseText = await response.text();
    console.log(" Response:", responseText);

    if (!response.ok) {
      throw new Error(responseText || "Error al iniciar sesión");
    }

    const data = JSON.parse(responseText);
    console.log(" Login exitoso:", data);
    return data;
  } catch (error) {
    console.error(" Error en login:", error);
    throw error;
  }
}
