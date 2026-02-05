"use client";

import { useEffect, useState } from "react";
import { getFoods, deleteFood, updateFood } from "../../../api/food.api";
import { Eye, EyeOff } from "lucide-react";
import AddFoodButton from "../../../components/AddFoodButton";
import { motion } from "framer-motion";
import EditFoodForm from "../../../components/EditFoodForm";

export default function Foods() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    loadFoods();
  }, []);

  async function loadFoods() {
    try {
      setLoading(true);
      const res = await getFoods(true);
      setItems(res?.data || res || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function remove(id) {
    if (!confirm("Are you sure you want to delete this food?")) return;
    try {
      await deleteFood(id);
      setItems((prev) => prev.filter((f) => f._id !== id));
    } catch (err) {
      console.error(err);
    }
  }

  // AddFoodButton handles creation and will call onSuccess to reload

  return (
    <div className="min-h-screen p-6 text-stone-950" style={{ backgroundColor: "var(--color-primary)" }}>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Foods</h1>
        <AddFoodButton onSuccess={loadFoods} />
      </div>

      {/* Loading */}
      {loading && <div className="text-sm">Loading foods…</div>}

      {/* Empty state */}
      {!loading && items.length === 0 && (
        <div className="rounded-xl glass-red p-6 text-center">
          No foods added yet
        </div>
      )}

      {/* Food grid */}
      <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {items.map((food) => {
          const img = food.images?.[0];
          const src = typeof img === "string" ? img : img?.url || img?.secure_url || img?.publicId || "";

          return (
          <motion.li
            key={food._id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl glass-red p-4 shadow-lg flex flex-col"
          >
            <div className="w-full aspect-[3/4] overflow-hidden rounded-lg mb-4">
              {src ? (
                <img src={src} alt={food.name} className="w-full h-full object-cover" loading="lazy" />
              ) : (
                <div className="w-full h-full bg-white/5 flex items-center justify-center text-stone-950">No Image</div>
              )}
            </div>

            <div className="flex-1">
              <h3 className="font-semibold text-lg">{food.name}</h3>
              <p className="mt-2 text-sm line-clamp-3">{food.description}</p>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="text-lg font-bold text-lime-500">₦{food.price}</div>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditing(food)}
                  className="rounded-md bg-white/20 px-3 py-1 text-sm font-semibold hover:bg-white/30 transition"
                >
                  Edit
                </button>
                <button
                  onClick={async () => {
                    try {
                      const updated = await updateFood(food._id, { hidden: !food.hidden });
                      setItems((prev) => prev.map((p) => (p._id === food._id ? (updated?.data || updated) : p)));
                    } catch (err) {
                      console.error(err);
                    }
                  }}
                  title={food.hidden ? "Unhide" : "Hide"}
                  className="rounded-md bg-white/20 px-3 py-1 text-sm font-semibold hover:bg-white/30 transition flex items-center"
                >
                  {food.hidden ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                <button
                  onClick={() => remove(food._id)}
                  className="rounded-md bg-white/20 px-3 py-1 text-sm font-semibold hover:bg-white/30 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          </motion.li>
          );
        })}
      </ul>

      {editing && (
        <EditFoodForm
          food={editing}
          onClose={() => setEditing(null)}
          onSuccess={loadFoods}
        />
      )}
    </div>
  );
}
