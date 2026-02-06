import MenuClient from "@/components/MenuClient";

export default function MenuPage() {
  return <MenuClient />;
}

export const revalidate = 3600; // cache menu page for 1 hour (ISR)
