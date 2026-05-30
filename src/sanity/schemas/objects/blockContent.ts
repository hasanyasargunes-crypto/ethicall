import { defineType, defineArrayMember } from "sanity";

export default defineType({
  name: "blockContent",
  title: "İçerik",
  type: "array",
  of: [
    defineArrayMember({
      type: "block",
      styles: [
        { title: "Normal", value: "normal" },
        { title: "Başlık 2", value: "h2" },
        { title: "Başlık 3", value: "h3" },
        { title: "Başlık 4", value: "h4" },
        { title: "Alıntı", value: "blockquote" },
      ],
      lists: [
        { title: "Madde İşareti", value: "bullet" },
        { title: "Numaralı", value: "number" },
      ],
      marks: {
        decorators: [
          { title: "Kalın", value: "strong" },
          { title: "İtalik", value: "em" },
          { title: "Altı Çizili", value: "underline" },
          { title: "Kod", value: "code" },
        ],
        annotations: [
          {
            name: "link",
            type: "object",
            title: "Link",
            fields: [
              {
                name: "href",
                type: "url",
                title: "URL",
                validation: (r: any) =>
                  r.uri({ allowRelative: true, scheme: ["http", "https", "mailto"] }),
              },
              {
                name: "blank",
                type: "boolean",
                title: "Yeni sekmede aç",
                initialValue: true,
              },
            ],
          },
        ],
      },
    }),
    defineArrayMember({
      type: "image",
      options: { hotspot: true },
      fields: [
        {
          name: "alt",
          type: "string",
          title: "Alt Metin",
          description: "SEO ve erişilebilirlik için önemli",
        },
        {
          name: "caption",
          type: "string",
          title: "Açıklama",
        },
      ],
    }),
  ],
});
