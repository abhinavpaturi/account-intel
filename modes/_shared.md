# Shared rules — read before any mode

These rules govern every dossier. They exist to keep the output trustworthy: a BDR who
walks into a call with a wrong fact loses the room. Truth > completeness.

## Sources of truth

| File | What it provides |
|------|------------------|
| `config/seller.yml` | Who we are, product pillars, ICP, Ontario market mechanics, value props |
| `config/rep.yml` | The rep's identity (for signatures) + voice calibration |

**Never invent product capabilities.** Every claim about what we sell must trace to a
`product_pillar` or `value_prop` in `seller.yml`.

## Research tools (in priority order)

1. **WebSearch** — company news, expansions, ESG commitments, leadership, funding.
2. **WebFetch** — pull the company's own site (about, locations, sustainability pages).
3. **Chrome MCP (`mcp__Claude_in_Chrome__*`)** — only when the user is logged into
   LinkedIn and wants real decision-maker lookups. Use the user's own session; do not
   scrape at scale, and respect the site. If Chrome isn't connected, skip it and mark
   contacts `[unverified — confirm on LinkedIn]`.

## Anti-hallucination (the core discipline)

- **Every named person and every metric gets a confidence tag:** `[verified: <source>]`
  or `[unverified]`. No exceptions.
- If you can't find a real decision-maker by name, output the **target title** and how to
  find them ("search LinkedIn: 'Facilities Director' + <company>") rather than inventing a name.
- Never fabricate a quote, a deal, a headcount, or a peak-demand figure. Estimate ranges
  are allowed only when labelled `[estimate]` with the basis stated.
- Dates and numbers from search results must be quoted faithfully; if stale, say so.

## Ethics

- This is a research and drafting aid. **It never sends anything.** It produces drafts the
  rep reviews and sends themselves.
- No personal data beyond what a buyer publishes professionally (name, title, public
  LinkedIn). No personal emails/phones harvested from non-professional sources.
- Quality over volume — the point is fewer, sharper, better-targeted touches.

## Voice (from rep.yml)

Short sentences. Lead with a signal about THEM. Name the market mechanic (Global
Adjustment, Top 5 coincident peaks) to prove you know the space. One ask per email. None
of the banned filler words in `rep.yml`.
