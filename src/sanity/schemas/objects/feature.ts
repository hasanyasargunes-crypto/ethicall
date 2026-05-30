import { defineField, defineType } from "sanity";

export default defineType({
  name: "feature",
  title: "Ozellik",
  type: "object",
  fields: [
    defineField({ name: "iconName", title: "Ikon Adi", type: "string", validation: (r) => r.required() }),
    defineField({ name: "title", title: "Baslik", type: "string", validation: (r) => r.required() }),
    defineField({ name: "description", title: "Aciklama", type: "text", rows: 3 }),
  ],
});
