import { defineField, defineType } from "sanity";

export default defineType({
  name: "footerColumn",
  title: "Footer Kolonu",
  type: "object",
  fields: [
    defineField({ name: "title", title: "Kolon Basligi", type: "string", validation: (r) => r.required() }),
    defineField({ name: "links", title: "Linkler", type: "array", of: [{ type: "navLink" }] }),
  ],
});
