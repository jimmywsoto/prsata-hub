const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

export const registerUser = async (data) => {
  const res = await fetch(`${API_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const responseData = await res.json();

  if (!res.ok) {
    throw new Error(responseData.error || 'Error al registrar usuario');
  }

  return responseData;
};

export const loginUser = async (data) => {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  const responseData = await res.json();

  if (!res.ok) {
    throw new Error(responseData.error || 'Error al iniciar sesión');
  }

  return responseData;
};

// Solicitudes de acceso

export const accessRequest = async (data) => {
  const res = await fetch(`${API_URL}/api/access-requests/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const responseData = await res.json();

  if (!res.ok) {
    throw new Error(responseData.error || 'Error al consultar acceso');
  }

  return responseData;
};

export const allRequests = async () => {
  const res = await fetch(`${API_URL}/api/access-requests/`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  const responseData = await res.json();

  if (!res.ok) {
    throw new Error(responseData.error || 'Error al consultar acceso');
  }

  return responseData;
};

export const allUserRequests = async (user_id) => {
  const res = await fetch(`${API_URL}/api/access-requests/user/${user_id}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    params: {id: user_id},
  });
  const responseData = await res.json();

  if (!res.ok) {
    throw new Error(responseData.error || 'Error al consultar acceso');
  }

  return responseData;
};