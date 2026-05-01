import type { Metadata } from "next";
import "./styles.css";

export const metadata: Metadata = {
  title: "OmniPro Support Agent",
  description: "Multimodal support agent for the Vulcan OmniPro 220 welder.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
