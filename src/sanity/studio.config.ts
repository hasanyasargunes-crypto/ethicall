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
          .title("Icerik Yonetimi")
          .items([
            S.listItem()
              .title("Landing Page")
              .id("landingPage")
              .child(S.document().schemaType("landingPage").documentId("landingPage")),
          ]),
    }),
    visionTool({ defaultApiVersion: "2024-01-01" }),
  ],
  schema: { types: schemas },
});
