"use client";

import { useEffect, useState } from "react";
import { getOrders, updateOrderStatus, deleteOrder } from "@/api/order.api";
import OrdersTable from "@/components/OrdersTable";

export default function Orders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();

    (async () => {
      try {
        const res = await getOrders({ signal: controller.signal });
        if (mounted) setOrders(res || []);
      } catch (err) {
        if (err.name !== "AbortError") console.error(err);
      }
    })();

    return () => {
      mounted = false;
      controller.abort();
    };
  }, []);

  async function markDelivered(id) {
    try {
      await updateOrderStatus(id, "delivered");
      // reload after update
      const res = await getOrders();
      setOrders(res || []);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this order?')) return;
    try {
      await deleteOrder(id);
      const res = await getOrders();
      setOrders(res || []);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="space-y-4 text-stone-950">
      {orders.length === 0 && <div className="text-sm text-zinc-500">No orders</div>}

      <div className="space-y-4">
        {/* Desktop table */}
        <div className="hidden md:block">
          <OrdersTable orders={orders} onMarkDelivered={markDelivered} onDelete={handleDelete} />
        </div>

        {/* Mobile cards */}
          <div className="block md:hidden grid grid-cols-1 gap-4">
          {orders.map((o) => (
            <div key={o._id} className="bg-white border rounded-lg p-4 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-stone-900 truncate">Order {o._id}</h3>
                  <span className={`text-xs font-semibold px-2 py-1 rounded ${o.status === 'delivered' ? 'bg-lime-100 text-lime-700' : 'bg-yellow-50 text-yellow-800'}`}>
                    {o.status}
                  </span>
                </div>

                <div className="mt-2 text-sm text-stone-700">
                  <p><span className="font-semibold">Customer:</span> {o.customerName || o.name || '—'}</p>
                  <p><span className="font-semibold">Phone:</span> {o.customerPhone || o.phone || '—'}</p>
                  <p><span className="font-semibold">Address:</span> {o.deliveryAddress || '—'}</p>
                </div>
              </div>
            </div>

            <div className="mt-4 border-t pt-3 space-y-2">
              <h4 className="text-sm font-semibold text-stone-800">Items</h4>
              <ul className="space-y-2">
                {(o.items || []).map((it, i) => (
                  <li key={i} className="flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-stone-900 truncate">{it.name || it.food?.name || 'Item'}</p>
                      <p className="text-xs text-stone-500">Qty: {it.quantity || it.qty || 1}</p>
                    </div>
                    <div className="text-sm font-bold text-stone-900">₦{Number(it.price || it.unitPrice || 0).toLocaleString()}</div>
                  </li>
                ))}
              </ul>

              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="text-stone-600 font-medium">Total</span>
                <span className="font-black text-stone-900">₦{Number(o.totalAmount || o.total || 0).toLocaleString()}</span>
              </div>
            </div>

              <div className="mt-4 flex items-center justify-between gap-2">
              <div className="text-xs text-stone-500">{new Date(o.createdAt || o.created || Date.now()).toLocaleString()}</div>
              <div className="flex items-center gap-2">
                {o.status !== 'delivered' && (
                  <button onClick={() => markDelivered(o._id)} className="bg-stone-900 text-white text-sm px-3 py-2 rounded-md">Mark Delivered</button>
                )}
                <button onClick={() => handleDelete(o._id)} className="bg-red-600 text-white text-sm px-3 py-2 rounded-md">Delete</button>
              </div>
            </div>
          </div>
          ))}
        </div>
      </div>
    </div>
  );
}
