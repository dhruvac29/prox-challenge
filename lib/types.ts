export type Citation = {
  source: "Owner's Manual" | "Quick Start Guide" | "Selection Chart" | "Product Photo";
  page?: number;
  label: string;
  href?: string;
};

export type Artifact =
  | { type: "polarity"; process: "mig" | "flux-cored" | "tig" | "stick"; title: string }
  | { type: "duty-cycle"; title: string; process?: string; inputVoltage?: "120V" | "240V" }
  | { type: "flowchart"; title: string; steps: string[] }
  | { type: "settings"; title: string }
  | { type: "manual-image"; title: string; image: string; caption: string };

export type AgentResponse = {
  answer: string;
  citations: Citation[];
  artifacts: Artifact[];
  followUps: string[];
};

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  response?: AgentResponse;
};
