import type { Artifact, Citation } from "../types";

export const citations = {
  specs: {
    source: "Owner's Manual",
    page: 7,
    label: "Specifications and rated duty cycles",
    href: "/files/owner-manual.pdf#page=7",
  },
  frontPanel: {
    source: "Owner's Manual",
    page: 8,
    label: "Front panel controls and sockets",
    href: "/files/owner-manual.pdf#page=8",
  },
  interior: {
    source: "Owner's Manual",
    page: 9,
    label: "Interior controls and wire feed mechanism",
    href: "/files/owner-manual.pdf#page=9",
  },
  fluxPolarity: {
    source: "Owner's Manual",
    page: 13,
    label: "DCEN flux-cored polarity setup",
    href: "/files/owner-manual.pdf#page=13",
  },
  migPolarity: {
    source: "Owner's Manual",
    page: 14,
    label: "DCEP solid-core gas-shielded polarity setup",
    href: "/files/owner-manual.pdf#page=14",
  },
  tigStick: {
    source: "Owner's Manual",
    page: 24,
    label: "TIG and stick setup",
    href: "/files/owner-manual.pdf#page=24",
  },
  wireTips: {
    source: "Owner's Manual",
    page: 35,
    label: "Wire weld diagnosis and CTWD guidance",
    href: "/files/owner-manual.pdf#page=35",
  },
  porosity: {
    source: "Owner's Manual",
    page: 37,
    label: "Wire weld porosity causes and solutions",
    href: "/files/owner-manual.pdf#page=37",
  },
  troubleshooting: {
    source: "Owner's Manual",
    page: 42,
    label: "MIG / flux-cored troubleshooting table",
    href: "/files/owner-manual.pdf#page=42",
  },
  quickStart: {
    source: "Quick Start Guide",
    page: 1,
    label: "Wire spool loading and feed mechanism",
    href: "/files/quick-start-guide.pdf#page=1",
  },
} satisfies Record<string, Citation>;

export const dutyCycles = [
  { process: "MIG", input: "120V", amps: 100, duty: 40, note: "100% duty cycle is rated at 75A." },
  { process: "MIG", input: "240V", amps: 200, duty: 25, note: "100% duty cycle is rated at 115A." },
  { process: "TIG", input: "120V", amps: 125, duty: 40, note: "100% duty cycle is rated at 90A." },
  { process: "TIG", input: "240V", amps: 175, duty: 30, note: "100% duty cycle is rated at 105A." },
  { process: "Stick", input: "120V", amps: 80, duty: 40, note: "100% duty cycle is rated at 60A." },
  { process: "Stick", input: "240V", amps: 175, duty: 25, note: "100% duty cycle is rated at 100A." },
] as const;

export const polarity = {
  mig: {
    name: "MIG solid-core gas-shielded",
    electrode: "DCEP",
    ground: "Negative (-) socket",
    powerLead: "Wire Feed Power Cable to Positive (+) socket",
    gas: "Use the shielding gas recommended by the wire supplier.",
    citation: citations.migPolarity,
  },
  "flux-cored": {
    name: "Flux-cored gasless",
    electrode: "DCEN",
    ground: "Positive (+) socket",
    powerLead: "Wire Feed Power Cable to Negative (-) socket",
    gas: "No shielding gas for gasless flux-cored wire.",
    citation: citations.fluxPolarity,
  },
  tig: {
    name: "TIG",
    electrode: "DCEN",
    ground: "Positive (+) socket",
    powerLead: "TIG torch to Negative (-) socket",
    gas: "Use argon shielding gas and follow the TIG setup flow.",
    citation: citations.tigStick,
  },
  stick: {
    name: "Stick",
    electrode: "Rod-dependent",
    ground: "Use the polarity recommended for the electrode.",
    powerLead: "Electrode holder goes to the matching socket for that rod.",
    gas: "No shielding gas.",
    citation: citations.tigStick,
  },
} as const;

export const manualChunks = [
  {
    title: "Specifications",
    text: "The OmniPro 220 supports MIG, flux-cored, TIG, and stick welding. MIG runs 30-140A on 120V and 30-220A on 240V. TIG runs 10-125A on 120V and 10-175A on 240V. Stick runs 10-80A on 120V and 10-175A on 240V. Do not use an extension cord.",
    citation: citations.specs,
  },
  {
    title: "Front controls",
    text: "The front panel includes the MIG gun/spool gun cable socket, negative socket, positive socket, spool gun gas outlet, LCD display, knobs, power switch, and storage compartment.",
    citation: citations.frontPanel,
  },
  {
    title: "Interior wire feed",
    text: "The interior controls include cold wire feed switch, idler arm, wire feed mechanism, wire spool, spool knob, feed tensioner, wire inlet liner, feed roller knob, wire feed control socket, and foot pedal socket.",
    citation: citations.interior,
  },
  {
    title: "Porosity diagnosis",
    text: "Wire weld porosity means small cavities or holes in the bead. Possible causes include incorrect polarity, insufficient shielding gas for MIG, incorrect shielding gas, dirty workpiece or wire, inconsistent travel speed, and CTWD too long.",
    citation: citations.porosity,
  },
  {
    title: "Wire feed problems",
    text: "If the wire feed motor runs but wire does not feed properly, check wire feed pressure, roller size, gun/cable/liner damage, and whether the feed tensioner is too tight. Bird nesting can be caused by excess pressure, incorrect contact tip size, an incompletely inserted gun cable connector, or damaged liner.",
    citation: citations.troubleshooting,
  },
  {
    title: "Wire weld diagnosis",
    text: "For inadequate penetration, reduce travel speed, increase weld current, increase wire feed speed, maintain 1/2 inch or less CTWD, and keep the arc on the leading edge of the puddle. For too much heat, reduce wire feed/current or travel faster.",
    citation: citations.wireTips,
  },
];

export const defaultArtifacts: Artifact[] = [
  {
    type: "manual-image",
    title: "Product reference",
    image: "/assets/product.webp",
    caption: "Exterior view of the Vulcan OmniPro 220.",
  },
  {
    type: "manual-image",
    title: "Wire feed compartment",
    image: "/assets/product-inside.webp",
    caption: "Inside door and wire feed area for setup reference.",
  },
];
