"use client";

import { useEffect, useState } from "react";
import { getPayments, verifyPayment, deletePayment } from "@/api/payment.api";
import { updateOrderStatus, getOrders } from "@/api/order.api";
import { toast } from "sonner";
import { RotateCcw } from "lucide-react";

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [loadingIds, setLoadingIds] = useState({});
  const [pendingActions, setPendingActions] = useState({});

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

  // Optimistic verify with undo window
  function verify(id) {
    // apply optimistic change
    setPayments((s) => s.map(p => p._id === id ? { ...p, verified: true } : p));
    // schedule actual API call
    const timer = setTimeout(async () => {
      setLoadingIds((s) => ({ ...s, [id]: true }));
      try {
        await verifyPayment(id);
        toast.success("Payment verified");
        try {
          const orders = await getOrders();
          const pending = (orders || []).filter(o => o.status === 'pending').length;
          try { const ch = new BroadcastChannel('admin-orders'); ch.postMessage({ type: 'orders-updated', pendingCount: pending }); ch.close(); }
          catch (e) { localStorage.setItem('admin_orders_updated', JSON.stringify({ ts: Date.now(), pendingCount: pending })); }
        } catch (e) {}
      } catch (err) {
        console.error(err);
        toast.error(err?.message || "Verify failed");
        // revert optimistic change
        setPayments((s) => s.map(p => p._id === id ? { ...p, verified: false } : p));
      } finally {
        setLoadingIds((s) => {
          const copy = { ...s };
          delete copy[id];
          return copy;
        });
        setPendingActions((s) => {
          const copy = { ...s };
          delete copy[id];
          return copy;
        });
      }
    }, 5000);

    setPendingActions((s) => ({ ...s, [id]: { timer, type: 'verify' } }));
    toast.success('Verification scheduled', { action: { label: 'Undo', onClick: () => undoPending(id) } });
  }

  function markOrderPaid(orderId) {
    // optimistic: mark related payment.order.paid? We'll mark order.status if present
    setPayments((s) => s.map(p => p.order && p.order._id === orderId ? { ...p, order: { ...p.order, status: 'paid' } } : p));
    const key = `order-${orderId}`;
    const timer = setTimeout(async () => {
      setLoadingIds((s) => ({ ...s, [orderId]: true }));
      try {
        await updateOrderStatus(orderId, "paid");
        toast.success("Order marked paid");
          try {
            const orders = await getOrders();
            const pending = (orders || []).filter(o => o.status === 'pending').length;
            try { const ch = new BroadcastChannel('admin-orders'); ch.postMessage({ type: 'orders-updated', pendingCount: pending }); ch.close(); }
            catch (e) { localStorage.setItem('admin_orders_updated', JSON.stringify({ ts: Date.now(), pendingCount: pending })); }
          } catch (e) {}
      } catch (err) {
        console.error(err);
        toast.error(err?.message || "Mark paid failed");
        // revert optimistic
        const res = await getPayments();
        setPayments(res || []);
      } finally {
        setLoadingIds((s) => {
          const copy = { ...s };
          delete copy[orderId];
          return copy;
        });
        setPendingActions((s) => {
          const copy = { ...s };
          delete copy[key];
          return copy;
        });
      }
    }, 5000);
    setPendingActions((s) => ({ ...s, [key]: { timer, type: 'markPaid', orderId } }));
    toast.success('Mark paid scheduled', { action: { label: 'Undo', onClick: () => undoPending(key) } });
  }

  function handleDelete(id) {
    if (!confirm("Delete this payment? You will have 5s to undo.")) return;
    // optimistic remove
    const prev = payments;
    setPayments((s) => s.filter(p => p._id !== id));
    const timer = setTimeout(async () => {
      setLoadingIds((s) => ({ ...s, [id]: true }));
      try {
        await deletePayment(id);
        toast.success("Payment deleted");
        try {
          const orders = await getOrders();
          const pending = (orders || []).filter(o => o.status === 'pending').length;
          try { const ch = new BroadcastChannel('admin-orders'); ch.postMessage({ type: 'orders-updated', pendingCount: pending }); ch.close(); }
          catch (e) { localStorage.setItem('admin_orders_updated', JSON.stringify({ ts: Date.now(), pendingCount: pending })); }
        } catch (e) {}
      } catch (err) {
        console.error(err);
        toast.error(err?.message || "Delete failed");
        setPayments(prev);
      } finally {
        setLoadingIds((s) => {
          const copy = { ...s };
          delete copy[id];
          return copy;
        });
        setPendingActions((s) => {
          const copy = { ...s };
          delete copy[id];
          return copy;
        });
      }
    }, 5000);
    setPendingActions((s) => ({ ...s, [id]: { timer, type: 'delete', prev } }));
    toast.success('Delete scheduled', { action: { label: 'Undo', onClick: () => undoPending(id) } });
  }

  function undoPending(key) {
    const action = pendingActions[key];
    if (!action) return;
    clearTimeout(action.timer);
    // revert optimistic UI
    if (action.type === 'verify') {
      setPayments((s) => s.map(p => p._id === key ? { ...p, verified: false } : p));
    } else if (action.type === 'markPaid') {
      const orderId = action.orderId;
      setPayments((s) => s.map(p => p.order && p.order._id === orderId ? { ...p, order: { ...p.order, status: 'pending' } } : p));
    } else if (action.type === 'delete') {
      setPayments(action.prev);
    }
    setPendingActions((s) => {
      const copy = { ...s };
      delete copy[key];
      return copy;
    });
    toast.success('Action undone');
  }

  function shareWhatsApp(p) {
    const phone = p.order?.customerPhone || "";
    const customer = p.customerName || p.order?.customerName || '';
    const items = (p.order?.items || []).map(i => `${i.name || i.food?.name} x${i.quantity || i.qty || 1} - ₦${Number(i.price||0).toLocaleString()}`).join("\n");
    const total = `₦${Number(p.order?.totalAmount || p.order?.total || p.amount || 0).toLocaleString()}`;

    const message = `Order Confirmed! ✅\n\nCustomer: ${customer}\n\nOrder Details:\n${items}\n\nAmount Due: ${total}\n\nYour food is being prepared now. See you soon!`;
    const encoded = encodeURIComponent(message);
    const url = phone ? `https://wa.me/${phone.replace(/[^0-9+]/g,"")}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
    window.open(url, "_blank");
  }

  return (
    <div className="text-stone-950 pb-12">
      {payments.length === 0 && <div className="text-sm text-zinc-500">No payments</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {payments.map((p) => (
          <div key={p._id} className="bg-white rounded-lg p-4 shadow-sm flex flex-col">
            <div className="flex items-start gap-4">
              <div className="w-20 md:w-24 flex-shrink-0">
                {p.proof?.url ? (
                  <img src={p.proof.url} alt="proof" className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-md" />
                ) : (
                  <div className="w-20 h-20 md:w-24 md:h-24 bg-stone-100 rounded-md flex items-center justify-center text-sm text-stone-500">No Image</div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <h4 className="font-semibold text-stone-900 truncate">Payment {p._id?.slice?.(0,8)}</h4>
                    <div className="text-sm text-stone-600 truncate">Customer: {p.customerName || '—'}</div>
                    <div className="text-sm text-stone-600">Amount: ₦{Number(p.amount || 0).toLocaleString()}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
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
                          <div className="flex-1 text-sm min-w-0">
                            <div className="font-medium text-stone-900 truncate">{it.name || it.food?.name}</div>
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

            <div className="mt-3 flex flex-col sm:flex-row items-center sm:justify-end gap-2">
              <button disabled={!!loadingIds[p._id]} onClick={() => verify(p._id)} className="px-3 py-2 bg-stone-900 text-white rounded-md text-sm w-full sm:w-auto">{loadingIds[p._id] ? 'Verifying...' : 'Verify Proof'}</button>
              {p.order && <button disabled={!!loadingIds[p.order._id]} onClick={() => markOrderPaid(p.order._id)} className="px-3 py-2 bg-lime-600 text-white rounded-md text-sm w-full sm:w-auto">{loadingIds[p.order._id] ? 'Processing...' : 'Mark Order Paid'}</button>}
              <button onClick={() => shareWhatsApp(p)} className="px-3 py-2 bg-green-600 text-white rounded-md text-sm w-full sm:w-auto">Share WhatsApp</button>
              <button disabled={!!loadingIds[p._id]} onClick={() => handleDelete(p._id)} className="px-3 py-2 bg-red-600 text-white rounded-md text-sm w-full sm:w-auto">{loadingIds[p._id] ? (<><RotateCcw size={14}/> Deleting...</>) : 'Delete'}</button>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden md:block h-20" />
    </div>
  );
}
