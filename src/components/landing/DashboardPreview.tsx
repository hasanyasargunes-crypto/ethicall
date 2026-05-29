"use client";

import { Reveal, SectionHead, Logo } from "./atoms";
import { Icons } from "./icons";

const CASES = [
  ["#4F2A1C", "Tedarikçi komisyon talebi", "Etik İhbar", "Açık", "high", "2 saat önce"],
  ["#7B91A2", "Veri erişim talebi — çalışan", "KVKK Başvuru", "İncelemede", "med", "5 saat önce"],
  ["#A3C46E", "Davranış kuralı onayı gecikti", "Tedarikçi", "Beklemede", "med", "Dün"],
  ["#C46E6E", "Mobbing iddiası — saha ekibi", "Etik İhbar", "Eskalasyon", "high", "Dün"],
  ["#6EA3C4", "Silme talebi — eski müşteri", "KVKK Başvuru", "Tamamlandı", "low", "2 gün önce"],
];

const SEV: Record<string, [string, string]> = {
  high: ["var(--lp-red)", "rgba(184,66,60,0.12)"],
  med: ["var(--lp-amber-dark)", "rgba(201,168,106,0.18)"],
  low: ["var(--lp-green-600)", "var(--lp-green-50)"],
};
const STATUS_COLOR: Record<string, string> = {
  "Açık": "var(--lp-red)",
  "Eskalasyon": "var(--lp-red)",
  "İncelemede": "var(--lp-amber-dark)",
  "Beklemede": "var(--lp-amber-dark)",
  "Tamamlandı": "var(--lp-green-600)",
};

const SIDEBAR_ITEMS: [React.ComponentType<{ size?: number }>, string, boolean][] = [
  [Icons.chart, "Genel Bakış", true],
  [Icons.whistle, "Etik İhbarlar", false],
  [Icons.user, "KVKK Başvuruları", false],
  [Icons.truck, "Tedarikçiler", false],
  [Icons.doc, "Raporlar", false],
  [Icons.layers, "Ayarlar", false],
];

export default function DashboardPreview() {
  return (
    <section style={{ padding: "110px 0 100px", overflow: "hidden" }}>
      <div className="lp-container">
        <SectionHead
          align="center"
          eyebrow="Ürün önizlemesi"
          title="Tüm vakalar, tek bir <em style='font-family:var(--font-display),serif;font-style:normal;color:var(--lp-green-700)'>komuta merkezinde</em>"
          lede="Ekibiniz ihbarları, başvuruları ve tedarikçi risklerini aynı panelden yönetir. Net görünürlük, kanıtlanabilir süreç."
          maxw={680}
        />
        <Reveal delay={120} style={{ marginTop: 56, perspective: 1600 }}>
          <div
            style={{
              background: "var(--lp-bg-white)",
              borderRadius: "var(--lp-radius-xl)",
              border: "1px solid var(--lp-border)",
              boxShadow: "var(--lp-shadow-lg)",
              overflow: "hidden",
              transform: "rotateX(1.5deg)",
              transformOrigin: "center top",
            }}
          >
            {/* top bar */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 20px",
                borderBottom: "1px solid var(--lp-border)",
                background: "var(--lp-bg-paper)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                <Logo size={26} />
                <span className="lp-mono" style={{ fontSize: 11, color: "var(--lp-ink-soft)" }}>
                  uyum paneli
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <span style={{ display: "flex", color: "var(--lp-ink-soft)" }}>
                  <Icons.bell size={17} />
                </span>
                <span
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 99,
                    background: "var(--lp-green-700)",
                    color: "var(--lp-bg-paper)",
                    display: "grid",
                    placeItems: "center",
                    fontSize: 11,
                    fontWeight: 600,
                  }}
                >
                  EA
                </span>
              </div>
            </div>

            <div className="lp-dash-body">
              {/* sidebar */}
              <div
                className="lp-dash-side"
                style={{
                  borderRight: "1px solid var(--lp-border)",
                  padding: "18px 14px",
                  background: "var(--lp-bg-paper)",
                }}
              >
                {SIDEBAR_ITEMS.map(([ICO, label, active], i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 11,
                      padding: "9px 11px",
                      borderRadius: 8,
                      marginBottom: 2,
                      fontSize: 13.5,
                      fontWeight: active ? 600 : 400,
                      background: active ? "var(--lp-green-50)" : "transparent",
                      color: active ? "var(--lp-green-700)" : "var(--lp-ink-muted)",
                    }}
                  >
                    <ICO size={17} /> {label}
                  </div>
                ))}
              </div>

              {/* main */}
              <div style={{ padding: "22px 24px" }}>
                {/* stat row */}
                <div className="lp-dash-stats" style={{ marginBottom: 22 }}>
                  {[
                    ["Açık vaka", "23", "+4", "var(--lp-red)"],
                    ["Ort. çözüm", "4.2g", "-0.6g", "var(--lp-green-600)"],
                    ["SLA uyumu", "%97", "+2", "var(--lp-green-600)"],
                    ["Bu ay toplam", "184", "+31", "var(--lp-green-600)"],
                  ].map(([label, val, delta, dc], i) => (
                    <div
                      key={i}
                      style={{
                        border: "1px solid var(--lp-border)",
                        borderRadius: 12,
                        padding: "14px 16px",
                        background: "var(--lp-bg-white)",
                      }}
                    >
                      <div style={{ fontSize: 11.5, color: "var(--lp-ink-soft)", marginBottom: 6 }}>
                        {label}
                      </div>
                      <div style={{ display: "flex", alignItems: "baseline", gap: 7 }}>
                        <span
                          className="lp-display"
                          style={{ fontSize: 26, fontWeight: 600, letterSpacing: "-0.02em" }}
                        >
                          {val}
                        </span>
                        <span className="lp-mono" style={{ fontSize: 11, color: dc }}>
                          {delta}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* chart strip */}
                <div
                  style={{
                    border: "1px solid var(--lp-border)",
                    borderRadius: 12,
                    padding: "16px 18px",
                    marginBottom: 22,
                    background: "var(--lp-bg-white)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 14,
                    }}
                  >
                    <span style={{ fontSize: 13, fontWeight: 600 }}>
                      Vaka akışı — son 12 hafta
                    </span>
                    <span className="lp-mono" style={{ fontSize: 10.5, color: "var(--lp-ink-soft)" }}>
                      haftalık
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 70 }}>
                    {[40, 55, 38, 62, 48, 70, 58, 80, 66, 90, 74, 96].map((h, i) => (
                      <div
                        key={i}
                        style={{
                          flex: 1,
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "flex-end",
                          height: "100%",
                        }}
                      >
                        <div
                          style={{
                            height: `${h}%`,
                            borderRadius: 4,
                            background: i === 11 ? "var(--lp-green-700)" : "var(--lp-green-100)",
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* case table */}
                <div
                  style={{
                    border: "1px solid var(--lp-border)",
                    borderRadius: 12,
                    overflow: "hidden",
                    background: "var(--lp-bg-white)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "13px 16px",
                      borderBottom: "1px solid var(--lp-border)",
                    }}
                  >
                    <span style={{ fontSize: 13, fontWeight: 600 }}>Son vakalar</span>
                    <span
                      className="lp-mono"
                      style={{ fontSize: 10.5, color: "var(--lp-green-700)" }}
                    >
                      tümünü gör →
                    </span>
                  </div>
                  {CASES.map((c, i) => (
                    <div
                      key={i}
                      className="lp-dash-row"
                      style={{
                        padding: "12px 16px",
                        borderBottom: i < CASES.length - 1 ? "1px solid var(--lp-border)" : "none",
                        fontSize: 13,
                      }}
                    >
                      <span className="lp-mono" style={{ fontSize: 11, color: "var(--lp-ink-soft)" }}>
                        {c[0]}
                      </span>
                      <span
                        style={{
                          fontWeight: 500,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {c[1]}
                      </span>
                      <span style={{ fontSize: 12, color: "var(--lp-ink-muted)" }}>{c[2]}</span>
                      <span
                        style={{
                          fontSize: 11.5,
                          fontWeight: 600,
                          color: STATUS_COLOR[c[3]],
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <span
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: 99,
                            background: STATUS_COLOR[c[3]],
                          }}
                        />
                        {c[3]}
                      </span>
                      <span
                        className="lp-mono"
                        style={{
                          fontSize: 9.5,
                          padding: "3px 7px",
                          borderRadius: 99,
                          textAlign: "center",
                          color: SEV[c[4]]?.[0],
                          background: SEV[c[4]]?.[1],
                          fontWeight: 600,
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        }}
                      >
                        {c[4] === "high" ? "yüksek" : c[4] === "med" ? "orta" : "düşük"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
