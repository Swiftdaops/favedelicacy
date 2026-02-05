"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { uploadPaymentProof } from "@/api/payment.api";

export default function ProofOfPayment({ orderId }) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const router = useRouter();

  function handleSelect(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!file) return alert("Please choose an image proof");
    if (!name) return alert("Please enter your name");
    if (!amount) return alert("Please enter the amount paid");

    try {
      setLoading(true);
      const fd = new FormData();
      fd.append("orderId", orderId);
      fd.append("customerName", name);
      fd.append("amount", amount);
      fd.append("proof", file);

      await uploadPaymentProof(fd);

      setDone(true);
      setTimeout(() => {
        router.replace(window.location.pathname);
      }, 1200);
    } catch (err) {
      console.error(err);
      alert("Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-lg p-6 bg-white text-stone-950 text-center">
        <h3 className="text-xl font-semibold">Thank you — payment received</h3>
        <p className="mt-2 text-sm">We've saved your payment proof. Your order will be completed once verified.</p>
      </div>
    );
  }

  return (
    <div className="mt-6">
      {!open ? (
        <div className="flex flex-col items-center gap-4">
          <button onClick={() => setOpen(true)} className="w-56 h-56 rounded-full border-8 border-dashed border-stone-300 flex items-center justify-center text-stone-950 text-lg font-semibold">I have paid</button>
          <p className="text-sm text-stone-700">Click to upload proof of payment (image)</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow text-stone-950">
          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-center gap-4">
              <label className="w-36 h-36 rounded-full flex items-center justify-center overflow-hidden border-4 border-stone-200">
                {preview ? (
                  <img src={preview} alt="preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-sm">No image</span>
                )}
                <input type="file" accept="image/*" onChange={handleSelect} className="hidden" />
              </label>
              <div className="flex-1">
                <label className="block mb-2 text-sm text-stone-950">Name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} className="w-full p-2 rounded border text-stone-950" />

                <label className="block mt-3 mb-2 text-sm text-stone-950">Amount paid</label>
                <input value={amount} onChange={(e) => setAmount(e.target.value)} type="number" className="w-full p-2 rounded border text-stone-950" />
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 rounded bg-white/10 text-stone-950">Cancel</button>
              <button type="submit" disabled={loading} className="px-6 py-3 rounded bg-[var(--color-primary)] text-stone-950 font-semibold">{loading ? "Uploading..." : "Upload proof"}</button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
