"use client";

import { useState } from "react";
import { createDrink } from "../api/drink.api";

export default function AddDrinkButton({ onSuccess }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", price: "", description: "" });
  const [files, setFiles] = useState([]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  }

  function handleFiles(e) {
    setFiles(Array.from(e.target.files || []));
  }

  async function submit(e) {
    e.preventDefault();
    try {
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("price", form.price);
      fd.append("description", form.description);
      files.forEach((f) => fd.append("images", f));

      await createDrink(fd);
      setForm({ name: "", price: "", description: "" });
      setFiles([]);
      setOpen(false);
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div>
      <button className="px-3 py-2 rounded bg-[#e63a46] text-white font-semibold" onClick={() => setOpen(true)}>
        Add Drink
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-4 sm:p-6">
          <div className="w-full max-w-md rounded-lg p-4 sm:p-6 glass-red">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-stone-950">Add Drink</h3>
              <button onClick={() => setOpen(false)} className="p-2 rounded hover:bg-white/5">
                ✕
              </button>
            </div>

            <form onSubmit={submit} className="flex flex-col gap-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="flex flex-col">
                  <span className="text-sm text-stone-950">Name</span>
                  <input name="name" value={form.name} onChange={handleChange} className="mt-1 p-2 rounded bg-white/10 w-full text-stone-950" required />
                </label>

                <label className="flex flex-col">
                  <span className="text-sm text-stone-950">Price</span>
                  <input name="price" type="number" value={form.price} onChange={handleChange} className="mt-1 p-2 rounded bg-white/10 w-full text-stone-950" required />
                </label>
              </div>

              <label className="flex flex-col">
                <span className="text-sm text-stone-950">Description</span>
                <textarea name="description" value={form.description} onChange={handleChange} className="mt-1 p-2 rounded bg-white/10 w-full text-stone-950" />
              </label>

              <label className="flex flex-col">
                <span className="text-sm text-stone-950">Images (multiple)</span>
                <input type="file" multiple accept="image/*" onChange={handleFiles} className="mt-1" />
              </label>

              {files.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {files.map((f, i) => (
                    <div key={i} className="h-20 w-full overflow-hidden rounded bg-white/5 flex items-center justify-center">
                      <img src={URL.createObjectURL(f)} alt={f.name} className="h-full w-full object-cover" />
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2 justify-end mt-2">
                <button type="button" onClick={() => setOpen(false)} className="px-3 py-2 rounded bg-white/10 text-stone-950">Cancel</button>
                <button type="submit" className="px-3 py-2 rounded bg-[#e63a46] text-white">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
