"use client";

import { useReveal } from "./atoms";
import Nav from "./Nav";
import Hero from "./Hero";
import TrustBar from "./TrustBar";
import Products from "./Products";
import EthicsDeep from "./EthicsDeep";
import HowItWorks from "./HowItWorks";
import DashboardPreview from "./DashboardPreview";
import Security from "./Security";
import Pricing from "./Pricing";
import FAQ from "./FAQ";
import FinalCTA from "./FinalCTA";
import Footer from "./Footer";
import type { LandingPageData } from "@/sanity/types";

export default function LandingClient({ data }: { data: LandingPageData | null }) {
  useReveal();

  return (
    <div style={{ background: "var(--lp-bg-paper)", color: "var(--lp-ink)" }}>
      <Nav data={data} />
      <main>
        <Hero data={data} />
        <TrustBar data={data} />
        <Products data={data} />
        <EthicsDeep data={data} />
        <HowItWorks data={data} />
        <DashboardPreview data={data} />
        <Security data={data} />
        <Pricing data={data} />
        <FAQ data={data} />
        <FinalCTA data={data} />
      </main>
      <Footer data={data} />
    </div>
  );
}
