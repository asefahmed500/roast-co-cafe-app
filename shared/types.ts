/** Shared API contracts used by both the Workers API and the Expo client. */

export type Category = "Hot" | "Cold" | "Bakery" | "Tea";
export type IllustrationName = "cup" | "iced" | "croi" | "cake" | "bean";

export type MenuItemDTO = {
  id: string;
  name: string;
  description: string;
  price: number;
  illustration: IllustrationName;
  category: Category;
  rating: number;
  reviews: number;
  minutes: number;
  tint: string;
};

export type CafeDTO = {
  id: string;
  name: string;
  address: string;
  distance: string;
  tint: string;
};

export type UserDTO = {
  id: string;
  email: string;
  name: string;
  points: number;
  tier: string;
  coffeeStamps: number;
};

export type CartSize = "S" | "M" | "L";
export type CartMilk = "Whole" | "Oat" | "Almond";

export type CartOptions = {
  size: CartSize;
  milk: CartMilk;
};

export type CartLineInput = {
  id: string;
  qty: number;
  note: string;
  options?: CartOptions;
};

export type CartDTO = {
  lines: CartLineInput[];
  promoCode: string | null;
  updatedAt: string | null;
};

export type PromoDTO = {
  code: string;
  percent: number;
};

export type OrderStatus = "received" | "brewing" | "ready" | "picked_up";
export type OrderMode = "pickup" | "dine";
export type PaymentMethod = "bkash" | "nagad" | "card" | "cash";

export type OrderItemDTO = {
  id: string;
  name: string;
  qty: number;
  note: string;
  price: number;
};

export type OrderDTO = {
  id: string;
  orderNumber: number;
  status: OrderStatus;
  items: OrderItemDTO[];
  subtotal: number;
  discount: number;
  total: number;
  promoCode: string | null;
  paymentStatus: "pending" | "pay_at_counter";
  cafeId: string;
  mode: OrderMode;
  payment: PaymentMethod;
  timeSlot: string;
  etaMinutes: number;
  minutesLeft: number;
  createdAt: string;
};

export type CreateOrderInput = {
  cafeId: string;
  mode: OrderMode;
  payment: PaymentMethod;
  timeSlot: string;
  promoCode?: string;
  idempotencyKey?: string;
  items: CartLineInput[];
};

export type AuthResponse = {
  token: string;
  user: UserDTO;
};

export type ApiErrorBody = {
  error: {
    code: string;
    message: string;
    issues?: Array<{ path: string; message: string }>;
  };
};
