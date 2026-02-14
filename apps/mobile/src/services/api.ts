import type { Zikr, CounterPreset, ApiResponse, ZikrCategory } from "@repo/types";

const API_URL = "http://localhost:3001/api/v1";

async function request<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const json: ApiResponse<T> = await res.json();
  if (!json.success) throw new Error(json.error.message);
  return json.data;
}

export function fetchAzkar(category: ZikrCategory): Promise<Zikr[]> {
  return request<Zikr[]>(`/azkar?category=${category}`);
}

export function fetchAllAzkar(): Promise<Zikr[]> {
  return request<Zikr[]>("/azkar/all");
}

export function fetchCounterPresets(): Promise<CounterPreset[]> {
  return request<CounterPreset[]>("/counter-presets");
}

export function fetchAzkarVersion(): Promise<{ version: number }> {
  return request<{ version: number }>("/azkar/version");
}
