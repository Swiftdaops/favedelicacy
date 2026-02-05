"use client";

import { useEffect, useState } from "react";
import { getOrders } from "../../../order.api";
import { getPayments } from "../../../payment.api";

export default function Dashboard() {
  const [counts, setCounts] = useState({ foods: 0, orders: 0, payments: 0 });

  useEffect(() => {
    async function load() {
      try {
        const [orders, payments] = await Promise.all([getOrders(), getPayments()]);

        setCounts({ foods: 0, orders: (orders && orders.length) || 0, payments: (payments && payments.length) || 0 });
      } catch (err) {
        console.error("Dashboard load failed:", err);
      }
    }

    load();
  }, []);

  return (
    <div className="min-h-screen p-8 bg-[var(--color-primary)] text-stone-950">
      <h1 className="text-2xl font-semibold mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-[var(--color-primary)] rounded shadow">Foods: {counts.foods}</div>
        <div className="p-4 bg-[var(--color-primary)] rounded shadow">Orders: {counts.orders}</div>
        <div className="p-4 bg-[var(--color-primary)] rounded shadow">Payments: {counts.payments}</div>
      </div>
    </div>
  );
}
