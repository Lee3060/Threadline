// Writes the 18 product illustrations to public/products/<slug>.svg.
// Run with: npm run images
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'products');

const COLORS = {
  navy: '#2f4062', charcoal: '#45484c', white: '#f4f1ec', blush: '#e6aaa5', lilac: '#b6a2d4',
  sand: '#d6bf98', grey: '#9ba1a8', olive: '#6e7a45', sage: '#93b291', terracotta: '#c6633f',
  rust: '#a54d2c', sky: '#7fbbe3', mint: '#8fd4b6', yellow: '#f0c443',
};

// ── colour helpers ──
const hex = (h) => h.match(/\w\w/g).map((x) => parseInt(x, 16));
const toHex = (rgb) => '#' + rgb.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('');
const mix = (a, b, t) => toHex(hex(a).map((v, i) => v + (hex(b)[i] - v) * t));
const shade = (c, t) => mix(c, '#1c1917', t);
const tint = (c, t) => mix(c, '#ffffff', t);

// ── garment shapes (400×400 canvas); each returns SVG markup for fill f, shadow s, highlight h ──
const SHAPES = {
  trunks: (f, s, h) => `
    <path d="M92 138H308L300 278H232L200 214L168 278H100Z" fill="${f}"/>
    <path d="M200 214L200 168" stroke="${s}" stroke-width="3" stroke-linecap="round" opacity=".5"/>
    <rect x="88" y="118" width="224" height="30" rx="8" fill="${s}"/>
    <path d="M110 133H290" stroke="${h}" stroke-width="2" stroke-dasharray="2 8" stroke-linecap="round" opacity=".7"/>`,
  boxer: (f, s, h) => `
    <path d="M96 140H304L316 304H218L200 226L182 304H84Z" fill="${f}"/>
    <path d="M200 226C176 210 172 180 178 160" stroke="${s}" stroke-width="3" fill="none" opacity=".55" stroke-linecap="round"/>
    <rect x="92" y="116" width="216" height="32" rx="8" fill="${s}"/>
    <path d="M84 296H182M218 296H316" stroke="${s}" stroke-width="5" opacity=".5"/>`,
  brief: (f, s, h) => `
    <path d="M90 150H310V170C292 206 248 232 232 282H168C152 232 108 206 90 170Z" fill="${f}"/>
    <rect x="86" y="128" width="228" height="28" rx="8" fill="${s}"/>
    <path d="M100 176C126 200 150 222 164 262M300 176C274 200 250 222 236 262" stroke="${h}" stroke-width="3" fill="none" opacity=".6" stroke-linecap="round"/>
    <circle cx="150" cy="200" r="9" fill="${h}" opacity=".8"/><circle cx="246" cy="196" r="7" fill="${h}" opacity=".8"/><circle cx="200" cy="232" r="6" fill="${h}" opacity=".8"/>`,
  panty: (f, s, h) => `
    <path d="M86 146H314V168C298 204 252 230 236 276H164C148 230 102 204 86 168Z" fill="${f}"/>
    <path d="M86 146H314" stroke="${s}" stroke-width="10" stroke-linecap="round"/>
    <path d="M100 170C130 196 152 222 166 262M300 170C270 196 248 222 234 262" stroke="${s}" stroke-width="3" fill="none" opacity=".45" stroke-linecap="round"/>
    <path d="M190 160L200 168L210 160L210 176L200 168L190 176Z" fill="${h}"/>`,
  vest: (f, s, h) => `
    <path d="M148 64C152 112 248 112 252 64L286 70C280 118 292 152 314 178V336H86V178C108 152 120 118 114 70Z" fill="${f}" stroke="${s}" stroke-width="3" stroke-linejoin="round"/>
    <path d="M150 66C156 102 244 102 250 66" stroke="${s}" stroke-width="7" fill="none" stroke-linecap="round"/>
    ${[120, 150, 180, 210, 240, 270].map((x) => `<path d="M${x} 190V328" stroke="${s}" stroke-width="2" opacity=".35"/>`).join('')}`,
  bra: (f, s, h) => `
    <path d="M128 92L134 190M272 92L266 190" stroke="${s}" stroke-width="7" stroke-linecap="round"/>
    <path d="M100 208C98 140 188 128 198 208Z" fill="${f}"/>
    <path d="M202 208C212 128 302 140 300 208Z" fill="${f}"/>
    <path d="M118 196C122 160 160 150 184 176M216 176C240 150 278 160 282 196" stroke="${h}" stroke-width="3" fill="none" opacity=".7" stroke-linecap="round"/>
    <rect x="86" y="204" width="228" height="40" rx="12" fill="${s}"/>
    <path d="M104 224H296" stroke="${h}" stroke-width="2" stroke-dasharray="2 8" stroke-linecap="round" opacity=".7"/>`,
  cami: (f, s, h) => `
    <path d="M150 62L156 142M250 62L244 142" stroke="${s}" stroke-width="4" stroke-linecap="round"/>
    <path d="M140 138C172 124 228 124 260 138L304 336H96Z" fill="${f}"/>
    <path d="M140 138${Array.from({ length: 10 }, (_, i) => `L${146 + i * 12} ${i % 2 ? 138 : 150}`).join('')}L260 138" stroke="${h}" stroke-width="4" fill="none" stroke-linejoin="round"/>
    <path d="M180 170C176 230 168 290 160 330M226 170C232 230 240 290 248 330" stroke="${s}" stroke-width="2.5" fill="none" opacity=".35"/>`,
  thermalTop: (f, s, h) => `
    <path d="M142 66C166 90 234 90 258 66L330 98L372 278L330 292L290 164V334H110V164L70 292L28 278L70 98Z" fill="${f}" stroke="${s}" stroke-width="3" stroke-linejoin="round"/>
    <path d="M146 68C170 96 230 96 254 68" stroke="${s}" stroke-width="8" fill="none" stroke-linecap="round"/>
    <path d="M30 270L72 284M370 270L328 284M110 322H290" stroke="${s}" stroke-width="10" opacity=".6"/>
    ${[140, 170, 200, 230, 260].map((x) => `<path d="M${x} 130V310" stroke="${h}" stroke-width="2" opacity=".35"/>`).join('')}`,
  tee: (f, s, h) => `
    <path d="M146 68C170 94 230 94 254 68L342 104L314 178L280 162V334H120V162L86 178L58 104Z" fill="${f}" stroke="${s}" stroke-width="3" stroke-linejoin="round"/>
    <path d="M150 70C172 98 228 98 250 70" stroke="${s}" stroke-width="7" fill="none" stroke-linecap="round"/>
    <path d="M92 168L64 112M308 168L336 112" stroke="${s}" stroke-width="3" opacity=".4"/>
    <path d="M226 150H260V176H226Z" fill="${s}" opacity=".3"/>`,
  leggings: (f, s, h) => `
    <path d="M124 82H276L292 340H226L200 158L174 340H108Z" fill="${f}"/>
    <rect x="120" y="60" width="160" height="28" rx="8" fill="${s}"/>
    <path d="M110 326H172M228 326H290" stroke="${s}" stroke-width="10" opacity=".6"/>
    <path d="M150 110L136 310M250 110L264 310" stroke="${h}" stroke-width="2" opacity=".35"/>`,
  pants: (f, s, h) => `
    <path d="M116 84H284L306 340H222L200 160L178 340H94Z" fill="${f}"/>
    <rect x="112" y="60" width="176" height="30" rx="10" fill="${s}"/>
    <path d="M190 88C186 108 178 118 170 126M210 88C214 108 222 118 230 126" stroke="${h}" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M100 322H176M224 322H300" stroke="${s}" stroke-width="12" opacity=".6"/>
    <path d="M128 110C140 140 150 150 168 156M272 110C260 140 250 150 232 156" stroke="${s}" stroke-width="3" fill="none" opacity=".45"/>`,
  shorts: (f, s, h) => `
    <path d="M100 128H300L322 282H216L200 214L184 282H78Z" fill="${f}"/>
    <rect x="96" y="104" width="208" height="30" rx="10" fill="${s}"/>
    <path d="M192 132C188 152 180 162 172 170M208 132C212 152 220 162 228 170" stroke="${h}" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M80 272H184M216 272H320" stroke="${s}" stroke-width="5" opacity=".5"/>`,
  socksAnkle: (f, s, h, extra) => {
    const sock = (dx, dy, c, cs) => `
      <g transform="translate(${dx} ${dy})">
        <path d="M150 150H226V214C226 236 244 244 270 248C310 254 312 312 268 312H160C130 312 126 284 138 262C146 246 150 232 150 214Z" fill="${c}"/>
        <rect x="146" y="138" width="84" height="22" rx="6" fill="${cs}"/>
        <path d="M262 249C312 252 316 312 268 312H250C262 296 266 268 262 249Z" fill="${cs}" opacity=".45"/>
      </g>`;
    const [c2, c3] = extra || [f, f];
    return sock(-78, -50, c2, shade(c2, 0.25)) + sock(42, -10, c3, shade(c3, 0.25)) + sock(-18, 40, f, s);
  },
  socksCrew: (f, s, h) => {
    const sock = (dx, dy, op) => `
      <g transform="translate(${dx} ${dy})" opacity="${op}">
        <path d="M150 70H222V214C222 236 240 244 266 248C306 254 308 312 264 312H160C130 312 126 284 138 262C146 246 150 232 150 214Z" fill="${f}"/>
        <rect x="146" y="58" width="80" height="34" rx="6" fill="${s}"/>
        ${[70, 78, 86].map((y) => `<path d="M152 ${y}H220" stroke="${h}" stroke-width="2" opacity=".5"/>`).join('')}
        <path d="M258 249C308 252 312 312 264 312H246C258 296 262 268 258 249Z" fill="${s}" opacity=".5"/>
      </g>`;
    return sock(-50, 10, 0.75) + sock(40, 20, 1);
  },
  socksWool: (f, s, h) => {
    const sock = (dx, dy) => `
      <g transform="translate(${dx} ${dy})">
        <path d="M146 64H226V214C226 238 246 246 272 250C314 256 316 316 270 316H160C126 316 122 286 134 262C142 246 146 232 146 214Z" fill="${f}"/>
        <rect x="140" y="54" width="92" height="40" rx="8" fill="${s}"/>
        ${[110, 140, 170].map((y) => `<path d="M150 ${y}L168 ${y + 14}L186 ${y}L204 ${y + 14}L222 ${y}" stroke="${h}" stroke-width="4" fill="none" stroke-linejoin="round"/>`).join('')}
        <path d="M264 251C316 254 320 316 270 316H252C264 300 268 270 264 251Z" fill="${s}" opacity=".6"/>
      </g>`;
    return sock(-52, 0) + sock(48, 20);
  },
  thermalSet: (f, s, h) => `
    <g transform="translate(24 44) scale(.56)">${SHAPES.thermalTop(f, s, h)}</g>
    <g transform="translate(168 112) scale(.6)">${SHAPES.leggings(f, s, h)}</g>`,
};

// slug → [shape, colour, optional scale, extra]
const PRODUCTS = {
  'trunks-navy': ['trunks', 'navy'],
  'boxer-charcoal': ['boxer', 'charcoal'],
  'vest-white': ['vest', 'white'],
  'bra-blush': ['bra', 'blush'],
  'panty-lilac': ['panty', 'lilac'],
  'cami-sand': ['cami', 'sand'],
  'thermal-top-grey': ['thermalTop', 'grey'],
  'thermal-leggings-grey': ['leggings', 'grey'],
  'thermal-top-olive': ['thermalTop', 'olive'],
  'tee-sage': ['tee', 'sage'],
  'pants-navy': ['pants', 'navy'],
  'shorts-terracotta': ['shorts', 'terracotta'],
  'socks-ankle-mixed': ['socksAnkle', 'terracotta', 1, [COLORS.sky, COLORS.sage]],
  'socks-crew-charcoal': ['socksCrew', 'charcoal'],
  'socks-wool-rust': ['socksWool', 'rust'],
  'kids-briefs-sky': ['brief', 'sky', 0.85],
  'kids-vest-mint': ['vest', 'mint', 0.82],
  'kids-thermal-yellow': ['thermalSet', 'yellow'],
};

function render(slug, [shape, colorName, scale = 1, extra]) {
  const f = COLORS[colorName];
  const isLight = colorName === 'white';
  const bg = isLight ? '#e6e0d6' : tint(f, 0.8);
  const bg2 = isLight ? '#d9d2c6' : tint(f, 0.68);
  const s = isLight ? '#cfc7ba' : shade(f, 0.22);
  const h = isLight ? '#ffffff' : tint(f, 0.35);
  const body = SHAPES[shape](f, s, h, extra);
  const t = scale === 1 ? '' : ` transform="translate(${200 - 200 * scale} ${200 - 200 * scale + 10}) scale(${scale})"`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" role="img" aria-label="${slug.replace(/-/g, ' ')}">
  <rect width="400" height="400" fill="${bg}"/>
  <circle cx="320" cy="78" r="120" fill="${bg2}" opacity=".55"/>
  <ellipse cx="200" cy="362" rx="130" ry="12" fill="${shade(bg, 0.12)}" opacity=".5"/>
  <g${t}>${body}
  </g>
</svg>
`;
}

mkdirSync(OUT, { recursive: true });
for (const [slug, spec] of Object.entries(PRODUCTS)) {
  writeFileSync(join(OUT, `${slug}.svg`), render(slug, spec).replace(/\n\s*\n/g, '\n'));
}
console.log(`Wrote ${Object.keys(PRODUCTS).length} SVGs to ${OUT}`);
