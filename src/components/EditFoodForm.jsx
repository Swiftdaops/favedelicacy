"use client";

import { useState } from "react";
import { updateFood } from "@/api/food.api";

export default function EditFoodForm({ food, onClose, onSuccess }) {
  const [name, setName] = useState(food.name || "");
  const [price, setPrice] = useState(food.price || 0);
  const [description, setDescription] = useState(food.description || "");
  const [files, setFiles] = useState(null);
  const [extras, setExtras] = useState(food.extras || []);
  const [existingImages, setExistingImages] = useState(food.images || []);
  const [removedImageIds, setRemovedImageIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const fd = new FormData();
      fd.append("name", name);
      fd.append("price", String(price));
      fd.append("description", description);
      if (extras && extras.length) fd.append("extras", JSON.stringify(extras));
      if (removedImageIds && removedImageIds.length) fd.append("removeImageIds", JSON.stringify(removedImageIds));
      if (files && files.length) {
        for (let i = 0; i < files.length; i++) fd.append("images", files[i]);
      }

      await updateFood(food._id, fd);
      onSuccess && onSuccess();
      onClose && onClose();
    } catch (err) {
      setError(err.message || "Update failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <form
        onSubmit={submit}
        className="relative w-full max-w-lg rounded-lg bg-[var(--background)] p-6 text-stone-950 z-10"
      >
        <h3 className="text-lg font-semibold mb-4 text-stone-950">Edit Food</h3>

        {error && <div className="mb-2 text-sm text-red-600">{error}</div>}

        <label className="block mb-2">
          <span className="text-sm text-stone-950">Name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 block w-full rounded border px-3 py-2 text-stone-950" />
        </label>

        <label className="block mb-2">
          <span className="text-sm text-stone-950">Price (NGN)</span>
          <input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} required className="mt-1 block w-full rounded border px-3 py-2 text-stone-950" />
        </label>

        <label className="block mb-2">
          <span className="text-sm text-stone-950">Description</span>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1 block w-full rounded border px-3 py-2 text-stone-950" rows={3} />
        </label>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-stone-950">Extras</span>
            <button type="button" onClick={() => setExtras((s) => [...s, { name: '', price: 0 }])} className="text-sm text-blue-600">+ Add</button>
          </div>
          {extras.map((ex, i) => (
            <div key={i} className="grid grid-cols-3 gap-2 mb-2">
              <input value={ex.name} onChange={(e) => setExtras((s) => s.map((it, idx) => idx === i ? { ...it, name: e.target.value } : it))} placeholder="Name" className="col-span-2 p-2 rounded border" />
              <input type="number" value={ex.price} onChange={(e) => setExtras((s) => s.map((it, idx) => idx === i ? { ...it, price: Number(e.target.value) } : it))} placeholder="Price" className="p-2 rounded border" />
              <div className="col-span-3 text-right"><button type="button" onClick={() => setExtras((s) => s.filter((_, idx) => idx !== i))} className="text-sm text-red-600">Remove</button></div>
            </div>
          ))}
        </div>

        <label className="block mb-4">
          <span className="text-sm text-stone-950">Images (optional, add or remove)</span>
          <input type="file" accept="image/*" multiple onChange={(e) => setFiles(e.target.files)} className="mt-1 block w-full" />

          {existingImages && existingImages.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mt-3">
              {existingImages.map((img, i) => (
                <div key={i} className="relative h-28 overflow-hidden rounded bg-white/5">
                  <img src={img.url} alt={`img-${i}`} className="w-full h-full object-cover" />
                  <button type="button" onClick={() => {
                    setExistingImages((s) => s.filter((_, idx) => idx !== i));
                    setRemovedImageIds((s) => [...s, img.publicId]);
                  }} className="absolute top-2 right-2 bg-white/80 p-1 rounded">Remove</button>
                </div>
              ))}
            </div>
          )}
        </label>

        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-white/10 text-stone-950">Cancel</button>
          <button type="submit" disabled={loading} className="px-4 py-2 rounded bg-[var(--color-primary)] text-stone-950">
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}
