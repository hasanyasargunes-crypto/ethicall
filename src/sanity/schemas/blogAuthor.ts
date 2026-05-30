import { defineType, defineField } from "sanity";

export default defineType({
  name: "blogAuthor",
  title: "Blog Yazarı",
  type: "document",
  icon: () => "✍️",
  fields: [
    defineField({
      name: "name",
      title: "Ad Soyad",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "name", maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "avatar",
      title: "Profil Fotoğrafı",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "bio",
      title: "Biyografi",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "role",
      title: "Ünvan",
      type: "string",
      placeholder: "örn: İçerik Editörü",
    }),
  ],
  preview: {
    select: { title: "name", media: "avatar", subtitle: "role" },
  },
});
