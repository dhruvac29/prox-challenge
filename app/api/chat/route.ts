import { query } from "@anthropic-ai/claude-agent-sdk";
import { NextResponse } from "next/server";
import { localAgent, mergeAgentResponses, searchManual } from "../../../lib/knowledge/tools";

export const runtime = "nodejs";

const systemPrompt = `You are a practical product-support agent for the Vulcan OmniPro 220 welder.
Use the manual snippets provided by the app. Be concise, cite safety-critical limits, and ask a clarifying
question when process, material, input voltage, or wire type is ambiguous. Do not invent exact chart values.`;

export async function POST(request: Request) {
  const { message } = (await request.json()) as { message?: string };
  if (!message?.trim()) {
    return NextResponse.json({ error: "Message is required." }, { status: 400 });
  }

  const local = localAgent(message);
  const key = process.env.ANTHROPIC_API_KEY;

  if (!key || key === "your-api-key-here") {
    return NextResponse.json({ ...local, answer: `${local.answer}\n\nRunning in manual-tool mode because ANTHROPIC_API_KEY is not configured.` });
  }

  try {
    const snippets = searchManual(message)
      .map((chunk) => `- ${chunk.title} (${chunk.citation.label}, page ${chunk.citation.page}): ${chunk.text}`)
      .join("\n");

    let claudeText = "";
    const agentMessages = query({
      prompt: `${systemPrompt}

Question: ${message}

Manual snippets:
${snippets || "No direct snippet matched. Use the deterministic tool result below."}

Deterministic manual-tool result:
${local.answer}`,
      options: {
        model: "sonnet",
        maxTurns: 1,
        tools: [],
        permissionMode: "dontAsk",
        persistSession: false,
        env: {
          ...process.env,
          ANTHROPIC_API_KEY: key,
          CLAUDE_AGENT_SDK_CLIENT_APP: "prox-omnipro-support/1.0.0",
        },
      },
    });

    for await (const agentMessage of agentMessages) {
      if (agentMessage.type === "assistant") {
        claudeText += agentMessage.message.content
          .map((block) => (block.type === "text" ? block.text : ""))
          .join("\n");
      }
    }

    return NextResponse.json(mergeAgentResponses(local, claudeText.trim()));
  } catch (error) {
    console.error(error);
    return NextResponse.json({
      ...local,
      answer: `${local.answer}\n\nClaude call failed, so this answer is from the local manual tools. Check the API key/model if you expected live Claude reasoning.`,
    });
  }
}
