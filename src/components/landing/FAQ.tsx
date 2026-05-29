"use client";

import { useState } from "react";
import { Reveal, SectionHead } from "./atoms";

const QA = [
  [
    "İhbarcının kimliği gerçekten gizli mi kalıyor?",
    "Evet. Sistem; IP adresi, cihaz parmak izi veya konum gibi hiçbir tanımlayıcı veriyi toplamaz. İhbarcı kimliği teknik olarak dahi geri izlenemez. Anonimliği bozmadan çift yönlü iletişim kurulabilir.",
  ],
  [
    "AB Whistleblower Directive ve KVKK ile uyum nasıl sağlanıyor?",
    "Platform; bildirimin 7 gün içinde teyit edilmesi ve 3 ay içinde geri bildirim verilmesi gibi yasal süreleri otomatik takip eder. KVKK ve GDPR kapsamındaki veri sahibi taleplerini de yasal sürelerle yönetir.",
  ],
  [
    "Üç ürünü ayrı ayrı satın alabilir miyiz?",
    "Başlangıç planı yalnızca Etik İhbar Hattını içerir. Kurumsal ve Enterprise planlarda üç ürün (Etik İhbar, KVKK Başvuruları, Tedarikçi Uyumu) birlikte gelir. İhtiyacınıza göre modüler yapılandırma da mümkündür.",
  ],
  [
    "Verilerimiz nerede barındırılıyor?",
    "Veriler AB ve Türkiye sınırları içindeki, KVKK ve GDPR uyumlu veri merkezlerinde tutulur. Enterprise planda özel veri ikametgâhı ve DPA imkânı sunulur.",
  ],
  [
    "Mevcut sistemlerimizle entegre olur mu?",
    "Evet. SSO/SCIM ile kullanıcı yönetimi, webhook ve API ile vaka aktarımı, ayrıca yaygın İK ve GRC araçlarıyla entegrasyon Enterprise planda desteklenir.",
  ],
];

export default function FAQ() {
  const [open, setOpen] = useState(0);

  return (
    <section style={{ padding: "110px 0 100px" }}>
      <div className="lp-container" style={{ maxWidth: 860 }}>
        <SectionHead align="center" eyebrow="SSS" title="Sıkça sorulan sorular" maxw={560} />
        <div style={{ marginTop: 44 }}>
          {QA.map(([q, a], i) => {
            const isOpen = open === i;
            return (
              <Reveal
                key={i}
                delay={i * 50}
                style={{
                  borderTop: "1px solid var(--lp-border)",
                  borderBottom:
                    i === QA.length - 1 ? "1px solid var(--lp-border)" : "none",
                }}
              >
                <button
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 20,
                    padding: "22px 4px",
                    background: "transparent",
                    border: "none",
                    textAlign: "left",
                    cursor: "pointer",
                  }}
                >
                  <span
                    className="lp-display"
                    style={{
                      fontSize: 18,
                      fontWeight: 500,
                      color: "var(--lp-ink)",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {q}
                  </span>
                  <span
                    style={{
                      flexShrink: 0,
                      width: 30,
                      height: 30,
                      borderRadius: 99,
                      border: "1px solid var(--lp-border-strong)",
                      display: "grid",
                      placeItems: "center",
                      color: "var(--lp-green-700)",
                      transform: isOpen ? "rotate(45deg)" : "none",
                      transition: "transform 240ms ease",
                    }}
                  >
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    >
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </span>
                </button>
                <div
                  style={{
                    maxHeight: isOpen ? 240 : 0,
                    overflow: "hidden",
                    transition:
                      "max-height 320ms cubic-bezier(.2,.7,.2,1), opacity 240ms ease",
                    opacity: isOpen ? 1 : 0,
                  }}
                >
                  <p
                    style={{
                      fontSize: 15.5,
                      lineHeight: 1.62,
                      color: "var(--lp-ink-muted)",
                      margin: "0 0 22px",
                      maxWidth: 660,
                      textWrap: "pretty" as any,
                    }}
                  >
                    {a}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
