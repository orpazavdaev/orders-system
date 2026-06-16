"use client";

import { useState, useEffect, type FormEvent } from "react";
import { createOrder } from "@/services/orderService";
import type { OrderFormState } from "@/types/order";

const initialState: OrderFormState = {
  status: "idle",
  orderId: null,
  orderStatus: null,
  error: null,
};

export default function OrderForm() {
  const [mounted, setMounted] = useState(false);
  const [userId, setUserId] = useState("");
  const [formState, setFormState] = useState<OrderFormState>(initialState);

  useEffect(() => {
    setMounted(true);
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setFormState({
      status: "loading",
      orderId: null,
      orderStatus: null,
      error: null,
    });

    try {
      const response = await createOrder({ userId });

      setFormState({
        status: "success",
        orderId: response.orderId,
        orderStatus: response.status,
        error: null,
      });
      setUserId("");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong.";

      setFormState({
        status: "error",
        orderId: null,
        orderStatus: null,
        error: message,
      });
    }
  }

  function handleReset() {
    setUserId("");
    setFormState(initialState);
  }

  const isLoading = formState.status === "loading";
  const isSuccess = formState.status === "success";
  const isError = formState.status === "error";

  if (!mounted) {
    return (
      <section className="order-form">
        <h2>Create Order</h2>
      </section>
    );
  }

  return (
    <section className="order-form">
      <h2>Create Order</h2>

      {isSuccess && formState.orderId && (
        <div className="alert alert-success" role="status">
          <p>Order created successfully.</p>
          <p>
            Order ID: <strong>{formState.orderId}</strong>
          </p>
          {formState.orderStatus && (
            <p>
              Status: <strong>{formState.orderStatus}</strong>
            </p>
          )}
          <button type="button" className="btn btn-secondary" onClick={handleReset}>
            Create another order
          </button>
        </div>
      )}

      {!isSuccess && (
        <form onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="userId">User ID</label>
            <input
              id="userId"
              name="userId"
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Enter user ID"
              disabled={isLoading}
              autoComplete="off"
            />
          </div>

          {isError && formState.error && (
            <div className="alert alert-error" role="alert">
              {formState.error}
            </div>
          )}

          <button type="submit" className="btn btn-primary" disabled={isLoading}>
            {isLoading ? "Creating order…" : "Create Order"}
          </button>
        </form>
      )}
    </section>
  );
}
