import type { Server } from "node:http";
import { createApp } from "./app";
import { runMigrations } from "./db/migrate";
import { closePool, getPool } from "./db/pool";
import { closeConnection } from "./messaging/connection";
import { OrderEventPublisher } from "./messaging/orderEventPublisher";
import { PostgresOrderRepository } from "./repositories/postgresOrderRepository";

let server: Server | null = null;
let orderEventPublisher: OrderEventPublisher | null = null;

async function shutdown(signal: string): Promise<void> {
  console.log(`Received ${signal}, shutting down gracefully`);

  if (server) {
    await new Promise<void>((resolve, reject) => {
      server!.close((error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve();
      });
    });
  }

  if (orderEventPublisher) {
    await orderEventPublisher.close();
    orderEventPublisher = null;
  }

  await closeConnection();
  await closePool();

  process.exit(0);
}

async function main(): Promise<void> {
  const pool = getPool();

  await runMigrations(pool);

  orderEventPublisher = new OrderEventPublisher();
  await orderEventPublisher.initialize();

  const orderRepository = new PostgresOrderRepository(pool);
  const app = createApp(orderRepository, orderEventPublisher);

  const port = Number(process.env.PORT) || 8080;

  server = app.listen(port, "0.0.0.0", () => {
    console.log(`Order API listening on port ${port}`);
  });

  process.on("SIGTERM", () => {
    shutdown("SIGTERM").catch((error) => {
      console.error("Shutdown failed:", error);
      process.exit(1);
    });
  });

  process.on("SIGINT", () => {
    shutdown("SIGINT").catch((error) => {
      console.error("Shutdown failed:", error);
      process.exit(1);
    });
  });
}

main().catch(async (error) => {
  console.error("Failed to start server:", error);

  if (orderEventPublisher) {
    await orderEventPublisher.close();
  }

  await closeConnection();
  await closePool();
  process.exit(1);
});
