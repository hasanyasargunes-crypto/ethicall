"use client";

import { useState, useEffect, useRef } from "react";
import { Reveal } from "./atoms";
import { Icons } from "./icons";
import type { LandingPageData } from "@/sanity/types";

const PLAIN_LINES = [
  "Satın alma müdürü, X tedarikçisinden",
  "kişisel komisyon talep ediyor.",
  "Son üç ihalede teklifler manipüle edildi.",
];
const CIPHER_CHARS = "▰▱▮▯◆◇●○⬢⬡▪▫⎯⟁⟐0123456789ABCDEF";
function randCipher(len: number) {
  let s = "";
  for (let i = 0; i < len; i++)
    s += CIPHER_CHARS[(Math.random() * CIPHER_CHARS.length) | 0];
  return s;
}

function EncryptPanel() {
  const [phase, setPhase] = useState<"typing" | "encrypting" | "sent">("typing");
  const [typed, setTyped] = useState(["", "", ""]);
  const [cipher, setCipher] = useState(["", "", ""]);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    let cancelled = false;
    const T = (fn: () => void, ms: number) => {
      const id = window.setTimeout(() => {
        if (!cancelled) fn();
      }, ms);
      timers.current.push(id);
    };

    function run() {
      setPhase("typing");
      setTyped(["", "", ""]);
      setCipher(["", "", ""]);

      let li = 0,
        ci = 0;
      const typeStep = () => {
        if (cancelled) return;
        if (li >= PLAIN_LINES.length) {
          startEncrypt();
          return;
        }
        const full = PLAIN_LINES[li];
        ci++;
        setTyped((prev) => {
          const next = [...prev];
          next[li] = full.slice(0, ci);
          return next;
        });
        if (ci >= full.length) {
          li++;
          ci = 0;
          T(typeStep, 320);
        } else T(typeStep, 26 + Math.random() * 30);
      };
      T(typeStep, 700);

      function startEncrypt() {
        setPhase("encrypting");
        let frame = 0;
        const total = 26;
        const enc = () => {
          if (cancelled) return;
          frame++;
          setCipher(PLAIN_LINES.map((l) => randCipher(Math.min(l.length, 38))));
          if (frame < total) T(enc, 55);
          else {
            setPhase("sent");
            T(run, 4200);
          }
        };
        T(enc, 360);
      }
    }

    run();
    return () => {
      cancelled = true;
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
  }, []);

  const showCipher = phase === "encrypting" || phase === "sent";

  return (
    <div style={{ position: "relative" }}>
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: "-12% -8% -16% -8%",
          borderRadius: 40,
          background:
            "radial-gradient(60% 60% at 70% 20%, rgba(27,157,110,0.22), transparent 70%)",
          filter: "blur(10px)",
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: "relative",
          zIndex: 1,
          background: "linear-gradient(180deg, #0A3E2A, #06231C)",
          borderRadius: 20,
          padding: 24,
          boxShadow: "var(--lp-shadow-green)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 18,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <span style={{ width: 9, height: 9, borderRadius: 99, background: "rgba(255,255,255,0.18)" }} />
            <span style={{ width: 9, height: 9, borderRadius: 99, background: "rgba(255,255,255,0.18)" }} />
            <span style={{ width: 9, height: 9, borderRadius: 99, background: "rgba(255,255,255,0.18)" }} />
          </div>
          <div
            className="lp-mono"
            style={{
              fontSize: 10.5,
              color: "rgba(211,231,220,0.6)",
              letterSpacing: "0.08em",
            }}
          >
            ethicall &middot; anonim kanal
          </div>
        </div>

        <div
          style={{
            background: "rgba(255,255,255,0.04)",
            borderRadius: 12,
            padding: "18px 18px 16px",
            border: "1px solid rgba(255,255,255,0.06)",
            minHeight: 152,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <span
              style={{
                width: 26,
                height: 26,
                borderRadius: 99,
                background: "rgba(201,168,106,0.18)",
                display: "grid",
                placeItems: "center",
                color: "var(--lp-amber)",
              }}
            >
              <Icons.user size={15} />
            </span>
            <span
              className="lp-mono"
              style={{ fontSize: 11, color: "rgba(211,231,220,0.7)" }}
            >
              anonim &middot; #4F2A1C
            </span>
          </div>

          {PLAIN_LINES.map((line, i) => (
            <div
              key={i}
              style={{
                fontFamily: showCipher
                  ? "var(--font-mono), ui-monospace, monospace"
                  : "inherit",
                fontSize: showCipher ? 13 : 14.5,
                lineHeight: 1.7,
                color: showCipher
                  ? "var(--lp-amber-soft)"
                  : "rgba(246,241,228,0.94)",
                letterSpacing: showCipher ? "0.04em" : 0,
                transition: "color 200ms, font-size 200ms",
                minHeight: 24,
                wordBreak: "break-all",
              }}
            >
              {showCipher
                ? cipher[i]
                : (
                    <>
                      {typed[i]}
                      {phase === "typing" &&
                        i ===
                          typed.findIndex(
                            (t, idx) => t.length < PLAIN_LINES[idx].length
                          ) && (
                          <span
                            style={{
                              display: "inline-block",
                              width: 2,
                              height: 15,
                              marginLeft: 1,
                              background: "var(--lp-amber)",
                              verticalAlign: "middle",
                              animation: "lp-blink 1s steps(2) infinite",
                            }}
                          />
                        )}
                    </>
                  )}
            </div>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                width: 24,
                height: 24,
                borderRadius: 99,
                background:
                  phase === "sent"
                    ? "rgba(27,157,110,0.25)"
                    : "rgba(255,255,255,0.06)",
                display: "grid",
                placeItems: "center",
                color:
                  phase === "sent"
                    ? "var(--lp-green-500)"
                    : "rgba(211,231,220,0.5)",
                transition: "all 240ms",
              }}
            >
              {phase === "sent" ? (
                <Icons.check size={14} />
              ) : (
                <Icons.lock size={13} />
              )}
            </span>
            <span
              className="lp-mono"
              style={{ fontSize: 11, color: "rgba(211,231,220,0.72)" }}
            >
              {phase === "typing" && "yazılıyor…"}
              {phase === "encrypting" && "uçtan uca şifreleniyor…"}
              {phase === "sent" && "anonim olarak iletildi"}
            </span>
          </div>
          <span
            className="lp-mono"
            style={{ fontSize: 10, color: "rgba(211,231,220,0.4)" }}
          >
            AES-256
          </span>
        </div>
      </div>
    </div>
  );
}

function GridLines() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 0,
        opacity: 0.5,
        backgroundImage:
          "linear-gradient(var(--lp-border) 1px, transparent 1px), linear-gradient(90deg, var(--lp-border) 1px, transparent 1px)",
        backgroundSize: "64px 64px",
        maskImage:
          "radial-gradient(80% 70% at 50% 30%, #000 30%, transparent 75%)",
        WebkitMaskImage:
          "radial-gradient(80% 70% at 50% 30%, #000 30%, transparent 75%)",
      }}
    />
  );
}

export default function Hero({ data }: { data?: LandingPageData | null }) {
  return (
    <section
      style={{
        position: "relative",
        paddingTop: 132,
        paddingBottom: 96,
        overflow: "hidden",
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          background:
            "radial-gradient(90% 60% at 85% 0%, rgba(27,157,110,0.10), transparent 60%), radial-gradient(70% 50% at 0% 30%, rgba(201,168,106,0.10), transparent 55%)",
        }}
      />
      <GridLines />
      <div
        className="lp-container lp-hero-grid"
        style={{ position: "relative", zIndex: 1 }}
      >
        <div>
          <Reveal as="span" className="lp-eyebrow" style={{ whiteSpace: "nowrap" }}>
            <span className="lp-eyebrow-dot" />
            {data?.heroTitle ? "AB Directive & KVKK uyumlu" : "AB Directive & KVKK uyumlu"}
          </Reveal>

          <Reveal
            as="h1"
            delay={70}
            className="lp-display"
            style={{
              fontSize: "clamp(40px, 5.4vw, 72px)",
              margin: "24px 0 0",
              maxWidth: 640,
              letterSpacing: "-0.03em",
              lineHeight: 1.0,
              textWrap: "balance" as any,
              color: "var(--lp-ink)",
            }}
          >
            <>
              {data?.heroTitle ?? "Etik kültürü"}
              <br />
              <span style={{ color: "var(--lp-green-700)" }}>{data?.heroTitleAccent ?? "ölçülebilir"}</span>{" "}
              {data?.heroTitle ? "" : "bir varlığa dönüştürün."}
            </>
          </Reveal>

          <Reveal
            as="p"
            delay={140}
            style={{
              fontSize: 19.5,
              lineHeight: 1.58,
              color: "var(--lp-ink-muted)",
              margin: "26px 0 0",
              maxWidth: 500,
              textWrap: "pretty" as any,
            }}
          >
            Etik ihbar, KVKK başvuruları ve tedarikçi uyumunu tek platformda
            yönetin. Çalışanlarınız için{" "}
            <strong style={{ color: "var(--lp-ink)", fontWeight: 600 }}>
              tam anonim
            </strong>
            , yönetiminiz için{" "}
            <strong style={{ color: "var(--lp-ink)", fontWeight: 600 }}>
              tam denetlenebilir
            </strong>
            .
          </Reveal>

          <Reveal
            delay={210}
            style={{ display: "flex", gap: 12, marginTop: 34, flexWrap: "wrap" }}
          >
            <a
              href="#demo"
              className="lp-btn lp-btn-primary"
              style={{ padding: "14px 22px", fontSize: 15.5 }}
            >
              {data?.heroCtaPrimary ?? "Demo Talep Et"} <Icons.arrow size={17} />
            </a>
            <a
              href="#urunler"
              className="lp-btn lp-btn-ghost"
              style={{ padding: "14px 22px", fontSize: 15.5 }}
            >
              {data?.heroCtaSecondary ?? "Ürünleri Keşfet"}
            </a>
          </Reveal>

          <Reveal
            delay={280}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 22,
              marginTop: 38,
              flexWrap: "wrap",
            }}
          >
            {[
              ["Uçtan uca", "şifreli"],
              ["Sınırsız", "ihbar kanalı"],
              ["7/24", "erişim"],
            ].map(([a, b], i) => (
              <div
                key={i}
                style={{ display: "flex", alignItems: "center", gap: 22 }}
              >
                {i > 0 && (
                  <span
                    style={{
                      width: 1,
                      height: 30,
                      background: "var(--lp-border)",
                    }}
                  />
                )}
                <div>
                  <div
                    className="lp-display"
                    style={{
                      fontSize: 17,
                      fontWeight: 600,
                      color: "var(--lp-green-700)",
                    }}
                  >
                    {a}
                  </div>
                  <div style={{ fontSize: 13, color: "var(--lp-ink-soft)" }}>
                    {b}
                  </div>
                </div>
              </div>
            ))}
          </Reveal>
        </div>

        <Reveal delay={160} className="lp-hero-panel">
          <EncryptPanel />
        </Reveal>
      </div>
    </section>
  );
}
