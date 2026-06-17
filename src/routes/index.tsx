import { createFileRoute } from "@tanstack/react-router";
import { TCashApp } from "@/components/tcash/TCashApp";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "T-Cash Tracker — Bus Card Balance" },
      {
        name: "description",
        content:
          "Track your T-Cash bus card balance, log fares and view trip history. Offline-first PWA.",
      },
    ],
  }),
  component: TCashApp,
});
