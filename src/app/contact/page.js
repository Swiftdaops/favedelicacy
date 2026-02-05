"use client";

import { useState } from "react";

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    setSent(true);
  }

  return (
    <main className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold text-stone-900">Contact Us</h1>

      {sent ? (
        <div className="mt-6 rounded-lg bg-green-50 p-4 text-green-800">
          Thanks — we received your message and will get back to you shortly.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm text-stone-700">Name</label>
            <input name="name" value={form.name} onChange={handleChange} className="mt-1 w-full rounded border p-2" />
          </div>

          <div>
            <label className="block text-sm text-stone-700">Email</label>
            <input name="email" value={form.email} onChange={handleChange} className="mt-1 w-full rounded border p-2" />
          </div>

          <div>
            <label className="block text-sm text-stone-700">Message</label>
            <textarea name="message" value={form.message} onChange={handleChange} className="mt-1 w-full rounded border p-2" rows={6} />
          </div>

          <button type="submit" className="inline-flex items-center rounded bg-red-600 px-4 py-2 text-white">
            Send Message
          </button>
        </form>
      )}
    </main>
  );
}
