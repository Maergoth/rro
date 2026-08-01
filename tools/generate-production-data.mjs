import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("../", import.meta.url));
const CORE = resolve(ROOT, "packages/game-data/core");
const roles = JSON.parse(readFileSync(resolve(CORE, "roles.json"), "utf8"));

const effectCycle = [
  ["perception", 8, "Shows earlier and clearer role cues."],
  ["speed", 6, "Reduces execution and transition time without skipping decisions."],
  ["recovery", 10, "Improves recovery quality after a partial failure."],
  ["capacity", 1, "Adds one safe concurrent state slot for matching tasks."],
  ["safety", 8, "Raises the safe quality floor for matching work."],
  ["handoff", 10, "Improves structured callouts and crew handoffs."],
  ["stress", 12, "Reduces stress gained while this branch is under pressure."],
  ["capstone", 1, "Unlocks the branch's signature active technique."],
];

const branchNames = {
  manager: {
    flow: ["Preflight", "Live Read", "Queue Sense", "Seat Throttle", "Expedite", "Bottleneck Break", "Command Presence", "Service Conductor"],
    people: ["Five-Minute Huddle", "Read the Room", "Break Guard", "Calm Correction", "In the Moment", "Cross-Train Plan", "Retention Talk", "Crew Trust"],
    compliance: ["HACCP Eyes", "Log Discipline", "Root Cause", "Containment", "Clean Recovery", "Inspector Rapport", "Safety Culture", "Zero Surprise"],
  },
  owner: {
    hospitality: ["House Welcome", "Regular Memory", "Community Table", "Recovery Reserve", "Brand Promise", "VIP Read", "Neighborhood Institution", "House Legacy"],
    capital: ["Cash Position", "Quote Compare", "Maintenance Reserve", "Vendor Terms", "Bridge Finance", "Portfolio Discipline", "Patient Capital", "Durable Operator"],
    expansion: ["Site Read", "Lease Sense", "Opening Runway", "Second Set of Keys", "Regional Buyer", "Delegated Standards", "Multi-Unit View", "Hospitality Group"],
  },
  server: {
    timing: ["Section Setup", "Seat Memory", "Silent Cues", "Route Chain", "Tray Geometry", "Pace Read", "Invisible Service", "Dining Captain"],
    sales: ["Menu Map", "Modifier Fluency", "Ingredient Recall", "Value Match", "Pairing Sense", "Allergy Confirmation", "Confident Guide", "Menu Steward"],
    recovery: ["Listen First", "Name the Issue", "Authority Read", "Measured Remedy", "Own the Fix", "Follow Through", "Lasting Recovery", "House Favorite"],
  },
  dishwasher: {
    flow: ["Intake Order", "Rack Geometry", "Spray Paths", "Cycle Chain", "Shortage Sight", "Landing Zone", "Pit Rhythm", "Endless Rack"],
    chemistry: ["Test Strip", "Material Care", "Soil Read", "Temperature Window", "Batch Recall", "Root-Cause Wash", "Sanitation Rescue", "Clean Certainty"],
    reliability: ["Safe Hands", "Breakage Guard", "Machine Ear", "Preventative Pull", "Utility Runner", "Deep-Close Habit", "Unshakeable", "Pit Anchor"],
  },
  chef: {
    cuisine: ["Spec Memory", "Taste Baseline", "Yield Eye", "Portion Truth", "Ingredient Voice", "Menu Cost Sense", "Recipe Authority", "House Cuisine"],
    expo: ["Rail Order", "All-Day Count", "Call and Answer", "Hold Control", "Pickup Window", "Refire Command", "Whole-Rail Sight", "Perfect Pass"],
    leadership: ["Line Check", "Precise Call", "Calm Refire", "Safety Culture", "Coach the Cause", "Station Trust", "Brigade Tempo", "Kitchen Standard"],
  },
  cook: {
    stations: ["Station Setup", "Heat Zones", "Pan Memory", "Doneness Read", "Rest Window", "Modifier Lane", "Station Rescue", "Station Master"],
    mise: ["Sharp Start", "Prep Dependencies", "Batch Scale", "Par Sense", "FIFO Hands", "Yield Discipline", "Perfect Readiness", "Mise Complete"],
    tempo: ["Call Back", "Pickup Sense", "Safe Acceleration", "Hold Recovery", "Multi-Process", "Second Wind", "Rush Clarity", "Unbroken Tempo"],
  },
  "host-busser": {
    door: ["Warm Arrival", "Quote Band", "Reservation Read", "Expectation Reset", "Fair Queue", "Regular Welcome", "Door Authority", "Maître d'"],
    room: ["Table Graph", "Section Balance", "Combination Sight", "Accessible Route", "Turn Forecast", "Congestion Read", "Room Conductor", "Perfect Floor"],
    support: ["Room Scan", "Pre-Bus Cue", "Stack Balance", "Reset Chain", "Spill Response", "Silent Support", "Turnover Captain", "Room Restored"],
  },
};

const fundamentals = {
  manager: ["Manager's Notebook", "Clear Delegation", "Cross-Role Literacy", "Shift Handoff"],
  owner: ["Owner's Ledger", "House Standards", "Operator Network", "Succession Notes"],
  server: ["Server Book", "Section Voice", "Safe Carry", "Checkout Discipline"],
  dishwasher: ["Pit Safety", "Clean/Dry Divide", "Downstream Awareness", "Close Ready"],
  chef: ["Chef's Book", "Pass Voice", "Food-Safety Authority", "Kitchen Handoff"],
  cook: ["Cook's Mise", "Behind and Corner", "Clean as You Go", "Station Handoff"],
  "host-busser": ["Door Book", "Room Voice", "Safe Bussing", "Closing Circuit"],
};

const progression = roles.filter((role) => role.kind === "base").map((role) => {
  const branches = {};
  for (const branch of role.branches) {
    const labels = branchNames[role.id]?.[branch.id];
    if (!labels || labels.length !== 8) throw new Error(`Missing eight-node path for ${role.id}/${branch.id}`);
    let previousId = null;
    branches[branch.id] = labels.map((label, index) => {
      const [type, value, description] = effectCycle[index];
      const id = `${role.id}-${branch.id}-${index + 1}`;
      const node = {
        id,
        label,
        cost: index < 2 ? 1 : index < 6 ? 2 : 3,
        requires: previousId,
        description,
        effect: { type, value, roleId: role.id, branchId: branch.id },
      };
      previousId = id;
      return node;
    });
  }
  return {
    roleId: role.id,
    fundamentals: fundamentals[role.id].map((label, index) => ({
      id: `${role.id}-fundamental-${index + 1}`,
      label,
      cost: index < 2 ? 1 : 2,
      requires: index ? `${role.id}-fundamental-${index}` : null,
      description: ["Clarifies owned work and its world cues.", "Improves structured crew communication.", "Reduces ordinary off-role penalties by 3%.", "Improves join-in-progress and clock-out handoffs."][index],
      effect: { type: ["perception", "handoff", "cross-training", "handoff"][index], value: [5, 8, 3, 12][index], roleId: role.id },
    })),
    branches,
  };
});

const activityCatalog = {
  manager: [
    ["lineup-deployment", "Lineup and Deployment", "allocation", "admin"], ["operations-board", "Operations Board", "orchestration", "now"], ["seating-throttle", "Seating Throttle", "orchestration", "next"], ["labor-breaks", "Labor and Breaks", "scheduling", "next"], ["guest-recovery", "Guest Recovery", "dialogue", "now"], ["comp-void-control", "Comp and Void Control", "evidence", "admin"], ["sanitation-walk", "Sanitation Walk", "diagnosis", "prevent"], ["incident-command", "Incident Command", "orchestration", "now"], ["incident-reconstruction", "Incident Reconstruction", "evidence", "admin"], ["coaching-intervention", "Coaching Intervention", "dialogue", "prevent"], ["close-control", "Close Control", "evidence", "admin"],
  ],
  owner: [
    ["cash-runway", "Cash Runway", "allocation", "now"], ["capital-portfolio", "Capital Portfolio", "allocation", "next"], ["vendor-negotiation", "Vendor Negotiation", "dialogue", "now"], ["purchase-authorization", "Purchase Authorization", "allocation", "admin"], ["menu-engineering", "Menu Engineering", "construction", "prevent"], ["brand-watch", "Brand Watch", "diagnosis", "prevent"], ["policy-desk", "Policy Desk", "evidence", "admin"], ["maintenance-portfolio", "Maintenance Portfolio", "allocation", "next"], ["community-hosting", "Community and VIP Hosting", "dialogue", "now"], ["insurance-lease", "Insurance and Lease Response", "evidence", "admin"], ["site-expansion", "Site and Expansion", "construction", "prevent"],
  ],
  server: [
    ["party-pre-read", "Party Pre-Read", "memory", "next"], ["contextual-greeting", "Contextual Greeting", "dialogue", "now"], ["beverage-discovery", "Beverage Discovery", "dialogue", "now"], ["pour-setup", "Pour and Setup", "precision", "now"], ["menu-interview", "Menu Interview", "dialogue", "now"], ["seat-order", "Seat-Numbered Order", "memory", "now"], ["allergy-confirmation", "Allergy Confirmation", "evidence", "now"], ["course-conductor", "Course Conductor", "orchestration", "next"], ["tray-route", "Tray Build and Route", "route", "now"], ["delivery-seat-match", "Delivery and Seat Match", "memory", "now"], ["two-bite-check", "Two-Bite Check", "diagnosis", "next"], ["attention-circuit", "Attention Circuit", "route", "now"], ["recovery-conversation", "Recovery Conversation", "dialogue", "now"], ["dessert-check-read", "Dessert and Check Read", "diagnosis", "next"], ["split-payment", "Split and Payment", "evidence", "now"], ["checkout-handoff", "Checkout and Handoff", "evidence", "admin"],
  ],
  dishwasher: [
    ["intake-triage", "Intake Triage", "diagnosis", "now"], ["scrape-waste", "Scrape and Waste Sort", "precision", "now"], ["soil-treatment", "Soil Treatment", "diagnosis", "now"], ["rack-geometry", "Rack Geometry", "packing", "now"], ["machine-setup", "Machine Setup", "process", "prevent"], ["cycle-cadence", "Cycle Cadence", "process", "now"], ["clean-inspection", "Clean Inspection", "diagnosis", "now"], ["pit-priority", "Pit Priority Board", "orchestration", "now"], ["clean-distribution", "Clean Distribution", "route", "next"], ["specialty-ware", "Pots and Specialty Ware", "precision", "now"], ["breakage-containment", "Breakage Containment", "diagnosis", "now"], ["preventative-maintenance", "Preventative Maintenance", "process", "prevent"], ["pit-close", "Pit Close", "evidence", "admin"],
  ],
  chef: [
    ["line-check", "Line Check", "diagnosis", "prevent"], ["ticket-rail", "Ticket Rail", "orchestration", "now"], ["call-acknowledgment", "Call and Acknowledgment", "memory", "now"], ["pickup-orchestration", "Pickup Orchestration", "process", "now"], ["plate-inspection", "Plate Inspection", "diagnosis", "now"], ["taste-calibration", "Taste Calibration", "diagnosis", "prevent"], ["refire-recovery", "Refire and Recovery", "orchestration", "now"], ["availability-control", "86 and Substitution Control", "allocation", "next"], ["haccp-decision", "HACCP Decision", "evidence", "now"], ["yield-order-guide", "Yield and Order Guide", "allocation", "admin"], ["waste-review", "Waste Review", "evidence", "admin"], ["kitchen-coaching", "Kitchen Coaching", "dialogue", "prevent"],
  ],
  cook: [
    ["product-rotation", "Product Pull and Rotation", "evidence", "prevent"], ["mise-plan", "Mise Dependency Plan", "orchestration", "next"], ["knife-prep", "Knife and Prep Craft", "precision", "now"], ["batch-scaling", "Batch Scaling", "memory", "now"], ["station-setup", "Station Setup", "construction", "prevent"], ["heat-control", "Multi-Pan Heat Control", "process", "now"], ["doneness-read", "Doneness and Sensory Read", "diagnosis", "now"], ["allergy-lane", "Modifier and Allergy Lane", "process", "now"], ["pickup-sync", "Pickup Synchronization", "process", "now"], ["plating-assembly", "Plating Assembly", "packing", "now"], ["clean-as-you-go", "Clean as You Go", "route", "prevent"], ["equipment-anomaly", "Equipment Anomaly", "diagnosis", "now"], ["station-handoff", "Station Handoff and Close", "evidence", "admin"],
  ],
  "host-busser": [
    ["reservation-graph", "Reservation Graph", "scheduling", "next"], ["wait-forecast", "Wait Forecast", "diagnosis", "next"], ["arrival-dialogue", "Arrival Dialogue", "dialogue", "now"], ["seating-graph", "Seating Graph", "orchestration", "now"], ["escort-handoff", "Escort and Handoff", "route", "now"], ["table-combine", "Table Combine and Split", "construction", "next"], ["room-scan", "Dining-Room Scan", "diagnosis", "now"], ["prebus-circuit", "Pre-Bus Circuit", "route", "now"], ["stack-balance", "Bus-Tub and Stack Balance", "packing", "now"], ["reset-sequence", "Reset Sequence", "process", "now"], ["spill-containment", "Spill Containment", "process", "now"], ["restroom-entry-standard", "Restroom and Entry Standard", "diagnosis", "prevent"], ["closing-room", "Closing Room", "route", "admin"],
  ],
};

const phaseTemplates = {
  dialogue: [
    { id: "observe", prompt: "Read the person and the current service evidence.", actions: ["listen", "rush"] },
    { id: "respond", prompt: "Choose a response that fits the stated need.", actions: ["acknowledge", "deflect"] },
    { id: "follow-up", prompt: "Confirm the next step and close the loop.", actions: ["confirm", "leave"] },
  ],
  orchestration: [
    { id: "scan", prompt: "Inspect the live queue and its dependencies.", actions: ["scan", "guess"] },
    { id: "sequence", prompt: "Choose the next safe priority.", actions: ["sequence", "first-in-list"] },
    { id: "communicate", prompt: "Issue and confirm the handoff.", actions: ["call-and-confirm", "silent-change"] },
  ],
  allocation: [
    { id: "forecast", prompt: "Read available resources and upcoming obligations.", actions: ["forecast", "spend-now"] },
    { id: "tradeoff", prompt: "Choose the tradeoff that protects the stated goal.", actions: ["balanced-commit", "overcommit"] },
    { id: "review", prompt: "Set a follow-up condition and reserve.", actions: ["set-review", "forget"] },
  ],
  scheduling: [
    { id: "constraints", prompt: "Mark hard constraints and promised times.", actions: ["map-constraints", "ignore-constraint"] },
    { id: "fit", prompt: "Fit the work without creating a collision.", actions: ["fit-with-buffer", "tight-stack"] },
    { id: "publish", prompt: "Publish and communicate the plan.", actions: ["publish-confirmed", "publish-silent"] },
  ],
  evidence: [
    { id: "collect", prompt: "Collect the relevant live records.", actions: ["collect-records", "assume"] },
    { id: "reconcile", prompt: "Resolve discrepancies against physical state.", actions: ["reconcile", "force-balance"] },
    { id: "sign", prompt: "Document the decision and owner.", actions: ["sign-with-note", "submit-blank"] },
  ],
  diagnosis: [
    { id: "inspect", prompt: "Inspect observable symptoms before acting.", actions: ["inspect", "act-blind"] },
    { id: "test", prompt: "Choose a discriminating test or question.", actions: ["test-cause", "treat-symptom"] },
    { id: "correct", prompt: "Correct the cause and verify the result.", actions: ["correct-and-verify", "quick-fix"] },
  ],
  memory: [
    { id: "encode", prompt: "Encode positions, modifiers, and exceptions.", actions: ["encode", "skim"] },
    { id: "execute", prompt: "Apply the remembered state in order.", actions: ["ordered-recall", "approximate"] },
    { id: "verify", prompt: "Verify the high-risk detail.", actions: ["verify", "trust-memory"] },
  ],
  precision: [
    { id: "setup", prompt: "Select the correct tool and working setup.", actions: ["safe-setup", "fast-setup"] },
    { id: "execute", prompt: "Perform the controlled gesture.", actions: ["controlled-pass", "force-pass"] },
    { id: "inspect", prompt: "Inspect and correct before handoff.", actions: ["inspect-result", "send-unchecked"] },
  ],
  packing: [
    { id: "sort", prompt: "Group items by compatibility and destination.", actions: ["sort-compatible", "mix-all"] },
    { id: "place", prompt: "Place for balance, access, and clearance.", actions: ["place-balanced", "pack-tight"] },
    { id: "verify", prompt: "Verify stability and downstream use.", actions: ["verify-load", "move-now"] },
  ],
  route: [
    { id: "scan", prompt: "Read hazards, stops, and task claims.", actions: ["scan-route", "shortest-only"] },
    { id: "chain", prompt: "Build a safe multi-stop circuit.", actions: ["chain-stops", "single-rush"] },
    { id: "handoff", prompt: "Complete each stop and communicate exceptions.", actions: ["complete-handoff", "drop-and-go"] },
  ],
  process: [
    { id: "setup", prompt: "Set safe starting conditions.", actions: ["calibrate", "start-cold"] },
    { id: "control", prompt: "Monitor and adjust concurrent state.", actions: ["controlled-adjust", "max-control"] },
    { id: "verify", prompt: "Verify completion before release.", actions: ["verify-release", "release-early"] },
  ],
  construction: [
    { id: "measure", prompt: "Measure space, utilities, and operational goal.", actions: ["measure", "eyeball"] },
    { id: "place", prompt: "Place with clearance and flow in mind.", actions: ["place-with-flow", "place-for-stat"] },
    { id: "simulate", prompt: "Run a route/utility check before committing.", actions: ["simulate", "commit-untested"] },
  ],
};

const activities = Object.entries(activityCatalog).flatMap(([roleId, entries]) => entries.map(([slug, label, grammar, lane], index) => ({
  id: `${roleId}-${slug}`,
  roleId,
  label,
  grammar,
  lane,
  priority: lane === "now" ? 70 + (index % 20) : lane === "next" ? 50 + (index % 15) : 30 + (index % 15),
  description: `${label} uses live restaurant state, can partially fail, and produces a crew or business consequence.`,
  phases: phaseTemplates[grammar],
  successActions: phaseTemplates[grammar].map((phase) => phase.actions[0]),
  riskActions: phaseTemplates[grammar].map((phase) => phase.actions[1]),
  tags: [roleId, grammar, lane, "authoritative", "recoverable"],
})));

const premiumObjects = [
  ["oak-two-top", "Oak Two-Top", "Dining", "premium", 78000, 2, 2, "table", { seats: 2, ambience: 4, turnover: 2 }],
  ["walnut-four-top", "Walnut Four-Top", "Dining", "premium", 142000, 3, 3, "table", { seats: 4, ambience: 7, comfort: 6 }],
  ["banquette-section", "Upholstered Banquette", "Dining", "iconic", 265000, 4, 2, "seating", { seats: 4, ambience: 10, comfort: 12 }],
  ["commercial-chair", "Commercial Dining Chair", "Dining", "commercial", 24000, 1, 1, "chair", { seats: 1, comfort: 3, durability: 5 }],
  ["premium-chair", "Premium Dining Chair", "Dining", "premium", 52000, 1, 1, "chair", { seats: 1, comfort: 8, ambience: 3 }],
  ["host-stand-pro", "Reservation Host Stand", "Service", "premium", 188000, 2, 2, "host", { turnover: 6, forecast: 8, ambience: 3 }],
  ["server-station-pro", "Integrated Server Station", "Service", "premium", 236000, 3, 2, "service", { turnover: 8, storage: 8, route: 5 }],
  ["pos-terminal", "Commercial POS Terminal", "Service", "commercial", 94000, 1, 1, "pos", { accuracy: 6, payment: 8 }],
  ["expo-pass-heated", "Heated Expo Pass", "Kitchen", "premium", 420000, 4, 2, "expo", { kitchen: 12, hold: 12, quality: 8 }],
  ["six-burner-range", "Six-Burner Range", "Kitchen", "premium", 685000, 4, 3, "range", { kitchen: 18, capacity: 6, recovery: 8 }],
  ["plancha-commercial", "Commercial Plancha", "Kitchen", "commercial", 348000, 3, 2, "plancha", { kitchen: 10, consistency: 6 }],
  ["convection-oven", "Convection Oven", "Kitchen", "premium", 575000, 3, 3, "oven", { kitchen: 15, consistency: 10 }],
  ["prep-table-refrigerated", "Refrigerated Prep Table", "Kitchen", "premium", 395000, 4, 2, "prep", { kitchen: 8, sanitation: 7, storage: 10 }],
  ["walkin-rack", "Walk-In Storage Rack", "Storage", "commercial", 112000, 3, 1, "storage", { storage: 15, rotation: 6 }],
  ["dry-storage-rack", "Dry Storage Rack", "Storage", "commercial", 76000, 3, 1, "storage", { storage: 12, organization: 5 }],
  ["chemical-cabinet", "Locked Chemical Cabinet", "Utility", "commercial", 88000, 2, 1, "utility", { sanitation: 8, safety: 10 }],
  ["dish-machine-high-temp", "High-Temperature Dish Machine", "Utility", "premium", 820000, 4, 3, "dish", { sanitation: 18, capacity: 12, speed: 10 }],
  ["three-comp-sink", "Three-Compartment Sink", "Utility", "commercial", 285000, 4, 2, "sink", { sanitation: 12, recovery: 8 }],
  ["glass-rack-system", "Glass Rack System", "Utility", "premium", 145000, 2, 2, "dish", { breakage: -8, capacity: 8 }],
  ["floor-drain", "Floor Drain", "Utility", "commercial", 96000, 1, 1, "drain", { sanitation: 6, spill: 8 }],
  ["oak-partition", "Oak Dining Partition", "Decor", "premium", 74000, 2, 1, "partition", { ambience: 5, privacy: 7, noise: -3 }],
  ["large-planter", "Large Indoor Planter", "Decor", "premium", 68000, 2, 2, "plant", { ambience: 6, noise: -2 }],
  ["wall-art-local", "Local Artist Feature", "Decor", "iconic", 210000, 2, 1, "art", { ambience: 14, community: 8 }],
  ["acoustic-panel", "Decorative Acoustic Panel", "Decor", "premium", 85000, 2, 1, "decor", { ambience: 4, noise: -8 }],
  ["pendant-light", "Dining Pendant Light", "Decor", "premium", 64000, 1, 1, "light", { ambience: 5, visibility: 3 }],
  ["wet-floor-station", "Spill Response Station", "Utility", "commercial", 128000, 2, 1, "clean", { sanitation: 8, spill: 12, recovery: 6 }],
  ["linen-storage", "Linen and Reset Cabinet", "Service", "commercial", 108000, 2, 1, "storage", { turnover: 5, storage: 6 }],
  ["water-station", "Filtered Water Station", "Service", "premium", 190000, 2, 2, "service", { turnover: 4, quality: 6, capacity: 5 }],
  ["office-desk", "Owner's Operations Desk", "Office", "commercial", 98000, 3, 2, "office", { forecast: 6, organization: 7 }],
  ["manager-console", "Live Operations Console", "Office", "premium", 260000, 3, 2, "office", { forecast: 12, handoff: 8, organization: 8 }],
].map(([id, name, category, tier, costCents, width, height, assetId, stats]) => ({
  id, name, category, style: tier === "iconic" ? "Heritage" : "Modern", tier, costCents, width, height,
  symbol: name.slice(0, 1), assetId, upkeepCents: Math.round(costCents * 0.004), durability: tier === "premium" || tier === "iconic" ? 92 : 78,
  utilities: category === "Kitchen" ? ["power", "ventilation"] : category === "Utility" ? ["water", "drain"] : [],
  stats, tags: [tier, category.toLowerCase(), assetId],
}));

const construction = {
  schemaVersion: 1,
  grid: { defaultWidth: 24, defaultHeight: 16, cellMeters: 0.5, rotations: [0, 90, 180, 270] },
  surfaces: [
    ["sealed-concrete", "Sealed Concrete", 1200, 8, 2], ["quarry-tile", "Quarry Tile", 2200, 10, 3], ["white-hex", "White Hex Tile", 3100, 8, 6], ["slate-tile", "Slate Tile", 4200, 9, 8],
    ["oak-plank", "Oak Plank", 4800, 5, 11], ["walnut-plank", "Walnut Plank", 6600, 5, 14], ["terrazzo", "Terrazzo", 7200, 10, 13], ["pattern-cement", "Patterned Cement Tile", 5600, 9, 12],
    ["commercial-vinyl", "Commercial Vinyl", 1800, 8, 3], ["rubber-kitchen", "Kitchen Rubber Flooring", 3600, 12, 1], ["entry-mat", "Entry Mat System", 2900, 7, 2], ["outdoor-paver", "Outdoor Paver", 3500, 9, 7],
  ].map(([id, label, costCents, sanitation, ambience]) => ({ id, label, costCents, stats: { sanitation, ambience }, assetId: `floor-${id}` })),
  wallStyles: [
    ["painted-plaster", "Painted Plaster", 3500], ["subway-tile", "Subway Tile", 6500], ["exposed-brick", "Exposed Brick", 8200],
    ["oak-panel", "Oak Panel", 11500], ["glass-partition", "Glass Partition", 14500], ["stainless-kitchen", "Stainless Kitchen Wall", 12500],
  ].map(([id, label, costCents]) => ({ id, label, costCents, assetId: `wall-${id}` })),
  utilityTypes: ["power", "gas", "water", "drain", "ventilation"],
};

const appearance = {
  schemaVersion: 1,
  outfitSilhouettes: ["classic", "apron", "chef-coat", "manager-jacket", "utility"],
  defaultPrimary: "#2f684f",
  defaultSecondary: "#d6a84b",
  palettes: [
    ["house-green", "#2f684f", "#d6a84b"], ["oxblood", "#6f2838", "#e5c6a5"], ["navy", "#243d5c", "#d9d5c9"],
    ["charcoal", "#303638", "#d98b4b"], ["cream", "#e7ddc5", "#4d5a4e"], ["plum", "#5e345f", "#d2a24c"],
  ].map(([id, primary, secondary]) => ({ id, primary, secondary })),
};

writeFileSync(resolve(CORE, "role-progression.json"), `${JSON.stringify({ schemaVersion: 1, roles: progression }, null, 2)}\n`);
writeFileSync(resolve(CORE, "activities.json"), `${JSON.stringify({ schemaVersion: 1, activities }, null, 2)}\n`);
writeFileSync(resolve(CORE, "furniture-production.json"), `${JSON.stringify(premiumObjects, null, 2)}\n`);
writeFileSync(resolve(CORE, "construction.json"), `${JSON.stringify(construction, null, 2)}\n`);
writeFileSync(resolve(CORE, "appearance.json"), `${JSON.stringify(appearance, null, 2)}\n`);

console.log(JSON.stringify({ roles: progression.length, skills: progression.reduce((sum, item) => sum + item.fundamentals.length + Object.values(item.branches).flat().length, 0), activities: activities.length, furniture: premiumObjects.length }, null, 2));
