import { defineField, defineType } from "sanity";

export default defineType({
  name: "faqItem",
  title: "SSS Maddesi",
  type: "object",
  fields: [
    defineField({ name: "question", title: "Soru", type: "string", validation: (r) => r.required() }),
    defineField({ name: "answer", title: "Cevap", type: "text", rows: 4, validation: (r) => r.required() }),
  ],
});
