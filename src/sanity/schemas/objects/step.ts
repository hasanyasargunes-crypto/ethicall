import { defineField, defineType } from "sanity";

export default defineType({
  name: "step",
  title: "Adim",
  type: "object",
  fields: [
    defineField({ name: "num", title: "Numara (01, 02...)", type: "string", validation: (r) => r.required() }),
    defineField({ name: "iconName", title: "Ikon Adi", type: "string", validation: (r) => r.required() }),
    defineField({ name: "title", title: "Baslik", type: "string", validation: (r) => r.required() }),
    defineField({ name: "description", title: "Aciklama", type: "text", rows: 3 }),
  ],
});
