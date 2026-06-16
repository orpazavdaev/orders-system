export interface CreateOrderRequest {
  userId: string;
}

export interface CreateOrderResponse {
  orderId: string;
  status: "created";
}

export type OrderFormStatus = "idle" | "loading" | "success" | "error";

export interface OrderFormState {
  status: OrderFormStatus;
  orderId: string | null;
  orderStatus: string | null;
  error: string | null;
}
