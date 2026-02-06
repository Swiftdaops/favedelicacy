import AboutClient from "@/components/AboutClient";

export default function AboutPage() {
  return <AboutClient />;
}

export const revalidate = 3600; // cache about page for 1 hour (ISR)
