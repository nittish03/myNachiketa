import axios from "axios";

const BASE_URL = (
  process.env.NEXT_PUBLIC_BACKEND_URL || "https://testaug.onrender.com"
).replace(/\/+$/, "");

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

function checkSuccess(data) {
  if (!data.success) {
    throw new Error(data.error || "Request failed");
  }
  return data;
}

export async function getFilters() {
  const { data } = await api.get("/api/filters");
  return checkSuccess(data);
}

export async function getStaff(params = {}) {
  const { data } = await api.get("/api/staff", { params });
  return checkSuccess(data);
}

export async function createStaff(body) {
  const { data } = await api.post("/api/staff", body);
  return checkSuccess(data);
}

export async function updateStaff(id, body) {
  const { data } = await api.put(`/api/staff/${id}`, body);
  return checkSuccess(data);
}

export async function deleteStaff(id) {
  const { data } = await api.delete(`/api/staff/${id}`);
  return checkSuccess(data);
}
