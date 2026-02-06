"use client";

import { useState, useEffect } from "react";
import { updateDrink } from "@/api/drink.api";

export default function EditDrinkForm({ initial, onClose, onSaved }) {
  const [form, setForm] = useState({ name: "", price: "", description: "" });
  const [files, setFiles] = useState([]);

  useEffect(() => {
    if (initial) setForm({ name: initial.name || "", price: initial.price || "", description: initial.description || "" });
  }, [initial]);

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

      await updateDrink(initial._id, fd);
      if (onSaved) onSaved();
    } catch (err) {
      console.error(err);
    }
  }

  return (
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
        <span className="text-sm text-stone-950">Images (add more to append)</span>
        <input type="file" multiple accept="image/*" onChange={handleFiles} className="mt-1" />
      </label>

      <div className="flex gap-2 justify-end mt-2">
        <button type="button" onClick={onClose} className="px-3 py-2 rounded bg-white/10 text-stone-950">Cancel</button>
        <button type="submit" className="px-3 py-2 rounded bg-[#e63a46] text-white">Save</button>
      </div>
    </form>
  );
}
