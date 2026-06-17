import type { Channel } from "amqplib";
import { ORDERS_EXCHANGE, ORDER_CREATED_ROUTING_KEY } from "./constants";
import { createChannel } from "./connection";
import type { OrderCreatedEvent } from "./events";

export class OrderEventPublishError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "OrderEventPublishError";
  }
}

export class OrderEventPublisher {
  private channel: Channel | null = null;

  async initialize(): Promise<void> {
    await this.ensureChannel();
  }

  async publishOrderCreated(order: {
    orderId: string;
    userId: string;
  }): Promise<void> {
    const payload: OrderCreatedEvent = {
      event: "OrderCreated",
      orderId: order.orderId,
      userId: order.userId,
    };

    const body = Buffer.from(JSON.stringify(payload));

    try {
      await this.publishWithRetry(body);
    } catch (error) {
      throw new OrderEventPublishError("Failed to publish OrderCreated event", {
        cause: error,
      });
    }
  }

  async close(): Promise<void> {
    if (this.channel) {
      await this.channel.close();
      this.channel = null;
    }
  }

  private async publishWithRetry(body: Buffer, attempt = 1): Promise<void> {
    const maxAttempts = 3;

    try {
      const channel = await this.ensureChannel();
      const published = channel.publish(
        ORDERS_EXCHANGE,
        ORDER_CREATED_ROUTING_KEY,
        body,
        {
          contentType: "application/json",
          persistent: true,
        }
      );

      if (!published) {
        await this.waitForDrain(channel);
        const retried = channel.publish(
          ORDERS_EXCHANGE,
          ORDER_CREATED_ROUTING_KEY,
          body,
          {
            contentType: "application/json",
            persistent: true,
          }
        );

        if (!retried) {
          throw new Error("RabbitMQ publish buffer full");
        }
      }
    } catch (error) {
      this.channel = null;

      if (attempt < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 500 * attempt));
        return this.publishWithRetry(body, attempt + 1);
      }

      throw error;
    }
  }

  private async ensureChannel(): Promise<Channel> {
    if (this.channel) {
      return this.channel;
    }

    const channel = await createChannel();

    channel.on("error", (error) => {
      console.error("RabbitMQ channel error:", error);
      this.channel = null;
    });

    channel.on("close", () => {
      this.channel = null;
    });

    this.channel = channel;
    return channel;
  }

  private waitForDrain(channel: Channel): Promise<void> {
    return new Promise((resolve) => {
      channel.once("drain", resolve);
    });
  }
}
