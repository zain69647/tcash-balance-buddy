import { defineMcp } from "@lovable.dev/mcp-js";
import aboutAppTool from "./tools/about-app";
import calculateRidesTool from "./tools/calculate-rides";

export default defineMcp({
  name: "t-cash-tracker-mcp",
  title: "T-Cash Tracker",
  version: "0.1.0",
  instructions:
    "Public, read-only tools for the T-Cash Tracker PWA. Use `about_app` to describe the app and `calculate_rides` to work out how many bus rides a given balance covers at a given fare (PKR). No user data is exposed — the app stores everything locally on each user's device.",
  tools: [aboutAppTool, calculateRidesTool],
});
