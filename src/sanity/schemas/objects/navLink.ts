import { defineField, defineType } from "sanity";

export default defineType({
  name: "navLink",
  title: "Nav Link",
  type: "object",
  fields: [
    defineField({ name: "label", title: "Etiket", type: "string", validation: (r) => r.required() }),
    defineField({ name: "href", title: "Link", type: "string", validation: (r) => r.required() }),
  ],
});
