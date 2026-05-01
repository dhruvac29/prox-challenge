"use client";

import { Bot, Send, ShieldAlert, Wrench } from "lucide-react";
import { useMemo, useState } from "react";
import { ArtifactPanel } from "./components/ArtifactPanel";
import type { AgentResponse, ChatMessage } from "../lib/types";

const examples = [
  "What's the duty cycle for MIG welding at 200A on 240V?",
  "I'm getting porosity in my flux-cored welds. What should I check?",
  "What polarity setup do I need for TIG welding? Which socket does the ground clamp go in?",
  "My wire feed motor runs but the wire does not feed properly.",
  "What settings should I use for mild steel?",
];

export default function Home() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Ask me about the Vulcan OmniPro 220. I can cite the manual, draw polarity setups, show duty-cycle limits, and walk through weld defects.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const latestResponse = useMemo(() => [...messages].reverse().find((message) => message.response)?.response, [messages]);

  async function sendMessage(text = input) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    setInput("");
    setLoading(true);
    setMessages((current) => [...current, { role: "user", content: trimmed }]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });
      const data = (await response.json()) as AgentResponse;
      setMessages((current) => [...current, { role: "assistant", content: data.answer, response: data }]);
    } catch {
      setMessages((current) => [...current, { role: "assistant", content: "The agent route failed. Check the dev server logs and API key." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="shell">
      <section className="chat">
        <header className="topbar">
          <div>
            <h1>OmniPro 220 Support Agent</h1>
            <p>Manual-grounded help for setup, polarity, duty cycle, and weld troubleshooting.</p>
          </div>
          <div className="status"><Bot size={16} /> Claude + manual tools</div>
        </header>

        <div className="product-strip">
          <img src="/assets/product.webp" alt="Vulcan OmniPro 220" />
          <div>
            <strong>Vulcan OmniPro 220</strong>
            <span>MIG, flux-cored, TIG, stick. 120V / 240V input.</span>
          </div>
          <div className="safety"><ShieldAlert size={16} /> Power off before changing leads.</div>
        </div>

        <div className="examples">
          {examples.map((example) => (
            <button key={example} onClick={() => sendMessage(example)} disabled={loading}>{example}</button>
          ))}
        </div>

        <div className="messages">
          {messages.map((message, index) => (
            <article key={index} className={`message ${message.role}`}>
              <div className="avatar">{message.role === "assistant" ? <Wrench size={16} /> : "You"}</div>
              <div className="bubble">
                <p>{message.content}</p>
                {message.response?.citations.length ? (
                  <div className="citations">
                    {message.response.citations.map((citation) => (
                      <a key={`${citation.label}-${citation.page}`} href={citation.href} target="_blank" rel="noreferrer">
                        {citation.label}{citation.page ? `, p. ${citation.page}` : ""}
                      </a>
                    ))}
                  </div>
                ) : null}
                {message.response?.followUps.length ? (
                  <div className="followups">
                    {message.response.followUps.map((followUp) => <button key={followUp} onClick={() => sendMessage(followUp)}>{followUp}</button>)}
                  </div>
                ) : null}
              </div>
            </article>
          ))}
          {loading ? <div className="thinking">Checking manual tools and Claude...</div> : null}
        </div>

        <form className="composer" onSubmit={(event) => { event.preventDefault(); void sendMessage(); }}>
          <input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Ask about polarity, duty cycle, porosity, wire feed..." />
          <button type="submit" disabled={loading || !input.trim()} aria-label="Send message"><Send size={18} /></button>
        </form>
      </section>

      <ArtifactPanel artifacts={latestResponse?.artifacts ?? []} />
    </main>
  );
}
