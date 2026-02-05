import React from 'react';

export default function OrdersTable({ orders = [], onMarkDelivered = () => {}, onDelete = () => {} }) {
  return (
    <div className="w-full overflow-auto">
      <table className="w-full table-auto border-collapse">
        <thead>
          <tr className="bg-stone-50">
            <th className="text-left px-4 py-2 text-xs text-stone-500">Order</th>
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
              <td className="px-4 py-3 text-sm text-stone-900 font-medium">{o._id?.slice?.(0, 8) || o._id}</td>
              <td className="px-4 py-3 text-sm text-stone-700">{o.customerName || '—'}</td>
              <td className="px-4 py-3 text-sm text-stone-700">{o.customerPhone || '—'}</td>
              <td className="px-4 py-3 text-sm text-stone-700">{(o.items || []).length}</td>
              <td className="px-4 py-3 text-sm text-stone-900 text-right">₦{Number(o.totalAmount || o.total || 0).toLocaleString()}</td>
              <td className="px-4 py-3 text-sm">
                {(['paid','confirmed','delivered'].includes(o.status)) ? (
                  <span className="inline-block px-2 py-1 text-xs font-semibold rounded bg-lime-100 text-lime-700">Paid</span>
                ) : (
                  <span className="inline-block px-2 py-1 text-xs font-semibold rounded bg-yellow-50 text-yellow-800">Pending payment</span>
                )}
              </td>
              <td className="px-4 py-3 text-sm">
                <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${o.status === 'delivered' ? 'bg-lime-100 text-lime-700' : 'bg-yellow-50 text-yellow-800'}`}>
                  {o.status}
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-stone-600">{new Date(o.createdAt || o.created || Date.now()).toLocaleString()}</td>
              <td className="px-4 py-3 text-sm flex items-center gap-2">
                {o.status !== 'delivered' ? (
                  <button onClick={() => onMarkDelivered(o._id)} className="bg-stone-900 text-white px-3 py-1 rounded-md text-sm">Mark Delivered</button>
                ) : (
                  <span className="text-sm text-stone-600">—</span>
                )}
                <button onClick={() => onDelete(o._id)} className="bg-red-600 text-white px-3 py-1 rounded-md text-sm">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
