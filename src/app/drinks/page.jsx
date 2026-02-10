import DrinksCarousel from "@/components/DrinksCarousel";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://favedelicacy.store").replace(/\/+$/, "");

export async function generateMetadata() {
  const apiBase = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/+$/, "");
  try {
    const res = await fetch(`${apiBase}/api/drinks?all=true`);
    const drinks = (await res.json()) || [];
    const names = drinks.slice(0, 4).map((d) => d.name).filter(Boolean);
    const description = names.length
      ? `Refreshing picks: ${names.join(", ")}. Order chilled drinks from Fave Delicacy.`
      : "Browse our curated selection of drinks — chilled and ready to enjoy.";
    const image = drinks[0]?.images?.[0]?.url || "/chef-icon-192.png";

    return {
      title: "Drinks",
      description,
      openGraph: {
        title: "Drinks | Fave Delicacy",
        description,
        url: `${SITE_URL}/drinks`,
        images: [{ url: image }],
      },
      twitter: {
        card: "summary_large_image",
        title: "Drinks | Fave Delicacy",
        description,
        images: [image],
      },
    };
  } catch (err) {
    return {
      title: "Drinks",
      description: "Browse our curated selection of drinks — chilled and ready to enjoy.",
    };
  }
}

export default function DrinksPage() {
  return (
    <main className=" text-stone-950">
      <DrinksCarousel />
    </main>
  );
}
