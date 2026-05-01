import type { AgentResponse, Artifact, Citation } from "../types";
import { citations, defaultArtifacts, dutyCycles, manualChunks, polarity } from "./manual-data";

const normalize = (value: string) => value.toLowerCase();

export function searchManual(query: string) {
  const terms = normalize(query).split(/\W+/).filter(Boolean);
  return manualChunks
    .map((chunk) => ({
      ...chunk,
      score: terms.reduce((score, term) => score + (normalize(chunk.text + chunk.title).includes(term) ? 1 : 0), 0),
    }))
    .filter((chunk) => chunk.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);
}

export function getDutyCycle(question: string): AgentResponse {
  const q = normalize(question);
  const process = q.includes("tig") ? "TIG" : q.includes("stick") ? "Stick" : "MIG";
  const input = q.includes("120") ? "120V" : "240V";
  const amps = Number(q.match(/(\d{2,3})\s*a/)?.[1] ?? q.match(/(\d{2,3})\s*amp/)?.[1]);
  const rows = dutyCycles.filter((row) => row.process === process && row.input === input);
  const exact = rows.find((row) => row.amps === amps) ?? rows[0];
  const qualifier = amps && exact.amps !== amps ? ` The manual does not list an exact ${amps}A duty cycle for ${process} on ${input}; the closest published rating is` : "";

  return {
    answer: `${qualifier || `For ${process} on ${input},`} the rated duty cycle is ${exact.duty}% at ${exact.amps}A. ${exact.note} Treat duty cycle as a thermal limit: in a 10-minute window, ${exact.duty}% means about ${Math.round(exact.duty / 10)} minutes welding and the rest cooling.`,
    citations: [citations.specs],
    artifacts: [{ type: "duty-cycle", title: "Duty cycle calculator", process, inputVoltage: input }],
    followUps: ["What input voltage are you plugged into?", "Which process are you using: MIG, TIG, stick, or flux-cored?"],
  };
}

export function getPolaritySetup(question: string): AgentResponse {
  const q = normalize(question);
  const process = q.includes("tig") ? "tig" : q.includes("stick") ? "stick" : q.includes("flux") || q.includes("gasless") ? "flux-cored" : "mig";
  const setup = polarity[process];

  return {
    answer: `${setup.name} setup: use ${setup.electrode}. Put the work clamp/ground in the ${setup.ground}. ${setup.powerLead}. ${setup.gas} Turn the welder off and unplug it before changing leads, then twist the plugs fully clockwise to lock them.`,
    citations: [setup.citation, citations.frontPanel],
    artifacts: [{ type: "polarity", process, title: `${setup.name} polarity diagram` }],
    followUps: process === "stick" ? ["Which electrode/rod are you using? Stick polarity depends on the rod."] : [],
  };
}

export function diagnose(question: string): AgentResponse {
  const q = normalize(question);
  const isPorosity = q.includes("porosity") || q.includes("holes") || q.includes("cavities");
  const isWireFeed = q.includes("wire") && (q.includes("feed") || q.includes("bird") || q.includes("nest") || q.includes("stops"));
  const citationsList: Citation[] = isWireFeed ? [citations.troubleshooting, citations.interior] : [citations.porosity, citations.wireTips];
  const steps = isWireFeed
    ? [
        "Turn the welder off, unplug it, and discharge the gun to ground.",
        "Check feed pressure: too little slips, too much can deform flux-cored wire.",
        "Confirm the feed roller groove matches the wire diameter.",
        "Inspect the contact tip size and replace worn or wrong-size tips.",
        "Straighten the gun cable and inspect the liner if the wire stops.",
        "Make sure the gun cable connector is fully seated in the wire feed mechanism.",
      ]
    : [
        "Check polarity first: MIG solid wire should be DCEP; gasless flux-cored should be DCEN.",
        "For MIG, verify gas flow, clean the nozzle, and use the gas recommended by the wire supplier.",
        "Clean the workpiece to bare metal and use clean wire without oil, coating, or residue.",
        "Shorten CTWD to the manual guidance of 1/2 inch or less.",
        "Keep travel speed steady and avoid outrunning the shielding envelope.",
      ];

  return {
    answer: isPorosity
      ? "Porosity is usually shielding or contamination before it is a machine failure. Start with polarity, gas/nozzle coverage for MIG, clean base metal and wire, then CTWD and steady travel speed."
      : isWireFeed
        ? "Wire-feed trouble is usually pressure, roller size, contact tip, cable/liner drag, or a connector seating issue. Work through the checks in order before replacing parts."
        : "For weld-quality issues, first identify the visible defect, then check polarity, heat/travel speed, CTWD, base-metal cleanliness, and wire/feed condition.",
    citations: citationsList,
    artifacts: [
      { type: "flowchart", title: isWireFeed ? "Wire feed troubleshooting flow" : "Porosity troubleshooting flow", steps },
      {
        type: "manual-image",
        title: "Wire feed compartment",
        image: "/assets/product-inside.webp",
        caption: "Use this to locate the spool, tensioner, idler arm, and feed mechanism.",
      },
    ],
    followUps: ["Are you running solid MIG wire with gas, or gasless flux-cored wire?", "What wire diameter and material thickness are you using?"],
  };
}

export function settingsConfigurator(question: string): AgentResponse {
  return {
    answer: "I can help choose a starting setup, but the exact chart values depend on process, wire type/diameter, material, thickness, and input voltage. Use the configurator to lock those inputs, then fine tune by bead shape: if penetration is low, add heat or slow down; if burn-through happens, reduce heat or travel faster.",
    citations: [citations.specs, citations.wireTips],
    artifacts: [{ type: "settings", title: "Settings configurator" }],
    followUps: ["What material and thickness are you welding?", "What wire type and diameter are installed?", "Are you on 120V or 240V?"],
  };
}

export function localAgent(question: string): AgentResponse {
  const q = normalize(question);
  if (q.includes("duty") || q.includes("cycle")) return getDutyCycle(question);
  if (q.includes("polarity") || q.includes("socket") || q.includes("ground clamp") || q.includes("negative") || q.includes("positive")) return getPolaritySetup(question);
  if (q.includes("porosity") || q.includes("bird") || q.includes("feed") || q.includes("spatter") || q.includes("holes") || q.includes("wire stops")) return diagnose(question);
  if (q.includes("setting") || q.includes("voltage") || q.includes("wire speed") || q.includes("thickness")) return settingsConfigurator(question);

  const chunks = searchManual(question);
  return {
    answer: chunks.length
      ? `Here is the relevant manual guidance: ${chunks.map((chunk) => chunk.text).join(" ")}`
      : "I can help with setup, duty cycle, polarity, wire feed, porosity, weld diagnosis, and settings for the Vulcan OmniPro 220. Ask a specific process or symptom and I will cite the manual and show a visual when useful.",
    citations: chunks.map((chunk) => chunk.citation),
    artifacts: chunks.some((chunk) => chunk.title.includes("Interior")) ? defaultArtifacts : defaultArtifacts.slice(0, 1),
    followUps: ["Which welding process are you using?", "Are you connected to 120V or 240V input?"],
  };
}

export function mergeAgentResponses(local: AgentResponse, claudeText?: string): AgentResponse {
  if (!claudeText) return local;
  return {
    ...local,
    answer: `${claudeText}\n\nManual-backed check: ${local.answer}`,
  };
}
