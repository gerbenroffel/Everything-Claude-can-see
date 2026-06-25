const PptxGenJS = require('pptxgenjs');
const sharp = require('sharp');
const path = require('path');

// ─── Brand tokens (Prosus official palette) ───────────────────────────────────
// Primary orange #E8521A, dark navy #0F1B2D, off-white #F5F5F0, mid-grey #8C9BAB
const B = {
  orange:   'E8521A',   // Prosus signature orange
  orangeD:  'C23F0D',   // darker orange for depth
  navy:     '0F1B2D',   // deep navy (main background)
  navyMid:  '1A2E45',   // card backgrounds
  navyLt:   '243752',   // lighter panel
  white:    'FFFFFF',
  offwhite: 'F5F5F0',
  muted:    'A8B8C8',
  subtle:   '4A6070',
  green:    '00B28A',   // used for positive metrics only
  rule:     '1E3550',   // divider lines
};

// ─── Build the Prosus logo PNG in memory ─────────────────────────────────────
// Geometric 3D "P" mark (simplified flat version) + wordmark "prosus"
// Actual Prosus P-mark: two concentric arcs on right half of a vertical stroke
async function buildLogoPng(width = 320, height = 80) {
  // The Prosus logomark is an orange geometric P with a 3-D look.
  // We replicate with SVG: bold vertical bar + two arcs forming the bowl,
  // plus a subtle inner highlight for depth. Wordmark in wide-tracked caps.
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <!-- P mark -->
    <!-- vertical stroke -->
    <rect x="4" y="8" width="14" height="64" rx="2" fill="#E8521A"/>
    <!-- outer bowl -->
    <path d="M18 8 Q58 8 58 36 Q58 64 18 64 L18 52 Q44 52 44 36 Q44 20 18 20 Z" fill="#E8521A"/>
    <!-- inner shadow for 3-D depth -->
    <path d="M18 20 Q44 20 44 36 Q44 52 18 52 L18 44 Q36 44 36 36 Q36 28 18 28 Z" fill="#C23F0D"/>
    <!-- wordmark -->
    <text x="72" y="53" font-family="Arial,Helvetica,sans-serif" font-size="32"
          font-weight="700" letter-spacing="2" fill="#FFFFFF">prosus</text>
  </svg>`;

  const pngBuf = await sharp(Buffer.from(svg)).png().toBuffer();
  return pngBuf.toString('base64');
}

async function main() {
  const logoB64 = await buildLogoPng();
  const logoData = `data:image/png;base64,${logoB64}`;

  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_WIDE';   // 13.33 × 7.5 inches

  // ─── Helper: add logo to any slide (top-right) ──────────────────────────────
  function addLogo(slide) {
    slide.addImage({ data: logoData, x: 10.7, y: 0.22, w: 2.4, h: 0.6 });
  }

  // ─── Helper: slide header bar ───────────────────────────────────────────────
  function addHeader(slide, title) {
    slide.addShape(pptx.ShapeType.rect, {
      x: 0, y: 0, w: 13.33, h: 1.0, fill: { color: B.navyMid },
    });
    // left orange accent
    slide.addShape(pptx.ShapeType.rect, {
      x: 0, y: 0, w: 0.06, h: 1.0, fill: { color: B.orange },
    });
    slide.addText(title, {
      x: 0.25, y: 0.16, w: 10.2, h: 0.68,
      fontSize: 22, bold: true, color: B.white, fontFace: 'Arial',
    });
    addLogo(slide);
  }

  // ─── Helper: horizontal rule ─────────────────────────────────────────────────
  function rule(slide, x, y, w) {
    slide.addShape(pptx.ShapeType.rect, { x, y, w, h: 0.03, fill: { color: B.orange } });
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // SLIDE 1 — Title
  // ══════════════════════════════════════════════════════════════════════════════
  const s1 = pptx.addSlide();
  s1.background = { color: B.navy };

  // Left orange bar
  s1.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 0.5, h: 7.5, fill: { color: B.orange } });

  // Logo (top-right, on dark bg)
  s1.addImage({ data: logoData, x: 10.7, y: 0.25, w: 2.4, h: 0.6 });

  // Title block
  s1.addText('FY2025 Annual Report', {
    x: 0.75, y: 1.6, w: 9.5, h: 1.0,
    fontSize: 46, bold: true, color: B.white, fontFace: 'Arial',
  });
  s1.addText('Management Overview', {
    x: 0.75, y: 2.65, w: 9.5, h: 0.65,
    fontSize: 26, bold: false, color: B.orange, fontFace: 'Arial',
  });

  rule(s1, 0.75, 3.5, 7.5);

  // Key stats — 4 inline numbers
  const titleStats = [
    { val: 'US$6.2bn', lbl: 'Revenue' },
    { val: '+21%',     lbl: 'Local-currency growth' },
    { val: 'US$179m',  lbl: 'Group aEBIT' },
    { val: 'US$7.4bn', lbl: 'Core headline earnings' },
  ];
  titleStats.forEach((s, i) => {
    const x = 0.75 + i * 3.1;
    s1.addText(s.val, {
      x, y: 3.7, w: 2.9, h: 0.7,
      fontSize: 26, bold: true, color: B.orange, fontFace: 'Arial',
    });
    s1.addText(s.lbl, {
      x, y: 4.4, w: 2.9, h: 0.45,
      fontSize: 11, color: B.muted, fontFace: 'Arial',
    });
  });

  // Tagline
  s1.addText('"A year of growth, innovation, disciplined execution and strategic milestones"', {
    x: 0.75, y: 5.3, w: 11.5, h: 0.6,
    fontSize: 13, italic: true, color: B.muted, fontFace: 'Arial',
  });
  s1.addText('— Fabricio Bloisi, CEO', {
    x: 0.75, y: 5.9, w: 6, h: 0.35,
    fontSize: 11, color: B.subtle, fontFace: 'Arial',
  });

  // Footer
  s1.addText('Year ended 31 March 2025  |  All figures in US dollars unless otherwise stated', {
    x: 0.75, y: 7.05, w: 12, h: 0.3,
    fontSize: 9, color: B.subtle, fontFace: 'Arial',
  });

  // ══════════════════════════════════════════════════════════════════════════════
  // SLIDE 2 — Financial Performance
  // ══════════════════════════════════════════════════════════════════════════════
  const s2 = pptx.addSlide();
  s2.background = { color: B.navy };
  addHeader(s2, 'Financial Performance Highlights');

  // 4 KPI cards
  const kpis = [
    { val: 'US$6.2bn',  lbl: 'Total Revenue',           note: '+13% reported  |  +21% local currency' },
    { val: 'US$179m',   lbl: 'Group aEBIT',              note: 'vs −US$118m in FY24 — 100% growth' },
    { val: 'US$7.4bn',  lbl: 'Core Headline Earnings',   note: '+47% YoY, driven by Tencent & ecommerce' },
    { val: 'US$1.0bn',  lbl: 'Free Cash Inflow',         note: 'vs US$422m in FY24' },
  ];

  kpis.forEach((k, i) => {
    const x = 0.25 + i * 3.26;
    // card
    s2.addShape(pptx.ShapeType.rect, {
      x, y: 1.15, w: 3.06, h: 1.9,
      fill: { color: B.navyMid }, line: { color: B.rule, pt: 1 },
    });
    // orange top border
    s2.addShape(pptx.ShapeType.rect, { x, y: 1.15, w: 3.06, h: 0.06, fill: { color: B.orange } });
    s2.addText(k.lbl, {
      x: x + 0.14, y: 1.28, w: 2.78, h: 0.38,
      fontSize: 10, color: B.muted, fontFace: 'Arial', bold: false,
    });
    s2.addText(k.val, {
      x: x + 0.14, y: 1.65, w: 2.78, h: 0.7,
      fontSize: 26, bold: true, color: B.orange, fontFace: 'Arial',
    });
    s2.addText(k.note, {
      x: x + 0.14, y: 2.35, w: 2.78, h: 0.55,
      fontSize: 9, color: B.muted, fontFace: 'Arial',
    });
  });

  // aEBIT turnaround table (left)
  s2.addText('aEBIT Turnaround', {
    x: 0.25, y: 3.25, w: 5.5, h: 0.42,
    fontSize: 14, bold: true, color: B.white, fontFace: 'Arial',
  });
  rule(s2, 0.25, 3.7, 5.5);

  const tRows = [
    [
      { text: 'Year', options: { bold: true, color: B.orange } },
      { text: 'Ecommerce aEBIT', options: { bold: true, color: B.orange } },
      { text: 'Group aEBIT', options: { bold: true, color: B.orange } },
    ],
    [{ text: 'FY22' }, { text: '(413)' }, { text: '(586)' }],
    [{ text: 'FY23' }, { text: '(381)' }, { text: '(537)' }],
    [{ text: 'FY24' }, { text: '38'    }, { text: '(118)' }],
    [
      { text: 'FY25', options: { bold: true, color: B.green } },
      { text: '443',  options: { bold: true, color: B.green } },
      { text: '179',  options: { bold: true, color: B.green } },
    ],
  ];
  s2.addTable(tRows, {
    x: 0.25, y: 3.78, w: 5.8,
    fontSize: 12, color: B.muted, fontFace: 'Arial',
    fill: { color: B.navyMid },
    border: { type: 'solid', color: B.rule, pt: 1 },
    rowH: 0.48,
    align: 'center',
    colW: [1.2, 2.3, 2.3],
  });

  // Revenue by region (right)
  s2.addText('Revenue by Region (US$m)', {
    x: 7.0, y: 3.25, w: 6.1, h: 0.42,
    fontSize: 14, bold: true, color: B.white, fontFace: 'Arial',
  });
  rule(s2, 7.0, 3.7, 6.1);

  const geos = [
    { region: 'Eastern Europe', fy25: '2,816', fy24: '2,371', chg: '+19%' },
    { region: 'Latin America',  fy25: '1,572', fy24: '1,495', chg: '+5%'  },
    { region: 'Central Europe', fy25: '788',   fy24: '750',   chg: '+5%'  },
    { region: 'Asia',           fy25: '718',   fy24: '601',   chg: '+19%' },
    { region: 'North America',  fy25: '122',   fy24: '106',   chg: '+15%' },
  ];

  s2.addTable([
    [
      { text: 'Region',    options: { bold: true, color: B.orange } },
      { text: 'FY25',      options: { bold: true, color: B.orange, align: 'right' } },
      { text: 'FY24',      options: { bold: true, color: B.orange, align: 'right' } },
      { text: 'Change',    options: { bold: true, color: B.orange, align: 'right' } },
    ],
    ...geos.map(g => [
      { text: g.region },
      { text: g.fy25,  options: { align: 'right' } },
      { text: g.fy24,  options: { align: 'right', color: B.subtle } },
      { text: g.chg,   options: { align: 'right', color: B.green, bold: true } },
    ]),
  ], {
    x: 7.0, y: 3.78, w: 6.1,
    fontSize: 11, color: B.muted, fontFace: 'Arial',
    fill: { color: B.navyMid },
    border: { type: 'solid', color: B.rule, pt: 1 },
    rowH: 0.44,
    colW: [2.4, 1.2, 1.2, 1.3],
  });

  // ══════════════════════════════════════════════════════════════════════════════
  // SLIDE 3 — Business Segments
  // ══════════════════════════════════════════════════════════════════════════════
  const s3 = pptx.addSlide();
  s3.background = { color: B.navy };
  addHeader(s3, 'Business Segment Performance');

  const segs = [
    {
      name: 'Food Delivery',      sub: 'iFood — Brazil',
      rev: 'US$1.3bn', aebit: 'US$226m', margin: '+19.1% EBITDA margin',
      kpi: '120M+ monthly orders  |  56M annual users  |  +29% orders YoY',
      pos: true,
    },
    {
      name: 'Classifieds',        sub: 'OLX — 9 markets',
      rev: 'US$788m', aebit: 'US$273m', margin: '35% aEBIT margin',
      kpi: '63.6M monthly app users  |  26.8M daily listings  |  Motors +24%',
      pos: true,
    },
    {
      name: 'Payments & Fintech', sub: 'PayU — India & Türkiye',
      rev: 'US$1.1bn', aebit: '−US$31m', margin: 'iyzico aEBIT: US$18m',
      kpi: 'iyzico +87% local rev  |  India H2 improving  |  Credit book US$558m',
      pos: false,
    },
    {
      name: 'Etail',              sub: 'eMAG — CEE',
      rev: 'US$2.5bn', aebit: 'US$14m', margin: 'Turnaround: +US$40m vs FY24',
      kpi: 'Romania aEBIT US$50m  |  GMV +15%  |  Sameday rev +38%',
      pos: true,
    },
    {
      name: 'Edtech',             sub: 'US & India',
      rev: 'US$170m', aebit: '−US$33m', margin: 'Loss improved US$65m YoY',
      kpi: 'Near cashflow breakeven  |  aEBIT −US$33m vs −US$98m',
      pos: false,
    },
    {
      name: 'Tencent',            sub: '23.5% associate stake',
      rev: '—', aebit: 'US$5.7bn*', margin: '*Equity accounted results',
      kpi: 'Non-IFRS profit +41%  |  WeChat 1.39bn MAU  |  Dividend US$1.0bn',
      pos: true,
    },
  ];

  const cols = 3;
  segs.forEach((seg, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = 0.22 + col * 4.35;
    const y = 1.15 + row * 2.95;

    // Card background
    s3.addShape(pptx.ShapeType.rect, {
      x, y, w: 4.15, h: 2.75,
      fill: { color: B.navyMid }, line: { color: B.rule, pt: 1 },
    });
    // Top accent line (orange if positive, subtle if loss)
    s3.addShape(pptx.ShapeType.rect, {
      x, y, w: 4.15, h: 0.06,
      fill: { color: seg.pos ? B.orange : B.subtle },
    });

    // Segment name
    s3.addText(seg.name, {
      x: x + 0.15, y: y + 0.1, w: 3.85, h: 0.42,
      fontSize: 14, bold: true, color: B.white, fontFace: 'Arial',
    });
    s3.addText(seg.sub, {
      x: x + 0.15, y: y + 0.52, w: 3.85, h: 0.3,
      fontSize: 9.5, color: B.muted, fontFace: 'Arial',
    });

    // Metrics row
    s3.addText('Revenue', { x: x + 0.15, y: y + 0.9, w: 1.6, h: 0.28, fontSize: 9, color: B.muted, fontFace: 'Arial' });
    s3.addText('aEBIT',   { x: x + 2.0,  y: y + 0.9, w: 2.0, h: 0.28, fontSize: 9, color: B.muted, fontFace: 'Arial' });
    s3.addText(seg.rev, {
      x: x + 0.15, y: y + 1.18, w: 1.8, h: 0.4,
      fontSize: 15, bold: true, color: B.offwhite, fontFace: 'Arial',
    });
    s3.addText(seg.aebit, {
      x: x + 2.0, y: y + 1.18, w: 2.0, h: 0.4,
      fontSize: 15, bold: true, color: seg.pos ? B.green : B.orange, fontFace: 'Arial',
    });
    s3.addText(seg.margin, {
      x: x + 0.15, y: y + 1.6, w: 3.85, h: 0.3,
      fontSize: 9.5, color: B.orange, fontFace: 'Arial',
    });

    // Divider
    s3.addShape(pptx.ShapeType.rect, { x: x + 0.15, y: y + 1.95, w: 3.85, h: 0.025, fill: { color: B.rule } });

    s3.addText(seg.kpi, {
      x: x + 0.15, y: y + 2.02, w: 3.85, h: 0.6,
      fontSize: 9, color: B.muted, fontFace: 'Arial',
    });
  });

  // ══════════════════════════════════════════════════════════════════════════════
  // SLIDE 4 — Strategy & Outlook
  // ══════════════════════════════════════════════════════════════════════════════
  const s4 = pptx.addSlide();
  s4.background = { color: B.navy };
  addHeader(s4, 'Strategy & Outlook');

  // ── Left: 3 strategic pillars ───────────────────────────────────────────────
  s4.addText('Three Strategic Pillars', {
    x: 0.25, y: 1.12, w: 6.1, h: 0.42,
    fontSize: 13, bold: true, color: B.orange, fontFace: 'Arial', allCaps: true,
  });
  rule(s4, 0.25, 1.57, 6.1);

  const pillars = [
    {
      n: '01', title: 'AI-First Businesses',
      body: 'Toqan assistant: 20,000+ daily users, 11% avg productivity gain. Large Commerce Model (LCM) in development. 30+ portfolio companies deploying AI.',
    },
    {
      n: '02', title: 'Regional Lifestyle Ecosystems',
      body: 'LatAm: >100M customers, >US$25bn GMV (iFood + Despegar + OLX). India: Swiggy, PayU, Meesho, Urban Company. Europe: eMAG, OLX, iyzico + Just Eat.',
    },
    {
      n: '03', title: 'Shareholder Value Creation',
      body: 'Buyback: NAV/share +11% since Jun 2022, free float reduced 27%. Dividend doubled to 20¢/share. US$836m invested in ecosystems in FY25.',
    },
  ];

  pillars.forEach((p, i) => {
    const y = 1.7 + i * 1.75;
    // number badge
    s4.addShape(pptx.ShapeType.rect, { x: 0.25, y, w: 0.52, h: 0.52, fill: { color: B.orange } });
    s4.addText(p.n, {
      x: 0.25, y, w: 0.52, h: 0.52,
      fontSize: 13, bold: true, color: B.white, align: 'center', valign: 'middle', fontFace: 'Arial',
    });
    s4.addText(p.title, {
      x: 0.9, y: y + 0.04, w: 5.45, h: 0.42,
      fontSize: 13, bold: true, color: B.white, fontFace: 'Arial',
    });
    s4.addText(p.body, {
      x: 0.9, y: y + 0.5, w: 5.45, h: 1.0,
      fontSize: 10.5, color: B.muted, fontFace: 'Arial',
    });
  });

  // ── Vertical divider ────────────────────────────────────────────────────────
  s4.addShape(pptx.ShapeType.rect, { x: 6.65, y: 1.1, w: 0.04, h: 6.2, fill: { color: B.rule } });

  // ── Right: Key transactions + AI highlights ─────────────────────────────────
  s4.addText('Key FY25 Transactions', {
    x: 6.85, y: 1.12, w: 6.2, h: 0.42,
    fontSize: 13, bold: true, color: B.orange, fontFace: 'Arial', allCaps: true,
  });
  rule(s4, 6.85, 1.57, 6.2);

  const deals = [
    { co: 'Despegar',              amt: 'US$1.7bn', note: 'LatAm travel leader — closes ecosystem for 100M+ customers; closed May 2025' },
    { co: 'Just Eat Takeaway.com', amt: '€4.1bn',   note: 'AI-first European food delivery; 17 markets, 61M customers, 356K+ partners' },
    { co: 'PayU / Mindgate',       amt: 'US$68m',   note: 'Real-time payments infrastructure in India' },
    { co: 'iyzico / Paynet',       amt: 'US$87m',   note: 'Payments network expansion in Türkiye' },
  ];

  deals.forEach((d, i) => {
    const y = 1.7 + i * 1.0;
    s4.addShape(pptx.ShapeType.rect, {
      x: 6.85, y, w: 6.2, h: 0.85,
      fill: { color: B.navyMid }, line: { color: B.rule, pt: 1 },
    });
    // left orange tag
    s4.addShape(pptx.ShapeType.rect, { x: 6.85, y, w: 0.06, h: 0.85, fill: { color: B.orange } });
    s4.addText(d.co, {
      x: 7.05, y: y + 0.06, w: 3.8, h: 0.36,
      fontSize: 12, bold: true, color: B.white, fontFace: 'Arial',
    });
    s4.addText(d.amt, {
      x: 10.9, y: y + 0.06, w: 2.0, h: 0.36,
      fontSize: 14, bold: true, color: B.orange, align: 'right', fontFace: 'Arial',
    });
    s4.addText(d.note, {
      x: 7.05, y: y + 0.44, w: 5.85, h: 0.36,
      fontSize: 9.5, color: B.muted, fontFace: 'Arial',
    });
  });

  // AI highlight box
  s4.addShape(pptx.ShapeType.rect, {
    x: 6.85, y: 5.85, w: 6.2, h: 1.45,
    fill: { color: B.navyLt }, line: { color: B.orange, pt: 1.5 },
  });
  s4.addText('AI Adoption in FY25', {
    x: 7.05, y: 5.93, w: 5.85, h: 0.36,
    fontSize: 12, bold: true, color: B.orange, fontFace: 'Arial',
  });
  s4.addText(
    '• iFood: 56% customer support automated; fraud chargebacks 0.1%; support cost −40%\n' +
    '• OLX Magic: conversational AI buying experience launched across classifieds\n' +
    '• Ventures: US$88m deployed into AI startups across 40+ transactions in FY25',
    {
      x: 7.05, y: 6.3, w: 5.85, h: 0.9,
      fontSize: 10, color: B.muted, fontFace: 'Arial',
    }
  );

  // ─── Write file ──────────────────────────────────────────────────────────────
  await pptx.writeFile({ fileName: 'prosus_fy2025_overview.pptx' });
  console.log('Saved: prosus_fy2025_overview.pptx');
}

main().catch(err => { console.error(err); process.exit(1); });
