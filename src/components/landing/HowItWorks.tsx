"use client";

import { Reveal, SectionHead } from "./atoms";
import { Icons } from "./icons";
import type { LandingPageData } from "@/sanity/types";

const ICON_MAP: Record<string, (p: { size?: number }) => React.ReactNode> = Icons as any;

const STEPS = [
  {
    num: "01",
    icon: Icons.bell,
    title: "Bildirim alınır",
    desc: "İhbarcı, web veya QR kanalından tam anonim bildirim oluşturur. Sistem hiçbir iz toplamaz.",
  },
  {
    num: "02",
    icon: Icons.flow,
    title: "Vaka yönlendirilir",
    desc: "Konu kategorisine göre doğru ekibe atanır; çıkar çatışması varsa otomatik izole edilir.",
  },
  {
    num: "03",
    icon: Icons.eye,
    title: "İnceleme & diyalog",
    desc: "Yetkili ekip, anonimliği bozmadan ihbarcıyla güvenli kanaldan iletişim kurar.",
  },
  {
    num: "04",
    icon: Icons.check,
    title: "Kapanış & rapor",
    desc: "Süreç kanıtlanabilir şekilde sonuçlanır; tüm adımlar denetim izinde saklanır.",
  },
];

export default function HowItWorks({ data }: { data?: LandingPageData | null }) {
  const steps = data?.howSteps
    ? data.howSteps.map((s) => ({
        num: s.num,
        icon: ICON_MAP[s.iconName] ?? Icons.shield,
        title: s.title,
        desc: s.description,
      }))
    : STEPS;
  return (
    <section id="nasil" style={{ padding: "110px 0 100px" }}>
      <div className="lp-container">
        <SectionHead
          eyebrow={data?.howEyebrow ?? "Nasıl çalışır"}
          title={data?.howTitle ?? "İlk bildirimden <em style='font-family:var(--font-display),serif;font-style:normal;color:var(--lp-green-700)'>kapanışa</em> kadar dört adım"}
          lede={data?.howSubtitle ?? "Her adım yasal yükümlülüklere uygun, her etkileşim kayıt altında."}
        />
        <div className="lp-steps-grid" style={{ marginTop: 56 }}>
          {steps.map((step, i) => {
            const ICO = step.icon;
            return (
              <Reveal key={i} delay={i * 90} style={{ position: "relative" }}>
                {i < steps.length - 1 && (
                  <span
                    className="lp-step-connector"
                    aria-hidden="true"
                    style={{
                      position: "absolute",
                      top: 30,
                      left: "calc(50% + 34px)",
                      right: "calc(-50% + 34px)",
                      height: 1,
                      borderTop: "1px dashed var(--lp-border-strong)",
                    }}
                  />
                )}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 16,
                  }}
                >
                  <span
                    style={{
                      position: "relative",
                      width: 60,
                      height: 60,
                      borderRadius: 16,
                      background: "var(--lp-bg-white)",
                      border: "1px solid var(--lp-border)",
                      boxShadow: "var(--lp-shadow-sm)",
                      display: "grid",
                      placeItems: "center",
                      color: "var(--lp-green-700)",
                      zIndex: 1,
                    }}
                  >
                    <ICO size={26} />
                    <span
                      className="lp-mono"
                      style={{
                        position: "absolute",
                        top: -8,
                        right: -8,
                        fontSize: 9.5,
                        fontWeight: 600,
                        background: "var(--lp-green-700)",
                        color: "var(--lp-bg-paper)",
                        borderRadius: 99,
                        width: 24,
                        height: 24,
                        display: "grid",
                        placeItems: "center",
                      }}
                    >
                      {step.num}
                    </span>
                  </span>
                  <div>
                    <h4
                      className="lp-display"
                      style={{
                        fontSize: 18,
                        fontWeight: 600,
                        margin: "0 0 7px",
                        color: "var(--lp-ink)",
                      }}
                    >
                      {step.title}
                    </h4>
                    <p
                      style={{
                        fontSize: 14.5,
                        lineHeight: 1.55,
                        color: "var(--lp-ink-muted)",
                        margin: 0,
                        maxWidth: 240,
                        textWrap: "pretty" as any,
                      }}
                    >
                      {step.desc}
                    </p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
