import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

export default defineTool({
  name: "about_app",
  title: "About T-Cash Tracker",
  description:
    "Returns a description of the T-Cash Tracker app: what it does, how manual balance tracking works, and its offline-first, not-official disclaimer.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => ({
    content: [
      {
        type: "text",
        text: [
          "T-Cash Tracker is a mobile-first PWA for manually tracking a T-Cash bus card balance.",
          "",
          "How it works:",
          "1. Add funds to reflect how much you think is on your card.",
          "2. Tap the red Deduct button (default Rs. 30) each time you take a ride.",
          "3. The balance updates and every change is saved as a transaction.",
          "",
          "Notes:",
          "- Not an official T-Cash app. It is not connected to your real card.",
          "- Fully offline after first load. Data is stored only on your device.",
          "- Currency is fixed to PKR.",
        ].join("\n"),
      },
    ],
  }),
});
