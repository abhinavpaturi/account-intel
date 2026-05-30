# Account Intel Agent

**Turn a company name into a sales-ready outbound packet in one command.**

```
/account-intel Cologix
```

→ a complete dossier: company snapshot, energy signals, a real decision-maker map, a
product-mapped pain hypothesis, a 30-second cold-call opener, three discovery questions,
and a three-email sequence — every fact tagged `verified` or `unverified`.

This is a [Claude Code](https://claude.com/claude-code) skill. It runs on the Claude Code
agent runtime and uses live web research — no API key, no scraping farm, no made-up data.

---

## Why I built this

I'm interviewing for a BDR seat at **Edgecom Energy**. Instead of just telling them I run
AI-assisted outbound, I built something I'd actually use. Also to show I belong at an AI-first company.

The hard part of outbound isn't volume, it's walking into a call already sounding like you
understand the prospect's world. For Edgecom that world is the **Ontario energy market**:
Global Adjustment, the Top 5 coincident peaks, the Industrial Conservation Initiative, and
the Class A relief that's phasing out in 2026. This agent bakes that domain knowledge into
every dossier, so the openers it writes sound like someone who already knows the space.

Point it at a target and 30 seconds later you have a brief you'd actually walk into a call
with. **That's my proposed first-week deliverable: 10 of these on Edgecom's top accounts.**

## What it produces

See real, unedited runs: **[Cologix](reports/samples/cologix-2026-05-29.md)** (data center) · **[Cadillac Fairview](reports/samples/cadillac-fairview-2026-05-30.md)** (commercial real estate)

A taste — the generated cold-call opener for Cologix (a Toronto data-center operator):

> "Hi Shafaq — Abhinav with Edgecom Energy in Toronto. You've got always-on load at 151
> Front and 905 King, and with Ontario's Class A relief phasing out this year, the Global
> Adjustment hit on those sites is about to climb. We predict and curtail the Top 5
> coincident peaks automatically — which cuts GA and, because we shift load to cleaner
> hours, moves your 65%-toward-2030 number at the same time. Worth 15 minutes?"

That references a **real** decision-maker (Cologix's Chief Energy Strategy Officer), a
**real** market change (2026 GA relief phase-out), and a **real** ESG gap (65% carbon-free
vs. a 100%-by-2030 goal) — and maps all of it to a specific Edgecom product pillar.

## How it works

```
account-intel/
├── SKILL.md              # entry point — /account-intel <company>
├── config/
│   ├── seller.yml        # who's selling: product pillars, ICP, Ontario GA mechanics  ← the brain
│   └── rep.yml           # the rep + voice calibration
├── modes/
│   ├── _shared.md        # sources, ethics, the anti-hallucination rules
│   └── intel.md          # the research → synthesis playbook (8 steps)
├── templates/
│   └── dossier.md        # output shape
└── reports/              # generated dossiers land here
    └── samples/          # committed example runs
```

1. Reads `config/seller.yml` — the domain knowledge that makes output expert.
2. Runs the `modes/intel.md` playbook: resolve target → snapshot → energy signals →
   decision-makers → pain hypothesis → opener → discovery → email sequence.
3. Researches live with web search + fetch (and optionally LinkedIn via the Chrome
   extension, using your own logged-in session).
4. Renders the dossier and saves it under `reports/`.

## The discipline: truth over completeness

A BDR who walks in with a wrong fact loses the room. So:

- **Every person and every metric is tagged** `[verified: <source>]` or `[unverified]`.
- **It never invents a name.** If it can't find the CFO, it gives you the title and a
  LinkedIn search string instead.
- **It disambiguates.** In the Cologix run it caught a similarly-named public company
  ("Hyperscale Data, Inc.") and explicitly excluded it from the brief.
- **It never sends anything** — it drafts; you review and send.

## Run it yourself

Requires [Claude Code](https://claude.com/claude-code). Then:

```bash
git clone <this-repo>
ln -s "$(pwd)/account-intel" ~/.claude/skills/account-intel
```

In Claude Code:

```
/account-intel <company name or URL>
/account-intel Cologix --segment=data_center
```

## Make it yours

Swap `config/seller.yml` to point the agent at any product and ICP — the playbook and the
truth-discipline stay the same. The Edgecom config (Ontario Global Adjustment, the 2026
relief phase-out, data-center / greenhouse / industrial ICP) ships as the working default.

---

*Built by Abhinav P · [linkedin.com/in/abhinav-p-4a8045101](https://linkedin.com/in/abhinav-p-4a8045101)*
