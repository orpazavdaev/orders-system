import type { Order } from "../models/order";
import type { OrderRepository } from "./orderRepository";

export class InMemoryOrderRepository implements OrderRepository {
  private readonly orders = new Map<string, Order>();

  async save(order: Order): Promise<Order> {
    this.orders.set(order.orderId, order);
    return order;
  }

  async findById(orderId: string): Promise<Order | null> {
    return this.orders.get(orderId) ?? null;
  }
}
