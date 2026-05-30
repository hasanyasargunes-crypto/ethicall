import { defineField, defineType } from "sanity";

export default defineType({
  name: "product",
  title: "Urun",
  type: "object",
  fields: [
    defineField({ name: "iconName", title: "Ikon Adi (whistle, user, truck vb.)", type: "string", validation: (r) => r.required() }),
    defineField({ name: "tag", title: "Etiket (ANA URUN, MODUL)", type: "string" }),
    defineField({ name: "name", title: "Urun Adi", type: "string", validation: (r) => r.required() }),
    defineField({ name: "tagline", title: "Alt Baslik", type: "string" }),
    defineField({ name: "description", title: "Aciklama", type: "text", rows: 3 }),
    defineField({ name: "points", title: "Ozellikler", type: "array", of: [{ type: "string" }] }),
    defineField({ name: "featured", title: "One Cikan", type: "boolean", initialValue: false }),
    defineField({ name: "linkText", title: "Link Metni", type: "string", initialValue: "Detayli incele" }),
  ],
});
