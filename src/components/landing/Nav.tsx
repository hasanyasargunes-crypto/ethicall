"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Logo } from "./atoms";
import type { LandingPageData } from "@/sanity/types";

const DEFAULT_LINKS = [
  ["Ürünler", "#urunler"],
  ["Nasıl Çalışır", "#nasil"],
  ["Güvenlik", "#guvenlik"],
  ["Fiyatlandırma", "#fiyat"],
  ["Blog", "/blog"],
];

export default function Nav({ data }: { data?: LandingPageData | null }) {
  const [atTop, setAtTop] = useState(true);

  useEffect(() => {
    const onScroll = () => setAtTop(window.scrollY < 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = data?.navLinks
    ? data.navLinks.map((l) => [l.label, l.href])
    : DEFAULT_LINKS;

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        transition:
          "background 280ms ease, border-color 280ms ease, backdrop-filter 280ms ease",
        background: atTop ? "rgba(246,241,228,0)" : "rgba(246,241,228,0.82)",
        backdropFilter: atTop ? "none" : "saturate(140%) blur(14px)",
        borderBottom: `1px solid ${atTop ? "transparent" : "var(--lp-border)"}`,
      }}
    >
      <div
        className="lp-container"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 70,
        }}
      >
        <a
          href="#"
          style={{ display: "flex", alignItems: "center", gap: 11, textDecoration: "none" }}
        >
          <Logo />
          <span
            className="lp-display"
            style={{ fontSize: 19, fontWeight: 600, letterSpacing: "-0.02em", color: "var(--lp-ink)" }}
          >
            Ethic<span style={{ color: "var(--lp-green-700)" }}>All</span>
          </span>
        </a>

        <nav
          className="lp-nav-desktop"
          style={{ display: "flex", alignItems: "center", gap: 4 }}
        >
          {links.map(([label, href]) => (
            <a
              key={href}
              href={href}
              style={{
                fontSize: 14.5,
                color: "var(--lp-ink-2)",
                padding: "8px 14px",
                borderRadius: 8,
                textDecoration: "none",
                transition: "color 140ms, background 140ms",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background =
                  "rgba(15,24,21,0.04)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = "transparent";
              }}
            >
              {label}
            </a>
          ))}
        </nav>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Link
            href="/auth/login"
            className="lp-btn lp-btn-ghost lp-nav-login"
            style={{ padding: "9px 16px", fontSize: 14 }}
          >
            {data?.navLoginText ?? "Giriş Yap"}
          </Link>
          <a
            href="#demo"
            className="lp-btn lp-btn-primary"
            style={{ padding: "10px 18px", fontSize: 14 }}
          >
            {data?.navCtaText ?? "Demo Talep Et"}
          </a>
        </div>
      </div>
    </header>
  );
}
