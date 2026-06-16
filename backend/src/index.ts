import { createApp } from "./app";
import { runMigrations } from "./db/migrate";
import { closePool, getPool } from "./db/pool";
import { PostgresOrderRepository } from "./repositories/postgresOrderRepository";

async function main(): Promise<void> {
  const pool = getPool();

  await runMigrations(pool);

  const orderRepository = new PostgresOrderRepository(pool);
  const app = createApp(orderRepository);

  const port = Number(process.env.PORT) || 8080;

  app.listen(port, "0.0.0.0", () => {
    console.log(`Order API listening on port ${port}`);
  });
}

main().catch(async (error) => {
  console.error("Failed to start server:", error);
  await closePool();
  process.exit(1);
});
