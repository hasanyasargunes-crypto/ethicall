import { defineField, defineType } from "sanity";

export default defineType({
  name: "plan",
  title: "Fiyat Plani",
  type: "object",
  fields: [
    defineField({ name: "name", title: "Plan Adi", type: "string", validation: (r) => r.required() }),
    defineField({ name: "price", title: "Fiyat", type: "string" }),
    defineField({ name: "period", title: "Donem (/ay, /yil)", type: "string" }),
    defineField({ name: "description", title: "Aciklama", type: "string" }),
    defineField({ name: "features", title: "Ozellikler", type: "array", of: [{ type: "string" }] }),
    defineField({ name: "ctaText", title: "Buton Metni", type: "string" }),
    defineField({ name: "featured", title: "One Cikan Plan", type: "boolean", initialValue: false }),
    defineField({ name: "badge", title: "Rozet (EN POPULER vb.)", type: "string" }),
  ],
});
