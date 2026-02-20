"use client";

import { useEffect, useState, useRef } from "react";
import { X, Plus, Minus, Trash, CheckCircle2, Copy, ArrowLeft } from "lucide-react";
import { usePathname } from "next/navigation";
import useCartStore from "@/store/cartStore";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerClose,
} from "@/components/ui/drawer";
import { createOrder } from "@/api/order.api";
import { getDrinks } from "@/api/drink.api";
import { uploadPaymentProof } from "@/api/payment.api";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export default function CartDrawer() {
  const pathname = usePathname();
  const isDrinksRoute = pathname?.startsWith("/drinks");

  const { items, drawerOpen, toggleDrawer, removeFromCart, updateQty, updateExtras, addToCart, total, clearCart } = useCartStore();
  const [step, setStep] = useState("cart"); // cart, details, addons, drinks, payment, upload, success
  const [submitting, setSubmitting] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [proofFiles, setProofFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ customerName: "", customerPhone: "", deliveryAddress: "" });
  const firstFocusable = useRef(null);
  const fileInputRef = useRef(null);
  const [copied, setCopied] = useState(false);
  const [availableDrinks, setAvailableDrinks] = useState([]);
  const [loadingDrinks, setLoadingDrinks] = useState(false);
  const [drinkQuery, setDrinkQuery] = useState("");

  // Focus management: Pull focus into the drawer immediately to avoid ARIA-hidden errors
  useEffect(() => {
    if (drawerOpen) {
      const timer = setTimeout(() => {
        firstFocusable.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [drawerOpen]);

  // Reset steps and form when drawer closes
  useEffect(() => {
    if (!drawerOpen) {
      const timer = setTimeout(() => {
        setStep("cart");
        setForm({ customerName: "", customerPhone: "", deliveryAddress: "" });
        setDrinkQuery("");
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [drawerOpen]);

  const copyToClipboard = (text) => {
    try {
      navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Account number copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Could not copy");
    }
  };

  const handleOrderSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!form.customerName || !form.customerPhone) return toast.error("Please provide name and phone");
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        items: items.map(it => ({ 
          food: it._id || it.id, 
          name: it.name, 
          price: Number(it.price), 
          quantity: it.qty || 1,
          extras: (it.selectedExtras || []).map(s => ({ name: s.name, price: Number(s.price) }))
        })),
        totalAmount: total(),
      };
      const order = await createOrder(payload);
      const id = order?._id || order?.id;
      setOrderId(id || null);
      setStep("payment");
    } catch (err) {
      toast.error(err?.message || "Order failed");
    } finally {
      setSubmitting(false);
    }
  };

  function handleDetailsNext(e) {
    e?.preventDefault?.();
    if (!form.customerName || !form.customerPhone) return toast.error("Please provide name and phone");
    setStep("addons");
  }

  // Allow user to go back to the previous step in the drawer
  const stepOrder = ["cart", "details", "addons", "drinks", "payment", "upload", "success"];
  function handleBack() {
    const idx = stepOrder.indexOf(step);
    if (idx > 0) setStep(stepOrder[idx - 1]);
    else setStep("cart");
  }

  useEffect(() => {
    if (step === "drinks") {
      const load = async () => {
        setLoadingDrinks(true);
        try {
          const data = await getDrinks(true);
          // getDrinks returns parsed data (or an object with `data`), so normalize
          const list = data?.data || data || [];
          setAvailableDrinks(list);
        } catch (err) {
          setAvailableDrinks([]);
        } finally {
          setLoadingDrinks(false);
        }
      };
      load();
    }
  }, [step]);

  const filteredDrinks = (() => {
    const q = (drinkQuery || "").trim().toLowerCase();
    if (!q) return availableDrinks;
    return (availableDrinks || []).filter((d) =>
      String(d?.name || "").toLowerCase().includes(q)
    );
  })();

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);
    setProofFiles([{ file, preview }]);
  }

  async function handleUploadConfirm() {
    if (!orderId) return toast.error("Order id missing");
    if (proofFiles.length === 0) return toast.error("Please add a screenshot of payment");
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("proof", proofFiles[0].file);
      fd.append("orderId", orderId);
      fd.append("customerName", form.customerName || "");
      fd.append("amount", String(total()));

      await uploadPaymentProof(fd);
      toast.success("Payment proof uploaded — thank you!");
      setStep("success");
      clearCart();
      setProofFiles([]);
    } catch (err) {
      console.error(err);
      toast.error(err?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <Drawer open={drawerOpen} onOpenChange={(v) => toggleDrawer(!!v)}>
      <DrawerContent className="max-h-[96vh] outline-none">
        <div className="mx-auto w-full max-w-lg overflow-hidden flex flex-col h-full text-stone-900 bg-white rounded-t-4xl">
          
          <DrawerHeader className="flex flex-row items-center justify-between border-b pb-4 px-6">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                {step !== "cart" && step !== "success" && (
                  <button
                    onClick={handleBack}
                    className="p-2 rounded-full hover:bg-stone-100 transition-colors outline-none focus:ring-2 focus:ring-red-500"
                    aria-label="Back"
                  >
                    <ArrowLeft size={18} />
                  </button>
                )}

                <DrawerTitle className="text-2xl font-black text-stone-900">
                  {step === "success" ? "Order Confirmed" : "FaveDelicacy"}
                </DrawerTitle>
              </div>

              {step === "cart" && (
                <DrawerDescription className="text-stone-500 font-medium">
                  {items.length} {items.length === 1 ? 'item' : 'items'} in your cart
                </DrawerDescription>
              )}
            </div>

            <DrawerClose asChild>
              <button 
                ref={firstFocusable} 
                className="p-2 rounded-full hover:bg-stone-100 transition-colors outline-none focus:ring-2 focus:ring-red-500"
                aria-label="Close"
              >
                <X size={22} />
              </button>
            </DrawerClose>
          </DrawerHeader>

          <div className="flex-1 overflow-y-auto px-6 py-4">
            {step === "cart" && (
              <div className="space-y-4">
                {items.length === 0 ? (
                  <div className="py-24 text-center">
                    <p className="text-stone-400 font-medium">Your cart is empty</p>
                  </div>
                ) : (
                  <AnimatePresence mode="popLayout">
                    {items.map((it) => (
                      <motion.div 
                        key={it._id || it.id} 
                        layout 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="flex items-center gap-4 p-3 border border-stone-100 rounded-2xl bg-stone-50/50"
                      >
                        {(function(){
                          const imgCandidate = it.images && it.images[0] ? (it.images[0].url || it.images[0]) : it.image;
                          const src = typeof imgCandidate === 'string' ? imgCandidate : '';
                          return <img src={src} className="w-16 h-16 object-cover rounded-xl bg-white shadow-sm" alt={it.name} />;
                        })()}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-stone-900 truncate">{it.name}</h4>
                          <p className="text-sm font-bold text-red-600">₦{Number(it.price).toLocaleString()}</p>
                          {/* Extras are selectable in the Add-ons step after details */}
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center border border-stone-200 rounded-lg bg-white overflow-hidden">
                              <button onClick={() => updateQty(it._id || it.id, Math.max(1, (it.qty || 1) - 1))} className="p-1.5 hover:bg-stone-50"><Minus size={14}/></button>
                              <span className="w-8 text-center text-xs font-black">{it.qty || 1}</span>
                              <button onClick={() => updateQty(it._id || it.id, (it.qty || 1) + 1)} className="p-1.5 hover:bg-stone-50"><Plus size={14}/></button>
                            </div>
                            <button onClick={() => removeFromCart(it._id || it.id)} className="text-stone-300 hover:text-red-600 transition-colors"><Trash size={18}/></button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>
            )}

            {step === "details" && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4 py-2">
                <h3 className="font-black text-xl text-stone-900">Delivery Details</h3>
                <div className="space-y-3">
                  <input required value={form.customerName} onChange={e => setForm({...form, customerName: e.target.value})} placeholder="Your Full Name" className="w-full p-4 rounded-xl border border-stone-200 outline-none focus:ring-2 focus:ring-red-600 transition-all font-medium" />
                  <input required type="tel" value={form.customerPhone} onChange={e => setForm({...form, customerPhone: e.target.value})} placeholder="Active Phone Number" className="w-full p-4 rounded-xl border border-stone-200 outline-none focus:ring-2 focus:ring-red-600 transition-all font-medium" />
                  <textarea value={form.deliveryAddress} onChange={e => setForm({...form, deliveryAddress: e.target.value})} placeholder="Detailed Delivery Address (Optional)" className="w-full p-4 rounded-xl border border-stone-200 outline-none focus:ring-2 focus:ring-red-600 transition-all font-medium resize-none" rows={3} />
                </div>
              </motion.div>
            )}

            {step === "addons" && (
              <div className="space-y-4 py-2">
                <h3 className="font-black text-xl text-stone-900">Add-ons</h3>
                <p className="text-sm text-stone-500">Choose extras for each food item below.</p>
                <div className="space-y-3 mt-3">
                  {items.map((it) => (
                    <div key={it._id || it.id} className="p-3 border border-stone-100 rounded-2xl bg-stone-50">
                      <div className="flex items-center gap-3">
                        <img src={it.images?.[0]?.url || it.image} className="w-12 h-12 object-cover rounded-md" alt={it.name} />
                        <div className="flex-1 min-w-0">
                          <div className="font-bold truncate">{it.name}</div>
                          <div className="text-sm text-stone-500">Qty: {it.qty || 1}</div>
                        </div>
                      </div>
                      {it.extras && it.extras.length > 0 && (
                        <div className="mt-3 grid grid-cols-1 gap-2">
                          {it.extras.map((ex, idx) => {
                            const checked = (it.selectedExtras || []).some(se => se.name === ex.name && Number(se.price) === Number(ex.price));
                            return (
                              <label key={idx} className="flex items-center justify-between gap-2 p-2 rounded-lg bg-white border">
                                <div>
                                  <div className="font-medium">{ex.name}</div>
                                  <div className="text-sm text-stone-400">₦{ex.price}</div>
                                </div>
                                <input type="checkbox" checked={checked} onChange={(e) => {
                                  const current = it.selectedExtras || [];
                                  if (e.target.checked) {
                                    updateExtras(it._id || it.id, [...current, { name: ex.name, price: ex.price }]);
                                  } else {
                                    updateExtras(it._id || it.id, current.filter(c => !(c.name === ex.name && Number(c.price) === Number(ex.price))));
                                  }
                                }} />
                              </label>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {step === "drinks" && (
              <div className="space-y-4 py-2">
                <h3 className="font-black text-xl text-stone-900">Drinks</h3>
                <p className="text-sm text-stone-500">Add chilled drinks to your order.</p>

                {isDrinksRoute && (
                  <input
                    value={drinkQuery}
                    onChange={(e) => setDrinkQuery(e.target.value)}
                    placeholder="Search drinks…"
                    className="w-full p-3 rounded-xl border border-stone-200 outline-none focus:ring-2 focus:ring-red-600 transition-all font-medium"
                  />
                )}

                <div className="mt-3 space-y-3">
                  {loadingDrinks ? (
                    <p className="text-sm text-stone-400">Loading drinks…</p>
                  ) : filteredDrinks.length === 0 ? (
                    <p className="text-sm text-stone-400">No drinks available.</p>
                  ) : (
                    filteredDrinks.map((d) => (
                      <div key={d._id || d.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <div className="flex items-center gap-3">
                          {(function(){
                            const imgCandidate = d.images && d.images[0] ? (d.images[0].url || d.images[0]) : null;
                            const src = typeof imgCandidate === 'string' ? imgCandidate : null;
                            return src ? <img src={src} alt={d.name} className="w-12 h-12 object-cover rounded-md" /> : null;
                          })()}
                          <div>
                            <div className="font-medium">{d.name}</div>
                            <div className="text-sm text-stone-400">₦{d.price}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => { addToCart(d, 1); toast.success("Added drink to cart"); }} className="py-2 px-3 bg-red-600 text-white rounded-lg">Add</button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {step === "payment" && (
              <div className="space-y-5 py-2 animate-in fade-in slide-in-from-bottom-4">
                <div className="bg-red-50 p-6 rounded-2xl text-center border border-red-100 shadow-sm">
                  <p className="text-red-800 text-sm font-bold uppercase tracking-wide">Transfer Exactly</p>
                  <p className="text-4xl font-black text-red-600 mt-1">₦{total().toLocaleString()}</p>
                </div>
                
                <div className="border border-stone-100 rounded-3xl p-6 space-y-5 bg-stone-50 shadow-inner">
                  <div className="flex justify-between items-center border-b border-stone-200 pb-3">
                    <span className="text-xs text-stone-400 uppercase font-black">Bank</span>
                    <span className="text-lg font-bold text-stone-900">Moniepoint</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-stone-200 pb-3">
                    <div>
                      <span className="text-xs text-stone-400 uppercase font-black">Account Number</span>
                      <p className="text-2xl font-mono font-black text-red-600 tracking-tighter">7018251100</p>
                    </div>
                    <button
                      onClick={() => copyToClipboard("7018251100")}
                      className="p-3 bg-white rounded-2xl border border-stone-200 shadow-sm hover:scale-105 active:scale-95 transition-all"
                      aria-label={copied ? "Copied" : "Copy account number"}
                    >
                      {copied ? <CheckCircle2 size={20} className="text-lime-500" /> : <Copy size={20} className="text-stone-700" />}
                    </button>
                  </div>
                  <div className="pt-1">
                    <span className="text-xs text-stone-400 uppercase font-black">Account Name</span>
                    <p className="text-lg font-bold text-stone-900">Favour Akudo</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-2">
                   <div className="h-2 w-2 rounded-full bg-red-600 animate-pulse" />
                   <p className="text-xs text-stone-500 font-medium italic">Click &quot;I Have Paid&quot; only after completing the transfer.</p>
                </div>
              </div>
            )}

            {step === "upload" && (
              <div className="space-y-4 py-2">
                <h3 className="font-black text-lg text-stone-900">Upload Payment Screenshot</h3>
                <p className="text-sm text-stone-500">Please upload a screenshot of your transfer to confirm payment for this order.</p>

                <div className="pt-3 flex items-center gap-4">
                  <input ref={fileInputRef} onChange={handleFileChange} type="file" accept="image/*" className="hidden" />
                  <button onClick={() => fileInputRef.current?.click()} className="w-16 h-16 flex items-center justify-center border-2 border-dashed border-stone-200 rounded-full bg-white shadow-sm">
                    <Plus size={20} />
                  </button>

                  <div className="flex-1">
                    {proofFiles.length === 0 ? (
                      <p className="text-sm text-stone-500">No screenshot added yet</p>
                    ) : (
                      <div className="flex items-center gap-3">
                        <img src={proofFiles[0].preview} alt="preview" className="w-24 h-16 object-cover rounded-md" />
                        <button onClick={() => setProofFiles([])} className="text-stone-400 hover:text-red-600"><Trash size={18} /></button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {step === "success" && (
              <div className="py-12 text-center animate-in zoom-in duration-500">
                <div className="flex justify-center mb-6">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", damping: 12 }}>
                    <CheckCircle2 size={90} className="text-lime-500" strokeWidth={1.5} />
                  </motion.div>
                </div>
                <h2 className="text-3xl font-black text-stone-900 mb-2">Thank You!</h2>
                <p className="text-stone-600 font-medium px-8 leading-relaxed">
                  Your purchase at <span className="text-red-600 font-bold">FaveDelicacy</span> was successful. 
                  We have received your order and are preparing your meal!
                </p>
              </div>
            )}
          </div>

          <div className="p-6 border-t bg-stone-50/80 backdrop-blur-sm">
            {step === "cart" && items.length > 0 && (
              <button 
                onClick={() => setStep("details")} 
                className="w-full bg-red-600 text-white font-black py-5 rounded-2xl shadow-[0_10px_20px_-5px_rgba(220,38,38,0.4)] active:scale-[0.98] transition-all flex justify-between px-8"
              >
                <span>Checkout</span>
                <span>₦{total().toLocaleString()}</span>
              </button>
            )}

            {step === "details" && (
              <div className="flex gap-3">
                <button 
                  onClick={handleDetailsNext} 
                  className="flex-2 bg-red-600 text-white font-black py-5 rounded-2xl shadow-lg disabled:opacity-50 active:scale-[0.98] transition-all"
                >
                  Next: Add-ons
                </button>
                <button 
                  onClick={() => setStep("cart")} 
                  className="flex-1 py-5 rounded-2xl bg-stone-200 text-stone-700 font-bold active:scale-[0.98] transition-all"
                >
                  Back
                </button>
              </div>
            )}

            {step === "addons" && (
              <div className="flex gap-3">
                <button 
                  onClick={() => setStep("drinks")} 
                  className="flex-2 bg-red-600 text-white font-black py-5 rounded-2xl shadow-lg active:scale-[0.98] transition-all"
                >
                  Next: Drinks
                </button>
                <button 
                  onClick={() => setStep("details")} 
                  className="flex-1 py-5 rounded-2xl bg-stone-200 text-stone-700 font-bold active:scale-[0.98] transition-all"
                >
                  Back
                </button>
              </div>
            )}

            {step === "drinks" && (
              <div className="flex gap-3">
                <button 
                  onClick={handleOrderSubmit} 
                  disabled={submitting} 
                  className="flex-2 bg-red-600 text-white font-black py-5 rounded-2xl shadow-lg disabled:opacity-50 active:scale-[0.98] transition-all"
                >
                  {submitting ? "Processing..." : "Next: Payment"}
                </button>
                <button 
                  onClick={() => setStep("addons")} 
                  className="flex-1 py-5 rounded-2xl bg-stone-200 text-stone-700 font-bold active:scale-[0.98] transition-all"
                >
                  Back
                </button>
              </div>
            )}

            {step === "payment" && (
              <button 
                onClick={() => setStep("upload")} 
                className="w-full bg-red-600 text-white font-black py-5 rounded-2xl shadow-lg hover:bg-red-700 transition-colors"
              >
                I Have Paid
              </button>
            )}

            {step === "upload" && (
              <div className="flex gap-3">
                <button 
                  onClick={handleUploadConfirm} 
                  disabled={uploading} 
                  className="flex-2 bg-red-600 text-white font-black py-5 rounded-2xl shadow-lg disabled:opacity-50 active:scale-[0.98] transition-all"
                >
                  {uploading ? "Uploading..." : "Upload & Confirm"}
                </button>
                <button 
                  onClick={() => setStep("payment")} 
                  className="flex-1 py-5 rounded-2xl bg-stone-200 text-stone-700 font-bold active:scale-[0.98] transition-all"
                >
                  Back
                </button>
              </div>
            )}

            {step === "success" && (
              <button 
                onClick={() => toggleDrawer(false)} 
                className="w-full bg-stone-900 text-white font-black py-5 rounded-2xl shadow-xl transition-transform active:scale-95"
              >
                Done
              </button>
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}