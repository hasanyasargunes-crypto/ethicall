"use client";

import { Reveal, SectionHead } from "./atoms";
import { Icons } from "./icons";

const PLANS = [
  {
    name: "Başlangıç",
    price: "₺4.900",
    period: "/ay",
    desc: "250 çalışana kadar KOBİ’ler için.",
    feats: [
      "Etik İhbar Hattı",
      "Tek dil & marka",
      "Temel raporlama",
      "E-posta destek",
    ],
    cta: "Hemen Başla",
    featured: false,
  },
  {
    name: "Kurumsal",
    price: "₺12.900",
    period: "/ay",
    desc: "Büyüyen organizasyonlar için tam set.",
    feats: [
      "Üç ürünün tamamı",
      "Sınırsız çalışan",
      "SLA & gelişmiş raporlar",
      "Çoklu dil & lokalizasyon",
      "Öncelikli destek",
    ],
    cta: "Demo Talep Et",
    featured: true,
  },
  {
    name: "Enterprise",
    price: "Özel",
    period: "",
    desc: "Holding ve denetim gereksinimleri için.",
    feats: [
      "Özel entegrasyon (SSO/SCIM)",
      "Özel veri ikametgâhı",
      "Adanmış başarı yöneticisi",
      "DPA & güvenlik incelemesi",
    ],
    cta: "Bizimle Konuşun",
    featured: false,
  },
];

export default function Pricing() {
  return (
    <section
      id="fiyat"
      style={{
        padding: "110px 0 100px",
        background: "var(--lp-bg-paper)",
        borderTop: "1px solid var(--lp-border)",
      }}
    >
      <div className="lp-container">
        <SectionHead
          align="center"
          eyebrow="Fiyatlandırma"
          title="Ölçeğinize göre <em style='font-family:var(--font-display),serif;font-style:normal;color:var(--lp-green-700)'>esnek</em> planlar"
          lede="Her ölçekte kurum için esnek planlar. Tüm planlar uçtan uca şifreleme ve uyumluluk altyapısını içerir."
          maxw={620}
        />
        <div className="lp-pricing-grid" style={{ marginTop: 52 }}>
          {PLANS.map((pl, i) => (
            <Reveal
              key={i}
              delay={i * 90}
              style={{
                position: "relative",
                display: "flex",
                flexDirection: "column",
                background: pl.featured
                  ? "linear-gradient(180deg,#0F5C3F,#06231C)"
                  : "var(--lp-bg-white)",
                color: pl.featured ? "var(--lp-bg-paper)" : "var(--lp-ink)",
                border: `1px solid ${pl.featured ? "transparent" : "var(--lp-border)"}`,
                borderRadius: "var(--lp-radius-lg)",
                padding: 30,
                boxShadow: pl.featured
                  ? "var(--lp-shadow-green)"
                  : "var(--lp-shadow-sm)",
                transform: pl.featured ? "translateY(-8px)" : "none",
              }}
            >
              {pl.featured && (
                <span
                  className="lp-mono"
                  style={{
                    position: "absolute",
                    top: 18,
                    right: 18,
                    fontSize: 9.5,
                    fontWeight: 600,
                    padding: "4px 10px",
                    borderRadius: 99,
                    background: "var(--lp-amber)",
                    color: "var(--lp-green-900)",
                    letterSpacing: "0.08em",
                  }}
                >
                  EN POPÜLER
                </span>
              )}
              <h3
                className="lp-display"
                style={{ fontSize: 19, fontWeight: 600, margin: "0 0 6px" }}
              >
                {pl.name}
              </h3>
              <p
                style={{
                  fontSize: 13.5,
                  margin: "0 0 24px",
                  color: pl.featured
                    ? "rgba(246,241,228,0.7)"
                    : "var(--lp-ink-muted)",
                  minHeight: 38,
                  textWrap: "pretty" as any,
                }}
              >
                {pl.desc}
              </p>
              <a
                href="#demo"
                className="lp-btn"
                style={
                  pl.featured
                    ? {
                        background: "var(--lp-amber)",
                        color: "var(--lp-green-900)",
                        justifyContent: "center",
                      }
                    : {
                        background: "var(--lp-green-700)",
                        color: "var(--lp-bg-paper)",
                        justifyContent: "center",
                      }
                }
              >
                {pl.cta}
              </a>
              <div
                style={{
                  height: 1,
                  background: pl.featured
                    ? "rgba(255,255,255,0.12)"
                    : "var(--lp-border)",
                  margin: "24px 0 20px",
                }}
              />
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 11,
                }}
              >
                {pl.feats.map((f, j) => (
                  <div
                    key={j}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      fontSize: 14,
                    }}
                  >
                    <span
                      style={{
                        color: pl.featured
                          ? "var(--lp-amber)"
                          : "var(--lp-green-600)",
                        display: "flex",
                        flexShrink: 0,
                      }}
                    >
                      <Icons.check size={16} />
                    </span>
                    <span
                      style={{
                        color: pl.featured
                          ? "rgba(246,241,228,0.9)"
                          : "var(--lp-ink-2)",
                      }}
                    >
                      {f}
                    </span>
                  </div>
                ))}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
