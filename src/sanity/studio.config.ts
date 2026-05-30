import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemas } from "./schemas";

export default defineConfig({
  name: "ethicall-studio",
  title: "EthicAll CMS",
  projectId: "k4ig95cu",
  dataset: "production",
  basePath: "/studio",
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title("İçerik Yönetimi")
          .items([
            // Landing Page (singleton)
            S.listItem()
              .title("Landing Page")
              .id("landingPage")
              .icon(() => "🏠")
              .child(S.document().schemaType("landingPage").documentId("landingPage")),
            S.divider(),
            // Blog
            S.listItem()
              .title("Blog Yazıları")
              .id("blogPosts")
              .icon(() => "📝")
              .child(
                S.documentTypeList("blogPost")
                  .title("Blog Yazıları")
                  .defaultOrdering([{ field: "publishedAt", direction: "desc" }]),
              ),
            S.listItem()
              .title("Yazarlar")
              .id("blogAuthors")
              .icon(() => "✍️")
              .child(S.documentTypeList("blogAuthor").title("Yazarlar")),
            S.listItem()
              .title("Kategoriler")
              .id("blogCategories")
              .icon(() => "🏷️")
              .child(S.documentTypeList("blogCategory").title("Kategoriler")),
          ]),
    }),
    visionTool({ defaultApiVersion: "2024-01-01" }),
  ],
  schema: { types: schemas },
});
