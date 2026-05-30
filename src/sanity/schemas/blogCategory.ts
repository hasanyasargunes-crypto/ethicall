import { defineType, defineField } from "sanity";

export default defineType({
  name: "blogCategory",
  title: "Blog Kategorisi",
  type: "document",
  icon: () => "🏷️",
  fields: [
    defineField({
      name: "title",
      title: "Kategori Adı",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "description",
      title: "Açıklama",
      type: "text",
      rows: 2,
    }),
  ],
  preview: {
    select: { title: "title" },
  },
});
