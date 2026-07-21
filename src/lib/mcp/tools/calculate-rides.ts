import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

export default defineTool({
  name: "calculate_rides",
  title: "Calculate remaining rides",
  description:
    "Given a current T-Cash balance and a fare per ride (both in PKR), returns how many full rides remain and the leftover balance.",
  inputSchema: {
    balance: z
      .number()
      .min(0)
      .describe("Current card balance in PKR."),
    fare: z
      .number()
      .positive()
      .describe("Fare per ride in PKR. Defaults to 30 in the app."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ balance, fare }) => {
    const rides = Math.floor(balance / fare);
    const leftover = +(balance - rides * fare).toFixed(2);
    return {
      content: [
        {
          type: "text",
          text: `With Rs. ${balance} at Rs. ${fare}/ride you get ${rides} full ride${
            rides === 1 ? "" : "s"
          } (Rs. ${leftover} left over).`,
        },
      ],
      structuredContent: { rides, leftover, balance, fare },
    };
  },
});
