import { defineField, defineType } from "sanity";

export default defineType({
  name: "landingPage",
  title: "Landing Page",
  type: "document",
  groups: [
    { name: "seo", title: "SEO" },
    { name: "nav", title: "Navigasyon" },
    { name: "hero", title: "Hero" },
    { name: "trust", title: "Uyumluluk Rozeti" },
    { name: "products", title: "Urunler" },
    { name: "ethics", title: "Etik Ihbar Detay" },
    { name: "howItWorks", title: "Nasil Calisir" },
    { name: "dashboard", title: "Dashboard Onizleme" },
    { name: "security", title: "Guvenlik" },
    { name: "pricing", title: "Fiyatlandirma" },
    { name: "faq", title: "SSS" },
    { name: "cta", title: "Final CTA" },
    { name: "footer", title: "Footer" },
  ],
  fields: [
    // === SEO ===
    defineField({ name: "seo", title: "SEO Ayarlari", type: "seo", group: "seo" }),

    // === NAV ===
    defineField({
      name: "navLinks",
      title: "Navigasyon Linkleri",
      type: "array",
      of: [{ type: "navLink" }],
      group: "nav",
    }),
    defineField({ name: "navLoginText", title: "Giris Butonu Metni", type: "string", group: "nav", initialValue: "Giris Yap" }),
    defineField({ name: "navCtaText", title: "CTA Butonu Metni", type: "string", group: "nav", initialValue: "Demo Talep Et" }),

    // === HERO ===
    defineField({ name: "heroTitle", title: "Ana Baslik", type: "string", group: "hero" }),
    defineField({ name: "heroTitleAccent", title: "Vurgulanan Kelime (yesil renk)", type: "string", group: "hero" }),
    defineField({ name: "heroSubtitle", title: "Alt Yazi", type: "text", rows: 3, group: "hero" }),
    defineField({ name: "heroCtaPrimary", title: "Birincil Buton", type: "string", group: "hero", initialValue: "Demo Talep Et" }),
    defineField({ name: "heroCtaSecondary", title: "Ikincil Buton", type: "string", group: "hero", initialValue: "Urunleri Kesfet" }),
    defineField({
      name: "heroStats",
      title: "Istatistik Rozetleri",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "value", title: "Deger", type: "string" }),
            defineField({ name: "label", title: "Etiket", type: "string" }),
          ],
        },
      ],
      group: "hero",
    }),

    // === TRUST BAR ===
    defineField({ name: "trustLabel", title: "Baslik", type: "string", group: "trust", initialValue: "Uyumluluk & guvenlik standartlari" }),
    defineField({ name: "trustBadges", title: "Rozetler", type: "array", of: [{ type: "trustBadge" }], group: "trust" }),

    // === PRODUCTS ===
    defineField({ name: "productsEyebrow", title: "Ust Baslik", type: "string", group: "products" }),
    defineField({ name: "productsTitle", title: "Baslik (HTML destekli, <em> kullanilabilir)", type: "string", group: "products" }),
    defineField({ name: "productsSubtitle", title: "Alt Yazi", type: "text", rows: 3, group: "products" }),
    defineField({ name: "productsItems", title: "Urunler", type: "array", of: [{ type: "product" }], group: "products" }),

    // === ETHICS DEEP ===
    defineField({ name: "ethicsEyebrow", title: "Ust Baslik", type: "string", group: "ethics" }),
    defineField({ name: "ethicsTitle", title: "Baslik", type: "string", group: "ethics" }),
    defineField({ name: "ethicsSubtitle", title: "Alt Yazi", type: "text", rows: 3, group: "ethics" }),
    defineField({ name: "ethicsCtaText", title: "CTA Metni", type: "string", group: "ethics" }),
    defineField({ name: "ethicsFeatures", title: "Ozellikler", type: "array", of: [{ type: "feature" }], group: "ethics" }),

    // === HOW IT WORKS ===
    defineField({ name: "howEyebrow", title: "Ust Baslik", type: "string", group: "howItWorks" }),
    defineField({ name: "howTitle", title: "Baslik", type: "string", group: "howItWorks" }),
    defineField({ name: "howSubtitle", title: "Alt Yazi", type: "text", rows: 3, group: "howItWorks" }),
    defineField({ name: "howSteps", title: "Adimlar", type: "array", of: [{ type: "step" }], group: "howItWorks" }),

    // === DASHBOARD PREVIEW ===
    defineField({ name: "dashEyebrow", title: "Ust Baslik", type: "string", group: "dashboard" }),
    defineField({ name: "dashTitle", title: "Baslik", type: "string", group: "dashboard" }),
    defineField({ name: "dashSubtitle", title: "Alt Yazi", type: "text", rows: 3, group: "dashboard" }),

    // === SECURITY ===
    defineField({ name: "securityEyebrow", title: "Ust Baslik", type: "string", group: "security" }),
    defineField({ name: "securityTitle", title: "Baslik", type: "string", group: "security" }),
    defineField({ name: "securitySubtitle", title: "Alt Yazi", type: "text", rows: 3, group: "security" }),
    defineField({ name: "securityItems", title: "Ozellikler", type: "array", of: [{ type: "feature" }], group: "security" }),

    // === PRICING ===
    defineField({ name: "pricingEyebrow", title: "Ust Baslik", type: "string", group: "pricing" }),
    defineField({ name: "pricingTitle", title: "Baslik", type: "string", group: "pricing" }),
    defineField({ name: "pricingSubtitle", title: "Alt Yazi", type: "text", rows: 3, group: "pricing" }),
    defineField({ name: "pricingPlans", title: "Planlar", type: "array", of: [{ type: "plan" }], group: "pricing" }),

    // === FAQ ===
    defineField({ name: "faqEyebrow", title: "Ust Baslik", type: "string", group: "faq" }),
    defineField({ name: "faqTitle", title: "Baslik", type: "string", group: "faq" }),
    defineField({ name: "faqItems", title: "Sorular", type: "array", of: [{ type: "faqItem" }], group: "faq" }),

    // === FINAL CTA ===
    defineField({ name: "ctaTitle", title: "Baslik", type: "string", group: "cta" }),
    defineField({ name: "ctaSubtitle", title: "Alt Yazi", type: "text", rows: 3, group: "cta" }),
    defineField({ name: "ctaPrimary", title: "Birincil Buton", type: "string", group: "cta" }),
    defineField({ name: "ctaSecondary", title: "Ikincil Buton", type: "string", group: "cta" }),

    // === FOOTER ===
    defineField({ name: "footerTagline", title: "Slogan", type: "text", rows: 2, group: "footer" }),
    defineField({ name: "footerColumns", title: "Kolonlar", type: "array", of: [{ type: "footerColumn" }], group: "footer" }),
    defineField({ name: "footerBadges", title: "Alt Rozetler", type: "array", of: [{ type: "string" }], group: "footer" }),
  ],
  preview: {
    prepare() {
      return { title: "Landing Page" };
    },
  },
});
