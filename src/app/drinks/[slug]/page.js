import React from "react";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://favedelicacy.store").replace(/\/+$/, "");

async function fetchDrinkBySlug(slug) {
  const apiBase = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/+$/, "");
  const res = await fetch(`${apiBase}/api/drinks?all=true`);
  const drinks = (await res.json()) || [];
  return drinks.find((d) => {
    const s = (d.slug || `${d.name || ""}`).toString().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    return s === slug || d._id === slug;
  });
}

export async function generateMetadata({ params }) {
  const { slug } = params;
  try {
    const drink = await fetchDrinkBySlug(slug);
    if (!drink) return { title: "Drink not found" };
    const title = `${drink.name} | Fave Delicacy`;
    const description = drink.description || `Order ${drink.name} from Fave Delicacy.`;
    const image = drink.images?.[0]?.url || "/chef-icon-192.png";
    return {
      title,
      description,
      openGraph: { title, description, url: `${SITE_URL}/drinks/${slug}`, images: [{ url: image }] },
      twitter: { card: "summary_large_image", title, description, images: [image] },
    };
  } catch (err) {
    return { title: "Drink" };
  }
}

export default async function DrinkPage({ params }) {
  const { slug } = params;
  const drink = await fetchDrinkBySlug(slug);
  if (!drink) {
    return <main className="p-8">Drink not found.</main>;
  }

  return (
    <main className="p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">{drink.name}</h1>
        {drink.images?.[0] && (
          <img src={drink.images[0].url || drink.images[0]} alt={drink.name} className="w-full rounded mb-4" />
        )}
        <p className="mb-4">{drink.description}</p>
        <div className="text-lg font-semibold">₦{drink.price}</div>
      </div>
    </main>
  );
}
