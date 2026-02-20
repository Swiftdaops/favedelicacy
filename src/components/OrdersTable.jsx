import React from 'react';
import { RotateCcw } from 'lucide-react';

export default function OrdersTable({ orders = [], onToggleDelivered = () => {}, loadingIds = {}, onDelete = () => {}, pendingActions = {}, onUndo = () => {} }) {
  return (
    <div className="w-full overflow-auto">
      <table className="w-full table-fixed border-collapse">
        <thead>
          <tr className="bg-stone-50">
            <th className="text-left px-4 py-2 text-xs text-stone-500 w-28">Order</th>
            <th className="text-left px-4 py-2 text-xs text-stone-500">Customer</th>
            <th className="text-left px-4 py-2 text-xs text-stone-500">Phone</th>
            <th className="text-left px-4 py-2 text-xs text-stone-500">Items</th>
            <th className="text-right px-4 py-2 text-xs text-stone-500">Total</th>
            <th className="text-left px-4 py-2 text-xs text-stone-500">Payment</th>
            <th className="text-left px-4 py-2 text-xs text-stone-500">Status</th>
            <th className="text-left px-4 py-2 text-xs text-stone-500">Date</th>
            <th className="text-left px-4 py-2 text-xs text-stone-500">Action</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o._id} className="border-b last:border-b-0 bg-white odd:bg-white even:bg-stone-50">
              <td className="px-4 py-3 text-sm text-stone-900 font-medium truncate">{o._id?.slice?.(0, 8) || o._id}</td>
              <td className="px-4 py-3 text-sm text-stone-700 min-w-0 truncate">{o.customerName || '—'}</td>
              <td className="px-4 py-3 text-sm text-stone-700 truncate">{o.customerPhone || '—'}</td>
              <td className="px-4 py-3 text-sm text-stone-700">{(o.items || []).length}</td>
              <td className="px-4 py-3 text-sm text-stone-900 text-right">₦{Number(o.totalAmount || o.total || 0).toLocaleString()}</td>
              <td className="px-4 py-3 text-sm whitespace-nowrap">
                {(['paid','confirmed','delivered'].includes(o.status)) ? (
                  <span className="inline-block px-2 py-1 text-xs font-semibold rounded bg-lime-100 text-lime-700 whitespace-nowrap">Paid</span>
                ) : (
                  <span className="inline-block px-2 py-1 text-xs font-semibold rounded bg-yellow-50 text-yellow-800 whitespace-nowrap">Pending payment</span>
                )}
              </td>
              <td className="px-4 py-3 text-sm whitespace-nowrap">
                <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${o.status === 'delivered' ? 'bg-lime-100 text-lime-700' : 'bg-yellow-50 text-yellow-800'} whitespace-nowrap`}>
                  {o.status}
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-stone-600 truncate">
                {o.createdAt || o.created ? new Date(o.createdAt || o.created).toLocaleString() : "—"}
              </td>
              <td className="px-4 py-3 text-sm flex items-center gap-2 whitespace-nowrap">
                {pendingActions[o._id] ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-stone-500">Scheduled</span>
                    <button onClick={() => onUndo(o._id)} className="bg-yellow-600 text-white px-2 py-1 rounded-md text-sm">Undo</button>
                  </div>
                ) : (
                  <>
                    {o.status !== 'delivered' ? (
                      <button disabled={!!loadingIds[o._id]} onClick={() => onToggleDelivered(o._id, o.status)} className="bg-stone-900 text-white px-3 py-1 rounded-md text-sm">{loadingIds[o._id] ? 'Saving...' : 'Mark Delivered'}</button>
                    ) : (
                      <button disabled={!!loadingIds[o._id]} onClick={() => onToggleDelivered(o._id, o.status)} className="bg-yellow-600 text-white px-3 py-1 rounded-md text-sm flex items-center gap-2">{loadingIds[o._id] ? 'Saving...' : (<><RotateCcw size={14}/>Undo</>)}</button>
                    )}
                    <button onClick={() => onDelete(o._id)} className="bg-red-600 text-white px-3 py-1 rounded-md text-sm">Delete</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
