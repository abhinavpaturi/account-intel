// render.mjs — turn a dossier markdown file into a polished, self-contained HTML report.
//
//   node render.mjs <input.md> [output.html | outputDir]
//
// Zero dependencies (Node built-ins only) so the skill is clone-and-run. The converter
// is tuned to the constructs the dossier template uses: headings, bold/italic, blockquotes,
// horizontal rules, nested unordered/ordered lists, GFM pipe tables, links, and the
// [verified]/[unverified]/[estimate] confidence tags — which render as colored pills.

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const expand = p => (p.startsWith('~') ? path.join(os.homedir(), p.slice(1)) : p);
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Private-use sentinels: these code points never appear in real prose, so protected
// fragments can be stashed and restored without colliding with content like "Top 5".
const S0 = '', S1 = '';

// ---------- inline formatting ----------
function inline(text) {
  const stash = [];
  const keep = html => `${S0}${stash.push(html) - 1}${S1}`;

  let t = esc(text);

  // code spans (protect first)
  t = t.replace(/`([^`]+)`/g, (_, c) => keep(`<code>${c}</code>`));
  // [label](url) links
  t = t.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g,
    (_, lbl, url) => keep(`<a href="${url}" target="_blank" rel="noopener">${lbl}</a>`));
  // confidence pills: [verified ...], [unverified ...], [estimate ...]
  t = t.replace(/\[(verified|unverified|estimate)([^\]]*)\]/gi,
    (_, kind, rest) => keep(`<span class="pill pill-${kind.toLowerCase()}">${(kind + rest).trim()}</span>`));
  // autolinks (protect so later passes don't touch the href)
  t = t.replace(/(https?:\/\/[^\s<]+[^\s<.,;)])/g,
    u => keep(`<a href="${u}" target="_blank" rel="noopener">${u}</a>`));
  t = t.replace(/(^|[\s(])(www\.[^\s<]+[^\s<.,;)])/g,
    (_, pre, u) => pre + keep(`<a href="https://${u}" target="_blank" rel="noopener">${u}</a>`));
  t = t.replace(/(^|[\s(])(linkedin\.com\/[^\s<]+[^\s<.,;)])/g,
    (_, pre, u) => pre + keep(`<a href="https://${u}" target="_blank" rel="noopener">${u}</a>`));

  // bold then italic
  t = t.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  t = t.replace(/__([^_]+)__/g, '<strong>$1</strong>');
  t = t.replace(/(^|[^*\w])\*([^*\n]+)\*/g, '$1<em>$2</em>');
  t = t.replace(/(^|[^_\w])_([^_\n]+)_/g, '$1<em>$2</em>');

  // email niceties
  t = t.replace(/^Subject:\s*/, '<span class="subj">Subject</span> ');
  t = t.replace(/^(—|--)\s+(.+)$/, '<span class="sig">— $2</span>');

  // restore protected fragments
  t = t.replace(new RegExp(`${S0}(\\d+)${S1}`, 'g'), (_, n) => stash[Number(n)]);
  return t;
}

// ---------- block helpers ----------
const isBlockStart = l =>
  /^#{1,6}\s/.test(l) ||
  /^\s*(---+|\*\*\*+)\s*$/.test(l) ||
  /^\s*>/.test(l) ||
  /^\s*([-*+]|\d+\.)\s+/.test(l) ||
  /^\s*\|/.test(l);

const splitRow = l => l.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map(c => c.trim());

function renderList(items) {
  // items: array of raw list-item lines (any nesting via leading spaces)
  const root = { indent: -1, children: [] };
  const stack = [root];
  for (const raw of items) {
    const indent = (raw.match(/^ */) || [''])[0].length;
    const m = raw.match(/^\s*([-*+]|\d+\.)\s+(.*)$/);
    if (!m) continue;
    const ordered = /\d+\./.test(m[1]);
    const node = { indent, ordered, content: inline(m[2]), children: [] };
    while (stack.length > 1 && stack[stack.length - 1].indent >= indent) stack.pop();
    stack[stack.length - 1].children.push(node);
    stack.push(node);
  }
  const ser = node => {
    if (!node.children.length) return '';
    const tag = node.children[0].ordered ? 'ol' : 'ul';
    return `<${tag}>` + node.children.map(c => `<li>${c.content}${ser(c)}</li>`).join('') + `</${tag}>`;
  };
  return ser(root);
}

function mdToHtml(md) {
  const lines = md.replace(/\r\n/g, '\n').replace(/\t/g, '  ').split('\n');
  const out = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.trim() === '') { i++; continue; }

    // horizontal rule
    if (/^\s*(---+|\*\*\*+)\s*$/.test(line)) { out.push('<hr>'); i++; continue; }

    // heading
    const h = line.match(/^(#{1,6})\s+(.*)$/);
    if (h) { out.push(`<h${h[1].length}>${inline(h[2].trim())}</h${h[1].length}>`); i++; continue; }

    // blockquote (consecutive > lines)
    if (/^\s*>/.test(line)) {
      const buf = [];
      while (i < lines.length && /^\s*>/.test(lines[i])) { buf.push(lines[i].replace(/^\s*>\s?/, '')); i++; }
      out.push(`<blockquote>${buf.map(inline).join('<br>')}</blockquote>`);
      continue;
    }

    // table: a pipe row immediately followed by a separator row
    if (/\|/.test(line) && i + 1 < lines.length && /^\s*\|?[\s:|-]*-[\s:|-]*\|?\s*$/.test(lines[i + 1]) && lines[i + 1].includes('-')) {
      const head = splitRow(lines[i]); i += 2;
      const rows = [];
      while (i < lines.length && lines[i].includes('|') && lines[i].trim() !== '') { rows.push(splitRow(lines[i])); i++; }
      const thead = '<thead><tr>' + head.map(c => `<th>${inline(c)}</th>`).join('') + '</tr></thead>';
      const tbody = '<tbody>' + rows.map(r => '<tr>' + r.map(c => `<td>${inline(c)}</td>`).join('') + '</tr>').join('') + '</tbody>';
      out.push(`<table>${thead}${tbody}</table>`);
      continue;
    }

    // list (contiguous list-item lines)
    if (/^\s*([-*+]|\d+\.)\s+/.test(line)) {
      const buf = [];
      while (i < lines.length && lines[i].trim() !== '' && /^\s*([-*+]|\d+\.)\s+/.test(lines[i])) { buf.push(lines[i]); i++; }
      out.push(renderList(buf));
      continue;
    }

    // paragraph (consecutive non-block lines; single newlines become <br>)
    const buf = [];
    while (i < lines.length && lines[i].trim() !== '' && !isBlockStart(lines[i])) { buf.push(lines[i]); i++; }
    out.push(`<p>${buf.map(inline).join('<br>')}</p>`);
  }
  return out.join('\n');
}

// ---------- styling ----------
const CSS = `
*{box-sizing:border-box}
html{-webkit-text-size-adjust:100%}
body{margin:0;background:#eceff3;color:#334155;line-height:1.65;font-size:16px;
  font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
  -webkit-font-smoothing:antialiased;padding:32px 16px}
.dossier{max-width:864px;margin:0 auto;background:#fff;border-radius:16px;padding:48px;
  box-shadow:0 1px 3px rgba(15,23,42,.06),0 24px 48px -24px rgba(15,23,42,.25)}
.dossier>h1:first-child{margin:-48px -48px 0;padding:40px 48px 20px;color:#fff;
  background:linear-gradient(135deg,#0f3d3e 0%,#11856a 55%,#0e9f6e 100%);
  font-size:29px;line-height:1.2;font-weight:700;letter-spacing:-.01em;border-radius:16px 16px 0 0}
.dossier>h1:first-child+p{margin:0 -48px;padding:14px 48px 18px;background:#0b2e2e;
  color:#a7cfc6;font-size:13.5px;line-height:1.75;border-bottom:3px solid #0e9f6e}
.dossier>h1:first-child+p strong{color:#fff;font-weight:600}
.dossier>h1:first-child+p a{color:#7ee0c1;border:0}
.dossier>h1:first-child+p+blockquote{margin-top:26px}
h2{font-size:18px;color:#0f3d3e;font-weight:700;letter-spacing:-.01em;margin:34px 0 14px;
  padding-bottom:7px;border-bottom:2px solid #e2e8f0}
h2 em{color:#0e9f6e;font-style:normal;font-weight:600;font-size:14px}
h3{font-size:14px;color:#0f3d3e;font-weight:700;margin:26px 0 10px;text-transform:uppercase;letter-spacing:.05em}
p{margin:12px 0}
strong{color:#1e293b;font-weight:600}
a{color:#0e7490;text-decoration:none;border-bottom:1px solid #bae6fd}
a:hover{border-bottom-color:#0e7490}
ul,ol{margin:12px 0;padding-left:22px}
li{margin:6px 0}
li>ul,li>ol{margin:6px 0}
hr{border:0;border-top:1px solid #e2e8f0;margin:26px 0}
code{background:#f1f5f9;padding:1.5px 6px;border-radius:5px;font-size:13.5px;
  font-family:ui-monospace,SFMono-Regular,Menlo,monospace;color:#be123c}
blockquote{margin:16px 0;padding:14px 20px;background:#f0fbf7;border-left:4px solid #0e9f6e;
  border-radius:0 10px 10px 0;color:#14463a;font-size:15.5px;line-height:1.6}
blockquote .sig{color:#5b8378}
table{width:100%;border-collapse:collapse;margin:14px 0;font-size:14px;
  box-shadow:0 0 0 1px #e2e8f0;border-radius:10px;overflow:hidden}
thead th{background:#0f3d3e;color:#fff;text-align:left;font-weight:600;padding:10px 13px;font-size:13px}
tbody td{padding:9px 13px;border-top:1px solid #eef2f6;vertical-align:top}
tbody tr:nth-child(even){background:#f8fafc}
.pill{display:inline-block;padding:1.5px 9px;border-radius:999px;font-size:11.5px;
  font-weight:600;line-height:1.5;vertical-align:baseline}
.pill-verified{background:#def7ec;color:#03543f}
.pill-unverified{background:#fdf6b2;color:#723b13}
.pill-estimate{background:#e1effe;color:#1e429f}
.subj{display:inline-block;background:#0f3d3e;color:#fff;font-size:10.5px;font-weight:700;
  text-transform:uppercase;letter-spacing:.05em;padding:1.5px 8px;border-radius:4px;margin-right:6px;vertical-align:1px}
.sig{color:#94a3b8;font-size:13.5px}
.doc-footer{margin:36px -48px -48px;padding:20px 48px 26px;border-top:1px solid #e2e8f0;
  background:#f8fafc;border-radius:0 0 16px 16px}
.legend{font-size:12px;color:#64748b;line-height:2.1}
.doc-footer .gen{margin-top:8px;font-size:11.5px;color:#94a3b8}
@media print{
  body{background:#fff;padding:0}
  .dossier{box-shadow:none;max-width:none;border-radius:0;padding:0 8mm}
  .dossier>h1:first-child,.dossier>h1:first-child+p{border-radius:0;margin-left:-8mm;margin-right:-8mm}
  .doc-footer{margin:24px -8mm 0;border-radius:0}
  a{color:#0e7490}
  table,blockquote,.pill,li{break-inside:avoid}
  h2,h3{break-after:avoid}
}
@page{margin:14mm}
@media (max-width:640px){
  body{padding:0}
  .dossier{padding:24px;border-radius:0}
  .dossier>h1:first-child{margin:-24px -24px 0;padding:28px 24px 16px;font-size:24px}
  .dossier>h1:first-child+p{margin:0 -24px;padding:12px 24px 14px}
  .doc-footer{margin:28px -24px -24px;padding:18px 24px 22px}
}`;

// ---------- main ----------
const inArg = process.argv[2];
const outArg = process.argv[3];
if (!inArg) { console.error('usage: node render.mjs <input.md> [output.html | outputDir]'); process.exit(1); }

const inPath = path.resolve(expand(inArg));
const md = fs.readFileSync(inPath, 'utf8');
const titleMatch = md.match(/^#\s+(.*)$/m);
const title = titleMatch ? titleMatch[1].replace(/[*_`]/g, '').trim() : path.basename(inPath, '.md');

let outPath;
if (outArg) {
  const o = path.resolve(expand(outArg));
  const isDir = outArg.endsWith('/') || (fs.existsSync(o) && fs.statSync(o).isDirectory());
  outPath = isDir ? path.join(o, path.basename(inPath).replace(/\.md$/i, '') + '.html') : o;
} else {
  outPath = inPath.replace(/\.md$/i, '') + '.html';
}

const body = mdToHtml(md);
const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<style>${CSS}</style>
</head>
<body>
<main class="dossier">
${body}
<footer class="doc-footer">
<div class="legend"><span class="pill pill-verified">verified</span> sourced &amp; confirmed &nbsp;·&nbsp; <span class="pill pill-unverified">unverified</span> confirm before calling &nbsp;·&nbsp; <span class="pill pill-estimate">estimate</span> directional, labelled</div>
<div class="gen">Generated by the Account Intel Agent — a research &amp; drafting aid. Review before sending.</div>
</footer>
</main>
</body>
</html>
`;

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, html);
console.log(outPath);
