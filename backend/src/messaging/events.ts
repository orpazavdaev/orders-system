export interface OrderCreatedEvent {
  event: "OrderCreated";
  orderId: string;
  userId: string;
}
