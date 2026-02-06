import Link from "next/link";
import Hero from "@/components/Hero";
import WhyChooseUs from "@/components/WhyChooseUs";
import BestSellers from "@/components/BestSellers";
import BrandStory from "@/components/BrandStory";
import DeliveryCoverage from "@/components/DeliveryCoverage";
import HowItWorks from "@/components/HowItWorks";
import Testimonials from "@/components/Testimonials";
import FinalCTA from "@/components/FinalCTA";

export default function Home() {
  return (
    <>
      <div className="p-4 text-center">
        <Link href="/test" className="text-sm underline">
          Go to Test Page
        </Link>
      </div>
      <Hero />
      <WhyChooseUs />
      <BestSellers />
      <BrandStory />
      <DeliveryCoverage />
      <HowItWorks />
      <Testimonials />
      <FinalCTA />
    </>
  );
}

export const revalidate = 3600; // cache home page for 1 hour (ISR)
