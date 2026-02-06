"use client";

import { useEffect, useState } from "react";
import { getPayments, verifyPayment, deletePayment } from "@/api/payment.api";
import { updateOrderStatus } from "@/api/order.api";

export default function Payments() {
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();

    (async () => {
      try {
        const res = await getPayments({ signal: controller.signal });
        if (mounted) setPayments(res || []);
      } catch (err) {
        if (err.name !== "AbortError") console.error(err);
      }
    })();

    return () => {
      mounted = false;
      controller.abort();
    };
  }, []);

  async function verify(id) {
    try {
      await verifyPayment(id);
      const res = await getPayments();
      setPayments(res || []);
    } catch (err) {
      console.error(err);
    }
  }

  async function markOrderPaid(orderId) {
    try {
      await updateOrderStatus(orderId, "paid");
      const res = await getPayments();
      setPayments(res || []);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this payment? This cannot be undone.")) return;
    try {
      await deletePayment(id);
      const res = await getPayments();
      setPayments(res || []);
    } catch (err) {
      console.error(err);
    }
  }

  function shareWhatsApp(p) {
    const phone = p.order?.customerPhone || "";
    const items = (p.order?.items || []).map(i => `${i.name || i.food?.name} x${i.quantity || i.qty || 1} - ₦${Number(i.price||0).toLocaleString()}`).join("\n");
    const total = `₦${Number(p.order?.totalAmount || p.order?.total || p.amount || 0).toLocaleString()}`;
    const text = `Order%20Summary%0AOrder:%20${p.order?._id||''}%0ACustomer:%20${encodeURIComponent(p.customerName||'')}%0A%0A${encodeURIComponent(items)}%0A%0ATotal:%20${encodeURIComponent(total)}`;
    const url = phone ? `https://wa.me/${phone.replace(/[^0-9+]/g,"")}?text=${text}` : `https://wa.me/?text=${text}`;
    window.open(url, "_blank");
  }

  return (
    <div className="text-stone-950">
      {payments.length === 0 && <div className="text-sm text-zinc-500">No payments</div>}
      <ul className="space-y-4">
        {payments.map((p) => (
          <li key={p._id} className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-24">
                {p.proof?.url ? (
                  <img src={p.proof.url} alt="proof" className="w-24 h-24 object-cover rounded-md" />
                ) : (
                  <div className="w-24 h-24 bg-stone-100 rounded-md flex items-center justify-center text-sm text-stone-500">No Image</div>
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-stone-900">Payment {p._id?.slice?.(0,8)}</h4>
                    <div className="text-sm text-stone-600">Customer: {p.customerName || '—'}</div>
                    <div className="text-sm text-stone-600">Amount: ₦{Number(p.amount || 0).toLocaleString()}</div>
                  </div>
                  <div className="text-right">
                    <div className={`px-2 py-1 rounded text-xs font-semibold ${p.verified ? 'bg-lime-100 text-lime-700' : 'bg-yellow-50 text-yellow-800'}`}>
                      {p.verified ? 'Verified' : 'Unverified'}
                    </div>
                  </div>
                </div>

                {p.order && (
                  <div className="mt-3 border-t pt-3">
                    <h5 className="text-sm font-semibold text-stone-800">Order {p.order._id?.slice?.(0,8)}</h5>
                    <div className="mt-2 space-y-2">
                      {(p.order.items || []).map((it, i) => (
                        <div key={i} className="flex items-center gap-3">
                          {it.food?.images?.[0]?.url ? (
                            <img src={it.food.images[0].url} className="w-12 h-12 object-cover rounded" />
                          ) : (
                            <div className="w-12 h-12 bg-stone-100 rounded" />
                          )}
                          <div className="flex-1 text-sm">
                            <div className="font-medium text-stone-900">{it.name || it.food?.name}</div>
                            <div className="text-xs text-stone-600">Qty: {it.quantity || it.qty || 1}</div>
                          </div>
                          <div className="font-bold text-stone-900">₦{Number(it.price || 0).toLocaleString()}</div>
                        </div>
                      ))}

                      <div className="mt-2 flex items-center justify-between">
                        <div className="text-sm text-stone-600">Total</div>
                        <div className="font-black">₦{Number(p.order.totalAmount || p.order.total || 0).toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-3 flex items-center gap-2 justify-end">
              <button onClick={() => verify(p._id)} className="px-3 py-2 bg-stone-900 text-white rounded-md text-sm">Verify Proof</button>
              {p.order && <button onClick={() => markOrderPaid(p.order._id)} className="px-3 py-2 bg-lime-600 text-white rounded-md text-sm">Mark Order Paid</button>}
              <button onClick={() => shareWhatsApp(p)} className="px-3 py-2 bg-green-600 text-white rounded-md text-sm">Share WhatsApp</button>
              <button onClick={() => handleDelete(p._id)} className="px-3 py-2 bg-red-600 text-white rounded-md text-sm">Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
