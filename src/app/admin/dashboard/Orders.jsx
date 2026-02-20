"use client";

import { useEffect, useState } from "react";
import { getOrders, updateOrderStatus, deleteOrder } from "@/api/order.api";
import OrdersTable from "@/components/OrdersTable";
import { toast } from "sonner";
import { RotateCcw } from "lucide-react";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loadingIds, setLoadingIds] = useState({});
  const [pendingActions, setPendingActions] = useState({});

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();

    (async () => {
      try {
        const res = await getOrders({ signal: controller.signal });
        if (mounted) setOrders(res || []);
        // mark as viewed when admin opens orders page
        try {
          const pending = (res || []).filter(o => o.status === 'pending').length;
          localStorage.setItem('admin_last_seen_orders_count', String(pending));
          try {
            const ch = new BroadcastChannel('admin-orders');
            ch.postMessage({ type: 'orders-viewed', pendingCount: pending });
            ch.close();
          } catch (e) {
            localStorage.setItem('admin_orders_viewed', JSON.stringify({ ts: Date.now(), pendingCount: pending }));
          }
        } catch (e) {}
      } catch (err) {
        if (err.name !== "AbortError") console.error(err);
      }
    })();

    return () => {
      mounted = false;
      controller.abort();
    };
  }, []);

  function toggleDelivered(id, currentStatus) {
    // optimistic
    setOrders((s) => s.map(o => o._id === id ? { ...o, status: currentStatus === 'delivered' ? 'pending' : 'delivered' } : o));
    const timer = setTimeout(async () => {
      setLoadingIds((s) => ({ ...s, [id]: true }));
      try {
        const newStatus = currentStatus === "delivered" ? "pending" : "delivered";
        await updateOrderStatus(id, newStatus);
        toast.success(`Order ${newStatus === 'delivered' ? 'marked delivered' : 'reverted to pending'}`);
        const res = await getOrders();
        setOrders(res || []);
        // broadcast updated pending count
        try {
          const pending = (res || []).filter(o => o.status === 'pending').length;
          try { const ch = new BroadcastChannel('admin-orders'); ch.postMessage({ type: 'orders-updated', pendingCount: pending }); ch.close(); }
          catch (e) { localStorage.setItem('admin_orders_updated', JSON.stringify({ ts: Date.now(), pendingCount: pending })); }
        } catch (e) {}
      } catch (err) {
        console.error(err);
        toast.error(err?.message || "Update failed");
        const res = await getOrders();
        setOrders(res || []);
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

    setPendingActions((s) => ({ ...s, [id]: { timer, type: 'toggleDelivered', prevStatus: currentStatus } }));
    toast.success('Delivery status scheduled', { action: { label: 'Undo', onClick: () => undoPending(id) } });
  }

  function handleDelete(id) {
    if (!confirm('Delete this order? You will have 5s to undo.')) return;
    const prev = orders;
    setOrders((s) => s.filter(o => o._id !== id));
    const timer = setTimeout(async () => {
      try {
        await deleteOrder(id);
        toast.success('Order deleted');
        // broadcast updated pending count
        try {
          const res = await getOrders();
          const pending = (res || []).filter(o => o.status === 'pending').length;
          try { const ch = new BroadcastChannel('admin-orders'); ch.postMessage({ type: 'orders-updated', pendingCount: pending }); ch.close(); }
          catch (e) { localStorage.setItem('admin_orders_updated', JSON.stringify({ ts: Date.now(), pendingCount: pending })); }
        } catch (e) {}
      } catch (err) {
        console.error(err);
        toast.error(err?.message || 'Delete failed');
        setOrders(prev);
      } finally {
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

  function undoPending(id) {
    const action = pendingActions[id];
    if (!action) return;
    clearTimeout(action.timer);
    if (action.type === 'toggleDelivered') {
      setOrders((s) => s.map(o => o._id === id ? { ...o, status: action.prevStatus } : o));
    } else if (action.type === 'delete') {
      setOrders(action.prev);
    }
    setPendingActions((s) => {
      const copy = { ...s };
      delete copy[id];
      return copy;
    });
    toast.success('Action undone');
  }

  return (
    <div className="space-y-4 text-stone-950 pb-6">
      {orders.length === 0 && <div className="text-sm text-zinc-500">No orders</div>}

      <div className="space-y-4">
        {/* Desktop table */}
        <div className="hidden md:block">
          <OrdersTable orders={orders} onToggleDelivered={toggleDelivered} loadingIds={loadingIds} onDelete={handleDelete} pendingActions={pendingActions} onUndo={undoPending} />
        </div>

        {/* Mobile cards */}
          <div className="block md:hidden grid grid-cols-1 gap-4">
          {orders.map((o) => (
            <div key={o._id} className="bg-white border rounded-lg p-4 shadow-sm overflow-hidden">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-bold text-stone-900 truncate min-w-0">Order {o._id}</h3>
                  <span className={`text-xs font-semibold px-2 py-1 rounded flex-shrink-0 whitespace-nowrap ${o.status === 'delivered' ? 'bg-lime-100 text-lime-700' : 'bg-yellow-50 text-yellow-800'}`}>
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

              <div className="mt-4 flex flex-col sm:flex-row items-center sm:justify-between gap-2">
                <div className="text-xs text-stone-500">{new Date(o.createdAt || o.created || Date.now()).toLocaleString()}</div>
                <div className="flex w-full sm:w-auto items-center gap-2">
                {pendingActions[o._id] ? (
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <span className="text-xs text-stone-500">Scheduled</span>
                    <button onClick={() => undoPending(o._id)} className="bg-yellow-600 text-white text-sm px-2 py-1 rounded-md w-full sm:w-auto">Undo</button>
                  </div>
                ) : (
                  <>
                    {o.status !== 'delivered' ? (
                      <button disabled={!!loadingIds[o._id]} onClick={() => toggleDelivered(o._id, o.status)} className="bg-stone-900 text-white text-sm px-3 py-2 rounded-md w-full sm:w-auto">
                        {loadingIds[o._id] ? 'Saving...' : 'Mark Delivered'}
                      </button>
                    ) : (
                      <button disabled={!!loadingIds[o._id]} onClick={() => toggleDelivered(o._id, o.status)} className="bg-yellow-600 text-white text-sm px-3 py-2 rounded-md flex items-center gap-2 w-full sm:w-auto">
                        {loadingIds[o._id] ? 'Saving...' : (<><RotateCcw size={16}/> Undo</>) }
                      </button>
                    )}
                    <button onClick={() => handleDelete(o._id)} className="bg-red-600 text-white text-sm px-3 py-2 rounded-md w-full sm:w-auto">Delete</button>
                  </>
                )}
                </div>
              </div>
          </div>
          ))}
        </div>
      <div className="hidden md:block h-20" />
      </div>
    </div>
  );
}
