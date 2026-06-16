export type OrderStatus = "created";

export interface Order {
  orderId: string;
  userId: string;
  status: OrderStatus;
  createdAt: Date;
}

export interface CreateOrderInput {
  userId: string;
}

export interface CreateOrderResult {
  orderId: string;
  status: OrderStatus;
}
