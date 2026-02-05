"use client";

import { useEffect, useState } from "react";
import AddDrinkButton from "../../../components/AddDrinkButton";
import EditDrinkForm from "../../../components/EditDrinkForm";
import { getDrinks, deleteDrink, updateDrink } from "../../../api/drink.api";
import { Eye, EyeOff } from "lucide-react";

export default function AdminDrinksPage() {
  const [drinks, setDrinks] = useState([]);
  const [editing, setEditing] = useState(null);
  const [showEdit, setShowEdit] = useState(false);

  async function fetch() {
    try {
      const res = await getDrinks(true);
      const data = res?.data || res || [];
      setDrinks(data);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    fetch();
  }, []);

  async function handleDelete(id) {
    if (!confirm("Are you sure you want to delete this drink?")) return;
    try {
      await deleteDrink(id);
      fetch();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-stone-950">Drinks</h2>
        <AddDrinkButton onSuccess={fetch} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {drinks.map((d) => {
          const img = d.images?.[0];
          const src = typeof img === "string" ? img : img?.url || img?.secure_url || img?.publicId || "";

          return (
            <div key={d._id} className="rounded-lg p-3 glass-card flex flex-col items-stretch mx-auto w-[70vw] sm:w-[44vw] md:w-full max-w-[360px]">
              <div className="w-full mb-2 overflow-hidden rounded aspect-[3/4]">
                {src ? (
                  <img src={src} alt={d.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-white/5 flex items-center justify-center text-stone-950">No Image</div>
                )}
              </div>
              <h3 className="text-lg font-semibold text-stone-950">{d.name}</h3>
              <p className="text-sm text-stone-950 line-clamp-2">{d.description}</p>
              
              <div className="mt-3 flex items-center justify-between">
                <div className="text-stone-950 font-semibold">₦{d.price?.toLocaleString()}</div>
                <div className="flex items-center gap-2">
                  <button onClick={() => { setEditing(d); setShowEdit(true); }} className="px-2 py-1 rounded bg-white/10 text-stone-950 border border-stone-200">Edit</button>
                  <button
                    onClick={async () => {
                      try {
                        const updated = await updateDrink(d._id, { hidden: !d.hidden });
                        setDrinks((prev) => prev.map((p) => (p._id === d._id ? (updated?.data || updated) : p)));
                      } catch (err) {
                        console.error(err);
                      }
                    }}
                    className="px-2 py-1 rounded bg-white/10 text-stone-950 border border-stone-200"
                    title={d.hidden ? "Unhide" : "Hide"}
                  >
                    {d.hidden ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                  <button onClick={() => handleDelete(d._id)} className="px-2 py-1 rounded bg-[#e63a46] text-white">Delete</button>
                </div>
              </div>

              {showEdit && editing && editing._id === d._id && (
                <div className="mt-3">
                  <EditDrinkForm 
                    initial={editing} 
                    onClose={() => setShowEdit(false)} 
                    onSaved={() => { setShowEdit(false); fetch(); }} 
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}