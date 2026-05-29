# Mode: intel — the research → outbound playbook

Goal: from a company name or URL, produce one dossier (`templates/dossier.md`) a BDR can
act on in five minutes. Work the steps in order. Cite sources inline. Tag every fact.

## Step 0 — Resolve the target

- If given a URL, fetch it to get the canonical company name + what they do.
- If given a name, WebSearch to find the official site and disambiguate (right company,
  right country — bias to Ontario/IESO footprint per `seller.yml`).
- Determine the likely ICP segment (`seller.yml > icp.segments`). Honor a `--segment=` hint.

## Step 1 — Company snapshot

Gather, each with a source + confidence tag:
- What they do, in one line.
- Size signals: facilities/sites, square footage or MW load if available, headcount, revenue band.
- Footprint: Ontario / IESO presence (this drives the GA angle).
- 2–4 recent, dated news items (last ~18 months): expansions, new builds, funding, ESG
  announcements, leadership changes.

## Step 2 — Energy / electrification signals (the reason-to-call engine)

This is the heart of the dossier. Find the facts that mean "their power bill is big, peaky,
or about to grow," and therefore that `seller.yml` mechanics apply. Look for:
- Large or 24/7 load (data centers, plants, greenhouses), new capacity, expansions.
- Ontario / IESO footprint → **Global Adjustment / Class A / ICI** exposure.
- The **2026 hook** (`market_mechanics.the_2026_hook`): GA relief phasing out → exposure rising.
- Public ESG / net-zero / decarbonization commitments → the emissions value prop.
- On-site generation, batteries, EV fleet/charging → DER / grid-interactive angle.

For each signal, write one line: **the fact (source) → why it matters to us.**
If a fact is inferred not found, tag `[estimate]` and state the basis.

## Step 3 — Decision-maker map

Using `seller.yml > buyer_personas`, identify real people where possible:
- **Economic buyer** (CFO/COO), **Champion** (Facilities/Ops/Sustainability/Energy Mgr),
  **Technical** (controls/engineering/real estate).
- Per person: name, title, LinkedIn URL, one line of recent activity if visible — each
  tagged `[verified: <source>]` or `[unverified]`.
- If a name can't be found, output the **target title + a search string** to find them.
  NEVER invent a name. (See `_shared.md`.)

## Step 4 — Pain hypothesis (map to ONE pillar)

Pick the single best-fitting `product_pillar` from `seller.yml`. Write 2–3 sentences:
the prospect's situation (from Steps 1–2) → the specific pain → the pillar that addresses
it. Reference the real mechanic (e.g., "their 24/7 load means the Top 5 coincident peaks
are unavoidable without active curtailment").

## Step 5 — 30-second cold-call opener

≤ 90 words. Structure: name a specific signal about them → one sentence of relevance →
a soft ask for the next 30 seconds. Sound like a person who knows the Ontario market.
No pitch dump. Use `value_props` for the relevance line.

## Step 6 — Three discovery questions

Open-ended, tied to the Step 4 pain. Each should make the buyer reflect on cost/peak/
emissions exposure — not yes/no. Avoid leading questions that pitch.

## Step 7 — Three-email sequence

Short, plain text, one ask each. Apply `rep.yml > voice`. Sign with the rep's name (no
phone). Suggested cadence:
- **Email 1 (Day 0):** the strongest signal + the GA/peak hook + soft ask (15 min?).
- **Email 2 (Day 3):** a proof angle or the 2026 GA change + a different ask (worth a look?).
- **Email 3 (Day 7):** short break-up / one-line value + easy yes-or-no.

## Step 8 — Render + save

Fill `templates/dossier.md`. Save to `reports/{company-slug}-{YYYY-MM-DD}.md`. End with a
**Confidence & gaps** note: what's verified, what the rep must confirm before calling.
