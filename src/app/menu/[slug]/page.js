import React from "react";
import MenuClient from "@/components/MenuClient";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://favedelicacy.store").replace(/\/+$/, "");

async function fetchFoodBySlug(slug) {
  const apiBase = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/+$/, "");
  const res = await fetch(`${apiBase}/api/foods?all=true`);
  const foods = (await res.json()) || [];
  return foods.find((f) => {
    const s = (f.slug || `${f.name || ""}`).toString().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    return s === slug || f._id === slug;
  });
}

export async function generateMetadata({ params }) {
  const { slug } = params;
  try {
    const food = await fetchFoodBySlug(slug);
    if (!food) return { title: "Food not found" };
    const title = `${food.name} | Fave Delicacy`;
    const description = food.description || `Order ${food.name} from Fave Delicacy.`;
    const image = food.images?.[0]?.url || "/chef-icon-192.png";
    return {
      title,
      description,
      openGraph: { title, description, url: `${SITE_URL}/menu/${slug}`, images: [{ url: image }] },
      twitter: { card: "summary_large_image", title, description, images: [image] },
    };
  } catch (err) {
    return { title: "Food" };
  }
}

export default async function FoodPage({ params }) {
  const { slug } = params;
  const food = await fetchFoodBySlug(slug);
  if (!food) {
    return <main className="p-8">Food not found.</main>;
  }

  return (
    <main className="p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">{food.name}</h1>
        {food.images?.[0] && (
          <img src={food.images[0].url || food.images[0]} alt={food.name} className="w-full rounded mb-4" />
        )}
        <p className="mb-4">{food.description}</p>
        <div className="text-lg font-semibold">₦{food.price}</div>
      </div>
    </main>
  );
}
