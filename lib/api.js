const BASE_URL = (
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.BACKEND_BASE_URL ||
  "https://testaug.onrender.com"
).replace(/\/+$/, "");

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  let json;
  try {
    json = await res.json();
  } catch {
    throw new Error(`Request failed (${res.status})`);
  }

  if (!json.success) {
    throw new Error(json.error || `Request failed (${res.status})`);
  }

  return json;
}

export function getFilters() {
  return request("/api/filters");
}

export function getStaff(params = {}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value));
    }
  });
  const query = search.toString();
  return request(`/api/staff${query ? `?${query}` : ""}`);
}

export function getStaffById(id) {
  return request(`/api/staff/${id}`);
}

export function createStaff(body) {
  return request("/api/staff", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function updateStaff(id, body) {
  return request(`/api/staff/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export function deleteStaff(id) {
  return request(`/api/staff/${id}`, {
    method: "DELETE",
  });
}
