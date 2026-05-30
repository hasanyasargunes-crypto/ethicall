import { defineType, defineField } from "sanity";

export default defineType({
  name: "blogPost",
  title: "Blog Yazısı",
  type: "document",
  icon: () => "📝",
  groups: [
    { name: "content", title: "İçerik", default: true },
    { name: "meta", title: "Meta & SEO" },
  ],
  fields: [
    defineField({
      name: "title",
      title: "Başlık",
      type: "string",
      group: "content",
      validation: (r) => r.required().max(120),
    }),
    defineField({
      name: "slug",
      title: "Slug (URL)",
      type: "slug",
      group: "content",
      options: { source: "title", maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "author",
      title: "Yazar",
      type: "reference",
      to: [{ type: "blogAuthor" }],
      group: "content",
    }),
    defineField({
      name: "coverImage",
      title: "Kapak Görseli",
      type: "image",
      group: "content",
      options: { hotspot: true },
      fields: [
        {
          name: "alt",
          type: "string",
          title: "Alt Metin",
        },
      ],
    }),
    defineField({
      name: "categories",
      title: "Kategoriler",
      type: "array",
      group: "content",
      of: [{ type: "reference", to: [{ type: "blogCategory" }] }],
    }),
    defineField({
      name: "publishedAt",
      title: "Yayın Tarihi",
      type: "datetime",
      group: "content",
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: "featured",
      title: "Öne Çıkan",
      type: "boolean",
      group: "content",
      initialValue: false,
      description: "Blog ana sayfasında büyük gösterilsin mi?",
    }),
    defineField({
      name: "excerpt",
      title: "Özet",
      type: "text",
      group: "content",
      rows: 3,
      validation: (r) => r.max(280),
      description: "Kart ve listelerde gösterilen kısa açıklama (maks 280 karakter)",
    }),
    defineField({
      name: "body",
      title: "İçerik",
      type: "blockContent",
      group: "content",
    }),
    // SEO
    defineField({
      name: "seo",
      title: "SEO Ayarları",
      type: "seo",
      group: "meta",
    }),
  ],
  orderings: [
    {
      title: "Yayın Tarihi (Yeni)",
      name: "publishedAtDesc",
      by: [{ field: "publishedAt", direction: "desc" }],
    },
  ],
  preview: {
    select: {
      title: "title",
      author: "author.name",
      media: "coverImage",
      date: "publishedAt",
    },
    prepare({ title, author, media, date }) {
      const d = date ? new Date(date).toLocaleDateString("tr-TR") : "";
      return {
        title,
        subtitle: [author, d].filter(Boolean).join(" · "),
        media,
      };
    },
  },
});
