import OrderForm from "@/components/OrderForm";

export default function HomePage() {
  return (
    <main>
      <h1>Order Processing</h1>
      <p className="subtitle">Create and track orders.</p>
      <OrderForm />
    </main>
  );
}
