import type { Pool } from "pg";
import type { Order, OrderStatus } from "../models/order";
import type { OrderRepository } from "./orderRepository";

interface OrderRow {
  id: string;
  user_id: string;
  status: OrderStatus;
  created_at: Date;
}

function mapRowToOrder(row: OrderRow): Order {
  return {
    orderId: row.id,
    userId: row.user_id,
    status: row.status,
    createdAt: row.created_at,
  };
}

export class PostgresOrderRepository implements OrderRepository {
  constructor(private readonly pool: Pool) {}

  async save(order: Order): Promise<Order> {
    const result = await this.pool.query<OrderRow>(
      `
        INSERT INTO orders (id, user_id, status, created_at)
        VALUES ($1, $2, $3, $4)
        RETURNING id, user_id, status, created_at
      `,
      [order.orderId, order.userId, order.status, order.createdAt]
    );

    return mapRowToOrder(result.rows[0]);
  }

  async findById(orderId: string): Promise<Order | null> {
    const result = await this.pool.query<OrderRow>(
      `
        SELECT id, user_id, status, created_at
        FROM orders
        WHERE id = $1
      `,
      [orderId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return mapRowToOrder(result.rows[0]);
  }
}
