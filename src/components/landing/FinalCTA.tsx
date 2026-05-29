"use client";

import { Reveal } from "./atoms";
import { Icons } from "./icons";

export default function FinalCTA() {
  return (
    <section id="demo" style={{ padding: "40px 0 110px" }}>
      <div className="lp-container">
        <Reveal
          style={{
            position: "relative",
            overflow: "hidden",
            borderRadius: "var(--lp-radius-xl)",
            background: "linear-gradient(150deg, #0F5C3F 0%, #06231C 70%)",
            color: "var(--lp-bg-paper)",
            padding: "clamp(44px, 6vw, 80px)",
            boxShadow: "var(--lp-shadow-green)",
          }}
        >
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              right: -80,
              top: -80,
              width: 380,
              height: 380,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(201,168,106,0.28), transparent 65%)",
            }}
          />
          <div style={{ position: "relative", maxWidth: 620 }}>
            <h2
              className="lp-display"
              style={{
                fontSize: "clamp(30px,4vw,52px)",
                fontWeight: 500,
                margin: 0,
                letterSpacing: "-0.03em",
                textWrap: "balance" as any,
              }}
            >
              Etik altyapınızı bugün kurun.
            </h2>
            <p
              style={{
                fontSize: 19,
                lineHeight: 1.55,
                color: "rgba(246,241,228,0.78)",
                margin: "20px 0 0",
                maxWidth: 520,
                textWrap: "pretty" as any,
              }}
            >
              30 dakikalık bir demoda, EthicAll&apos;ın kurumunuzun uyum
              yükümlülüklerini nasıl tek platforma indirgediğini gösterelim.
            </p>
            <div
              style={{
                display: "flex",
                gap: 12,
                marginTop: 34,
                flexWrap: "wrap",
              }}
            >
              <a
                href="#"
                className="lp-btn"
                style={{
                  background: "var(--lp-amber)",
                  color: "var(--lp-green-900)",
                  padding: "14px 24px",
                  fontSize: 15.5,
                }}
              >
                Demo Talep Et <Icons.arrow size={17} />
              </a>
              <a
                href="#fiyat"
                className="lp-btn"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  color: "var(--lp-bg-paper)",
                  border: "1px solid rgba(255,255,255,0.18)",
                  padding: "14px 24px",
                  fontSize: 15.5,
                }}
              >
                Fiyatlandırmayı İncele
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
