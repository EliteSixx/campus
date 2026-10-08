import { EditorialBulbLanding } from "@/components/landing/editorial-bulb-landing";
import { IntegratedProductSections } from "@/components/landing/integrated-product-sections";

export default function LandingPage() {
  return (
    <main className="bg-[#010206] text-white min-h-screen">
      <EditorialBulbLanding />
      <IntegratedProductSections />
    </main>
  );
}
