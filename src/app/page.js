import Hero from "../components/Hero";
import WhyChooseUs from "../components/WhyChooseUs";
import BestSellers from "../components/BestSellers";
import BrandStory from "../components/BrandStory";
import DeliveryCoverage from "../components/DeliveryCoverage";
import HowItWorks from "../components/HowItWorks";
import Testimonials from "../components/Testimonials";
import FinalCTA from "../components/FinalCTA";

export default function Home() {
  return (
    <>
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
