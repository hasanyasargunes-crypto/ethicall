import { defineField, defineType } from "sanity";

export default defineType({
  name: "seo",
  title: "SEO",
  type: "object",
  fields: [
    defineField({ name: "title", title: "Sayfa Basligi (Title)", type: "string" }),
    defineField({ name: "description", title: "Aciklama (Meta Description)", type: "text", rows: 3 }),
    defineField({ name: "ogImage", title: "OG Image (Sosyal medya gorseli)", type: "image", options: { hotspot: true } }),
    defineField({ name: "keywords", title: "Anahtar Kelimeler", type: "array", of: [{ type: "string" }] }),
  ],
});
