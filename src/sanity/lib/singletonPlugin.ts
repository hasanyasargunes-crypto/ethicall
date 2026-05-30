import type { DocumentActionComponent } from "sanity";

const SINGLETON_TYPES = new Set(["landingPage"]);

export const singletonPlugin = {
  name: "singleton",
  document: {
    actions: (prev: DocumentActionComponent[], context: { schemaType: string }) => {
      if (SINGLETON_TYPES.has(context.schemaType)) {
        return prev.filter(
          (action) => !["duplicate", "delete", "unpublish"].includes(action.action ?? "")
        );
      }
      return prev;
    },
    newDocumentOptions: (prev: Array<{ templateId: string }>) =>
      prev.filter((item) => !SINGLETON_TYPES.has(item.templateId)),
  },
};
