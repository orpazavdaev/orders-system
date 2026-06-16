import type { Request, Response, NextFunction } from "express";
import type { OrderService } from "../services/orderService";

export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  createOrder = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { userId } = req.body as { userId?: unknown };

      if (typeof userId !== "string" || !userId.trim()) {
        res.status(400).json({ message: "userId is required" });
        return;
      }

      const result = await this.orderService.createOrder({
        userId: userId.trim(),
      });

      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };
}
