import { apiClient } from "@/services/apiClient";
import type { CreateOrderRequest, CreateOrderResponse } from "@/types/order";

export async function createOrder(
  request: CreateOrderRequest
): Promise<CreateOrderResponse> {
  const trimmedUserId = request.userId.trim();

  if (!trimmedUserId) {
    throw new Error("User ID is required.");
  }

  return apiClient<CreateOrderResponse>("/orders", {
    method: "POST",
    body: JSON.stringify({ userId: trimmedUserId }),
  });
}
