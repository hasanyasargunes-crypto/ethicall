"use client";

import { Reveal } from "./atoms";
import { Icons } from "./icons";

const FEATURES = [
  {
    icon: Icons.eye,
    title: "Tam anonimlik",
    desc: "IP, cihaz ve meta veri toplanmaz. İhbarcı kimliği teknik olarak dahi geri izlenemez.",
  },
  {
    icon: Icons.flow,
    title: "Çift yönlü diyalog",
    desc: "Anonimliği bozmadan ihbarcıyla güvenli kanal üzerinden ek bilgi alışverişi yapın.",
  },
  {
    icon: Icons.clock,
    title: "SLA & yasal süre takibi",
    desc: "AB Directive’in öngördüğü 7 gün onay / 3 ay geri bildirim sürelerini otomatik izleyin.",
  },
  {
    icon: Icons.scale,
    title: "Çıkar çatışması koruması",
    desc: "Vakayı ilgili kişilerden izole eden rol bazlı erişim ve eskalasyon kuralları.",
  },
];

export default function EthicsDeep() {
  return (
    <section
      style={{
        background: "var(--lp-bg-paper)",
        borderTop: "1px solid var(--lp-border)",
        borderBottom: "1px solid var(--lp-border)",
      }}
    >
      <div className="lp-container" style={{ padding: "100px 32px" }}>
        <div className="lp-deep-grid">
          <div>
            <Reveal as="span" className="lp-eyebrow">
              <span className="lp-eyebrow-dot" />
              Etik İhbar Hattı
            </Reveal>
            <Reveal
              as="h2"
              delay={60}
              className="lp-display"
              style={{
                fontSize: "clamp(30px,3.6vw,46px)",
                margin: "20px 0 0",
                maxWidth: 520,
                textWrap: "balance" as any,
                color: "var(--lp-ink)",
              }}
            >
              Sessizliğin kırıldığı an, koruma başlar.
            </Reveal>
            <Reveal
              as="p"
              delay={120}
              style={{
                fontSize: 18,
                lineHeight: 1.6,
                color: "var(--lp-ink-muted)",
                margin: "18px 0 0",
                maxWidth: 460,
                textWrap: "pretty" as any,
              }}
            >
              İhbarcıyı koruyan, kurumu yasal yükümlülüklerine uygun kılan ve
              her adımı kanıtlanabilir hale getiren uçtan uca bir süreç.
            </Reveal>
            <Reveal
              delay={180}
              style={{ display: "flex", gap: 12, marginTop: 30, flexWrap: "wrap" }}
            >
              <a
                href="#demo"
                className="lp-btn lp-btn-primary"
                style={{ padding: "12px 20px" }}
              >
                Canlı Demo İste <Icons.arrow size={16} />
              </a>
            </Reveal>
          </div>

          <div>
            {FEATURES.map((f, i) => {
              const ICO = f.icon;
              return (
                <Reveal
                  key={i}
                  delay={i * 80}
                  style={{
                    display: "flex",
                    gap: 16,
                    padding: "20px 0",
                    borderTop: i === 0 ? "none" : "1px solid var(--lp-border)",
                  }}
                >
                  <span
                    style={{
                      width: 44,
                      height: 44,
                      flexShrink: 0,
                      borderRadius: 11,
                      background: "var(--lp-green-50)",
                      color: "var(--lp-green-700)",
                      display: "grid",
                      placeItems: "center",
                    }}
                  >
                    <ICO size={22} />
                  </span>
                  <div>
                    <h4
                      className="lp-display"
                      style={{
                        fontSize: 17,
                        fontWeight: 600,
                        margin: "2px 0 5px",
                        color: "var(--lp-ink)",
                      }}
                    >
                      {f.title}
                    </h4>
                    <p
                      style={{
                        fontSize: 14.5,
                        lineHeight: 1.55,
                        color: "var(--lp-ink-muted)",
                        margin: 0,
                        textWrap: "pretty" as any,
                      }}
                    >
                      {f.desc}
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
