import cors from "cors";
import express, { type Express, type NextFunction, type Request, type Response } from "express";
import { OrderController } from "./controllers/orderController";
import { createOrderRoutes } from "./routes/orderRoutes";
import { OrderEventPublishError } from "./messaging/orderEventPublisher";
import type { OrderEventPublisher } from "./messaging/orderEventPublisher";
import type { OrderRepository } from "./repositories/orderRepository";
import { OrderService } from "./services/orderService";

export function createApp(
  orderRepository: OrderRepository,
  orderEventPublisher: OrderEventPublisher
): Express {
  const app = express();

  const orderService = new OrderService(orderRepository, orderEventPublisher);
  const orderController = new OrderController(orderService);

  app.use(cors());
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/orders", createOrderRoutes(orderController));

  app.use(
    (
      err: Error,
      _req: Request,
      res: Response,
      _next: NextFunction
    ): void => {
      if (err instanceof OrderEventPublishError) {
        res.status(503).json({
          message: "Order was saved but event publishing failed. Please retry.",
        });
        return;
      }

      res.status(500).json({ message: err.message || "Internal server error" });
    }
  );

  return app;
}
