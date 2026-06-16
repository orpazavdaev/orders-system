import { randomUUID } from "node:crypto";
import type { CreateOrderInput, CreateOrderResult, Order } from "../models/order";
import type { OrderRepository } from "../repositories/orderRepository";

export class OrderService {
  constructor(private readonly orderRepository: OrderRepository) {}

  async createOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
    const order: Order = {
      orderId: randomUUID(),
      userId: input.userId,
      status: "created",
      createdAt: new Date(),
    };

    await this.orderRepository.save(order);

    return {
      orderId: order.orderId,
      status: order.status,
    };
  }
}
