import type { Order } from "../models/order";

export interface OrderRepository {
  save(order: Order): Promise<Order>;
  findById(orderId: string): Promise<Order | null>;
}
