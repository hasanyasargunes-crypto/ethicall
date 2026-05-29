"use client";

import { Reveal } from "./atoms";
import { Icons } from "./icons";

const ITEMS = [
  {
    icon: Icons.lock,
    title: "Uçtan uca şifreleme",
    desc: "Tüm veriler AES-256 ile şifrelenir. Anahtarlar izole edilir; mesaj içeriğine yetkisiz hiç kimse erişemez.",
  },
  {
    icon: Icons.eye,
    title: "İz bırakmayan mimari",
    desc: "IP, cihaz parmak izi ve konum verisi toplanmaz. Anonimlik teknik tasarımla garanti altındadır.",
  },
  {
    icon: Icons.globe,
    title: "AB veri ikametgâhı",
    desc: "Veriler AB / Türkiye sınırları içinde, KVKK ve GDPR’a uygun lokasyonlarda barındırılır.",
  },
  {
    icon: Icons.layers,
    title: "Rol bazlı erişim",
    desc: "Granüler yetkilendirme ve tam denetim izi. Her erişim kaydedilir, hiçbir işlem gizli kalmaz.",
  },
];

export default function Security() {
  return (
    <section
      id="guvenlik"
      style={{
        background: "var(--lp-green-900)",
        color: "var(--lp-bg-paper)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(60% 50% at 80% 0%, rgba(27,157,110,0.18), transparent 60%), radial-gradient(50% 40% at 0% 100%, rgba(201,168,106,0.10), transparent 60%)",
        }}
      />
      <div
        className="lp-container"
        style={{ padding: "100px 32px", position: "relative" }}
      >
        <div style={{ maxWidth: 600 }}>
          <Reveal
            as="span"
            className="lp-eyebrow"
            style={{
              background: "rgba(255,255,255,0.06)",
              borderColor: "rgba(255,255,255,0.14)",
              color: "var(--lp-amber-soft)",
            }}
          >
            <span className="lp-eyebrow-dot" style={{ background: "var(--lp-amber)" }} />
            Güvenlik & gizlilik
          </Reveal>
          <Reveal
            as="h2"
            delay={60}
            className="lp-display"
            style={{
              fontSize: "clamp(30px,3.6vw,48px)",
              margin: "20px 0 0",
              textWrap: "balance" as any,
            }}
          >
            Güven, varsayılan ayardır.
          </Reveal>
          <Reveal
            as="p"
            delay={120}
            style={{
              fontSize: 18.5,
              lineHeight: 1.6,
              color: "rgba(246,241,228,0.72)",
              margin: "18px 0 0",
              maxWidth: 500,
              textWrap: "pretty" as any,
            }}
          >
            EthicAll, gizliliği sonradan eklenen bir özellik değil, mimarinin
            temeli olarak ele alır.
          </Reveal>
        </div>

        <div className="lp-security-grid" style={{ marginTop: 54 }}>
          {ITEMS.map((item, i) => {
            const ICO = item.icon;
            return (
              <Reveal
                key={i}
                delay={i * 80}
                style={{
                  padding: 26,
                  borderRadius: "var(--lp-radius-lg)",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <span
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: 12,
                    display: "grid",
                    placeItems: "center",
                    background: "rgba(201,168,106,0.16)",
                    color: "var(--lp-amber)",
                    marginBottom: 16,
                  }}
                >
                  <ICO size={24} />
                </span>
                <h4
                  className="lp-display"
                  style={{ fontSize: 18, fontWeight: 600, margin: "0 0 8px" }}
                >
                  {item.title}
                </h4>
                <p
                  style={{
                    fontSize: 14.5,
                    lineHeight: 1.55,
                    color: "rgba(246,241,228,0.66)",
                    margin: 0,
                    textWrap: "pretty" as any,
                  }}
                >
                  {item.desc}
                </p>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
