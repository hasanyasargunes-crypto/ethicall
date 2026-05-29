"use client";

import { useReveal } from "@/components/landing/atoms";
import Nav from "@/components/landing/Nav";
import Hero from "@/components/landing/Hero";
import TrustBar from "@/components/landing/TrustBar";
import Products from "@/components/landing/Products";
import EthicsDeep from "@/components/landing/EthicsDeep";
import HowItWorks from "@/components/landing/HowItWorks";
import DashboardPreview from "@/components/landing/DashboardPreview";
import Security from "@/components/landing/Security";
import Pricing from "@/components/landing/Pricing";
import FAQ from "@/components/landing/FAQ";
import FinalCTA from "@/components/landing/FinalCTA";
import Footer from "@/components/landing/Footer";

export default function Home() {
  useReveal();

  return (
    <div style={{ background: "var(--lp-bg-paper)", color: "var(--lp-ink)" }}>
      <Nav />
      <main>
        <Hero />
        <TrustBar />
        <Products />
        <EthicsDeep />
        <HowItWorks />
        <DashboardPreview />
        <Security />
        <Pricing />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
