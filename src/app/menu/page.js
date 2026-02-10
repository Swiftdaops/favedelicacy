import MenuClient from "@/components/MenuClient";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://favedelicacy.store").replace(/\/+$/, "");

export async function generateMetadata() {
  const apiBase = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/+$/, "");
  try {
    const res = await fetch(`${apiBase}/api/foods?all=true`);
    const foods = (await res.json()) || [];
    const names = foods.slice(0, 4).map((f) => f.name).filter(Boolean);
    const description = names.length
      ? `Menu highlights: ${names.join(", ")}. Order now from Fave Delicacy.`
      : "Explore our full menu of delicious meals and sides. Order now.";
    const image = foods[0]?.images?.[0]?.url || "/chef-icon-192.png";

    return {
      title: "Menu",
      description,
      openGraph: {
        title: "Menu | Fave Delicacy",
        description,
        url: `${SITE_URL}/menu`,
        images: [{ url: image }],
      },
      twitter: {
        card: "summary_large_image",
        title: "Menu | Fave Delicacy",
        description,
        images: [image],
      },
    };
  } catch (err) {
    return {
      title: "Menu",
      description: "Explore our full menu of delicious meals and sides.",
    };
  }
}

export default function MenuPage() {
  return <MenuClient />;
}

export const revalidate = 3600; // cache menu page for 1 hour (ISR)
