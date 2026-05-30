---
name: account-intel
description: >
  Account Intel Agent — turn a target company name or URL into a sales-ready outbound
  packet: company snapshot, energy/electrification signals, decision-maker map, a
  product-mapped pain hypothesis, a 30-second cold-call opener, 3 discovery questions,
  and a 3-email sequence. Built for an Edgecom Energy BDR motion (Ontario Global
  Adjustment / ICI angle), but the seller config is swappable. Trigger when the user
  runs /account-intel, asks to "build a dossier / pre-call brief / outbound packet" on
  a company, or wants prospect research mapped to what they sell.
---

# Account Intel Agent — Router

Turn one input (a company name, or a URL) into a complete, sales-ready outbound packet a
BDR can act on in five minutes.

## Usage

```
/account-intel <company name>          e.g. /account-intel Cologix
/account-intel <company URL>           e.g. /account-intel https://cologix.com
/account-intel <name> --segment=greenhouse   (optional ICP hint)
```

No arguments → ask the user which company to research, then proceed.

## What it produces

Two files saved to **`~/Desktop/Account Intel Reports/`** — the dossier as markdown **and** a polished, self-contained HTML report (print-to-PDF ready) — containing:

1. **Company snapshot** — what they do, size, footprint, recent news (with sources)
2. **Energy / electrification signals** — the facts that create a reason-to-call
3. **Decision-maker map** — economic buyer, champion, technical contacts (name + title + LinkedIn, each marked verified/unverified)
4. **Pain hypothesis** — mapped to ONE `product_pillar` from `config/seller.yml`
5. **30-second cold-call opener** — references one specific signal
6. **3 discovery questions** — tied to the hypothesized pain
7. **3-email sequence** — personalized, short, one ask each

## How to run it

1. Read `config/seller.yml` (who we are, ICP, product pillars, market mechanics) and
   `config/rep.yml` (the rep + voice).
2. Read `modes/_shared.md` (sources, ethics, anti-hallucination rules).
3. Execute `modes/intel.md` (the research → synthesis playbook) for the target company.
4. Render with `templates/dossier.md`, save the markdown to `~/Desktop/Account Intel Reports/`,
   then run `render.mjs` to produce the beautified HTML and `open` it. (Details: `modes/intel.md` Step 8.)

Always load `_shared.md` before `intel.md`. The seller config is the source of truth for
product framing — never invent product capabilities that aren't in `seller.yml`.
