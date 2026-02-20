"use client";

import { useState } from "react";
import { submitContact } from "@/api/contact.api";

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [isNewCustomer, setIsNewCustomer] = useState(null);
  const [form, setForm] = useState({ name: "", phone: "", email: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    (async () => {
      try {
        const res = await submitContact({
          name: form.name,
          phone: form.phone,
          email: form.email,
          message: form.message,
        });
        setIsNewCustomer(!!res?.isNewCustomer);
        setSent(true);
      } catch (err) {
        setError(err?.message || "Failed to send message");
      } finally {
        setSubmitting(false);
      }
    })();
  }

  return (
    <main className="max-w-3xl mx-auto glass-red py-12 px-4">
      <h1 className="text-3xl font-bold text-stone-900">Contact Us</h1>

      {sent ? (
        <div className="mt-6 rounded-lg bg-green-50 p-4 text-green-800">
          Thanks — we received your message and will get back to you shortly.
          {isNewCustomer === true && (
            <div className="mt-2 text-sm font-semibold">Customer: New</div>
          )}
          {isNewCustomer === false && (
            <div className="mt-2 text-sm font-semibold">Customer: Existing</div>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm text-stone-700">Name</label>
            <input name="name" value={form.name} onChange={handleChange} className="mt-1 w-full rounded border p-2" />
          </div>

          <div>
            <label className="block text-sm text-stone-700">Phone Number</label>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className="mt-1 w-full rounded border p-2"
              placeholder="e.g. 080..."
              required
            />
          </div>

          <div>
            <label className="block text-sm text-stone-700">Email</label>
            <input name="email" value={form.email} onChange={handleChange} className="mt-1 w-full rounded border p-2" />
          </div>

          {/* CID is generated server-side; do not collect from users */}

          <div>
            <label className="block text-sm text-stone-700">Message</label>
            <textarea name="message" value={form.message} onChange={handleChange} className="mt-1 w-full rounded border p-2" rows={6} />
          </div>

          {error && <div className="text-sm text-red-600">{error}</div>}

          <button type="submit" disabled={submitting} className="inline-flex items-center rounded bg-red-600 px-4 py-2 text-white disabled:opacity-60">
            {submitting ? "Sending..." : "Send Message"}
          </button>
        </form>
      )}
    </main>
  );
}
