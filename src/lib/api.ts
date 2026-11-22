import type { ApiErrorBody, AuthResponse, CafeDTO, CartDTO, CartLineInput, CreateOrderInput, MenuItemDTO, OrderDTO, PromoDTO, UserDTO } from "../../shared/types";
import { API_URL } from "./config";
import { readToken, writeToken } from "./storage";

export type FieldIssue = { path: string; message: string };

export class ApiRequestError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly issues?: FieldIssue[],
  ) {
    super(message);
    this.name = "ApiRequestError";
  }
}

let token: string | null = null;

export async function initToken(): Promise<void> {
  token = await readToken();
}

export function setAuthToken(next: string | null): void {
  token = next;
  void writeToken(next);
}

export function getAuthToken(): string | null {
  return token;
}

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  public?: boolean;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (options.body !== undefined) headers["Content-Type"] = "application/json";
  if (!options.public && token) headers.Authorization = `Bearer ${token}`;

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method: options.method ?? "GET",
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });
  } catch {
    throw new ApiRequestError(0, "NETWORK", "Cannot reach the server. Check your connection and try again.");
  }

  const payload = (await response.json().catch(() => null)) as (T & Partial<ApiErrorBody>) | null;
  if (!response.ok) {
    const error = payload?.error;
    throw new ApiRequestError(
      response.status,
      error?.code ?? "ERROR",
      error?.message ?? "Something went wrong. Please try again.",
      error?.issues,
    );
  }
  return payload as T;
}

export const api = {
  health: () => request<{ ok: boolean }>("/api/health", { public: true }),

  register: (input: { email: string; password: string; name: string }) =>
    request<AuthResponse>("/api/auth/register", { method: "POST", body: input, public: true }),

  login: (input: { email: string; password: string }) =>
    request<AuthResponse>("/api/auth/login", { method: "POST", body: input, public: true }),

  logout: () => request<{ ok: boolean }>("/api/auth/logout", { method: "POST" }),

  me: () => request<{ user: UserDTO }>("/api/auth/me"),

  getMenu: () => request<{ items: MenuItemDTO[] }>("/api/menu", { public: true }),

  getMenuItem: (id: string) => request<{ item: MenuItemDTO }>(`/api/menu/${encodeURIComponent(id)}`, { public: true }),

  getCafes: () => request<{ cafes: CafeDTO[] }>("/api/cafes", { public: true }),

  getCart: () => request<CartDTO>("/api/cart"),

  saveCart: (cart: { lines: CartLineInput[]; promoCode: string | null }) =>
    request<CartDTO>("/api/cart", { method: "PUT", body: cart }),

  getPromo: (code: string) => request<{ promo: PromoDTO }>(`/api/promos/${encodeURIComponent(code)}`, { public: true }),

  createOrder: (input: CreateOrderInput) => request<OrderDTO>("/api/orders", { method: "POST", body: input }),

  getOrders: () => request<{ orders: OrderDTO[] }>("/api/orders"),

  getOrder: (id: string) => request<{ order: OrderDTO }>(`/api/orders/${encodeURIComponent(id)}`),
};

export function errorMessage(error: unknown): string {
  if (error instanceof ApiRequestError) return error.message;
  if (error instanceof Error) return error.message;
  return "Something went wrong. Please try again.";
}
