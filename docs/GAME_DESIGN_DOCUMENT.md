# Rush & Revenue Online

## Production Game Design Document

**Document version:** 2.0  
**Implementation baseline:** Clean `rro.v1` Godot/TypeScript alpha foundation  
**Product target:** V2 AAA restaurant MMORPG  
**Simulation clock:** 4× real time  
**Primary session:** 60 real minutes / 4 game hours  
**Maximum restaurant day:** 240 real minutes / 16 game hours  

---

## 1. Executive vision

Rush & Revenue Online is a persistent top-down restaurant MMORPG in which hospitality jobs are full character classes, restaurants are player-built economic entities, and countries and regions form competitive shared markets.

The strategic layer begins on an XCOM-style globe. Players select a country, inspect its regions, compare restaurant licenses, shared resource pressure, public performance, and job openings, then enter a region to work or open a business. The ground game combines the social autonomy and readable needs of The Sims with the deliberate top-down movement, spatial awareness, and systems-driven interaction of Project Zomboid—without survival horror.

Every meaningful action is playable. Starting a pan is not a “complete cook task” button; it begins a timing game. Clicking a table does not serve it; it opens a service window that must be read against the rest of the section. Loading a dish rack is an efficiency puzzle. Cleaning is a coverage-and-solution problem. Management decisions, purchasing, seating, prep, repair, and ownership all have their own decisions, execution, and quality outcomes.

The local release is designed to be fully playable with one account and one connected player. NPC staff fill every unoccupied class so the complete restaurant simulation remains active. The architecture preserves authoritative server state, durable identities, content packs, class inheritance, and additive event modifiers so the same world can grow into a concurrent online service.

This document is both the product design and the implementation contract. Sections explicitly labeled **V1 implemented** describe code present in this repository. Unqualified systems describe the intended complete game. The repository version is `1.0.0-alpha.2`; it is a substantial vertical-slice foundation, not a claim that a small codebase is already an operated AAA MMO. The exact release gate is maintained in `docs/V1_RELEASE_GATE.md`, and the assignable V2 inventory is maintained in `planning/v2-backlog.json`.

### Product promise

> Build a hospitality career one scored shift at a time, or spend your profits building the restaurant everyone else wants to work for.

---

## 2. Player fantasies

The game supports four overlapping fantasies:

1. **Master the work.** Become visibly better at a profession whose real-world rhythm is rarely represented in games.
2. **Belong to a crew.** Read and support a restaurant as an interdependent machine, even during solo play.
3. **Build a place.** Turn a floor plan, menu identity, and finite budget into a restaurant with a recognizable personality.
4. **Shape a market.** Compete and cooperate inside regional labor, supply, sanitation, demand, and licensing constraints.

Players may remain career specialists indefinitely, cross-train across every base class, unlock subclasses, manage, or move into ownership. Ownership is not the only endgame and is not inherently stronger than skilled employment.

---

## 3. Design pillars

### 3.1 Every click opens a decision

No whole job task resolves from one unopposed click. A click may select a station, move the character, open a tool, or commit a decision, but execution always includes timing, sequence, spatial reasoning, resource use, risk, or prioritization.

### 3.2 The restaurant is one machine

Classes must influence one another. A dishwasher’s throughput changes glass availability; glass scarcity changes server routes; delayed table resets change host quotes; seating pace changes kitchen ticket arrival; kitchen timing changes guest patience and manager incidents.

### 3.3 One hour must tell a complete story

A normal session includes preparation, an escalating service period, a peak, recovery, a payout, and progression. Longer play extends the same restaurant day rather than forcing repetitive disconnected matches.

### 3.4 Ownership is operational, not decorative

Furniture changes seats, routes, ambience, sanitation, waste, kitchen throughput, revenue, and service speed. Every purchase competes with wages, inventory, repairs, permits, and working cash.

### 3.5 The world expands through data

Classes, subclasses, furniture, countries, regions, events, recipes, modifiers, and reward tracks use stable content IDs and versioned packs. Expansions add to registries; they do not require rewriting core simulation switches or invalidating old saves.

---

## 4. World structure

```text
World
└── Country
    └── Region
        ├── Finite restaurant-license capacity
        ├── Shared resource pools
        ├── Demand and cost indices
        ├── Sanitation authority
        ├── Logistics routes
        └── Restaurants
            ├── Owner and treasury
            ├── Job openings
            ├── Public performance
            ├── Floor plan and equipment
            └── Live shift instances
```

### 4.1 Globe command view

The globe is the primary navigation and strategic comparison layer.

- Dragging rotates the globe; scroll or pinch changes zoom.
- Country markers disclose the number of active restaurants and open jobs.
- Selecting a country opens its region list without forcing a load screen.
- A player can mark one country as a home market. Home affects tutorial recommendations and future travel costs, not account access.
- Event overlays can tint affected countries, add route markers, or highlight temporary markets.
- Locked future countries remain visible as geography, never as blank menu entries.

### 4.2 Country view

Country summaries show:

- number of active regions;
- restaurant count and total license capacity;
- aggregate open roles;
- average demand, cost, and sanitation stability;
- active country-wide regulations or events;
- travel and language modifiers when those systems are enabled.

### 4.3 Region view

Each region defines an integer `capacity`. A restaurant consumes one license slot while active. Capacity creates meaningful regional identity and prevents every player from clustering in one optimal market.

Region cards expose:

- active restaurants / capacity;
- open roles;
- demand index;
- cost index;
- produce, seafood, labor, fuel, and sanitation pools;
- active incidents, festivals, storms, inspections, or shortages;
- license cost and application rules.

### 4.4 Launch world

| Country | Launch regions |
| --- | --- |
| United States | Mid-Atlantic, Pacific Northwest, Gulf Coast |
| Canada | Great Lakes, British Columbia |
| Mexico | Central Highlands, Yucatán Coast |
| United Kingdom | Greater London, North West |
| France | Île-de-France, Provence |
| Japan | Kantō, Kansai |

The launch database contains **23 seeded NPC restaurants across exactly 115 regional license slots: 20% world occupancy**. They have different concepts, ratings, sanitation, covers, turnover, wages, tips, viability, and openings. Player restaurants appear beside them and use the same public model.

### 4.5 Living restaurant ecology and business permadeath

Restaurant identity is persistent; restaurant success is not guaranteed. Each active house has a treasury, viability score, loss streak, generation, and last simulated business day. At the end of each world day, the authoritative simulation combines demand, regional costs, rating, sanitation, covers, ownership overhead, and deterministic market variance into an operating result.

- A failing restaurant accumulates unprofitable days and loses viability.
- Seed restaurants receive a four-day launch cushion; new player houses receive a longer receivership window so one bad shift is not lethal.
- Insolvency, critical sanitation failure, or sustained losses permanently closes the restaurant identity.
- Closure displaces accepted applicants, releases its finite license, and writes an immutable lifecycle event with the name, reason, day, and generation.
- A closed identity never silently reopens. Its history remains available for future archives, memorials, acquisition systems, and regional statistics.
- If a human is clocked in, that restaurant is protected from the irreversible end-of-day closure tick. All other roles continue to simulate, so protection does not freeze ordinary operational pressure.

Regions periodically sprout new NPC concepts into open licenses. Falling below 20% occupancy guarantees a replacement opportunity; above that floor, demand-sensitive spawn pressure aims for a living 20–44% NPC market rather than a static catalog. New houses receive a new stable ID, procedural name and concept, new stats, full job board, generation counter, and opening event. This is the restaurant-economy analogue of a Civilization encampment: opportunities appear, compete, flourish, and sometimes disappear without erasing history.

---

## 5. Time model and session architecture

### 5.1 Core conversion

The simulation operates at exactly four times natural restaurant time:

\[
\text{game minutes} = 4 \times \text{real minutes}
\]

Examples:

| Natural restaurant duration | Real duration |
| --- | ---: |
| Four-minute cook | 1 minute |
| Twelve-minute entrée | 3 minutes |
| One-hour table turn | 15 minutes |
| Four-hour service block | 1 hour |
| Sixteen-hour restaurant day | 4 hours |

The restaurant opens at 6:00 AM game time and closes at 10:00 PM game time. One complete day therefore lasts four real hours.

### 5.2 Standard 60-minute session

| Real time | Game time | Expected arc |
| ---: | ---: | --- |
| 0–10 min | 40 min | Arrival, setup, mise en place, briefing |
| 10–25 min | 60 min | First seating wave and early constraints |
| 25–45 min | 80 min | Peak demand, cross-station pressure, incidents |
| 45–55 min | 40 min | Recovery, late tables, cleaning, close decisions |
| 55–60 min | 20 min | Cashout, review, XP, repairs, next-shift planning |

Players may clock in for 60, 120, or 240 real minutes. They may clock out early and retain every recorded task, earned payment, XP, and restaurant-state change. An early departure creates an NPC handoff instead of deleting the role.

### 5.3 Offline and empty-server time

- The world clock advances only while the local server is running in the local release.
- Active player shifts never simulate irreversible failure while the server is stopped.
- Regional market state can perform bounded catch-up on restart in a hosted release.
- No restaurant can be destroyed by offline simulation.

---

## 6. Character and class model

Every role is a class definition loaded from the content registry. A class declares:

- stable role ID;
- base or subclass status;
- optional parent role ID;
- employment mode;
- primary task/minigame ID;
- permissions;
- economy and tip tags;
- three or more skill branches;
- skill nodes and prerequisites;
- content-pack ownership and schema version.

### 6.1 Starting aptitudes and class mastery

Signup rolls a character sheet once and saves it permanently. The eight launch aptitudes are Composure, Coordination, Palate, Stamina, Memory, Empathy, Organization, and Mechanical Sense. Two are rolled as strengths (72–86), two as weak spots (28–45), and the remaining four as ordinary abilities (44–68). Every attribute has trainable potential to 100.

Natural role fit is a weighted average defined by the role’s data rather than hard-coded client logic. For role (r):

\[
\operatorname{fit}(r) = \frac{\sum_a w_{r,a} \cdot A_a}{\sum_a w_{r,a}}
\]

Examples: Server emphasizes Empathy, Memory, Coordination, and Composure; Cook emphasizes Coordination, Composure, Stamina, and Palate; Manager emphasizes Organization, Composure, Empathy, and Memory. New roles and subclasses bring their own weights in their content pack.

The roll guides a player toward jobs that may feel immediately comfortable but never forbids a class. Each role has independent XP, level, task count, and best score. Role mastery adds a modest performance bonus, and every eighth task trains the class’s strongest weighted aptitude. Long-term practice can therefore outweigh a poor starting fit without making character generation meaningless.

### 6.2 Manager

**Fantasy:** Keep the whole floor calm, staffed, legal, and profitable.  
**Primary game:** Triage Board.  
**Branches:** Flow Control, People Ops, Compliance.

Core activities:

- assign and redirect labor;
- watch ticket, table, dish, and sanitation bottlenecks;
- make incident decisions under time pressure;
- conduct pre-shift checks and closing audits;
- resolve guest and employee problems;
- prepare for sanitation inspections;
- set pacing and temporary station priorities.

### 6.3 Owner

**Fantasy:** Turn a neighborhood idea into a durable hospitality business.  
**Primary game:** Capital Allocation.  
**Branches:** Hospitality, Capital, Expansion.

Core activities:

- open and name a restaurant;
- choose concept and style identity;
- purchase, place, rotate, and resell objects;
- set capital and purchasing priorities;
- maintain working cash;
- choose staffing budgets and upgrades;
- respond to regional supply bids;
- plan additional concepts when expansion skills allow.

### 6.4 Server

**Fantasy:** Orchestrate attention so every table feels like the only table.  
**Primary game:** Steps of Service.  
**Branches:** Tablecraft, Menu Fluency, Service Recovery.

Core activities:

- greet, take orders, fire courses, run, check, and clear;
- judge natural attention windows;
- route through the room with full hands;
- remember modifiers and seat ownership;
- make recommendations against guest preferences;
- recover delays and mistakes;
- coordinate with host, busser, bar, and pass.

### 6.5 Dishwasher

**Fantasy:** Run the quiet machine that keeps every other station alive.  
**Primary game:** Rack Logic.  
**Branches:** Rack Flow, Chemistry, Reliability.

Core activities:

- pre-sort item shapes and materials;
- build dense safe racks;
- manage detergent, temperature, soak, and dry time;
- preserve a dirty-to-clean flow;
- prevent glass, plate, pan, and utensil shortages;
- perform sanitation and utility support;
- avoid breakage and rewash.

### 6.6 Chef

**Fantasy:** Call the line, protect the menu, and make the pass sing.  
**Primary game:** Expo Rhythm.  
**Branches:** Cuisine, Expo, Kitchen Leadership.

Core activities:

- call tickets and synchronize stations;
- judge complete-table timing;
- plate and inspect dishes;
- create specials and manage recipe yield;
- train cooks and set standards;
- respond to allergy and quality incidents;
- manage 86s and substitutions.

### 6.7 Cook

**Fantasy:** Build mise en place into a controlled, repeatable rush.  
**Primary game:** Heat & Timing.  
**Branches:** Station Mastery, Mise en Place, Rush Tempo.

Core activities:

- prepare ingredients against forecast demand;
- control heat, doneness, rest, and plating windows;
- run parallel tickets;
- communicate holds and shortages;
- manage waste and clean yield;
- chain accurate actions into rush bonuses;
- cross-train on stations.

### 6.8 Host / Busser

**Fantasy:** Shape the room before a single order reaches the kitchen.  
**Primary game:** Room Geometry.  
**Branches:** Doorcraft, Dining Room, Service Support.

Core activities:

- quote waits and maintain a queue;
- fit party sizes to table inventory;
- balance server sections;
- preserve accessible routes;
- clear, clean, and reset tables;
- manage reservations and walk-ins;
- run support and anticipate bottlenecks.

---

## 7. Subclasses and horizontal progression

Subclasses extend parent roles through the content registry.

Examples:

- Cook → Pastry Cook, Grill Cook, Prep Specialist;
- Server → Sommelier, Banquet Captain, Counter Specialist;
- Host / Busser → Reservations Lead, Event Floor Lead;
- Manager → Beverage Manager, Training Manager, Compliance Manager;
- Owner → Operator, Creative Director, Multi-Unit Developer.

A subclass inherits parent permissions, tags, minigame compatibility, branches, and skills, then adds or overrides specific fields. Save data stores stable skill IDs rather than array positions. Removing or disabling a pack does not delete unknown IDs from a save; they remain dormant for later restoration.

Subclass rules:

1. A subclass may reuse a parent minigame with new scoring targets.
2. A subclass may register a new configurable task definition.
3. Parent skills may be retained, overridden by stable ID, or supplemented.
4. Permissions merge additively unless a pack explicitly declares a safe revocation migration.
5. A subclass never silently changes the player’s active class.

---

## 8. Interaction and minigame framework

Every task emits the same normalized result envelope:

```json
{
  "taskType": "dishes",
  "score": 91,
  "durationMs": 18340,
  "resourceUse": { "solution": 7, "water": 4 },
  "mistakes": 1,
  "combo": 4,
  "context": { "station": "dish-pit-1", "rush": 78 }
}
```

The server validates the task type, shift ownership, score bounds, task rate, and payload size before applying rewards.

### 8.1 Universal score bands

| Score | Outcome |
| ---: | --- |
| 95–100 | Exceptional; strong combo, quality, and training effects |
| 80–94 | Clean professional execution |
| 65–79 | Acceptable service standard |
| 40–64 | Recoverable miss; time or resource cost |
| 0–39 | Failure state; incident, rework, waste, or patience loss |

### 8.2 Heat & Timing

Three or more foods move through heat, rest, and finish windows. Players can parallelize with higher skills but risk losing visibility. Scoring considers doneness, synchronized ticket completion, waste, and communication.

### 8.3 Expo Rhythm

Components from multiple stations approach the pass on separate timelines. The chef may hold, refire, call hands, or send. Complete-table sends score higher than isolated speed.

### 8.4 Steps of Service

Tables expose needs through posture, course state, conversation state, elapsed time, and prior service—not a single flashing button. The player must decide when attention is useful. Hovering and neglect both reduce quality.

### 8.5 Rack Logic

Dish items have shape, material, soil, fragility, and drying properties. Rack density, lane compatibility, sprayer coverage, chemistry, and order of operations determine throughput. A perfectly dense rack can outperform frantic single-item loads.

### 8.6 Room Geometry

Party size, accessibility, reservations, expected duration, server sections, and table combinability create a live seating puzzle. Exact fits preserve capacity, but context can justify intentional waste.

### 8.7 One-Pass Clean

The player uses a limited tool footprint and solution supply to cover soil, edges, and contamination zones. Repeated empty passes waste time and chemicals. Different surfaces later add directional grain, soak, and tool requirements.

### 8.8 Triage Board

Managers receive incidents with incomplete information and competing consequences. The best answer protects safety first, then communicates, contains, delegates, documents, and restores flow.

### 8.9 Capital Allocation

Owners interpret market signals and distribute limited purchasing capacity among inventory, labor, sanitation, repair, and marketing. The “correct” mix depends on concept, forecast, events, and current restaurant weaknesses.

### 8.10 Closeout & Compliance

Paperwork is role-specific operational play, not a generic trivia prompt. A three-record scenario asks the player to preserve an honest audit trail, apply the correct control, and choose defensible corrective action.

| Role | Launch records and decisions |
| --- | --- |
| Manager | overtime variance, incident report, cooler corrective action |
| Owner | P&L coding, invoice three-way match, cash variance audit |
| Server | tender correction, tip declaration, void/refire reason |
| Dishwasher | machine specification, sanitizer test, glass-breakage response |
| Chef | HACCP cook log, two-stage cooling, allergen matrix update |
| Cook | prep/date label, waste log, unidentified product control |
| Host / Busser | accessible reservation notes, evidence-based wait quote, table sanitation status |

Unsafe shortcuts and falsified readings are always poor outcomes. A correction preserves the original record where an audit trail requires it. Content packs may contribute local forms, regulations, union rules, currencies, and subclass-specific records through configurable task definitions.

### 8.11 Walk-In Rotation

Product lots expose receipt date, use-by date, open/sealed state, and verified holding temperature. The player must quarantine expired product first, then pull valid product by FEFO/FIFO rules. The launch puzzle scores both safety classification and exact use sequence; later versions add lot traceability, partial quantities, thaw dates, cooling windows, allergen zoning, vendor recalls, and yield-versus-waste tradeoffs.

---

## 9. Top-down restaurant simulation

### 9.1 Spatial model

The restaurant uses a navigable top-down floor with:

- kitchen stations;
- pass and service station;
- dish pit with dirty and clean sides;
- host stand and waiting pocket;
- dining tables and sections;
- storage and walk-in;
- bathrooms;
- manager/owner office;
- entrances, exits, and accessible paths;
- sanitation and spill zones.

Characters may move with click-to-path or WASD/arrow keys. Clicking a station moves the character into interaction range; it never automatically completes station work.

### 9.2 Entity simulation

Core entities include:

- players;
- NPC employees;
- guest parties;
- tables and seats;
- tickets and courses;
- ingredients and prepared items;
- dishes, racks, and containers;
- furniture and equipment;
- incidents and work orders;
- region resource contracts.

### 9.3 Guest party state machine

```text
Arriving → Waiting → Seated → Greeted → Ordering → Course Loop
    → Check Requested → Paying → Departing → Review
```

The course loop may repeat for drinks, appetizers, mains, dessert, and after-meal service. Guest patience is not a simple countdown. It changes with quoted expectations, communication, visible effort, comfort, social context, hunger, prior mistakes, and recovery.

### 9.4 Ticket state machine

```text
Entered → Held/Fired → Station Work → Pass Ready → Table Complete
    → Run → Accepted / Refire / Recovery
```

Whole-table timing matters more than the fastest isolated plate.

### 9.5 Solo crew model

When only one human is online:

- six unoccupied base classes are filled by NPCs;
- NPC proficiency, morale, equipment, layout, and manager priorities control their throughput;
- NPC work is simulated, not cosmetic;
- the player’s station output changes queues throughout the restaurant;
- cross-trained support can rescue NPC bottlenecks;
- clocking out performs a safe NPC handoff.

Starting a player shift creates a durable role-state row for all seven base classes (and the selected subclass when applicable). Every simulated role has its own staffing source, efficiency, queue pressure, completed work, failures, and last tick. Four-times game time converts elapsed real minutes into arrivals and completions. High unresolved pressure raises failure risk. Player tasks reduce their live queue and can relieve connected NPC bottlenecks; the UI exposes the whole-house role state instead of representing coworkers as decorative sprites.

Hosted multiplayer replaces an NPC when a qualified player claims that shift slot. Authority remains on the server.

---

## 10. Regional economy and finite resources

### 10.1 Resource pools

Every region maintains normalized pools from 0 to 100:

- **Produce:** freshness, variety, and local farm capacity;
- **Seafood:** dock, cold-chain, and species availability;
- **Labor:** available workers, wages, burnout, and competition;
- **Fuel:** delivery, utility, and transport pressure;
- **Sanitation:** municipal capacity, inspector load, waste pickup, and cleanliness risk.

Regional restaurants draw from these pools through purchasing and operation. Pools replenish through time, imports, player contracts, event resolution, and infrastructure.

### 10.2 Price model

A future full market tick uses:

\[
P = P_0 \times C_r \times \left(1 + \frac{100-R}{100}S\right) \times E \times Q
\]

Where:

- \(P_0\) is base price;
- \(C_r\) is region cost index;
- \(R\) is resource availability;
- \(S\) is scarcity sensitivity;
- \(E\) is the combined event modifier;
- \(Q\) is contract quality and delivery timing.

### 10.3 Labor market

- Every restaurant advertises finite role openings.
- Wages and estimated tips are public.
- NPC labor consumes the same wage budget as player labor.
- Low regional labor raises wages, vacancy duration, fatigue, and training pressure.
- Reputation affects applicant quality, not whether a player may participate.

### 10.4 License capacity

Region capacity is intentionally finite. Capacity changes only through content, policy, infrastructure, or special events. If a region is full, players may buy an existing restaurant in a later market feature, wait for a closure, win a temporary event license, or choose another region.

---

## 11. Logistics

Restaurants maintain inventory by ingredient, preparation state, shelf life, storage location, and supplier lot.

Core logistics pressures:

- delivery windows and loading access;
- storage volume and temperature;
- regional shortages;
- substitutions and menu 86s;
- minimum order sizes;
- perishability and FIFO rotation;
- waste pickup and recycling capacity;
- equipment parts and maintenance contracts;
- inter-restaurant transfers for multi-unit owners.

An owner’s purchase is a contract choice, not a restock button. Price, freshness, reliability, lead time, minimum order, and regional impact compete.

The local playable implements the first FEFO/FIFO date-code station and records its action trail with the scored task. Full ingredient quantities, recipes, recalls, and supplier delivery persistence remain in the deep-simulation milestone.

---

## 12. Sanitation and safety

Sanitation exists at four levels:

1. **Object:** soil, contamination, temperature, damage.
2. **Station:** local cleanliness, chemical setup, handwashing, tool separation.
3. **Restaurant:** public grade, pest pressure, waste, logs, incidents.
4. **Region:** inspector load, waste infrastructure, water events, policy.

Sanitation falls through neglected cleaning, unsafe food handling, poor layouts, full waste, equipment failure, and event modifiers. It rises through correct tasks, equipment, training, preventive schedules, and manager compliance skills.

Safety-critical failures never reward speed. Allergy, contamination, fire, harassment, accessibility, and injury decisions prioritize safe containment and escalation.

---

## 13. Ownership and build mode

### 13.1 Opening flow

1. Select a country and region.
2. Confirm an available license slot.
3. Pay lease and permit cost.
4. Name the restaurant.
5. Select a concept and initial style.
6. Receive a protected starting treasury.
7. Place required functional items.
8. Staff roles and open service.

The V1 alpha begins players with $35,000 personal cash. Opening costs $10,000 and funds an $8,000 restaurant treasury.

### 13.2 Build grid

The launch build surface is a 24×16 collision-checked grid with add-on expansion to 64×64. Floor cells, room tags, wall edges, doors/arches, and object instances are persisted separately. The alpha-2 registry contains 229 stable furniture definitions: 16 core, 210 generated production-catalog, and three seasonal. Items declare width, height, four-way rotation, cost, tier, upkeep, repair cost, durability, wear per shift, breakage horizon, utilities, style, pack, tags, stat effects, role effects, and a one-to-one asset ID.

Launch item stats include:

- seats;
- ambience;
- turnover;
- kitchen throughput;
- sanitation;
- waste;
- revenue.

Production definitions also expose comfort, appearance, cleanability, and reliability as independent dimensions. Price and stat total may broadly rise together, but upgrades are not a linear ladder: a costly showpiece can be hard to clean, an inexpensive commercial chair can be durable but plain, and specialist equipment can trade comfort or ambience for throughput. Duplicate benefits taper so a healthy restaurant inventory favors a deliberate portfolio; physical seats and storage remain additive.

Placed inventory feeds the live restaurant, not just the builder card. It changes effective public rating, arriving-party happiness, visible per-role workload, maintenance-task volume, reliability risk, role/task support, food/service/cleanliness/value/ambience review baselines, revenue multiplier, upkeep and repair reserve. Wear advances at shift settlement, changes state at worn/broken thresholds, reduces contribution, adds role-authentic maintenance pressure, and can be repaired by the owner with audited treasury spending. Selling returns a wear-adjusted 40% of purchase cost. This prevents consequence-free layout swapping during service while keeping experimentation recoverable.

### 13.3 Styles and sets

Launch styles are Heritage, Modern, Diner, Natural, and Industrial. A restaurant may mix styles, but coherent sets can receive identity bonuses through Owner skills. Furniture packs add items without changing save schema.

---

## 14. Progression

### 14.1 Player progression

Players earn:

- class XP from scored tasks;
- general level XP from completed shifts;
- skill points on level increases;
- personal cash from wages, tips, and owner draws;
- role and regional reputation;
- records for quality, throughput, recovery, and support.

### 14.2 Skill design rules

- Skills widen options or improve mastery; they do not remove the minigame.
- Early skills improve readability and consistency.
- Mid skills enable parallel work and support.
- Advanced skills change strategy and team interactions.
- No skill creates an automatic perfect task.
- Additive content uses stable node IDs and prerequisites.

### 14.3 Restaurant progression

Restaurants progress through:

- treasury and profitability;
- public rating;
- sanitation grade;
- repeat customers;
- employee morale and proficiency;
- kitchen, ambience, and throughput capacity;
- regional standing;
- concept mastery and awards.

### 14.4 Persistent role inventory — V1 implemented slice

Personal cash also buys class-specific tools and consumables. The alpha-2 catalog has 45 stable items across all seven base roles, with at least nine choices available to each role. Every role has four persistent loadout slots; item definitions declare allowed roles, compatible slots, role-level requirement, price, ownership/stack limit, durability for equipment, modifiers, consumable use effects, description, quality tier, and a unique icon ID.

Purchases, equips, unequips, and uses are server-authoritative, persisted by character, and written to an inventory audit stream. The native inventory/shop screen exposes owned quantities, eligibility, loadouts, prices, tradeoffs, combined displayed modifiers, and personal cash. Deterministic badge icons keep all 45 items visually identifiable while bespoke raster icons remain in production. Applying every equipment modifier and consumable effect to live minigame resolution—and adding equipment wear/repair—is a promotion requirement, not an alpha-2 claim.

---

## 15. Applications and employment

Restaurant public cards display:

- concept and style;
- trailing rating;
- daily covers;
- table turnover;
- sanitation grade;
- open roles;
- hourly wage and estimated tips.

The local alpha accepts seeded restaurant applications immediately so a solo player can enter a trial shift. Hosted production adds application questions, schedule fit, owner response windows, trial shifts, contracts, and anti-discrimination constraints.

Employment is persistent but non-exclusive. A player may hold multiple accepted opportunities and select a workplace when clocking in.

### 15.1 Local restaurant rivalry — V1 implemented slice

A player who works at or owns a restaurant may spend earned personal cash while physically seated as a guest at another restaurant in the same region. They choose one of five legitimate service requests, optionally target an untouched live task attached to their own party, choose a difficulty dimension—timing, precision, memory/order, coordination/handoff, or interruptions—and select light, focused, or expert intensity.

The server owns price, eligibility, target validation, pressure, due-window/priority changes, party patience, ledger evidence, cooldown, per-visit/party/shift caps, and outcome. The target crew sees the rival restaurant, request, dimension, telegraph, required response and counterplay. Controlled work can mitigate the modifier; overcoming it grants bounded cash/XP and positive review evidence. Own-workplace challenges, cross-region attacks, stacked or in-progress targets, fake reviews, vandalism, invisible sabotage and unbounded stat damage are rejected.

---

## 16. Seasonal events and live content

Events are dated content records loaded from versioned packs. An event may contribute:

- regional or global modifiers;
- temporary furniture and cosmetics;
- recipes and ingredients;
- guest archetypes;
- incidents;
- reward tracks;
- public objectives;
- temporary licenses;
- map art and music cues.

The included **Summer Street-Fair Season** demonstrates the system:

- demand +7;
- produce −6;
- labor −5;
- fuel +2;
- sanitation −2;
- three event furniture items.

Modifiers are composed at bootstrap and applied to public resource values without overwriting base database state. Event progress uses a separate table so expiry never corrupts core progression.

---

## 17. Content-pack architecture

Every pack declares:

- pack ID;
- label;
- semantic version;
- content schema version;
- type and priority;
- roles/subclasses;
- furniture;
- events;
- later: recipes, countries, regions, guest archetypes, audio, and localization.

The registry validates unique IDs and schema compatibility, orders packs deterministically, resolves role inheritance, merges permissions/tags/skills, and records installed versions in SQLite.

Startup reconciliation is additive:

- new catalog items are upserted by stable ID;
- new base-role jobs are added to old restaurants;
- existing restaurant stats and player layouts are preserved;
- unknown save IDs remain untouched;
- static country/region metadata can update without resetting resource state.

See `docs/CONTENT_PACKS.md` for the authoring contract and subclass example.

---

## 18. Technical architecture

### 18.1 Local topology

```text
Godot 4 native desktop client
        │ Bearer-authenticated HTTP + WebSocket commands/snapshots
        ▼
TypeScript authoritative game server :8788
        │
        ▼
Clean V1 SQLite persistent world
```

The V1 line is a deliberate compatibility break. The browser gameplay surface, V0 API routes, V0 database, and old launch scripts are not loaded, migrated, or shipped. The native client sends movement intent, claims, phase actions, builder mutations, and legitimate guest challenges. The server owns the shift clock, collision, task phase, score, consequences, money, XP, reviews, layout validation, NPC coverage, and seasonal modifiers.

The Windows server controller starts a pinned runtime without a visible console, polls health, and stops through a loopback-only per-run token. The intended release launcher starts the server distribution and exported Godot client as separate products. Source builds never masquerade as exported clients.

### 18.2 Authority boundaries

Server-authoritative:

- accounts and sessions;
- profile, cash, XP, levels, skill points;
- applications and employment;
- restaurant ownership and treasury;
- item purchases and collision validation;
- active/completed shifts;
- scored task rewards;
- world time;
- regional resources and event modifiers.

Client-presented:

- animation and camera;
- input sampling;
- local movement interpolation;
- minigame presentation;
- optimistic UI that does not grant durable rewards.

### 18.3 Hosted evolution

V1 already includes authenticated WebSocket presence, snapshots, commands, duty handoff, and shared shifts. A hosted service adds:

- gateway routing, delta compression, prediction/reconciliation, and reconnect recovery;
- region simulation workers;
- distributed job queues;
- managed relational database;
- object storage and CDN;
- account recovery and external identity;
- moderation and audit services;
- telemetry pipeline;
- deployment-safe content registry.

### 18.4 Database domains

The alpha schema includes:

- accounts and password-derived credentials;
- sessions;
- characters, randomized attributes, role progress, and skill unlocks;
- countries and regions;
- regional resource state and NPC generations;
- restaurants, modular floor cells, wall edges, and placed objects;
- employment applications;
- service shifts, duty slots, player presences, parties, tasks, incidents, and command idempotency;
- review evidence, verified restaurant reviews, and ledger entries.

---

## 19. Security and integrity

- Passwords use salted scrypt hashes; plaintext is never stored.
- Session tokens are random, stored only as SHA-256 digests, and carried as Bearer credentials by the native client.
- Realtime connections must authenticate before subscribing or commanding; payload and per-second message limits are enforced.
- Request bodies are size-limited.
- Text inputs are length-limited and stripped of control/markup characters.
- Ownership, employment, skill prerequisites, capacity, funds, collision, and shift state are validated server-side.
- SQL uses prepared statements for player input.
- Task actions are phase-validated, idempotent, bounded, and scored by the server; clients never submit a final score.
- Local graceful shutdown requires loopback origin and a one-time, per-process control token stored outside the database.
- Hosted production still requires MFA/recovery, distributed rate limiting, task-attestation heuristics, secrets management, moderation, penetration testing, and signed content.

---

## 20. Art and interface direction

### 20.1 Visual language

The selected direction is an inviting adult management sim presented through tactile miniature-diorama art and a strong editorial command interface.

- deep teal and blue-black operational surfaces;
- tomato-red primary actions and urgent states;
- mustard navigation and economic emphasis;
- warm paper panels for readable public information;
- walnut, tile, steel, plaster, and scale-model material cues;
- condensed editorial display type with compact humanist body text.

Furniture artwork uses individual transparent, direct-overhead raster sprites so rotation, collision footprint and simulation identity stay aligned. The alpha-2 measured baseline is 20/229: all 16 core objects plus four production-catalog objects. The remaining 209 furniture sprites and 45 bespoke role-item icons are an explicit production queue in `planning/art-production.json`, with stable outputs and per-item prompt briefs. The validator reports coverage and forbids baked restaurant/world backgrounds; generated art does not silently turn a missing modular asset into a complete scene.

### 20.2 Strategic versus ground views

- The globe is spacious, slow, and strategic.
- Region art shows logistics, supply vehicles, sanitation infrastructure, and distinct restaurant concepts.
- The restaurant floor is brighter, denser, and task-oriented.
- Work pins show interaction opportunities; they never imply auto-completion.
- Reduced-motion mode removes drifting, pulses, and nonessential movement.

### 20.3 Audio direction

Future production audio layers:

- room tone by occupancy;
- station loops tied to throughput;
- call-and-response crew barks;
- subtle metronomic tension during peak service;
- distinct success sounds for clean work, not casino reward noise;
- regional ambience and event music;
- accessibility controls for bark density and critical cues.

---

## 21. Accessibility

- Keyboard navigation for all menus and minigames.
- WASD and arrow movement with click-to-move alternative.
- Visible focus states.
- Non-color status labels and symbols.
- Reduced-motion support.
- Scalable UI and responsive layouts.
- Timing-window width can be adjusted without changing reward ceilings.
- Future: remappable controls, screen-reader task summaries, high contrast, dyslexia-friendly font option, hold/toggle alternatives, audio cue substitution, and one-hand layouts.

Accessibility options affect input demands, not economic rewards.

---

## 22. Balance model

### 22.1 Task rewards

Alpha task reward is based on class economy tags and normalized quality. It is intentionally simple enough to inspect and replace with tunable tables.

Conceptually:

\[
R_t = (B_t + Q \times M_q) \times M_{class}
\]

XP grows more slowly than task cash and is granted to the shift ledger. Shift completion converts accrued work into personal payout and progression.

### 22.2 Anti-grind rules

- Best earnings come from maintaining a live restaurant, not repeating an isolated trivial task.
- Task availability derives from simulation queues.
- Cross-trained support is useful but cannot outperform a specialist forever.
- One-hour sessions receive a complete reward arc.
- Four-hour sessions offer continuity and mastery, not a fourfold exclusive bonus.
- Daily and seasonal objectives never require the maximum session length.

---

## 23. Telemetry and tuning plan

Local development should record privacy-safe aggregate counters only when explicitly enabled.

Important balance measures:

- task score distribution by role and input method;
- time to first accepted job and first shift;
- station idle and blocked time;
- guest patience causes;
- rack throughput and rewash rate;
- seating waste and section imbalance;
- table-turn distribution;
- restaurant failure causes;
- purchase regret and item resale rate;
- one-, two-, and four-hour session outcomes;
- resource scarcity duration;
- subclass adoption and skill-node diversity.

---

## 24. Production roadmap

### 24.1 V1 alpha foundation — implemented in source

- clean TypeScript server, `rro.v1` protocol, Bearer sessions, scrypt passwords, and a new SQLite schema with no V0 migration path;
- six-country native globe, 13 regions, 115 license slots, 23 seeded NPC restaurants, and an asserted 20% starting occupancy;
- regional demand, cost, resource pools, active seasonal modifiers, public restaurant performance, applications, reviews, and live-shift discovery;
- persistent shared shifts, 13 automatically available regional shifts, public employee/guest joining, NPC duty coverage, join-in-progress handoff, and authoritative snapshots;
- server-owned movement/collision, task claims, three-phase actions, scores, off-role penalties, earnings, role XP, incidents, satisfaction evidence, and reviews;
- seven base classes, exactly 28 nodes each (196 total), 89 continuous-work activities, four work lanes, and 12 reusable minigame grammars;
- targeted local-rival guest influence with five paid requests, manual live-task/dimension/intensity selection, telegraphing, caps, counterplay and positive staff upside rather than invisible sabotage;
- restaurant founding, treasury, 24×16 modular layouts, floor painting, room tags, snapped walls/openings, four-way object/art rotation, drag/move, collision, resale, repair and footprint expansion;
- 229 furniture definitions with non-linear tradeoffs, live ratings/happiness/work/economic effects, upkeep, wear and breakage; 20 measured production sprites with all 16 core objects covered;
- 45 persistent purchasable role tools/consumables, four-slot loadouts, stable icons and native shop/inventory UI;
- seasonal pack loading, role inheritance hooks, content hashing, forward-compatible stable IDs, and static validation;
- zero-error/zero-warning GDScript analysis, a Godot 4.4.1 Linux import/main-scene launch plus Windows export, strict TypeScript/content checks, explicit art coverage and 29 integration tests;
- a hidden Windows server controller with health checks and graceful tokenized shutdown, plus separate server/source/client release boundaries.

### 24.2 V1 release-candidate gate — required before calling the binary 1.0

- export and execute the Godot Windows client with Godot 4.4.1+ and official templates;
- run native UI, input, layout, reconnect, multi-client, DPI, and GPU compatibility tests;
- replace alpha-only credentials and migration assumptions with recovery, migrations, backup/restore, retention, and security review;
- complete utility networks, physical inventory/recipes/tickets, richer NPC pathing, scheduling, and role-authentic paperwork archives;
- ship a signed launcher/updater/installer, full licenses/SBOM, crash reporting, accessibility review, localization architecture, moderation, and operational monitoring;
- complete external restaurant-veteran and multiplayer crew playtests and balance one-, two-, and four-hour shifts.

The evidence checklist and current pass/fail state are in `docs/V1_RELEASE_GATE.md`.

### 24.3 V2 AAA program

V2 is not a feature pile. It is the staffed production program that turns the V1 vertical slice into a scalable, secure, content-rich MMO. Its MoSCoW scope is in `docs/V2_AAA_ROADMAP.md`. The 240 assignable work items—each with category, discipline, priority, target, size, dependencies, and acceptance—are in `docs/V2_TEAM_BACKLOG.md` and `planning/v2-backlog.json`.

---

## 25. Acceptance criteria for the V1 source baseline

1. A new player can create an account, close the game, restart, and sign back into the same profile.
2. The globe exposes multiple countries, regions, resource conditions, capacities, restaurants, and job counts.
3. A player can enter a region, compare public restaurant stats, and apply to an open role.
4. An authenticated player can join any advertised live shift immediately as an available employee role or as a guest.
5. Unoccupied duty slots are explicitly NPC-staffed and hand off to joining players without resetting the restaurant.
6. Every base role owns at least ten activities, four work lanes, multi-phase choices, partial failure, and downstream consequences.
7. A player can move with WASD on a rendered modular layout while the server validates speed, bounds, and object collision.
8. Completing work changes durable task history, role mastery, earnings, XP, party satisfaction, incidents, reviews, sanitation, and shift state.
9. Leaving returns the duty to an NPC, releases claimed work, and preserves earned progression.
10. Every base role has a class identity, primary minigame, three branches, independent progression, and unlockable skills.
11. Signup creates two aptitude strengths and two weaknesses while preserving access to every role.
12. A player can open a restaurant if a regional license is available and funds are sufficient.
13. The owner can paint cells, tag rooms, place walls/openings, buy, rotate, drag, collision-check, resell objects, and purchase an add-on footprint using restaurant funds.
14. A seasonal event changes regional market values and contributes temporary furniture without rewriting base records.
15. The registry can resolve a subclass through parent-role inheritance without modifying simulation switches.
16. A fresh world contains 23 restaurants across 115 slots; tests assert exact 20% occupancy.
17. Insolvent, critically unsafe, or poorly rated NPC restaurants can close permanently; underfilled regions can sprout a distinct generation while old database identity remains closed.
18. Automated checks cover content counts and occupancy, strict TypeScript, zero-error/zero-warning GDScript analysis, artwork coverage, authentication, HTTP-to-WebSocket upgrade, shared snapshots, role/off-role work, furniture simulation, persistent equipment, targeted rivalry, and modular building.
19. The release system produces a runnable standalone server ZIP, a GitHub-friendly clean source ZIP, and only labels a client ZIP runnable when a real Godot export exists.
20. The old web client, V0 database, V0 routes, and V0 Windows launchers are excluded from V1 release artifacts.
21. A character can purchase role equipment and consumables, maintain separate four-slot loadouts, use a consumable, restart the server, and recover the same quantities and loadouts.
22. Mixed placed furniture changes live rating, party satisfaction, role/task support, review baselines and settlement; wear reaches worn/broken state and owner repair restores condition with an audited cost.
23. A visiting local rival can choose one of their party's untouched minigames, select dimension/intensity, spend once, and expose visible counterplay; self-targets, stacking, cooldown and caps are enforced without extra spend.

---

## 26. Risks and guardrails

| Risk | Guardrail |
| --- | --- |
| Work becomes repetitive | Parallel queues, context-sensitive scoring, role branches, changing layouts and markets |
| Ownership dominates employment | Specialist prestige, wages, awards, team demand, ownership risk and operational cost |
| Four-hour sessions become mandatory | Complete one-hour arc, no exclusive long-session reward, safe early handoff |
| Solo play feels fake | NPCs consume real queues, wages, equipment, path capacity, and morale |
| Scarcity locks players out | Multiple regions, employment always available, license events, later transfer/sale market |
| Seasonal content corrupts saves | Stable IDs, pack versions, additive reconciliation, dormant unknown records |
| Minigames trivialize real work | Model decisions and tradeoffs, consult hospitality workers, never reward unsafe shortcuts |
| MMO economy encourages abuse | Server authority, transaction audit, rate limits, restoration tools, anti-collusion monitoring |

---

## 27. Glossary

- **Game hour:** Fifteen real minutes at the 4× clock.
- **Restaurant day:** Sixteen game hours / four real hours.
- **Shift:** A player’s bounded work session inside a restaurant day.
- **Role:** A base class such as Server or Cook.
- **Subclass:** A role definition inheriting another role’s mechanics and progression.
- **Task:** A server-recognized unit of scored work.
- **Station:** A spatial interaction point that opens work; not an auto-complete button.
- **License:** One unit of finite regional restaurant capacity.
- **Resource pool:** A shared regional availability measure.
- **Content pack:** A versioned additive bundle of classes, furniture, events, and future content domains.
- **NPC fill:** Authoritative simulation of unoccupied restaurant roles.
- **Dormant ID:** Save data retained while its owning content pack is unavailable.

---

## 28. Final design statement

Rush & Revenue Online treats restaurants as living cooperative systems rather than click factories. Its strategic globe gives every restaurant a real market context; its class model makes labor as important as ownership; its 4× clock gives one hour a satisfying dramatic arc; and its data-driven engine lets subclasses, regions, seasonal events, recipes, and furniture packs arrive without breaking the world that players have already built.
