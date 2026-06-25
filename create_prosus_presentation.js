const PptxGenJS = require('pptxgenjs');

const pptx = new PptxGenJS();

// Theme colors
const DARK_BG = '1A1A2E';
const ACCENT = '00B4D8';
const LIGHT_TEXT = 'FFFFFF';
const SUBTEXT = 'B0C4DE';
const CARD_BG = '16213E';
const GREEN = '06D6A0';
const ORANGE = 'FFB703';

pptx.layout = 'LAYOUT_WIDE';
pptx.author = 'Prosus Investor Relations';
pptx.company = 'Prosus N.V.';

// ─── SLIDE 1: Title ──────────────────────────────────────────────────────────
const s1 = pptx.addSlide();
s1.background = { color: DARK_BG };

// Left accent bar
s1.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 0.12, h: 7.5, fill: { color: ACCENT } });

// Title
s1.addText('Prosus N.V.', {
  x: 0.4, y: 1.2, w: 9, h: 0.9,
  fontSize: 42, bold: true, color: LIGHT_TEXT, fontFace: 'Calibri',
});
s1.addText('FY2025 Annual Report', {
  x: 0.4, y: 2.1, w: 9, h: 0.7,
  fontSize: 30, bold: false, color: ACCENT, fontFace: 'Calibri',
});
s1.addText('Management Overview', {
  x: 0.4, y: 2.8, w: 9, h: 0.5,
  fontSize: 20, color: SUBTEXT, fontFace: 'Calibri',
});

// Divider
s1.addShape(pptx.ShapeType.rect, { x: 0.4, y: 3.55, w: 5, h: 0.04, fill: { color: ACCENT } });

// Bullet highlights
const bullets = [
  'Revenue: US$6.2bn (+21% local currency)',
  'Consolidated aEBIT: US$179m (+100%)',
  'Core Headline Earnings: US$7.4bn (+47%)',
  'Major acquisitions: Despegar & Just Eat Takeaway.com (>US$7bn)',
];
s1.addText(bullets.map(b => ({ text: b, options: { bullet: { type: 'bullet' }, paraSpaceAfter: 4 } })), {
  x: 0.4, y: 3.75, w: 9, h: 2.2,
  fontSize: 14, color: SUBTEXT, fontFace: 'Calibri', valign: 'top',
});

// Footer
s1.addText('Year ended 31 March 2025  |  All figures in US dollars', {
  x: 0.4, y: 6.9, w: 12.3, h: 0.35,
  fontSize: 10, color: '555577', fontFace: 'Calibri',
});

// ─── SLIDE 2: Financial Performance ──────────────────────────────────────────
const s2 = pptx.addSlide();
s2.background = { color: DARK_BG };

s2.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.33, h: 1.0, fill: { color: CARD_BG } });
s2.addText('Financial Performance Highlights', {
  x: 0.4, y: 0.15, w: 12.5, h: 0.7,
  fontSize: 24, bold: true, color: LIGHT_TEXT, fontFace: 'Calibri',
});

// KPI cards — row 1
const kpis = [
  { label: 'Revenue', val: 'US$6.2bn', note: '+13% YoY\n+21% local currency', color: ACCENT },
  { label: 'aEBIT', val: 'US$179m', note: '+100% YoY\nvs -US$118m in FY24', color: GREEN },
  { label: 'Core Headline Earnings', val: 'US$7.4bn', note: '+47% YoY', color: ORANGE },
  { label: 'Free Cash Inflow', val: 'US$1.0bn', note: 'vs US$422m in FY24', color: ACCENT },
];

kpis.forEach((k, i) => {
  const x = 0.3 + i * 3.2;
  s2.addShape(pptx.ShapeType.roundRect, { x, y: 1.2, w: 3.0, h: 2.0, fill: { color: CARD_BG }, line: { color: k.color, pt: 2 }, rectRadius: 0.08 });
  s2.addText(k.label, { x, y: 1.25, w: 3.0, h: 0.4, fontSize: 11, color: SUBTEXT, align: 'center', fontFace: 'Calibri' });
  s2.addText(k.val, { x, y: 1.65, w: 3.0, h: 0.65, fontSize: 22, bold: true, color: k.color, align: 'center', fontFace: 'Calibri' });
  s2.addText(k.note, { x, y: 2.3, w: 3.0, h: 0.7, fontSize: 10, color: SUBTEXT, align: 'center', fontFace: 'Calibri' });
});

// aEBIT trend table
s2.addText('aEBIT Turnaround (US$m)', {
  x: 0.3, y: 3.4, w: 6, h: 0.4,
  fontSize: 14, bold: true, color: LIGHT_TEXT, fontFace: 'Calibri',
});

const trendRows = [
  [{ text: 'Year', options: { bold: true, color: ACCENT } }, { text: 'Ecommerce aEBIT', options: { bold: true, color: ACCENT } }, { text: 'Group aEBIT', options: { bold: true, color: ACCENT } }],
  [{ text: 'FY22' }, { text: '(413)' }, { text: '(586)' }],
  [{ text: 'FY23' }, { text: '(381)' }, { text: '(537)' }],
  [{ text: 'FY24' }, { text: '38' }, { text: '(118)' }],
  [{ text: 'FY25', options: { bold: true, color: GREEN } }, { text: '443', options: { bold: true, color: GREEN } }, { text: '179', options: { bold: true, color: GREEN } }],
];

s2.addTable(trendRows, {
  x: 0.3, y: 3.85, w: 6.5,
  fontSize: 12, color: SUBTEXT, fontFace: 'Calibri',
  fill: { color: CARD_BG },
  border: { type: 'solid', color: '334466', pt: 1 },
  rowH: 0.42,
  align: 'center',
  colW: [1.5, 2.5, 2.5],
});

// Revenue by geography note
s2.addText('Top Revenue Regions (FY25)', {
  x: 7.2, y: 3.4, w: 5.8, h: 0.4,
  fontSize: 14, bold: true, color: LIGHT_TEXT, fontFace: 'Calibri',
});

const geoData = [
  ['Eastern Europe', 'US$2,816m', '+19%'],
  ['Latin America', 'US$1,572m', '+5%'],
  ['Asia', 'US$718m', '+19%'],
  ['Central Europe', 'US$788m', '+5%'],
];
geoData.forEach((row, i) => {
  const y = 3.85 + i * 0.55;
  s2.addText(row[0], { x: 7.2, y, w: 3.0, h: 0.45, fontSize: 12, color: SUBTEXT, fontFace: 'Calibri' });
  s2.addText(row[1], { x: 10.2, y, w: 1.5, h: 0.45, fontSize: 12, color: LIGHT_TEXT, fontFace: 'Calibri', align: 'right' });
  s2.addText(row[2], { x: 11.8, y, w: 1.3, h: 0.45, fontSize: 12, color: GREEN, fontFace: 'Calibri', align: 'right' });
});

// ─── SLIDE 3: Business Segments ───────────────────────────────────────────────
const s3 = pptx.addSlide();
s3.background = { color: DARK_BG };

s3.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.33, h: 1.0, fill: { color: CARD_BG } });
s3.addText('Business Segment Performance', {
  x: 0.4, y: 0.15, w: 12.5, h: 0.7,
  fontSize: 24, bold: true, color: LIGHT_TEXT, fontFace: 'Calibri',
});

const segments = [
  { name: 'Food Delivery\n(iFood)', rev: 'US$1.3bn', aEBIT: 'US$226m', highlight: '+29% orders\n56M annual active users', color: ACCENT },
  { name: 'Classifieds\n(OLX)', rev: 'US$788m', aEBIT: 'US$273m', highlight: '35% aEBIT margin\n63.6M monthly app users', color: GREEN },
  { name: 'Payments & Fintech\n(PayU)', rev: 'US$1.1bn', aEBIT: '-US$31m', highlight: 'Improving; H2 momentum\niyzico: +87% local rev', color: ORANGE },
  { name: 'Etail\n(eMAG)', rev: 'US$2.5bn', aEBIT: 'US$14m', highlight: 'Turnaround: +US$40m\nvs -US$26m FY24', color: ACCENT },
  { name: 'Edtech', rev: 'US$170m', aEBIT: '-US$33m', highlight: 'Loss improved US$65m\nNear cashflow breakeven', color: SUBTEXT },
  { name: 'Tencent\n(23.5% stake)', rev: '—', aEBIT: 'US$5.7bn*', highlight: '*Equity accounted results\n+41% non-IFRS profit', color: ORANGE },
];

const cols = 3;
segments.forEach((seg, i) => {
  const col = i % cols;
  const row = Math.floor(i / cols);
  const x = 0.25 + col * 4.35;
  const y = 1.15 + row * 2.9;

  s3.addShape(pptx.ShapeType.roundRect, { x, y, w: 4.1, h: 2.65, fill: { color: CARD_BG }, line: { color: seg.color, pt: 2 }, rectRadius: 0.08 });
  s3.addText(seg.name, { x: x + 0.12, y: y + 0.1, w: 3.86, h: 0.55, fontSize: 13, bold: true, color: seg.color, fontFace: 'Calibri' });
  s3.addText(`Revenue: ${seg.rev}`, { x: x + 0.12, y: y + 0.68, w: 3.86, h: 0.35, fontSize: 11, color: SUBTEXT, fontFace: 'Calibri' });
  s3.addText(`aEBIT: ${seg.aEBIT}`, { x: x + 0.12, y: y + 1.05, w: 3.86, h: 0.35, fontSize: 12, bold: true, color: LIGHT_TEXT, fontFace: 'Calibri' });
  s3.addShape(pptx.ShapeType.rect, { x: x + 0.12, y: y + 1.45, w: 3.86, h: 0.02, fill: { color: seg.color } });
  s3.addText(seg.highlight, { x: x + 0.12, y: y + 1.55, w: 3.86, h: 0.8, fontSize: 10, color: SUBTEXT, fontFace: 'Calibri' });
});

// ─── SLIDE 4: Strategy & Outlook ─────────────────────────────────────────────
const s4 = pptx.addSlide();
s4.background = { color: DARK_BG };

s4.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.33, h: 1.0, fill: { color: CARD_BG } });
s4.addText('Strategy & Outlook', {
  x: 0.4, y: 0.15, w: 12.5, h: 0.7,
  fontSize: 24, bold: true, color: LIGHT_TEXT, fontFace: 'Calibri',
});

// Left column: strategic pillars
s4.addText('Strategic Pillars', {
  x: 0.3, y: 1.1, w: 5.9, h: 0.45,
  fontSize: 16, bold: true, color: ACCENT, fontFace: 'Calibri',
});

const pillars = [
  { icon: '1', title: 'AI-First Businesses', desc: 'Toqan assistant used by 20,000+ staff daily; 11% avg productivity gain. Large Commerce Model (LCM) in development.' },
  { icon: '2', title: 'Regional Ecosystems', desc: 'LatAm: >100M customers, >US$25bn GMV. India: Swiggy, PayU, Meesho. Europe: eMAG, OLX, iyzico + Just Eat.' },
  { icon: '3', title: 'Shareholder Value', desc: 'Share buyback: 11% NAV/share increase; float -27%. Dividend doubled to 20 euro cents. >US$7bn M&A committed.' },
];

pillars.forEach((p, i) => {
  const y = 1.7 + i * 1.65;
  s4.addShape(pptx.ShapeType.ellipse, { x: 0.3, y: y, w: 0.45, h: 0.45, fill: { color: ACCENT } });
  s4.addText(p.icon, { x: 0.3, y: y, w: 0.45, h: 0.45, fontSize: 14, bold: true, color: DARK_BG, align: 'center', valign: 'middle', fontFace: 'Calibri' });
  s4.addText(p.title, { x: 0.85, y: y, w: 5.3, h: 0.4, fontSize: 13, bold: true, color: LIGHT_TEXT, fontFace: 'Calibri' });
  s4.addText(p.desc, { x: 0.85, y: y + 0.4, w: 5.3, h: 0.85, fontSize: 10.5, color: SUBTEXT, fontFace: 'Calibri' });
});

// Right column: key transactions & AI
s4.addShape(pptx.ShapeType.rect, { x: 6.7, y: 1.1, w: 0.04, h: 6.1, fill: { color: ACCENT } });

s4.addText('Key FY25 Transactions', {
  x: 6.9, y: 1.1, w: 6.1, h: 0.45,
  fontSize: 16, bold: true, color: ACCENT, fontFace: 'Calibri',
});

const deals = [
  { co: 'Despegar', amt: 'US$1.7bn', note: 'LatAm travel — closes ecosystem for 100M+ customers' },
  { co: 'Just Eat Takeaway.com', amt: '€4.1bn', note: 'AI-first European food delivery; 17 markets, 61M customers' },
  { co: 'PayU / Mindgate', amt: 'US$68m', note: 'Real-time payments tech in India' },
  { co: 'iyzico / Paynet', amt: 'US$87m', note: 'Payments expansion in Türkiye' },
];

deals.forEach((d, i) => {
  const y = 1.7 + i * 0.95;
  s4.addShape(pptx.ShapeType.rect, { x: 6.9, y, w: 6.15, h: 0.8, fill: { color: CARD_BG }, line: { color: ACCENT, pt: 1 } });
  s4.addText(d.co, { x: 7.05, y: y + 0.05, w: 3.0, h: 0.35, fontSize: 12, bold: true, color: LIGHT_TEXT, fontFace: 'Calibri' });
  s4.addText(d.amt, { x: 10.1, y: y + 0.05, w: 2.8, h: 0.35, fontSize: 13, bold: true, color: ORANGE, align: 'right', fontFace: 'Calibri' });
  s4.addText(d.note, { x: 7.05, y: y + 0.4, w: 5.85, h: 0.35, fontSize: 9.5, color: SUBTEXT, fontFace: 'Calibri' });
});

s4.addText('AI Adoption Highlights', {
  x: 6.9, y: 5.65, w: 6.1, h: 0.35,
  fontSize: 13, bold: true, color: GREEN, fontFace: 'Calibri',
});
s4.addText(
  '• iFood: 56% customer support automated; fraud chargebacks at 0.1%\n• OLX Magic: conversational AI buying experience launched\n• Ventures: US$88m invested in AI startups across 40+ transactions',
  {
    x: 6.9, y: 6.05, w: 6.2, h: 1.2,
    fontSize: 10, color: SUBTEXT, fontFace: 'Calibri',
  }
);

// ─── Save ─────────────────────────────────────────────────────────────────────
pptx.writeFile({ fileName: 'prosus_fy2025_overview.pptx' })
  .then(() => console.log('Saved: prosus_fy2025_overview.pptx'))
  .catch(err => { console.error(err); process.exit(1); });
