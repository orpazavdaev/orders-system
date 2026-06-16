import { Router } from "express";
import type { OrderController } from "../controllers/orderController";

export function createOrderRoutes(orderController: OrderController): Router {
  const router = Router();

  router.post("/", orderController.createOrder);

  return router;
}
