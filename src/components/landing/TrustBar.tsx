"use client";

import { Reveal } from "./atoms";
import type { LandingPageData } from "@/sanity/types";

const DEFAULT_BADGES = [
  ["EU 2019/1937", "Whistleblower Directive"],
  ["KVKK", "6698 sayılı kanun"],
  ["GDPR", "AB veri tüzüğü"],
  ["ISO 27001", "bilgi güvenliği"],
  ["AES-256", "uçtan uca şifreleme"],
];

export default function TrustBar({ data }: { data?: LandingPageData | null }) {
  const BADGES = data?.trustBadges
    ? data.trustBadges.map((b) => [b.name, b.description])
    : DEFAULT_BADGES;
  return (
    <section
      style={{
        borderTop: "1px solid var(--lp-border)",
        borderBottom: "1px solid var(--lp-border)",
        background: "var(--lp-bg-paper)",
      }}
    >
      <div className="lp-container" style={{ padding: "26px 32px" }}>
        <Reveal
          style={{
            display: "flex",
            alignItems: "center",
            gap: 28,
            flexWrap: "wrap",
            justifyContent: "space-between",
          }}
        >
          <span
            className="lp-mono"
            style={{
              fontSize: 11.5,
              color: "var(--lp-ink-soft)",
              letterSpacing: "0.08em",
              whiteSpace: "nowrap",
            }}
          >
            {data?.trustLabel ?? "Uyumluluk & güvenlik standartları"}
          </span>
          <div
            style={{
              display: "flex",
              gap: 30,
              flexWrap: "wrap",
              flex: 1,
              justifyContent: "flex-end",
            }}
          >
            {BADGES.map(([a, b], i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column" }}>
                <span
                  className="lp-display"
                  style={{
                    fontSize: 15,
                    fontWeight: 600,
                    color: "var(--lp-green-700)",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {a}
                </span>
                <span style={{ fontSize: 11.5, color: "var(--lp-ink-soft)" }}>
                  {b}
                </span>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
