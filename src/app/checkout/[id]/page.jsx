import ProofOfPayment from "@/components/ProofOfPayment";

export default async function CheckoutPage({ params }) {
  const resolved = await params;
  const { id } = resolved || {};

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-stone-50">
      <div className="max-w-xl w-full bg-white p-6 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-2 text-stone-900">Thank you — Order received</h1>
        <p className="text-stone-700 mb-4">Your order ID: <span className="font-mono text-stone-800">{id}</span></p>
        <p className="text-sm text-stone-600">We've received your order and will confirm shortly via phone.</p>

        <ProofOfPayment orderId={id} />
      </div>
    </div>
  );
}
