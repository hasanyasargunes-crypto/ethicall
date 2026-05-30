import { defineField, defineType } from "sanity";

export default defineType({
  name: "trustBadge",
  title: "Uyumluluk Rozeti",
  type: "object",
  fields: [
    defineField({ name: "name", title: "Ad", type: "string", validation: (r) => r.required() }),
    defineField({ name: "description", title: "Aciklama", type: "string" }),
  ],
});
