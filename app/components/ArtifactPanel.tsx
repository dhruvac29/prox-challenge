"use client";

import { Calculator, FileText, GitBranch, PlugZap, SlidersHorizontal } from "lucide-react";
import type { Artifact } from "../../lib/types";

const socketStyle = "grid h-24 w-24 place-items-center rounded-full border-4 bg-white text-center text-sm font-bold shadow-sm";

function PolarityDiagram({ artifact }: { artifact: Extract<Artifact, { type: "polarity" }> }) {
  const data = {
    mig: { name: "MIG Solid Wire", ground: "Ground clamp", groundSocket: "-", torch: "Wire feed power", torchSocket: "+", note: "DCEP with shielding gas" },
    "flux-cored": { name: "Flux-Cored", ground: "Ground clamp", groundSocket: "+", torch: "Wire feed power", torchSocket: "-", note: "DCEN gasless" },
    tig: { name: "TIG", ground: "Ground clamp", groundSocket: "+", torch: "TIG torch", torchSocket: "-", note: "DCEN with argon" },
    stick: { name: "Stick", ground: "Work clamp", groundSocket: "rod", torch: "Electrode holder", torchSocket: "rod", note: "Match electrode spec" },
  }[artifact.process];

  return (
    <div className="artifact">
      <div className="artifact-title"><PlugZap size={18} />{artifact.title}</div>
      <div className="machine-face">
        <div className="display">LCD</div>
        <div className={`${socketStyle} socket-neg`}>Negative<br />Socket</div>
        <div className={`${socketStyle} socket-pos`}>Positive<br />Socket</div>
      </div>
      <div className="lead-grid">
        <div><strong>{data.torch}</strong><span>goes to {data.torchSocket === "rod" ? "socket required by rod" : `${data.torchSocket} socket`}</span></div>
        <div><strong>{data.ground}</strong><span>goes to {data.groundSocket === "rod" ? "opposite/rod-specified socket" : `${data.groundSocket} socket`}</span></div>
      </div>
      <p className="muted">{data.name}: {data.note}. Power off and unplug before moving leads.</p>
    </div>
  );
}

function DutyCycle() {
  return (
    <div className="artifact">
      <div className="artifact-title"><Calculator size={18} />Duty cycle reference</div>
      <div className="duty-grid">
        {[
          ["MIG 120V", "40% @ 100A", "100% @ 75A"],
          ["MIG 240V", "25% @ 200A", "100% @ 115A"],
          ["TIG 120V", "40% @ 125A", "100% @ 90A"],
          ["TIG 240V", "30% @ 175A", "100% @ 105A"],
          ["Stick 120V", "40% @ 80A", "100% @ 60A"],
          ["Stick 240V", "25% @ 175A", "100% @ 100A"],
        ].map(([label, peak, continuous]) => (
          <div className="duty-card" key={label}>
            <strong>{label}</strong>
            <span>{peak}</span>
            <small>{continuous}</small>
          </div>
        ))}
      </div>
    </div>
  );
}

function Flowchart({ artifact }: { artifact: Extract<Artifact, { type: "flowchart" }> }) {
  return (
    <div className="artifact">
      <div className="artifact-title"><GitBranch size={18} />{artifact.title}</div>
      <ol className="flow">
        {artifact.steps.map((step) => <li key={step}>{step}</li>)}
      </ol>
    </div>
  );
}

function Settings() {
  return (
    <div className="artifact">
      <div className="artifact-title"><SlidersHorizontal size={18} />Settings configurator</div>
      <div className="settings-grid">
        {["Process", "Material", "Thickness", "Wire", "Input"].map((label) => (
          <label key={label}>
            {label}
            <select defaultValue="">
              <option value="" disabled>Choose</option>
              <option>MIG</option>
              <option>Flux-cored</option>
              <option>TIG</option>
              <option>Stick</option>
            </select>
          </label>
        ))}
      </div>
      <p className="muted">This intentionally asks for missing inputs instead of inventing exact chart values.</p>
    </div>
  );
}

function ManualImage({ artifact }: { artifact: Extract<Artifact, { type: "manual-image" }> }) {
  return (
    <div className="artifact">
      <div className="artifact-title"><FileText size={18} />{artifact.title}</div>
      <img src={artifact.image} alt={artifact.caption} className="manual-image" />
      <p className="muted">{artifact.caption}</p>
    </div>
  );
}

export function ArtifactPanel({ artifacts }: { artifacts: Artifact[] }) {
  return (
    <aside className="panel">
      <h2>Visual Workspace</h2>
      {artifacts.length === 0 ? <p className="muted">Ask about polarity, duty cycle, porosity, wire feed, or settings to generate diagrams and tools.</p> : null}
      {artifacts.map((artifact, index) => {
        if (artifact.type === "polarity") return <PolarityDiagram key={index} artifact={artifact} />;
        if (artifact.type === "duty-cycle") return <DutyCycle key={index} />;
        if (artifact.type === "flowchart") return <Flowchart key={index} artifact={artifact} />;
        if (artifact.type === "settings") return <Settings key={index} />;
        return <ManualImage key={index} artifact={artifact} />;
      })}
    </aside>
  );
}
