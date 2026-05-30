"use client";

import { useState } from "react";
import { Reveal, SectionHead } from "./atoms";
import { Icons } from "./icons";
import type { LandingPageData } from "@/sanity/types";

type Product = {
  key: string;
  icon: (p: { size?: number }) => React.ReactNode;
  tag: string;
  name: string;
  tagline: string;
  desc: string;
  points: string[];
  featured: boolean;
};

const PRODUCTS: Product[] = [
  {
    key: "ethics",
    icon: Icons.whistle,
    tag: "ANA ÜRÜN",
    name: "Etik İhbar Hattı",
    tagline: "Anonim, güvenli, denetlenebilir ihbar yönetimi",
    desc: "Çalışanlar ve paydaşlar; usulsüzlük, yolsuzluk ve etik ihlalleri tam anonimlikle bildirir. Vaka yönetimi, SLA takibi ve raporlama tek panelde.",
    points: [
      "Tam anonim çift yönlü diyalog",
      "Vaka yönetimi & SLA",
      "AB Directive uyumlu süreç",
    ],
    featured: true,
  },
  {
    key: "dsar",
    icon: Icons.user,
    tag: "MODÜL",
    name: "İlgili Kişi Başvuruları",
    tagline: "KVKK & GDPR veri sahibi taleplerini otomatikleştirin",
    desc: "Erişim, silme ve düzeltme taleplerini yasal süreler içinde, kanıtlanabilir bir akışla yönetin. Formdan kapanışa kadar tek yerden.",
    points: [
      "Yasal süre & otomatik hatırlatma",
      "Kimlik doğrulama akışı",
      "Denetim izi & arşiv",
    ],
    featured: false,
  },
  {
    key: "supplier",
    icon: Icons.truck,
    tag: "MODÜL",
    name: "Tedarikçi Uyumu",
    tagline: "Tedarik zincirinizde etik & uyum risklerini izleyin",
    desc: "Tedarikçi davranış kuralları onayı, due-diligence anketleri ve risk skorlaması ile tedarik zincirinizi sürekli denetim altında tutun.",
    points: [
      "Davranış kuralı onayı",
      "Risk skorlama & uyarı",
      "Periyodik değerlendirme",
    ],
    featured: false,
  },
];

function ProductCard({ p, delay }: { p: Product; delay: number }) {
  const [hover, setHover] = useState(false);
  const ICO = p.icon;
  return (
    <Reveal
      delay={delay}
      style={{
        position: "relative",
        gridColumn: p.featured ? "span 2" : "span 1",
        background: p.featured
          ? "linear-gradient(165deg, #0F5C3F, #06231C)"
          : "var(--lp-bg-white)",
        color: p.featured ? "var(--lp-bg-paper)" : "var(--lp-ink)",
        border: `1px solid ${p.featured ? "transparent" : "var(--lp-border)"}`,
        borderRadius: "var(--lp-radius-lg)",
        padding: p.featured ? 36 : 28,
        boxShadow: hover ? "var(--lp-shadow-lg)" : "var(--lp-shadow-sm)",
        transform: hover ? "translateY(-3px)" : "none",
        transition:
          "transform 220ms cubic-bezier(.2,.7,.2,1), box-shadow 220ms ease",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        minHeight: p.featured ? "auto" : 320,
        cursor: "default",
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {p.featured && (
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            right: -40,
            top: -40,
            width: 220,
            height: 220,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(201,168,106,0.30), transparent 68%)",
          }}
        />
      )}
      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 18,
        }}
      >
        <span
          style={{
            width: 46,
            height: 46,
            borderRadius: 12,
            display: "grid",
            placeItems: "center",
            background: p.featured
              ? "rgba(201,168,106,0.20)"
              : "var(--lp-green-50)",
            color: p.featured ? "var(--lp-amber)" : "var(--lp-green-700)",
          }}
        >
          <ICO size={24} />
        </span>
        <span
          className="lp-mono"
          style={{
            fontSize: 10,
            letterSpacing: "0.1em",
            padding: "4px 9px",
            borderRadius: 99,
            background: p.featured
              ? "rgba(201,168,106,0.22)"
              : "var(--lp-green-50)",
            color: p.featured ? "var(--lp-amber-soft)" : "var(--lp-green-600)",
            fontWeight: 600,
          }}
        >
          {p.tag}
        </span>
      </div>

      <h3
        className="lp-display"
        style={{
          position: "relative",
          fontSize: p.featured ? 28 : 22,
          fontWeight: 600,
          margin: "0 0 8px",
          letterSpacing: "-0.02em",
        }}
      >
        {p.name}
      </h3>
      <p
        style={{
          position: "relative",
          fontSize: 14,
          fontWeight: 500,
          margin: "0 0 12px",
          color: p.featured ? "var(--lp-amber-soft)" : "var(--lp-green-700)",
        }}
      >
        {p.tagline}
      </p>
      <p
        style={{
          position: "relative",
          fontSize: 15,
          lineHeight: 1.6,
          margin: 0,
          color: p.featured
            ? "rgba(246,241,228,0.78)"
            : "var(--lp-ink-muted)",
          maxWidth: p.featured ? 460 : "none",
          textWrap: "pretty" as any,
        }}
      >
        {p.desc}
      </p>

      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          gap: 9,
          margin: "20px 0 0",
        }}
      >
        {p.points.map((pt, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 9,
              fontSize: 13.5,
              color: p.featured
                ? "rgba(246,241,228,0.9)"
                : "var(--lp-ink-2)",
            }}
          >
            <span
              style={{
                color: p.featured
                  ? "var(--lp-amber)"
                  : "var(--lp-green-600)",
                display: "flex",
              }}
            >
              <Icons.check size={16} />
            </span>
            {pt}
          </div>
        ))}
      </div>

      <div style={{ flex: 1 }} />
      <a
        href="#"
        style={{
          position: "relative",
          display: "inline-flex",
          alignItems: "center",
          gap: 7,
          marginTop: 22,
          fontSize: 14,
          fontWeight: 500,
          color: p.featured ? "var(--lp-amber-soft)" : "var(--lp-green-700)",
          textDecoration: "none",
        }}
      >
        Detaylı incele
        <span
          style={{
            display: "flex",
            transform: hover ? "translateX(3px)" : "none",
            transition: "transform 200ms",
          }}
        >
          <Icons.arrow size={15} />
        </span>
      </a>
    </Reveal>
  );
}

const ICON_MAP: Record<string, (p: { size?: number }) => React.ReactNode> = Icons as any;

export default function Products({ data }: { data?: LandingPageData | null }) {
  const products: Product[] = data?.productsItems
    ? data.productsItems.map((p) => ({
        key: p.name,
        icon: ICON_MAP[p.iconName] ?? Icons.shield,
        tag: p.tag,
        name: p.name,
        tagline: p.tagline,
        desc: p.description,
        points: p.points ?? [],
        featured: p.featured ?? false,
      }))
    : PRODUCTS;

  return (
    <section id="urunler" style={{ padding: "110px 0 100px" }}>
      <div className="lp-container">
        <SectionHead
          eyebrow={data?.productsEyebrow ?? "Tek platform, üç ürün"}
          title={data?.productsTitle ?? "Uyumun her cephesi <em style='font-family:var(--font-display),serif;font-style:normal;color:var(--lp-green-700)'>tek</em> çatı altında"}
          lede={data?.productsSubtitle ?? "EthicAll; etik ihbardan veri sahibi taleplerine, tedarikçi denetiminden risk skorlamasına kadar tüm uyum sürecini birbirine bağlar."}
        />
        <div className="lp-products-grid" style={{ marginTop: 52 }}>
          {products.map((p, i) => (
            <ProductCard key={p.key} p={p} delay={i * 90} />
          ))}
        </div>
      </div>
    </section>
  );
}
