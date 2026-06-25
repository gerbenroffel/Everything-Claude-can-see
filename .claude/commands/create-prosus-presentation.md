# create-prosus-presentation

Create a PowerPoint presentation using **pptxgenjs** that strictly follows the Prosus corporate brand identity. This skill must be invoked whenever any presentation is created — it ensures every deck is on-brand and consistent.

## When to use

Call this skill for **any request to create a presentation**, whether it is:
- A new deck from a document or data source
- An update to an existing Prosus presentation
- A one-pager, summary deck, or investor brief

---

## Brand Tokens

Always use these exact values. Never substitute generic colours.

```js
const B = {
  orange:   'E8521A',   // Prosus signature orange — primary accent
  orangeD:  'C23F0D',   // darker orange for depth / hover states
  navy:     '0F1B2D',   // slide background (deep navy)
  navyMid:  '1A2E45',   // card / panel background
  navyLt:   '243752',   // highlight panel background
  white:    'FFFFFF',
  offwhite: 'F5F5F0',   // large headline text
  muted:    'A8B8C8',   // body / supporting text
  subtle:   '4A6070',   // de-emphasised text (footers, labels)
  green:    '00B28A',   // positive metrics only (growth, profit)
  rule:     '1E3550',   // divider lines and card borders
};
```

**Font:** `Arial` (universally available; substitute `Calibri` only if Arial is unavailable).

---

## Logo

The Prosus P-mark and wordmark must appear in the **top-right corner of every slide** at position `x: 10.7, y: 0.22, w: 2.4, h: 0.6`.

### Logo source priority
1. If a file `prosus_logo.png` exists in the project root → use it directly:
   ```js
   slide.addImage({ path: 'prosus_logo.png', x: 10.7, y: 0.22, w: 2.4, h: 0.6 });
   ```
2. Otherwise, **generate it programmatically** using `sharp` (install if absent: `npm install sharp`):
   ```js
   const sharp = require('sharp');

   async function buildLogoPng(width = 320, height = 80) {
     const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
       <!-- vertical stroke of P -->
       <rect x="4" y="8" width="14" height="64" rx="2" fill="#E8521A"/>
       <!-- outer bowl -->
       <path d="M18 8 Q58 8 58 36 Q58 64 18 64 L18 52 Q44 52 44 36 Q44 20 18 20 Z" fill="#E8521A"/>
       <!-- inner shadow for 3-D depth -->
       <path d="M18 20 Q44 20 44 36 Q44 52 18 52 L18 44 Q36 44 36 36 Q36 28 18 28 Z" fill="#C23F0D"/>
       <!-- wordmark -->
       <text x="72" y="53" font-family="Arial,Helvetica,sans-serif" font-size="32"
             font-weight="700" letter-spacing="2" fill="#FFFFFF">prosus</text>
     </svg>`;
     const buf = await sharp(Buffer.from(svg)).png().toBuffer();
     return 'data:image/png;base64,' + buf.toString('base64');
   }
   ```

---

## Slide Layout Rules

| Element | Spec |
|---------|------|
| Layout | `LAYOUT_WIDE` (13.33 × 7.5 in) |
| Background | `B.navy` (`0F1B2D`) |
| Header bar | Full-width rect, `h: 1.0`, fill `B.navyMid`; thin left edge rect `w: 0.06` fill `B.orange` |
| Header title | `x: 0.25, y: 0.16`, `fontSize: 22`, bold, `color: B.white` |
| Section label | `fontSize: 13`, bold, `color: B.orange`, `allCaps: true`, followed by an orange rule (`h: 0.03`) |
| Card background | Fill `B.navyMid`, border `B.rule 1pt`; orange top-edge stripe `h: 0.06` |
| KPI value | `fontSize: 24–28`, bold, `color: B.orange` |
| Positive metric | `color: B.green` |
| Body text | `fontSize: 10–12`, `color: B.muted` |
| Footer | `fontSize: 9`, `color: B.subtle`, bottom of slide |
| Vertical divider | `w: 0.04`, fill `B.rule` — use to split left/right columns |

### Title slide (slide 1) specifics
- Left orange bar: `x: 0, y: 0, w: 0.5, h: 7.5`, fill `B.orange`
- Main title: `fontSize: 44–48`, bold, `color: B.white`, x starts at `0.75`
- Subtitle: `fontSize: 24–28`, `color: B.orange`
- Horizontal orange rule below subtitle
- 4 inline key stats (value + label) beneath the rule
- Italic CEO/leadership quote at bottom in `B.muted`
- Footer: report period + currency note in `B.subtle`

---

## Standard 4-Slide Structure

When creating a presentation from a management overview or annual report, use this structure:

| # | Slide | Content |
|---|-------|---------|
| 1 | **Title** | Company name, report title, 4 headline KPIs, leadership quote, footer |
| 2 | **Financial Performance** | 4 KPI cards (revenue, aEBIT, headline earnings, free cash); aEBIT trend table; revenue by region table |
| 3 | **Business Segments** | 3×2 grid of segment cards — each with name, sub-label, revenue, aEBIT, margin note, KPI bullets |
| 4 | **Strategy & Outlook** | 3 numbered strategic pillars (left column); key transactions as tagged rows (right column); AI/innovation highlight box |

For more or fewer slides, adapt the structure but **always keep slide 1 as the title slide** with the above spec, and **always follow the brand token and logo rules**.

---

## Dependencies

```bash
npm install pptxgenjs sharp
```

Both must be installed before running the generation script.

---

## Output

- Save as `<topic>_presentation.pptx` in the project root (e.g. `prosus_fy2025_overview.pptx`).
- Commit the generated `.pptx` **and** the generator script (`create_<topic>_presentation.js`) to the repo.
- Push to the active feature branch.

---

## Example invocation

```
/create-prosus-presentation @report.md (4 slides)
```

This skill reads the source document, applies the brand, generates the `.pptx`, and pushes it to the branch.
