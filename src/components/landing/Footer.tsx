"use client";

import { Logo } from "./atoms";

const COLS: [string, string[]][] = [
  ["Ürünler", ["Etik İhbar Hattı", "İlgili Kişi Başvuruları", "Tedarikçi Uyumu", "Raporlama"]],
  ["Şirket", ["Hakkımızda", "Müşteriler", "Kariyer", "İletişim"]],
  ["Kaynaklar", ["Blog", "Uyumluluk Rehberi", "API Dokümantasyonu", "Yardım Merkezi"]],
  ["Yasal", ["Gizlilik Politikası", "KVKK Aydınlatma", "Kullanım Şartları", "Veri İşleme (DPA)"]],
];

export default function Footer() {
  return (
    <footer
      style={{
        background: "var(--lp-bg-white)",
        borderTop: "1px solid var(--lp-border)",
      }}
    >
      <div className="lp-container" style={{ padding: "64px 32px 36px" }}>
        <div className="lp-footer-grid">
          <div style={{ maxWidth: 300 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 11,
                marginBottom: 16,
              }}
            >
              <Logo size={30} />
              <span
                className="lp-display"
                style={{ fontSize: 19, fontWeight: 600, color: "var(--lp-ink)" }}
              >
                Ethic<span style={{ color: "var(--lp-green-700)" }}>All</span>
              </span>
            </div>
            <p
              style={{
                fontSize: 14,
                lineHeight: 1.6,
                color: "var(--lp-ink-muted)",
                margin: 0,
                textWrap: "pretty" as any,
              }}
            >
              Etik ihbar, KVKK başvuruları ve tedarikçi uyumu için bütünleşik
              kurumsal platform.
            </p>
          </div>
          <div className="lp-footer-cols">
            {COLS.map(([title, items], i) => (
              <div key={i}>
                <h5
                  className="lp-mono"
                  style={{
                    fontSize: 11,
                    letterSpacing: "0.08em",
                    color: "var(--lp-ink-soft)",
                    margin: "0 0 14px",
                    fontWeight: 600,
                  }}
                >
                  {title}
                </h5>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                  }}
                >
                  {items.map((it, j) => (
                    <a
                      key={j}
                      href="#"
                      style={{
                        fontSize: 14,
                        color: "var(--lp-ink-2)",
                        textDecoration: "none",
                      }}
                    >
                      {it}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 16,
            marginTop: 48,
            paddingTop: 24,
            borderTop: "1px solid var(--lp-border)",
          }}
        >
          <span style={{ fontSize: 13, color: "var(--lp-ink-soft)" }}>
            &copy; {new Date().getFullYear()} EthicAll. Tüm hakları saklıdır.
          </span>
          <div style={{ display: "flex", gap: 18 }}>
            <span className="lp-mono" style={{ fontSize: 11, color: "var(--lp-ink-soft)" }}>
              EU 2019/1937
            </span>
            <span className="lp-mono" style={{ fontSize: 11, color: "var(--lp-ink-soft)" }}>
              KVKK &middot; GDPR
            </span>
            <span className="lp-mono" style={{ fontSize: 11, color: "var(--lp-ink-soft)" }}>
              ISO 27001
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
