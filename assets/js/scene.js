/* =====================================================================
   Or3L — scène 3D procédurale partagée (Canvas 2D, sans dépendance)
   ---------------------------------------------------------------------
   L'entreprise (production + services supports) se décompose en signaux ;
   la donnée est nettoyée, standardisée et rationalisée, puis captée par un
   cerveau unique, moitié humain, moitié IA, dont les décisions reviennent
   aux métiers.
   - Accueil : [data-scene-intro] joue l'introduction (35 s), puis la scène
     reste vivante derrière le titre.
   - Pages : [data-scene-view="factory|signals|refinery|hub|brain|performance"]
     affiche une vue de la même scène dans un moniteur.
   Mouvement réduit : image fixe. Hors écran ou onglet masqué : pause.
   ===================================================================== */
(function () {
  "use strict";
  const html = document.documentElement;
  const introRoot = document.querySelector("[data-scene-intro]");
  const viewRoots = Array.from(document.querySelectorAll("[data-scene-view]"));
  if (!introRoot && !viewRoots.length) return;
  const EN = (html.lang || "fr").slice(0, 2) === "en";
  const motion = matchMedia("(prefers-reduced-motion: reduce)");

  // Tout le reste se construit après le premier affichage de la page (voir le démarrage en bas).
  function boot() {
    /* ---------- Textes (FR / EN) ---------- */
    const T = EN ? {
      locale: "en-US", dec: ".", pct: "%",
      chapters: [
        ["01 / THE COMPANY", "It all starts with the business teams.", "Production and support services: a living company, always in motion.", "COMPANY"],
        ["02 / THE SIGNALS", "Every machine, every department speaks.", "Sensors, PLCs, ERP, CMMS, quality, HR: raw, heterogeneous, sometimes wrong data.", "SIGNALS"],
        ["03 / CLEANSING", "Weed out what is wrong.", "Every record is checked: duplicates, missing values and outliers are removed.", "CLEANSING"],
        ["04 / STANDARDISATION", "Speak the same language.", "Units, formats, dates: every value is converted into a common model.", "STANDARDISATION"],
        ["05 / RATIONALISATION", "A single source of truth.", "Silos are consolidated: one master data hub replaces point-to-point exchanges.", "RATIONALISATION"],
        ["06 / INTELLIGENCE", "One brain, two intelligences.", "AI detects and predicts; human expertise interprets and decides, on reliable data.", "INTELLIGENCE"],
        ["07 / PERFORMANCE", "Better decisions, better production.", "Every decision goes back to the business teams: performance improves.", "PERFORMANCE"]
      ],
      m3: ["Checked", "Duplicates", "Missing", "Outliers", "Reliable"],
      m4: [["Temperatures", "°F · K", "°C"], ["Energy", "MW · W", "kW"], ["Timestamps", "6 formats", "ISO 8601"], ["Quantities", "1.2E3 · lots", "parts"], ["Formats", "9", "1"]],
      m5: ["Source systems", "Interfaces", "Duplicates merged", "Sources of truth"],
      families: [["TEMP · °C", "165.4 °F", "74.1 °C"], ["ENERGY · kW", "0.342 MW", "342 kW"], ["DATE · ISO", "03/12/26 2pm", "2026-03-12 14:00"], ["QTY · pcs", "1.2E3", "1,200 pcs"]],
      nodes: ["ERP", "MES", "SCADA", "CMMS", "QUALITY", "PLM", "WMS", "HR", "FINANCE", "PURCHASING", "CRM", "EXCEL"],
      raw: ["T=74.1C", "342 kW", "NULL", "vib:2.4mm/s", "WO-4471 ?", "abs.HR=3.8%", "#N/A", "purch:1.2E3", "03/12/26 2pm"],
      flags: ["NULL", "#N/A", "OUTLIER", "DUPLICATE"],
      hub: "SINGLE SOURCE OF TRUTH",
      production: ["PRODUCTION", ["lines · machines · energy"]],
      support: ["SUPPORT SERVICES", ["HR · finance · purchasing", "quality · maintenance · IT"]],
      human: ["HUMAN", ["expertise · intuition"]],
      ai: ["AI", ["detection · prediction"]],
      stations: ["01 · CLEANSING", "02 · STANDARDISATION", "03 · RATIONALISATION"],
      labels: {reduced: "REDUCED MOTION", paused: "PAUSED", final: "LIVE"},
      status: {
        done: "Introduction complete. The page content is available.",
        paused: "Introduction paused."
      },
      pause: "Pause", resume: "Resume"
    } : {
      locale: "fr-FR", dec: ",", pct: " %",
      chapters: [
        ["01 / L'ENTREPRISE", "Tout part des métiers.", "Production et services supports : une entreprise vivante, en mouvement.", "ENTREPRISE"],
        ["02 / LES SIGNAUX", "Chaque machine, chaque service parle.", "Capteurs, automates, ERP, GMAO, qualité, RH : des données brutes, hétérogènes, parfois fausses.", "SIGNAUX"],
        ["03 / NETTOYAGE", "Écarter ce qui est faux.", "Chaque enregistrement est contrôlé : doublons, valeurs manquantes et aberrations sont écartés.", "NETTOYAGE"],
        ["04 / STANDARDISATION", "Parler le même langage.", "Unités, formats, dates : chaque donnée est convertie dans un modèle commun.", "STANDARDISATION"],
        ["05 / RATIONALISATION", "Une seule source de vérité.", "Les silos sont consolidés : un référentiel unique remplace les échanges point à point.", "RATIONALISATION"],
        ["06 / L'INTELLIGENCE", "Un cerveau, deux intelligences.", "L'IA détecte et prédit, l'expertise humaine interprète et arbitre, sur des données fiables.", "INTELLIGENCE"],
        ["07 / LA PERFORMANCE", "Mieux décider, mieux produire.", "Chaque décision revient aux métiers : la performance progresse.", "PERFORMANCE"]
      ],
      m3: ["Contrôlés", "Doublons", "Manquants", "Aberrants", "Fiables"],
      m4: [["Températures", "°F · K", "°C"], ["Énergie", "MW · W", "kW"], ["Horodatage", "6 formats", "ISO 8601"], ["Quantités", "1.2E3 · lots", "pièces"], ["Formats", "9", "1"]],
      m5: ["Systèmes sources", "Interfaces", "Doublons fusionnés", "Sources de vérité"],
      families: [["TEMP · °C", "165,4 °F", "74,1 °C"], ["ÉNERGIE · kW", "0,342 MW", "342 kW"], ["DATE · ISO", "12/03/26 14h", "2026-03-12 14:00"], ["QTÉ · pcs", "1.2E3", "1 200 pcs"]],
      nodes: ["ERP", "MES", "SCADA", "GMAO", "QUALITÉ", "PLM", "WMS", "RH", "FINANCE", "ACHATS", "CRM", "EXCEL"],
      raw: ["T=74.1C", "342 kW", "NULL", "vib:2,4mm/s", "OF-4471 ?", "abs.RH=3,8%", "#N/A", "achats:1.2E3", "12/03/26 14h"],
      flags: ["NULL", "#N/A", "ABERRANT", "DOUBLON"],
      hub: "RÉFÉRENTIEL UNIQUE",
      production: ["PRODUCTION", ["lignes · machines · énergie"]],
      support: ["SERVICES SUPPORTS", ["RH · finance · achats", "qualité · maintenance · SI"]],
      human: ["HUMAIN", ["expertise · intuition"]],
      ai: ["IA", ["détection · prédiction"]],
      stations: ["01 · NETTOYAGE", "02 · STANDARDISATION", "03 · RATIONALISATION"],
      labels: {reduced: "MOUVEMENT RÉDUIT", paused: "EN PAUSE", final: "EN DIRECT"},
      status: {
        done: "Introduction terminée. Le contenu de la page est disponible.",
        paused: "Introduction en pause."
      },
      pause: "Pause", resume: "Reprendre"
    };

    /* ---------- Chronologie (secondes) ---------- */
    const DURATION = 35, REVEAL = 32.6, TEXT_END = 32.7, TAU = Math.PI * 2, NEAR = 30;
    const DOWN0 = 5, DOWN1 = 7, UP0 = 30.2, UP1 = 31.6, SCAN_TOP = 184, SCAN_SPAN = 190;
    const SC0 = 10.1, SC1 = 12.7, LIFT1_0 = 13.3, LIFT1_1 = 14.9;
    const TOK0 = 14.6, TOK_STEP = .55, TOK_DUR = 2.1, TOK_CROSS = 1.3, LOCK0 = 17.5, LOCK1 = 18.2, LIFT2_0 = 18.6, LIFT2_1 = 19.6;
    const CONS0 = 21, CONS1 = 22, HUB0 = 21.7, HUB1 = 23.5, B0_0 = 23.5, B0_1 = 25.6, BUILD0 = 24, BUILD1 = 26.6;
    const BEAM0 = 28.9, KPI_SWAP = 30, KPI0 = 30.4, KPI1 = 32.6, IDLE0 = 29.8, END0 = 34;
    const MONO = '"JetBrains Mono", ui-monospace, Consolas, monospace';

    const mix = (p, q, t) => p + (q - p) * t;
    const clamp = x => Math.max(0, Math.min(1, x));
    const ease = x => { x = clamp(x); return x * x * (3 - 2 * x); };
    const easeOut = x => 1 - (1 - clamp(x)) ** 3;
    const frac = x => x - Math.floor(x);
    const fmt = (v, d) => v.toFixed(d).replace(".", T.dec);
    const num = v => Math.round(v).toLocaleString(T.locale);
    const minus = v => v < .5 ? "0" : "−" + num(v);
    const win = (t, t0, t1, fi = .35, fo = .3) => ease((t - t0) / fi) * (1 - ease((t - t1) / fo));
    const hash = n => { n = Math.imul(n | 0, 0x9e3779b1) ^ 0x5bd1e995; n = Math.imul(n ^ (n >>> 15), 0x85ebca6b); n ^= n >>> 13; return (n >>> 0) / 4294967296; };
    const set3 = (o, x, y, z) => { o[0] = x; o[1] = y; o[2] = z; return true; };
    const scanP = t => clamp((t - SC0) / (SC1 - SC0));
    const consP = t => ease((t - CONS0) / (CONS1 - CONS0));
    const hubP = t => clamp((t - HUB0) / (HUB1 - HUB0));
    const tokAt = f => TOK0 + f * TOK_STEP + TOK_CROSS;

    const M3 = T.m3, M4 = T.m4, M5 = T.m5;
    const CHAPTERS = [
      {start: 0, end: 4.4},
      {start: 4.4, end: 9.4},
      {start: 9.4, end: 14.1, metrics: [
        {label: M3[0], value: t => num(12480 * scanP(t))},
        {label: M3[1], value: t => minus(1240 * scanP(t)), cls: "neg"},
        {label: M3[2], value: t => minus(860 * scanP(t)), cls: "neg"},
        {label: M3[3], value: t => minus(310 * scanP(t)), cls: "neg"},
        {label: M3[4], value: t => num(10070 * scanP(t)), cls: "total"}
      ]},
      {start: 14.1, end: 18.7, metrics: M4.map(([label, value, to], k) => ({label, value, to, at: k < 4 ? tokAt(k) : LOCK1, cls: k === 4 ? "total" : ""}))},
      {start: 18.7, end: 23.4, metrics: [
        {label: M5[0], value: "12"},
        {label: M5[1], value: t => num(mix(66, 12, consP(t)))},
        {label: M5[2], value: t => num(1960 * hubP(t))},
        {label: M5[3], value: "12", to: "1", at: HUB1 - .3, cls: "total"}
      ]},
      {start: 23.4, end: 28.6},
      {start: 28.6, end: DURATION}
    ].map((c, i) => Object.assign(c, {num: T.chapters[i][0], title: T.chapters[i][1], detail: T.chapters[i][2], label: T.chapters[i][3]}));

    // Contexte de rendu courant : chaque instance (accueil ou moniteur) le renseigne avant de dessiner.
    let ctx = null, width = 0, height = 0, cx = 0, cy = 0, fov = 1, view = null, parts = null;
    let elapsed = 0, clock = 0, idleT = 0, work = 0;
    let seed = 3187;
    const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
    const a = new Float64Array(3), b = new Float64Array(3), c3 = new Float64Array(3), pa = new Float64Array(3), pb = new Float64Array(3);
    const g0 = new Float64Array(3), g1 = new Float64Array(3), sP = new Float64Array(3), sN = new Float64Array(3), camera = new Float64Array(3);
    const q4 = [0, 1, 2, 3].map(() => new Float64Array(3));
    let F0 = 0, F1 = 0, F2 = 1, R0 = 1, R2 = 0, U0 = 0, U1 = 1, U2 = 0;
    const layout = {stacked: false, short: false, intro: [0, 1, 0, 1], final: [0, 1, 0, 1], heroRight: 0, heroTop: 0, chapterRight: 0, chapterTop: 0, headerBottom: 0, density: 2, endDy: 0, endRw: 1, endRh: 1};

    /* ---------- Entreprise : production (cyan) + services supports (ambre) ---------- */
    const AX = -15;
    const segments = [];
    const seg = (ax, ay, az, bx, by, bz, delay, detail = false, kind = 0) => segments.push({ax, ay, az, bx, by, bz, delay, detail, kind});
    const path = (pts, closed, delay, detail = false, kind = 0) => {
      const n = closed ? pts.length : pts.length - 1;
      for (let i = 0; i < n; i++) { const p = pts[i], q = pts[(i + 1) % pts.length]; seg(p[0], p[1], p[2], q[0], q[1], q[2], delay, detail, kind); }
    };
    const rect = (x0, x1, y, z0, z1, delay, detail, kind) => path([[x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1]], true, delay, detail, kind);
    const box = (x0, x1, y0, y1, z0, z1, delay, detail, kind) => {
      rect(x0, x1, y0, z0, z1, delay, detail, kind); rect(x0, x1, y1, z0, z1, delay + .15, detail, kind);
      for (const [x, z] of [[x0, z0], [x1, z0], [x1, z1], [x0, z1]]) seg(x, y0, z, x, y1, z, delay + .08, detail, kind);
    };
    const ringPts = (x, y, z, r, n) => Array.from({length: n}, (_, i) => [x + r * Math.cos(i / n * TAU), y, z + r * Math.sin(i / n * TAU)]);

    const TX0 = -268, TX1 = -196, TZ0 = -36, TZ1 = 36, FH = 21, FLOORS = 6, TH = FH * FLOORS;
    rect(TX0, TX1, 0, TZ0, TZ1, 0, false, 1);
    for (const [x, z] of [[TX0, TZ0], [TX1, TZ0], [TX1, TZ1], [TX0, TZ1]]) seg(x, 0, z, x, TH, z, .18, false, 1);
    rect(TX0, TX1, TH, TZ0, TZ1, .55, false, 1);
    for (let k = 1; k < FLOORS; k++) rect(TX0, TX1, k * FH, TZ0, TZ1, .3 + k * .05, true, 1);
    for (let i = 1; i < 4; i++) { seg(TX0 + i * 18, 0, TZ0, TX0 + i * 18, TH, TZ0, .45 + i * .03, true, 1); seg(TX0, 0, TZ0 + i * 18, TX0, TH, TZ0 + i * 18, .45 + i * .03, true, 1); }
    box(-250, -214, TH, TH + 12, -14, 14, .7, false, 1);
    const ANT = [-232, TH + 52, 0];
    seg(-232, TH + 12, 0, -232, ANT[1], 0, .8, false, 1);
    seg(-239, TH + 34, 0, -225, TH + 34, 0, .85, true, 1);
    seg(-236, TH + 44, 0, -228, TH + 44, 0, .88, true, 1);
    path([[-250, 16, TZ0], [-250, 16, TZ0 - 12], [-214, 16, TZ0 - 12], [-214, 16, TZ0]], false, .9, true, 1);
    box(TX1, -150, 38, 52, -11, 11, .95, false, 1);
    const OFFICE_WINDOWS = Array.from({length: FLOORS}, (_, k) => [TX0 + 3, TX1 - 3, k * FH + 5, k * FH + 16, TZ0]);

    const HX0 = -150, HX1 = 110, HZ0 = -80, HZ1 = 80, WALL = 70, PEAK = 108, TEETH = 4, TW = (HX1 - HX0) / TEETH;
    rect(HX0, HX1, 0, HZ0, HZ1, 0, false, 0);
    for (const [x, z] of [[HX0, HZ0], [HX1, HZ0], [HX1, HZ1], [HX0, HZ1]]) seg(x, 0, z, x, WALL, z, .3 + (x - HX0) / 1300);
    for (const z of [HZ0, HZ1]) {
      const pts = [[HX0, WALL, z]];
      for (let i = 1; i <= TEETH; i++) pts.push([HX0 + i * TW, PEAK, z], [HX0 + i * TW, WALL, z]);
      path(pts, false, z === HZ0 ? .55 : .62);
    }
    for (let i = 0; i <= TEETH; i++) {
      const x = HX0 + i * TW;
      seg(x, WALL, HZ0, x, WALL, HZ1, .72 + i * .04);
      if (i) { seg(x, PEAK, HZ0, x, PEAK, HZ1, .74 + i * .04); seg(x, (WALL + PEAK) / 2, HZ0, x, (WALL + PEAK) / 2, HZ1, .95 + i * .03, true); }
    }
    path([[-40, 0, HZ0], [-40, 46, HZ0], [0, 46, HZ0], [0, 0, HZ0]], false, 1);
    for (const y of [12, 24, 36]) seg(-40, y, HZ0, 0, y, HZ0, 1.12, true);
    const WINDOWS = [-140, -106, -72, 12, 46, 80].map(x => [x, x + 24, 34, 50, HZ0]);
    for (const w of WINDOWS) path([[w[0], w[2], w[4]], [w[1], w[2], w[4]], [w[1], w[3], w[4]], [w[0], w[3], w[4]]], true, 1 + (w[0] + 150) / 1900, true);
    const CHX = 150, CHZ = 55, CHH = 150;
    path(ringPts(CHX, 0, CHZ, 12, 8), true, .2);
    path(ringPts(CHX, CHH, CHZ, 8, 8), true, .9);
    path(ringPts(CHX, CHH - 22, CHZ, 8.4, 8), true, .95, true);
    for (let i = 0; i < 8; i += 2) { const q = i / 8 * TAU; seg(CHX + 12 * Math.cos(q), 0, CHZ + 12 * Math.sin(q), CHX + 8 * Math.cos(q), CHH, CHZ + 8 * Math.sin(q), .5); }
    const SILOS = [[178, -38], [222, -38]], SR = 17, SH = 92;
    for (const [sx, sz] of SILOS) {
      path(ringPts(sx, 0, sz, SR, 12), true, .15);
      path(ringPts(sx, SH, sz, SR, 12), true, .78);
      path(ringPts(sx, SH / 2, sz, SR, 12), true, .85, true);
      for (let i = 0; i < 12; i += 3) { const q = i / 12 * TAU; seg(sx + SR * Math.cos(q), 0, sz + SR * Math.sin(q), sx + SR * Math.cos(q), SH, sz + SR * Math.sin(q), .45); }
      for (let i = 0; i < 12; i += 2) { const q = i / 12 * TAU; seg(sx + SR * Math.cos(q), SH, sz + SR * Math.sin(q), sx, SH + 18, sz, 1); }
    }
    seg(SILOS[0][0] - SR, 60, -38, HX1, 60, -38, 1.2, true);
    seg(SILOS[0][0] + SR, 78, -38, SILOS[1][0] - SR, 78, -38, 1.22, true);
    const CXL = -32, CXR = -8, CVH = 16, CV1 = -205;
    seg(CXL, CVH, HZ0, CXL, CVH, CV1, 1.05);
    seg(CXR, CVH, HZ0, CXR, CVH, CV1, 1.05);
    for (let z = -95; z > CV1; z -= 30) { seg(CXL, CVH, z, CXR, CVH, z, 1.15, true); seg(CXL, 0, z, CXL, CVH, z, 1.18, true); seg(CXR, 0, z, CXR, CVH, z, 1.18, true); }
    seg(CXL, CVH, CV1, CXR, CVH, CV1, 1.15);
    const ROB = [22, 0, -178];
    path(ringPts(ROB[0], 0, ROB[2], 10, 6), true, 1.15);
    path(ringPts(ROB[0], 8, ROB[2], 7, 6), true, 1.2, true);
    path([[46, 5, -192], [72, 5, -192], [72, 5, -166], [46, 5, -166]], true, 1.3, true);
    const LEDS = [1, 2, 3, 4].map(i => [HX0 + i * TW, PEAK, HZ0]).concat([ANT, [SILOS[0][0], SH + 18, -38], [SILOS[1][0], SH + 18, -38]]);
    const NET = [
      [[-232, .6, TZ0 - 14], [-232, .6, -112], [-20, .6, -112], [-20, .6, HZ0 - 1]],
      [[HX1 + 1, .6, 22], [200, .6, 22], [200, .6, -20]],
      [[TX1, .6, 28], [HX0 - 1, .6, 28]]
    ];

    /* ---------- Raffinerie de données : trois stations superposées ---------- */
    const S1 = 240, S2 = 322, S3 = 404, H1 = 118, H2 = 112, SLAB = 24, R3 = 150, HUB_R = 24, HUB_H = 34;
    const FAMILIES = ["#ffad6b", "#ffd75e", "#c7a2ff", "#7cc8ff"].map((color, f) => ({name: T.families[f][0], color, raw: T.families[f][1], std: T.families[f][2]}));
    const NODES3 = T.nodes.map((name, k) => {
      const q = -Math.PI / 2 + (k + .5) / 12 * TAU;
      return {name, kind: k < 7 ? 0 : 1, x: AX + R3 * Math.cos(q), z: R3 * Math.sin(q)};
    });
    // Échanges point à point entre tous les systèmes (12 × 11 / 2 = 66 interfaces)
    const LINKS = [];
    for (let i = 0; i < 12; i++) for (let j = i + 1; j < 12; j++) {
      const A = NODES3[i], B = NODES3[j], up = random() < .8 ? 22 + random() * 60 : -16 - random() * 20;
      LINKS.push({ax: A.x, az: A.z, bx: B.x, bz: B.z, cx: (A.x + B.x) / 2 + (random() - .5) * 70, cy: S3 + 11 + up, cz: (A.z + B.z) / 2 + (random() - .5) * 70, g: (i + j) % 3});
    }

    /* ---------- Cerveau : hémisphère humain (gauche) + hémisphère IA (droite) ---------- */
    // Le cerveau est incliné vers la caméra pour être vu par le dessus (deux hémisphères côte à côte).
    const BRAIN = [AX, 600, 0], STEM_TOP = -38, TILT = .72, CT = Math.cos(TILT), ST = Math.sin(TILT);
    const G = 3.5, CXH = 40, AXH = 78, AYT = 86, AYB = 58, AZH = 140, NA = 60, NB = 44, GW = NB + 1, NG = (NA + 1) * GW;
    const widthAt = al => .84 + .08 * (1 - Math.cos(al));
    const betaLim = al => { const c0 = (G - CXH) / (AXH * widthAt(al) * Math.max(Math.sin(al), 1e-6)); return c0 <= -1 ? Math.PI : Math.acos(c0); };
    const alphaAt = i => .05 + (Math.PI - .1) * i / NA;
    function surface(s, al, be, P, N, o) {
      const rho = Math.sin(al), wz = widthAt(al), hz = .9 + .05 * (1 - Math.cos(al)), ay = (be > 0 ? AYT : AYB) * hz;
      const xo = AXH * wz * rho * Math.cos(be), y = ay * rho * Math.sin(be), z = -AZH * Math.cos(al);
      P[o] = s * (CXH + xo); P[o + 1] = y; P[o + 2] = z;
      const nx = s * xo / (AXH * wz) ** 2, ny = y / ay ** 2, nz = z / AZH ** 2, l = Math.hypot(nx, ny, nz) || 1;
      N[o] = nx / l; N[o + 1] = ny / l; N[o + 2] = nz / l;
    }
    const distE = (x, y, z) => Math.hypot(x, y - STEM_TOP, z);
    const hemis = [-1, 1].map(s => {
      const P = new Float64Array(3 * NG), N = new Float64Array(3 * NG), D = new Float64Array(NG);
      for (let i = 0; i <= NA; i++) {
        const al = alphaAt(i), bl = betaLim(al);
        for (let j = 0; j <= NB; j++) { const k = i * GW + j; surface(s, al, -bl + 2 * bl * j / NB, P, N, 3 * k); D[k] = distE(P[3 * k], P[3 * k + 1], P[3 * k + 2]); }
      }
      return {s, P, N, D, V: new Float64Array(NG), WP: new Float64Array(3 * NG)};
    });
    let RMAX = 0;
    for (const h of hemis) for (let k = 0; k < NG; k++) RMAX = Math.max(RMAX, h.D[k]);
    const MS = [[], [3, 0], [0, 1], [3, 1], [1, 2], [3, 0, 1, 2], [0, 2], [3, 2], [2, 3], [0, 2], [0, 1, 2, 3], [1, 2], [1, 3], [0, 1], [3, 0], []];
    const edgeOf = (e, k0, k1, k2, k3) => e === 0 ? [2 * k0, k0, k1] : e === 1 ? [2 * k1 + 1, k1, k2] : e === 2 ? [2 * k3, k3, k2] : [2 * k0 + 1, k0, k3];
    function contour(h, field, level) {
      const {P, N} = h, V = new Float64Array(NG), pos = new Map(), segs = [];
      for (let k = 0; k < NG; k++) V[k] = field(P[3 * k], P[3 * k + 1], P[3 * k + 2]) - level;
      const at = (e, k0, k1, k2, k3) => {
        const [id, kA, kB] = edgeOf(e, k0, k1, k2, k3);
        if (!pos.has(id)) {
          const t = V[kA] / (V[kA] - V[kB]), v = [];
          for (let c = 0; c < 3; c++) v.push(P[3 * kA + c] + (P[3 * kB + c] - P[3 * kA + c]) * t);
          for (let c = 0; c < 3; c++) v.push(N[3 * kA + c] + (N[3 * kB + c] - N[3 * kA + c]) * t);
          pos.set(id, v);
        }
        return id;
      };
      for (let i = 0; i < NA; i++) for (let j = 0; j < NB; j++) {
        const k0 = i * GW + j, k1 = k0 + GW, k2 = k1 + 1, k3 = k0 + 1;
        const list = MS[(V[k0] > 0 ? 1 : 0) | (V[k1] > 0 ? 2 : 0) | (V[k2] > 0 ? 4 : 0) | (V[k3] > 0 ? 8 : 0)];
        for (let m = 0; m < list.length; m += 2) segs.push([at(list[m], k0, k1, k2, k3), at(list[m + 1], k0, k1, k2, k3)]);
      }
      const adj = new Map();
      segs.forEach((sg, n) => { for (const id of sg) { if (!adj.has(id)) adj.set(id, []); adj.get(id).push(n); } });
      const used = new Uint8Array(segs.length), chains = [];
      const walk = (n, id) => {
        const chain = [id];
        while (n >= 0) {
          used[n] = 1;
          id = segs[n][0] === id ? segs[n][1] : segs[n][0];
          chain.push(id);
          n = -1;
          for (const m of adj.get(id)) if (!used[m]) { n = m; break; }
        }
        return chain;
      };
      for (const [id, list] of adj) if (list.length === 1 && !used[list[0]]) chains.push(walk(list[0], id));
      for (let n = 0; n < segs.length; n++) if (!used[n]) chains.push(walk(n, segs[n][0]));
      return chains.filter(c => c.length > 4).map(c => c.map(id => pos.get(id)));
    }
    const gyriField = (x, y, z) => { const f = .15; return Math.sin(f * x + 1.8 * Math.sin(f * .83 * z + .4)) + Math.sin(f * 1.07 * z + 1.6 * Math.sin(f * .91 * y + 1.3)) + Math.sin(f * .96 * y + 1.5 * Math.sin(f * 1.13 * x + 2.2)); };
    const GL = [], gpts = [], gnrm = [];
    for (const chain of contour(hemis[0], gyriField, 0)) {
      GL.push({s: gpts.length / 3, n: chain.length});
      for (const v of chain) { gpts.push(v[0], v[1], v[2]); gnrm.push(v[3], v[4], v[5]); }
    }
    const GP = Float64Array.from(gpts), GNRM = Float64Array.from(gnrm), GN = GP.length / 3;
    const GD = new Float64Array(GN), GX = new Float64Array(GN), GY = new Float64Array(GN), GOK = new Uint8Array(GN), GF = new Uint8Array(GN);
    for (let k = 0; k < GN; k++) GD[k] = distE(GP[3 * k], GP[3 * k + 1], GP[3 * k + 2]);
    const LONG = GL.slice().sort((p, q) => q.n - p.n).slice(0, 18);

    const nodeList = [];
    for (let i = 0; i < 14; i++) {
      const al0 = .2 + (Math.PI - .4) * (i + .5) / 14, count = Math.max(2, Math.round(1 + 12 * Math.sin(al0) * betaLim(al0) / Math.PI));
      for (let k = 0; k < count; k++) {
        const al = al0 + (random() - .5) * .12, bl = betaLim(al) * .95;
        surface(1, al, -bl + (k + .5 + (random() - .5) * .55) / count * 2 * bl, sP, sN, 0);
        nodeList.push([sP[0], sP[1], sP[2], sN[0], sN[1], sN[2]]);
      }
    }
    const NODES = nodeList.length, AN = new Float64Array(3 * NODES), ANN = new Float64Array(3 * NODES), AD = new Float64Array(NODES);
    nodeList.forEach((v, k) => { AN.set(v.slice(0, 3), 3 * k); ANN.set(v.slice(3), 3 * k); AD[k] = distE(v[0], v[1], v[2]); });
    const AOK = new Uint8Array(NODES), AF = new Uint8Array(NODES), AV = new Uint8Array(NODES), ASX = new Float64Array(NODES), ASY = new Float64Array(NODES);
    const NODE_RATE = Float64Array.from({length: NODES}, () => .35 + random() * .8), NODE_PHASE = Float64Array.from({length: NODES}, () => random());
    const AE = [], edgeKeys = new Set();
    for (let i = 0; i < NODES; i++) {
      const near = [];
      for (let j = 0; j < NODES; j++) if (j !== i) near.push([Math.hypot(AN[3 * i] - AN[3 * j], AN[3 * i + 1] - AN[3 * j + 1], AN[3 * i + 2] - AN[3 * j + 2]), j]);
      near.sort((p, q) => p[0] - q[0]);
      for (const [, j] of near.slice(0, 3)) { const key = Math.min(i, j) * 4096 + Math.max(i, j); if (!edgeKeys.has(key)) { edgeKeys.add(key); AE.push([i, j]); } }
    }
    const TRACES = [];
    for (let n = 0; n < 9; n++) {
      let al = .55 + random() * (Math.PI - 1.1), be = (random() - .5) * 1.3 * betaLim(al);
      const pts = [], nrm = [], d = [];
      const push = () => { surface(1, al, be, sP, sN, 0); pts.push(sP[0], sP[1], sP[2]); nrm.push(sN[0], sN[1], sN[2]); d.push(distE(sP[0], sP[1], sP[2])); };
      push();
      const n1 = 3 + Math.floor(random() * 4), d1 = random() < .5 ? -1 : 1;
      for (let k = 0; k < n1; k++) { al = Math.max(.3, Math.min(Math.PI - .3, al + d1 * .07)); push(); }
      const n2 = 2 + Math.floor(random() * 4), d2 = random() < .5 ? -1 : 1;
      for (let k = 0; k < n2; k++) { const bl = betaLim(al) * .9; be = Math.max(-bl, Math.min(bl, be + d2 * .12)); push(); }
      TRACES.push({pts, n: nrm, d});
    }
    const RIMS = [-1, 1].map(s => {
      const P = new Float64Array(3 * (NA + 1)), N = new Float64Array(3 * (NA + 1)), D = new Float64Array(NA + 1);
      for (let i = 0; i <= NA; i++) { const al = alphaAt(i); surface(s, al, betaLim(al) * .998, P, N, 3 * i); D[i] = distE(P[3 * i], P[3 * i + 1], P[3 * i + 2]); }
      return {P, D};
    });
    const BRIDGES = [];
    for (let k = 0; k < 9; k++) {
      const al = .8 + (Math.PI - 1.6) * k / 8, be = betaLim(al) * .78;
      surface(-1, al, be, sP, sN, 0); const L = Array.from(sP);
      surface(1, al, be, sP, sN, 0); const R = Array.from(sP);
      BRIDGES.push([L[0], L[1], L[2], 0, Math.min(L[1], R[1]) - 20, (L[2] + R[2]) / 2, R[0], R[1], R[2]]);
    }
    const radiusAt = t => t <= BUILD0 ? 0 : t >= BUILD1 ? 1e9 : RMAX * 1.06 * ease((t - BUILD0) / (BUILD1 - BUILD0));
    const humanOrder = Array.from({length: GN}, (_, k) => k).sort((p, q) => GD[p] - GD[q]);
    const aiOrder = Array.from({length: NODES}, (_, k) => k).sort((p, q) => AD[p] - AD[q]);
    function pickTarget(side, t) {
      const order = side < 0 ? humanOrder : aiOrder, dist = side < 0 ? GD : AD, limit = radiusAt(t) + 6;
      let lo = 0, hi = order.length;
      while (lo < hi) { const mid = (lo + hi) >> 1; if (dist[order[mid]] < limit) lo = mid + 1; else hi = mid; }
      return order[Math.floor(random() * Math.max(Math.min(order.length, 10), lo))];
    }

    /* ---------- Enregistrements : de l'usine au cerveau ---------- */
    const clampS = v => Math.max(-1, Math.min(1, v));
    const particles = [];
    for (const s of segments) {
      const length = Math.hypot(s.bx - s.ax, s.by - s.ay, s.bz - s.az), count = Math.max(1, Math.round(length / (s.detail ? 18 : 12)));
      for (let k = 0; k < count; k++) {
        const f = (k + .5) / count, x = mix(s.ax, s.bx, f), y = mix(s.ay, s.by, f), z = mix(s.az, s.bz, f), r = random();
        const ex = AX + clampS((x + 15) / 280 + (random() - .5) * .2) * H1 * .92, ez = clampS((z + 50) / 160 + (random() - .5) * .25) * H1 * .92;
        // bad : 1 = valeur manquante, 2 = valeur aberrante
        const bad = r < .09 ? 1 : r < .14 ? 2 : 0, t0 = DOWN0 + (SCAN_TOP - y) / SCAN_SPAN * (DOWN1 - DOWN0) + random() * .1;
        particles.push({x, y, z, ex, ez, bad, t0, t1: t0 + 2 + random() * .5, tScan: SC0 + (ex - AX + H1) / (2 * H1) * (SC1 - SC0),
          fam: Math.floor(random() * 4), src: s.kind ? 7 + Math.floor(random() * 5) : Math.floor(random() * 7),
          h: bad === 2 ? 34 + random() * 20 : 5 + random() * 11, dup: !bad && random() < .11, dupA: random() * TAU,
          side: random() < .5 ? -1 : 1, jp: random() * TAU, jq: random() * TAU, spark: random() < .3, size: random()});
      }
    }
    const valid = particles.filter(p => !p.bad);
    // Station 2 : une matrice GRID × GRID, une colonne de blocs par famille de données
    const famCount = [0, 0, 0, 0];
    for (const p of valid) famCount[p.fam]++;
    let GRID = Math.ceil(Math.sqrt(valid.length)), widths = [];
    for (;; GRID++) {
      widths = famCount.map(n => Math.ceil(n / GRID));
      if (widths.reduce((s, w) => s + w, 0) + 3 <= GRID) break;
    }
    const CELL2 = 2 * H2 / GRID, famStart = [];
    let col = Math.floor((GRID - widths.reduce((s, w) => s + w, 0) - 3) / 2);
    for (const w of widths) { famStart.push(col); col += w + 1; }
    const FAM_X = FAMILIES.map((f, i) => AX - H2 + (famStart[i] + widths[i] / 2) * CELL2);
    for (let f = 0; f < 4; f++) {
      valid.filter(p => p.fam === f).sort((p, q) => p.ez - q.ez || p.ex - q.ex).forEach((p, k) => {
        p.si = famStart[f] + k % widths[f]; p.sj = Math.floor(k / widths[f]);
        p.sx = AX - H2 + (p.si + .5) * CELL2; p.sz = -H2 + (p.sj + .5) * CELL2;
      });
    }
    valid.sort((p, q) => p.sj - q.sj || p.si - q.si).forEach((p, n) => {
      const u = n / valid.length, node = NODES3[p.src], q = random() * TAU, r = Math.sqrt(random()) * 6.5;
      p.tL1 = LIFT1_0 + u * (LIFT1_1 - LIFT1_0) + random() * .08;
      p.tSnap = p.tL1 + 1.15 + random() * .2;
      p.tL2 = LIFT2_0 + u * (LIFT2_1 - LIFT2_0) + random() * .06;
      p.tA3 = p.tL2 + 1 + random() * .25;
      p.nx = node.x + r * Math.cos(q); p.ny = S3 + 3 + random() * 16; p.nz = node.z + r * Math.sin(q);
      p.tS = HUB0 + p.src * .05 + random() * .5;
      p.tH = p.tS + .65 + random() * .15;
    });
    valid.slice().sort((p, q) => p.tH - q.tH).forEach((p, n, list) => {
      p.tB0 = Math.max(p.tH + .15, B0_0 + n / list.length * (B0_1 - B0_0) + random() * .1);
      p.t5 = p.tB0 + 1.4 + random() * .4;
      p.target = pickTarget(p.side, p.t5);
    });
    const nodeTotal = new Float64Array(12), nodeIn = new Float64Array(12);
    for (const p of valid) nodeTotal[p.src]++;
    // Quelques enregistrements signalés pendant le contrôle
    const FLAGS = [];
    const byX = list => list.slice().sort((p, q) => p.ex - q.ex);
    const pickFlag = (list, at, text, kind) => { if (list.length) FLAGS.push({p: list[Math.min(list.length - 1, Math.floor(at * list.length))], text, kind}); };
    const missing = byX(particles.filter(p => p.bad === 1)), outliers = byX(particles.filter(p => p.bad === 2)), dups = byX(valid.filter(p => p.dup));
    pickFlag(missing, .16, T.flags[0], 0); pickFlag(missing, .5, T.flags[1], 0); pickFlag(missing, .84, T.flags[0], 0);
    pickFlag(outliers, .3, T.flags[2], 0); pickFlag(outliers, .7, T.flags[2], 0);
    pickFlag(dups, .22, T.flags[3], 1); pickFlag(dups, .6, T.flags[3], 1);

    // Flux continu une fois l'introduction terminée
    const IDLE_PERIOD = 7.5, LEGS = [0, .22, .4, .56, .7, 1];
    const idle = Array.from({length: 64}, () => {
      const p = particles[Math.floor(random() * particles.length)], v = valid[Math.floor(random() * valid.length)], side = random() < .5 ? -1 : 1;
      return {x: p.x, y: p.y, z: p.z, ex: p.ex, ez: p.ez, fam: p.fam, sx: v.sx, sz: v.sz, nx: v.nx, ny: v.ny, nz: v.nz, side,
        target: side < 0 ? Math.floor(random() * GN) : Math.floor(random() * NODES), phase: random()};
    });

    /* ---------- Décor ---------- */
    const stars = Array.from({length: 90}, () => ({x: (random() - .5) * 3000, y: random() * 1400 - 100, z: random() * 3400 - 900, size: .8 + random() * 1.4}));
    const traces = Array.from({length: 16}, (_, i) => {
      let x = Math.round((random() - .5) * 22) * 100;
      const z = Math.round(random() * 20 - 8) * 100;
      if (Math.abs(x) < 360 && z > -320 && z < 220) x += x < 0 ? -420 : 420;
      return {x, z, length: 180 + random() * 420, offset: random(), amber: i % 5 === 0};
    });
    const SPARK = Array.from({length: 28}, (_, i) => 64 + 23 * easeOut(i / 27 * 1.06) + (i && i < 27 ? (random() - .5) * 2.4 : 0));
    // Décisions : du cerveau vers les métiers, en contournant la raffinerie
    const BEAMS = [
      {src: [-74, -30, -30], dst: [ANT[0], ANT[1] + 3, ANT[2]], side: -1},
      {src: [-58, -42, 36], dst: [-70, PEAK + 2, 0], side: -1},
      {src: [44, -46, -66], dst: [ROB[0], 34, ROB[2]], side: 1},
      {src: [62, -42, 36], dst: [CHX, CHH + 3, CHZ], side: 1},
      {src: [76, -30, -30], dst: [SILOS[1][0], SH + 20, -38], side: 1}
    ].map(beam => Object.assign(beam, {c: new Float64Array(12)}));

    /* ---------- Étiquettes (DOM, alignées sur la scène ; accueil uniquement) ---------- */
    const tagLayer = introRoot ? introRoot.querySelector("[data-scene-tags]") : null;
    const TAGS = [];
    function addTag(cls, title, lines, opts) {
      if (!tagLayer) return;
      const el = document.createElement("div");
      el.className = "scene-tag " + cls;
      const head = document.createElement("b");
      head.textContent = title;
      el.appendChild(head);
      for (const line of lines) { const span = document.createElement("span"); span.textContent = line; el.appendChild(span); }
      tagLayer.appendChild(el);
      TAGS.push(Object.assign({el, w: 0, h: 0, cw: 0, ch: 0, th: 12, op: "", tf: "", shown: false, isCompact: false, lead: true, lines: lines.length > 0, group: null}, opts));
    }
    const endTag = t => ease((t - END0) / .7);
    // HUMAIN et IA s'effacent pendant le mouvement de caméra final, puis reviennent avec les autres étiquettes.
    const brainTag = (t, t0) => ease((t - t0) / .45) * (1 - win(t, REVEAL - .5, END0, .4, .6));
    const RAW = [
      [[64, 58, HZ0 - 2], ""], [[CHX, CHH - 10, CHZ - 12], ""], [[-104, 86, HZ0 - 2], "bad"],
      [[ROB[0] + 6, 46, ROB[2]], ""], [[-20, 22, -150], ""], [[-250, 104, TZ0 - 2], "amber"],
      [[-214, 62, TZ0 - 2], "bad"], [[-250, 28, TZ0 - 2], "amber"], [[SILOS[0][0], 70, -56], "amber"]
    ].map(([src, cls], k) => ({text: T.raw[k], src, cls, t: DOWN0 + (SCAN_TOP - src[1]) / SCAN_SPAN * (DOWN1 - DOWN0) + .05}));
    addTag("mid", T.production[0], T.production[1], {side: "up", color: "111,255,240",
      anchor: o => set3(o, -20, PEAK + 4, 0), alpha: t => win(t, .95, 4.1), compact: t => t > 3.2});
    addTag("mid amber", T.support[0], T.support[1], {side: "up", color: "255,207,143",
      anchor: o => set3(o, ANT[0], ANT[1] + 3, ANT[2]), alpha: t => win(t, 1.25, 4.2), compact: t => t > 3.2});
    for (const r of RAW) addTag("raw " + r.cls, r.text, [], {side: "float", lead: false, color: "",
      anchor: o => set3(o, r.src[0], r.src[1] + 96 * easeOut((elapsed - r.t) / 2.4), r.src[2]), alpha: t => win(t, r.t, r.t + 1.9, .22, .45)});
    [[T.stations[0], S1, H1], [T.stations[1], S2, H2], [T.stations[2], S3 + 11, R3 + 26]].forEach(([title, y, x]) =>
      addTag("plate", title, [], {side: "right", color: "111,255,240", group: "R", anchor: o => set3(o, AX + x, y, 0), alpha: t => endTag(t) * (layout.density > 0 ? .9 : 0)}));
    addTag("end amber", T.human[0], T.human[1], {side: "left", color: "255,207,143",
      anchor: o => tiltW(-CXH - AXH * .93 - 22, 8, 10, o), alpha: t => brainTag(t, 25.2), compact: () => layout.density === 0});
    addTag("", T.ai[0], T.ai[1], {side: "right", color: "111,255,240",
      anchor: o => tiltW(CXH + AXH * .93 + 22, 8, 10, o), alpha: t => brainTag(t, 25.35), compact: () => layout.density === 0});
    const FILTERS = TAGS.filter(t => t.group === "R");
    const BRAIN_TAGS = TAGS.slice(-2);
    const PLACE_ORDER = TAGS.filter(t => t.lead && t.group !== "R");

    /* ---------- Caméra ---------- */
    // t, cible x/y/z, distance, lacet, tangage, demi-largeur et demi-hauteur cadrées
    const KEYS = [
      [0, -35, 72, -30, 700, -.62, .1, 270, 150],
      [4.4, -25, 95, -20, 830, -.42, .17, 285, 175],
      [7.4, AX, 170, -10, 960, -.3, .27, 255, 215],
      [9.9, AX, S1 + 18, 0, 700, -.24, .46, 160, 110],
      [13.4, AX, S1 + 22, 0, 690, -.02, .42, 158, 108],
      [15.1, AX, S2 + 8, 0, 680, .14, .56, 150, 104],
      [18.4, AX, S2 + 12, 0, 670, .3, .52, 148, 104],
      [20, AX, S3 + 22, 0, 760, .22, .48, 200, 135],
      [23, AX, S3 + 30, 0, 760, .04, .36, 196, 132],
      [25.1, AX + 10, BRAIN[1] - 30, 10, 820, .03, .3, 215, 178],
      [28.2, AX + 10, BRAIN[1] - 26, 10, 860, -.08, .28, 222, 182],
      [30.7, AX, 330, 0, 1500, -.22, .12, 330, 410],
      [33.6, AX, 420, 0, 1250, -.15, .15, 258, 318],
      [DURATION, AX, 420, 0, 1290, -.19, .16, 260, 320]
    ];
    const cam = new Float64Array(8);
    function sampleKeys(t) {
      const n = KEYS.length;
      if (t <= KEYS[0][0] || t >= KEYS[n - 1][0]) { const k = t <= KEYS[0][0] ? KEYS[0] : KEYS[n - 1]; for (let j = 0; j < 8; j++) cam[j] = k[j + 1]; return; }
      let i = 0;
      while (t > KEYS[i + 1][0]) i++;
      const k0 = KEYS[Math.max(i - 1, 0)], k1 = KEYS[i], k2 = KEYS[i + 1], k3 = KEYS[Math.min(i + 2, n - 1)];
      const h = k2[0] - k1[0], u = (t - k1[0]) / h, u2 = u * u, u3 = u2 * u;
      const h00 = 2 * u3 - 3 * u2 + 1, h10 = u3 - 2 * u2 + u, h01 = -2 * u3 + 3 * u2, h11 = u3 - u2;
      for (let j = 1; j <= 8; j++) {
        const m1 = i === 0 ? 0 : (k2[j] - k0[j]) / (k2[0] - k0[0]);
        const m2 = i + 1 === n - 1 ? 0 : (k3[j] - k1[j]) / (k3[0] - k1[0]);
        cam[j - 1] = h00 * k1[j] + h10 * h * m1 + h01 * k2[j] + h11 * h * m2;
      }
    }
    // Vues des pages : cadrage fixe sur l'état final, caméra qui respire doucement.
    // cam : cible x/y/z, distance, lacet, tangage, demi-largeur et demi-hauteur cadrées.
    const PRESETS = {
      factory: {cam: [-34, 80, -26, 760, -.5, .15, 290, 150], skip: {brain: 1}},
      signals: {cam: [AX, 168, -10, 980, -.3, .27, 262, 212], skip: {brain: 1}},
      refinery: {cam: [AX, 326, 0, 1000, .14, .44, 205, 148], skip: {brain: 1}},
      hub: {cam: [AX, S3 + 24, 0, 800, .05, .42, 196, 118], skip: {brain: 1, floor: 1}},
      brain: {cam: [AX + 10, BRAIN[1] - 36, 10, 880, -.06, .27, 216, 168], skip: {factory: 1, floor: 1}},
      performance: {cam: [AX, 402, 0, 1290, -.19, .16, 255, 330], skip: {}}
    };
    function setCamera() {
      let tx, ty, tz, dist, yaw, pitch, rw, rh, x0, x1, y0, y1;
      if (view) {
        const c = view.cam, s = view.sway;
        tx = c[0]; ty = c[1]; tz = c[2]; rw = c[6]; rh = c[7];
        dist = c[3] + 20 * Math.sin(clock * .11) * s; yaw = c[4] + .1 * Math.sin(clock * .12) * s; pitch = c[5] + .014 * Math.sin(clock * .17) * s;
        x0 = view.box[0]; x1 = view.box[1]; y0 = view.box[2]; y1 = view.box[3];
      } else {
        sampleKeys(elapsed);
        const endK = ease((elapsed - 31.4) / 2.2);
        tx = cam[0]; ty = cam[1] + layout.endDy * endK; tz = cam[2]; rw = cam[6] * mix(1, layout.endRw, endK); rh = cam[7] * mix(1, layout.endRh, endK);
        dist = cam[3] + 26 * Math.sin(idleT * .11); yaw = cam[4] + .06 * Math.sin(idleT * .15); pitch = cam[5] + .015 * Math.sin(idleT * .13);
        const reveal = ease((elapsed - REVEAL) / 1.7), ib = layout.intro, fb = layout.final;
        x0 = mix(ib[0], fb[0], reveal); x1 = mix(ib[1], fb[1], reveal); y0 = mix(ib[2], fb[2], reveal); y1 = mix(ib[3], fb[3], reveal);
      }
      const cp = Math.cos(pitch);
      camera[0] = tx + dist * Math.sin(yaw) * cp; camera[1] = ty + dist * Math.sin(pitch); camera[2] = tz - dist * Math.cos(yaw) * cp;
      let fx = tx - camera[0], fy = ty - camera[1], fz = tz - camera[2], length = Math.hypot(fx, fy, fz);
      fx /= length; fy /= length; fz /= length;
      F0 = fx; F1 = fy; F2 = fz;
      length = Math.hypot(fz, fx); R0 = fz / length; R2 = -fx / length;
      U0 = fy * R2; U1 = fz * R0 - fx * R2; U2 = -fy * R0;
      cx = (x0 + x1) / 2; cy = (y0 + y1) / 2;
      fov = Math.min((x1 - x0) / (2 * rw), (y1 - y0) / (2 * rh)) * dist;
    }
    function project(x, y, z, out) {
      x -= camera[0]; y -= camera[1]; z -= camera[2];
      const depth = x * F0 + y * F1 + z * F2;
      if (depth <= NEAR) return false;
      const scale = fov / depth;
      out[0] = cx + (x * R0 + z * R2) * scale;
      out[1] = cy - (x * U0 + y * U1 + z * U2) * scale;
      out[2] = scale;
      return Number.isFinite(out[0]) && Number.isFinite(out[1]);
    }
    function segment3(x1, y1, z1, x2, y2, z2, target) {
      const d1 = (x1 - camera[0]) * F0 + (y1 - camera[1]) * F1 + (z1 - camera[2]) * F2;
      const d2 = (x2 - camera[0]) * F0 + (y2 - camera[1]) * F1 + (z2 - camera[2]) * F2;
      if (d1 <= NEAR && d2 <= NEAR) return;
      if (d1 <= NEAR) { const t = (NEAR + .5 - d1) / (d2 - d1); x1 += (x2 - x1) * t; y1 += (y2 - y1) * t; z1 += (z2 - z1) * t; }
      else if (d2 <= NEAR) { const t = (NEAR + .5 - d2) / (d1 - d2); x2 += (x1 - x2) * t; y2 += (y1 - y2) * t; z2 += (z1 - z2) * t; }
      if (project(x1, y1, z1, a) && project(x2, y2, z2, b)) { target.moveTo(a[0], a[1]); target.lineTo(b[0], b[1]); }
    }
    function quad(points) {
      ctx.beginPath();
      for (let i = 0; i < points.length; i++) {
        if (!project(points[i][0], points[i][1], points[i][2], a)) return false;
        if (i) ctx.lineTo(a[0], a[1]); else ctx.moveTo(a[0], a[1]);
      }
      ctx.closePath();
      return true;
    }
    function circle3(x, y, z, r, n, target) {
      for (let i = 0; i < n; i++) {
        const q0 = i / n * TAU, q1 = (i + 1) / n * TAU;
        segment3(x + r * Math.cos(q0), y, z + r * Math.sin(q0), x + r * Math.cos(q1), y, z + r * Math.sin(q1), target);
      }
    }
    function corners(x, y, h, alpha, color) {
      const ticks = new Path2D(), c = 16;
      for (const [sx, sz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
        segment3(x + sx * h, y, sz * h, x + sx * (h - c), y, sz * h, ticks);
        segment3(x + sx * h, y, sz * h, x + sx * h, y, sz * (h - c), ticks);
      }
      ctx.globalAlpha = alpha; ctx.strokeStyle = color; ctx.lineWidth = 1.4; ctx.stroke(ticks);
    }
    function cellQuad(x, y, z, c, target) {
      if (!project(x - c, y, z - c, q4[0]) || !project(x + c, y, z - c, q4[1]) || !project(x + c, y, z + c, q4[2]) || !project(x - c, y, z + c, q4[3])) return;
      target.moveTo(q4[0][0], q4[0][1]); target.lineTo(q4[1][0], q4[1][1]); target.lineTo(q4[2][0], q4[2][1]); target.lineTo(q4[3][0], q4[3][1]); target.closePath();
    }
    // Cellule minuscule à l'écran : un rectangle écrasé suffit (une projection au lieu de quatre).
    function cellDot(x, y, z, c, squash, target) {
      if (!project(x, y, z, a)) return;
      const w = c * a[2], h = Math.max(.6, w * squash);
      target.rect(a[0] - w, a[1] - h, 2 * w, 2 * h);
    }
    const setSpacing = value => { if ("letterSpacing" in ctx) ctx.letterSpacing = value; };
    // Police et largeurs mémorisées : changer ctx.font ou mesurer un texte à chaque image coûte cher.
    const textWidths = new Map();
    const setFont = font => { if (ctx._font !== font) { ctx.font = font; ctx._font = font; } };
    function textWidth(text, font) {
      const key = font + "|" + text;
      let w = textWidths.get(key);
      if (w === undefined) { setFont(font); w = ctx.measureText(text).width; textWidths.set(key, w); }
      return w;
    }

    /* ---------- Rendu : décor et entreprise ---------- */
    function drawBackground() {
      ctx.globalCompositeOperation = "source-over"; ctx.globalAlpha = 1;
      const haze = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(width, height) * .7);
      haze.addColorStop(0, "#10272f"); haze.addColorStop(.5, "#0b141c"); haze.addColorStop(1, "#0a0e13");
      ctx.fillStyle = haze; ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = "#80bac4";
      for (const s of stars) if (project(s.x, s.y, s.z, a)) {
        ctx.globalAlpha = Math.min(.35, a[2] * .2);
        const size = Math.min(2, Math.max(.45, s.size * a[2]));
        ctx.fillRect(a[0], a[1], size, size);
      }
      ctx.globalAlpha = 1;
    }
    function drawFloor() {
      const bands = [new Path2D(), new Path2D(), new Path2D()];
      const band = (x, z) => { const d = Math.hypot(x, z * .8); return d < 520 ? 0 : d < 1000 ? 1 : 2; };
      for (let z = -900; z <= 1700; z += 100) for (let x = -1300; x < 1300; x += 100) segment3(x, 0, z, x + 100, 0, z, bands[band(x + 50, z)]);
      for (let x = -1300; x <= 1300; x += 100) for (let z = -900; z < 1700; z += 100) segment3(x, 0, z, x, 0, z + 100, bands[band(x, z + 50)]);
      ctx.lineWidth = .7;
      [.17, .1, .05].forEach((alpha, i) => { ctx.strokeStyle = `rgba(64,148,160,${alpha})`; ctx.stroke(bands[i]); });
      ctx.lineWidth = 1.1;
      for (const trace of traces) {
        const line = new Path2D();
        segment3(trace.x, .5, trace.z, trace.x, .5, trace.z + trace.length, line);
        segment3(trace.x, .5, trace.z + trace.length, trace.x + 100, .5, trace.z + trace.length, line);
        ctx.strokeStyle = trace.amber ? "rgba(243,182,104,.24)" : "rgba(49,229,220,.24)"; ctx.stroke(line);
        const q = frac(clock * .18 + trace.offset);
        if (project(trace.x, 1, trace.z + q * trace.length, a)) {
          ctx.globalAlpha = Math.sin(q * Math.PI) * .8; ctx.fillStyle = trace.amber ? "#efb668" : "#6ffff0";
          ctx.beginPath(); ctx.arc(a[0], a[1], Math.min(3.5, Math.max(.7, a[2] * 1.8)), 0, TAU); ctx.fill(); ctx.globalAlpha = 1;
        }
      }
    }
    function drawNetwork() {
      const on = ease((elapsed - .6) / .8);
      if (on <= 0) return;
      const p = new Path2D();
      for (const line of NET) for (let i = 0; i < line.length - 1; i++) segment3(line[i][0], line[i][1], line[i][2], line[i + 1][0], line[i + 1][1], line[i + 1][2], p);
      ctx.globalAlpha = on * .6; ctx.strokeStyle = "rgba(243,182,104,.5)"; ctx.lineWidth = 1; ctx.stroke(p);
      ctx.globalCompositeOperation = "lighter";
      NET.forEach((line, n) => {
        const lens = [];
        let total = 0;
        for (let i = 0; i < line.length - 1; i++) { const l = Math.hypot(line[i + 1][0] - line[i][0], line[i + 1][2] - line[i][2]); lens.push(l); total += l; }
        let d = frac(clock * .3 + n * .37) * total, i = 0;
        while (i < lens.length - 1 && d > lens[i]) d -= lens[i++];
        const u = d / lens[i], P = line[i], Q = line[i + 1];
        if (project(mix(P[0], Q[0], u), 1, mix(P[2], Q[2], u), a)) { ctx.globalAlpha = on * .9; ctx.fillStyle = "#ffd393"; ctx.beginPath(); ctx.arc(a[0], a[1], 2, 0, TAU); ctx.fill(); }
      });
      ctx.globalCompositeOperation = "source-over"; ctx.globalAlpha = 1;
    }
    function factoryTop() {
      if (elapsed < DOWN0) return Infinity;
      if (elapsed < UP0) return SCAN_TOP - clamp((elapsed - DOWN0) / (DOWN1 - DOWN0)) * SCAN_SPAN;
      return elapsed >= UP1 ? Infinity : SCAN_TOP - SCAN_SPAN + clamp((elapsed - UP0) / (UP1 - UP0)) * SCAN_SPAN;
    }
    function drawGhost() {
      const alpha = .16 * ease((elapsed - DOWN0 - .3) / 1) * (1 - ease((elapsed - (UP0 - .2)) / .8));
      if (alpha <= .002) return;
      const p = new Path2D();
      for (const s of segments) if (!s.detail && project(s.ax, s.ay, s.az, a) && project(s.bx, s.by, s.bz, b)) { p.moveTo(a[0], a[1]); p.lineTo(b[0], b[1]); }
      ctx.setLineDash([2, 6]); ctx.globalAlpha = alpha; ctx.strokeStyle = "#7cd6de"; ctx.lineWidth = .8; ctx.stroke(p);
      ctx.setLineDash([]); ctx.globalAlpha = 1;
    }
    function drawWindows(top, boosted) {
      const on = ease((elapsed - 1.4) / .6);
      for (let i = 0; on > 0 && i < WINDOWS.length; i++) {
        const [x0, x1, y0, y1, z] = WINDOWS[i];
        if (y1 > top || !quad([[x0, y0, z], [x1, y0, z], [x1, y1, z], [x0, y1, z]])) continue;
        ctx.globalAlpha = on * (.65 + .35 * Math.sin(clock * (1.3 + i * .17) + i * 2.1)) * (boosted ? .2 : .1);
        ctx.fillStyle = i % 4 === 1 ? "#f3b668" : "#31e5dc"; ctx.fill();
      }
      for (let k = 0; k < FLOORS; k++) {
        const [x0, x1, y0, y1, z] = OFFICE_WINDOWS[k], lit = ease((elapsed - 1.05 - k * .13) / .3);
        if (lit <= 0 || y1 > top || !quad([[x0, y0, z], [x1, y0, z], [x1, y1, z], [x0, y1, z]])) continue;
        ctx.globalAlpha = lit * (.7 + .3 * Math.sin(clock * (1.1 + k * .23) + k * 1.7)) * (boosted ? .2 : .13);
        ctx.fillStyle = k % 3 === 1 ? "#31e5dc" : "#f3b668"; ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
    const sparks = [], tips = [];
    function drawFactoryLines(top, boosted) {
      const prod = new Path2D(), supp = new Path2D();
      sparks.length = 0; tips.length = 0;
      for (const s of segments) {
        let f = 1;
        if (elapsed < 2.2) { f = ease((elapsed - .15 - s.delay) / .5); if (f <= 0) continue; }
        let ax = s.ax, ay = s.ay, az = s.az, bx = mix(s.ax, s.bx, f), by = mix(s.ay, s.by, f), bz = mix(s.az, s.bz, f);
        if (ay > top && by > top) continue;
        if (ay > top || by > top) {
          const k = (top - ay) / (by - ay), ix = ax + (bx - ax) * k, iz = az + (bz - az) * k;
          if (ay > top) { ax = ix; ay = top; az = iz; } else { bx = ix; by = top; bz = iz; }
          sparks.push(ix, top, iz);
        }
        if (project(ax, ay, az, a) && project(bx, by, bz, b)) {
          const p = s.kind ? supp : prod;
          p.moveTo(a[0], a[1]); p.lineTo(b[0], b[1]);
          if (f < 1) tips.push(b[0], b[1]);
        }
      }
      ctx.lineCap = "round";
      ctx.strokeStyle = boosted ? "rgba(49,229,220,.14)" : "rgba(49,229,220,.07)"; ctx.lineWidth = 3.2; ctx.stroke(prod);
      ctx.strokeStyle = boosted ? "rgba(182,255,248,.84)" : "rgba(124,214,222,.62)"; ctx.lineWidth = .9; ctx.stroke(prod);
      ctx.strokeStyle = boosted ? "rgba(243,182,104,.14)" : "rgba(243,182,104,.07)"; ctx.lineWidth = 3.2; ctx.stroke(supp);
      ctx.strokeStyle = boosted ? "rgba(255,226,186,.84)" : "rgba(236,196,146,.64)"; ctx.lineWidth = .9; ctx.stroke(supp);
      ctx.fillStyle = "#e8fffd";
      for (let i = 0; i < tips.length; i += 2) { ctx.beginPath(); ctx.arc(tips[i], tips[i + 1], 1.8, 0, TAU); ctx.fill(); }
    }
    function cube(x, y, z, half, target) {
      const c = [[-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1], [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]];
      for (const [i, j] of [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]]) segment3(x + c[i][0] * half, y + c[i][1] * half, z + c[i][2] * half, x + c[j][0] * half, y + c[j][1] * half, z + c[j][2] * half, target);
    }
    function drawMachines(top, boosted) {
      const on = ease((elapsed - 1.3) / .5);
      if (on <= 0) return;
      const line = new Path2D();
      if (top > CVH + 12) for (let k = 0; k < 4; k++) {
        const z = -86 - frac(work * .32 + k / 4) * 113;
        if (z > -93 || z < -193) continue;
        cube(-20, CVH + 6, z, 6, line);
      }
      if (top > 70) {
        const phase = work * 1.5, swing = .5 - .5 * Math.cos(phase), lift = Math.sin(phase) ** 2;
        const yaw = mix(Math.PI, .2, swing), dx = Math.cos(yaw), dz = Math.sin(yaw), a1 = .55 + .5 * lift, a2 = -1.55 + .35 * lift;
        const j1 = [ROB[0], 24, ROB[2]];
        const j2 = [j1[0] + dx * Math.cos(a1) * 46, j1[1] + Math.sin(a1) * 46, j1[2] + dz * Math.cos(a1) * 46];
        const e = [j2[0] + dx * Math.cos(a1 + a2) * 40, j2[1] + Math.sin(a1 + a2) * 40, j2[2] + dz * Math.cos(a1 + a2) * 40];
        segment3(ROB[0], 8, ROB[2], j1[0], j1[1], j1[2], line);
        segment3(j1[0], j1[1], j1[2], j2[0], j2[1], j2[2], line);
        segment3(j2[0], j2[1], j2[2], e[0], e[1], e[2], line);
        for (const side of [-1, 1]) {
          const ox = -dz * 5 * side, oz = dx * 5 * side;
          segment3(e[0], e[1], e[2], e[0] + ox, e[1] - 3, e[2] + oz, line);
          segment3(e[0] + ox, e[1] - 3, e[2] + oz, e[0] + ox, e[1] - 10, e[2] + oz, line);
        }
      }
      ctx.globalAlpha = on; ctx.lineWidth = 1;
      ctx.strokeStyle = boosted ? "rgba(214,255,250,.9)" : "rgba(150,232,236,.72)"; ctx.stroke(line);
      ctx.globalCompositeOperation = "lighter";
      if (top > CHH) for (let m = 0; m < 3; m++) {
        const q = frac(clock * (boosted ? .42 : .3) + m / 3), ring = new Path2D(), r = 8 + q * 18, y = CHH + 4 + q * 40;
        for (let i = 0; i < 18; i++) { const t0 = i / 18 * TAU, t1 = (i + 1) / 18 * TAU; segment3(CHX + r * Math.cos(t0), y, CHZ + r * Math.sin(t0), CHX + r * Math.cos(t1), y, CHZ + r * Math.sin(t1), ring); }
        ctx.globalAlpha = on * (1 - q) * .5; ctx.strokeStyle = "#f3b668"; ctx.stroke(ring);
      }
      LEDS.forEach((led, i) => {
        if (led[1] > top || !project(led[0], led[1] + 2, led[2], a)) return;
        ctx.globalAlpha = on * (frac(clock * (boosted ? 1.1 : .8) + i * .37) < .18 ? 1 : .25); ctx.fillStyle = i % 3 === 0 ? "#ffd393" : "#6ffff0";
        ctx.beginPath(); ctx.arc(a[0], a[1], 1.9, 0, TAU); ctx.fill();
      });
      ctx.globalCompositeOperation = "source-over"; ctx.globalAlpha = 1;
    }
    function drawScan() {
      let alpha = 0, y = 0;
      if (elapsed >= DOWN0 - .2 && elapsed <= DOWN1 + .3) { y = SCAN_TOP - clamp((elapsed - DOWN0) / (DOWN1 - DOWN0)) * SCAN_SPAN; alpha = ease((elapsed - DOWN0 + .2) / .3) * (1 - ease((elapsed - DOWN1) / .3)); }
      else if (elapsed >= UP0 - .2 && elapsed <= UP1 + .3) { y = SCAN_TOP - SCAN_SPAN + clamp((elapsed - UP0) / (UP1 - UP0)) * SCAN_SPAN; alpha = ease((elapsed - UP0 + .2) / .3) * (1 - ease((elapsed - UP1) / .3)); }
      if (alpha <= 0) return;
      const X0 = -300, X1 = 270, Z0 = -228, Z1 = 112;
      if (quad([[X0, y, Z0], [X1, y, Z0], [X1, y, Z1], [X0, y, Z1]])) {
        ctx.globalAlpha = alpha; ctx.fillStyle = "rgba(49,229,220,.07)"; ctx.fill();
        ctx.strokeStyle = "rgba(111,255,240,.55)"; ctx.lineWidth = 1; ctx.stroke();
      }
      const lines = new Path2D();
      for (let z = Z0 + 34; z < Z1; z += 34) segment3(X0, y, z, X1, y, z, lines);
      ctx.globalAlpha = alpha * .35; ctx.lineWidth = .6; ctx.stroke(lines);
      ctx.globalCompositeOperation = "lighter"; ctx.globalAlpha = alpha; ctx.fillStyle = "#dafffb";
      for (let i = 0; i < sparks.length; i += 3) if (project(sparks[i], sparks[i + 1], sparks[i + 2], a)) ctx.fillRect(a[0] - 1.3, a[1] - 1.3, 2.6, 2.6);
      ctx.globalCompositeOperation = "source-over"; ctx.globalAlpha = 1;
    }

    /* ---------- Rendu : les trois stations de la donnée ---------- */
    function drawStation1() {
      const on = ease((elapsed - 6.3) / .8);
      if (on <= 0) return;
      const a0 = on * (1 - .55 * ease((elapsed - 14.4) / 1.4));
      const P = [[AX - H1, S1, -H1], [AX + H1, S1, -H1], [AX + H1, S1, H1], [AX - H1, S1, H1]];
      if (quad(P)) {
        ctx.globalAlpha = a0 * .05; ctx.fillStyle = "#31e5dc"; ctx.fill();
        ctx.globalAlpha = a0 * .5; ctx.strokeStyle = "#6fe9e2"; ctx.lineWidth = 1; ctx.stroke();
      }
      const grid = new Path2D(), step = 2 * H1 / 12;
      for (let i = 1; i < 12; i++) { const o = -H1 + i * step; segment3(AX + o, S1, -H1, AX + o, S1, H1, grid); segment3(AX - H1, S1, o, AX + H1, S1, o, grid); }
      ctx.globalAlpha = a0 * .1; ctx.strokeStyle = "#7cd6de"; ctx.lineWidth = .6; ctx.stroke(grid);
      corners(AX, S1, H1, a0 * .9, "#ffb4a0");
      // Rideau de contrôle qui balaie le plateau ; après l'introduction, un contrôle périodique plus discret.
      let fade = ease((elapsed - SC0 + .35) / .35) * (1 - ease((elapsed - SC1) / .45)), sweepP = scanP(elapsed);
      if (elapsed >= DURATION) { const u = frac(clock / 12); fade = win(u, 0, .2, .03, .04) * .5; sweepP = clamp(u / .22); }
      if (fade > 0) {
        const x = AX - H1 + sweepP * 2 * H1;
        ctx.globalCompositeOperation = "lighter";
        if (quad([[AX - H1, S1, -H1], [x, S1, -H1], [x, S1, H1], [AX - H1, S1, H1]])) { ctx.globalAlpha = fade * .06; ctx.fillStyle = "#31e5dc"; ctx.fill(); }
        if (quad([[x, S1, -H1], [x, S1, H1], [x, S1 + 64, H1], [x, S1 + 64, -H1]])) { ctx.globalAlpha = fade * .09; ctx.fillStyle = "#8ffff5"; ctx.fill(); }
        const beam = new Path2D(), crest = new Path2D();
        segment3(x, S1 + .5, -H1, x, S1 + .5, H1, beam);
        segment3(x, S1 + 64, -H1, x, S1 + 64, H1, crest);
        segment3(x, S1, -H1, x, S1 + 64, -H1, crest); segment3(x, S1, H1, x, S1 + 64, H1, crest);
        ctx.globalAlpha = fade; ctx.strokeStyle = "#d9fffb"; ctx.lineWidth = 2; ctx.stroke(beam);
        ctx.globalAlpha = fade * .4; ctx.lineWidth = 1; ctx.stroke(crest);
        ctx.globalCompositeOperation = "source-over";
      }
      const ok = win(elapsed, SC1 + .1, SC1 + 1, .15, .6);
      if (ok > 0 && quad(P)) { ctx.globalAlpha = ok * .9; ctx.strokeStyle = "#d9fffb"; ctx.lineWidth = 2; ctx.stroke(); }
      ctx.globalAlpha = 1;
    }
    function drawStation2() {
      const on = ease((elapsed - 12.9) / .9);
      if (on <= 0) return;
      const a0 = on * (1 - .62 * ease((elapsed - 19.4) / 1.4)), y0 = S2 - SLAB, cs = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
      // Dalle de conversion : un cadre bas relié au plateau de la matrice
      const frame = new Path2D();
      for (let i = 0; i < 4; i++) {
        const [x1, z1] = cs[i], [x2, z2] = cs[(i + 1) % 4];
        segment3(AX + x1 * H2, y0, z1 * H2, AX + x2 * H2, y0, z2 * H2, frame);
        segment3(AX + x1 * H2, y0, z1 * H2, AX + x1 * H2, S2, z1 * H2, frame);
      }
      ctx.globalAlpha = a0 * .3; ctx.strokeStyle = "#6fe9e2"; ctx.lineWidth = .8; ctx.stroke(frame);
      const P = [[AX - H2, S2, -H2], [AX + H2, S2, -H2], [AX + H2, S2, H2], [AX - H2, S2, H2]];
      if (quad(P)) {
        ctx.globalAlpha = a0 * .045; ctx.fillStyle = "#31e5dc"; ctx.fill();
        ctx.globalAlpha = a0 * .6; ctx.strokeStyle = "#8ff7ef"; ctx.lineWidth = 1.1; ctx.stroke();
      }
      const grid = new Path2D();
      for (let i = 1; i < GRID; i++) { const o = -H2 + i * CELL2; segment3(AX + o, S2, -H2, AX + o, S2, H2, grid); segment3(AX - H2, S2, o, AX + H2, S2, o, grid); }
      ctx.globalAlpha = a0 * .06; ctx.strokeStyle = "#7cd6de"; ctx.lineWidth = .5; ctx.stroke(grid);
      // Colonnes du modèle commun : une par famille de données
      FAMILIES.forEach((fam, f) => {
        const x0 = AX - H2 + famStart[f] * CELL2, x1 = x0 + widths[f] * CELL2, edge = new Path2D(), sep = new Path2D();
        segment3(x0, S2 + .3, -H2 - 3, x1, S2 + .3, -H2 - 3, edge);
        ctx.globalAlpha = a0 * .9; ctx.strokeStyle = fam.color; ctx.lineWidth = 2; ctx.stroke(edge);
        segment3(x0, S2 + .2, -H2, x0, S2 + .2, H2, sep); segment3(x1, S2 + .2, -H2, x1, S2 + .2, H2, sep);
        ctx.globalAlpha = a0 * .25; ctx.strokeStyle = "#9ffcf4"; ctx.lineWidth = .8; ctx.stroke(sep);
      });
      corners(AX, S2, H2, a0 * .9, "#9ffcf4");
      // Cellules remplies : vives à l'arrivée, puis empreinte une fois la donnée repartie ; après l'introduction, une relecture périodique.
      let lockZ = elapsed >= LOCK0 && elapsed <= LOCK1 + .3 ? -H2 + clamp((elapsed - LOCK0) / (LOCK1 - LOCK0)) * 2 * H2 : null, lockA = 1 - ease((elapsed - LOCK1) / .3);
      if (elapsed >= DURATION) { const u = frac(clock / 12 + .5); lockZ = u < .1 ? -H2 + u / .1 * 2 * H2 : null; lockA = .7 * win(u, 0, .085, .02, .015); }
      const bright = new Path2D(), lit = new Path2D(), dim = new Path2D(), c = CELL2 * .36;
      // Taille d'une cellule à l'écran (au centre de la matrice) : en dessous de ~2 px, un rectangle suffit.
      const tiny = project(AX, S2, 0, g0) && c * g0[2] < 2.2, squash = Math.max(.15, Math.abs(F1));
      for (const p of valid) {
        if (elapsed < p.tSnap) continue;
        const hot = elapsed - p.tSnap < .35 || (lockZ !== null && Math.abs(p.sz - lockZ) < CELL2 * 1.6), target = hot ? bright : elapsed < p.tL2 ? lit : dim;
        if (tiny) cellDot(p.sx, S2 + .4, p.sz, c, squash, target); else cellQuad(p.sx, S2 + .4, p.sz, c, target);
      }
      ctx.globalCompositeOperation = "lighter"; ctx.fillStyle = "#31e5dc";
      ctx.globalAlpha = a0 * .16; ctx.fill(dim);
      ctx.globalAlpha = a0 * .5; ctx.fill(lit);
      ctx.fillStyle = "#d9fffb"; ctx.globalAlpha = a0 * .9; ctx.fill(bright);
      if (lockZ !== null) {
        const sweep = new Path2D();
        segment3(AX - H2, S2 + 1, lockZ, AX + H2, S2 + 1, lockZ, sweep);
        ctx.globalAlpha = a0 * lockA; ctx.strokeStyle = "#e9fffd"; ctx.lineWidth = 2; ctx.stroke(sweep);
      }
      ctx.globalCompositeOperation = "source-over";
      const ok = win(elapsed, LOCK1, LOCK1 + .8, .15, .5);
      if (ok > 0 && quad(P)) { ctx.globalAlpha = ok * .9; ctx.strokeStyle = "#d9fffb"; ctx.lineWidth = 2; ctx.stroke(); }
      ctx.globalAlpha = 1;
    }
    const linkPoint = (L, u, o) => {
      const v = 1 - u, w0 = v * v, w1 = 2 * v * u, w2 = u * u;
      o[0] = w0 * L.ax + w1 * L.cx + w2 * L.bx; o[1] = (w0 + w2) * (S3 + 11) + w1 * L.cy; o[2] = w0 * L.az + w1 * L.cz + w2 * L.bz;
      return o;
    };
    function linkPart(L, u0, u1, target) {
      if (u1 - u0 < .005) return;
      linkPoint(L, u0, g0);
      for (let i = 1; i <= 7; i++) {
        linkPoint(L, mix(u0, u1, i / 7), g1);
        segment3(g0[0], g0[1], g0[2], g1[0], g1[1], g1[2], target);
        g0[0] = g1[0]; g0[1] = g1[1]; g0[2] = g1[2];
      }
    }
    function drawStation3() {
      const on = ease((elapsed - 18.2) / .9);
      if (on <= 0) return;
      const a0 = on * (1 - .3 * ease((elapsed - 25) / 1.5)), cons = consP(elapsed);
      const ring = new Path2D();
      circle3(AX, S3, 0, R3, 72, ring);
      ctx.setLineDash([2, 6]); ctx.globalAlpha = a0 * .35; ctx.strokeStyle = "#6fe9e2"; ctx.lineWidth = .8; ctx.stroke(ring); ctx.setLineDash([]);
      // Échanges point à point : ils se rétractent vers les systèmes pendant la consolidation
      if (cons < 1) {
        const groups = [new Path2D(), new Path2D(), new Path2D()], keep = (1 - cons) / 2, base = a0 * (1 - .6 * cons);
        for (const L of LINKS) { linkPart(L, 0, keep, groups[L.g]); linkPart(L, 1 - keep, 1, groups[L.g]); }
        groups.forEach((g, i) => {
          ctx.globalAlpha = base * (.16 + .14 * (.5 + .5 * Math.sin(clock * (2.6 + i * .9) + i * 2.1)));
          ctx.strokeStyle = i === 0 ? "#ff7f6e" : "#ffb37a"; ctx.lineWidth = .8; ctx.stroke(g);
        });
        if (cons < .6) {
          ctx.globalCompositeOperation = "lighter"; ctx.fillStyle = "#ffcf9a";
          for (let m = 0; m < 16; m++) {
            const cyc = clock * (.55 + .4 * hash(m + 3)) + hash(m + 17), L = LINKS[Math.floor(hash(Math.floor(cyc) * 53 + m) * LINKS.length)];
            let u = frac(cyc);
            if (hash(m + 91) < .5) u = 1 - u;
            if ((u > keep && u < 1 - keep) || !project(...linkPoint(L, u, pa), a)) continue;
            ctx.globalAlpha = base * .9; ctx.fillRect(a[0] - 1.2, a[1] - 1.2, 2.4, 2.4);
          }
          ctx.globalCompositeOperation = "source-over";
        }
      }
      // Rayons vers le référentiel unique
      const spokes = new Path2D();
      NODES3.forEach((nd, k) => {
        const g = ease((elapsed - (CONS0 + .15 + k * .04)) / .5);
        if (g <= 0) return;
        const ux = (nd.x - AX) / R3, uz = nd.z / R3, sx = nd.x - ux * 9, sz = nd.z - uz * 9;
        segment3(sx, S3 + 2, sz, mix(sx, AX + ux * HUB_R, g), S3 + 2, mix(sz, uz * HUB_R, g), spokes);
      });
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = a0 * .14; ctx.strokeStyle = "#31e5dc"; ctx.lineWidth = 3.4; ctx.stroke(spokes);
      ctx.globalAlpha = a0 * .75; ctx.strokeStyle = "#9ffcf4"; ctx.lineWidth = 1.1; ctx.stroke(spokes);
      ctx.globalCompositeOperation = "source-over";
      // Systèmes sources : des silos de données qui se remplissent puis se vident vers le référentiel
      nodeIn.fill(0);
      for (const p of valid) if (elapsed >= p.tA3 && elapsed < p.tS) nodeIn[p.src]++;
      const prod = new Path2D(), supp = new Path2D(), level = new Path2D();
      NODES3.forEach((nd, k) => {
        const target = nd.kind ? supp : prod;
        circle3(nd.x, S3, nd.z, 9, 14, target); circle3(nd.x, S3 + 22, nd.z, 9, 14, target);
        for (let i = 0; i < 4; i++) { const q = i / 4 * TAU + .4, x = nd.x + 9 * Math.cos(q), z = nd.z + 9 * Math.sin(q); segment3(x, S3, z, x, S3 + 22, z, target); }
        const fill = nodeTotal[k] ? nodeIn[k] / nodeTotal[k] : 0;
        if (fill > .02) circle3(nd.x, S3 + 1 + 20 * fill, nd.z, 8.4, 14, level);
      });
      const nodeA = a0 * (1 - .35 * cons);
      ctx.globalAlpha = nodeA * .85; ctx.lineWidth = 1;
      ctx.strokeStyle = "#8ff7ef"; ctx.stroke(prod);
      ctx.strokeStyle = "#ffcf8f"; ctx.stroke(supp);
      ctx.globalAlpha = nodeA; ctx.strokeStyle = "#e9fffd"; ctx.lineWidth = 1.4; ctx.stroke(level);
      drawHub(on);
      ctx.globalAlpha = 1;
    }
    function drawHub(alpha) {
      const hs = easeOut((elapsed - (CONS0 + .2)) / .8);
      if (hs <= 0) return;
      let arrived = 0;
      for (const p of valid) if (elapsed >= p.tH) arrived++;
      const fill = arrived / valid.length, r = HUB_R * hs, body = new Path2D(), lit = new Path2D();
      for (let i = 0; i < 3; i++) circle3(AX, S3 + 2 + i * 16, 0, r, 24, i / 3 < fill ? lit : body);
      for (let i = 0; i < 8; i++) { const q = i / 8 * TAU, x = AX + r * Math.cos(q), z = r * Math.sin(q); segment3(x, S3 + 2, z, x, S3 + 2 + HUB_H - 2, z, body); }
      if (fill > .01) circle3(AX, S3 + 2 + 32 * fill, 0, r * .92, 24, lit);
      if (project(AX, S3 + 18, 0, c3)) {
        const R = 80 * c3[2] * hs, g = ctx.createRadialGradient(c3[0], c3[1], 0, c3[0], c3[1], R);
        g.addColorStop(0, `rgba(160,255,248,${((.12 + .3 * fill) * alpha).toFixed(3)})`); g.addColorStop(1, "rgba(49,229,220,0)");
        ctx.globalCompositeOperation = "lighter"; ctx.globalAlpha = 1; ctx.fillStyle = g; ctx.fillRect(c3[0] - R, c3[1] - R, 2 * R, 2 * R);
        ctx.globalCompositeOperation = "source-over";
      }
      ctx.globalAlpha = alpha * hs * .8; ctx.strokeStyle = "#8ff7ef"; ctx.lineWidth = 1; ctx.stroke(body);
      ctx.globalAlpha = alpha * hs; ctx.strokeStyle = "#e9fffd"; ctx.lineWidth = 1.5; ctx.stroke(lit);
      ctx.globalAlpha = 1;
    }

    /* ---------- Rendu : cerveau ---------- */
    let cb = 1, sb = 0, bob = 0, frontR = 0, energy = 0, ghost = 0;
    const ENTRY_W = new Float64Array(3);
    function brainState() {
      const settle = ease((elapsed - 25.6) / 1.6), yaw = .12 * Math.sin(clock * .3) * settle;
      cb = Math.cos(yaw); sb = Math.sin(yaw); bob = 3 * Math.sin(clock * .7) * settle;
      frontR = radiusAt(elapsed); energy = ease((elapsed - BUILD0 - .2) / 1.8); ghost = ease((elapsed - 22.9) / .9);
      toW(0, STEM_TOP, 0, ENTRY_W);
    }
    function toW(x, y, z, o) {
      const y1 = y * CT + z * ST, z1 = z * CT - y * ST;
      o[0] = BRAIN[0] + x * cb + z1 * sb; o[1] = BRAIN[1] + y1 + bob; o[2] = BRAIN[2] - x * sb + z1 * cb;
      return o;
    }
    const tiltW = (x, y, z, o) => set3(o, BRAIN[0] + x, BRAIN[1] + y * CT + z * ST, BRAIN[2] + z * CT - y * ST);
    function facing(nx, ny, nz, o) {
      const y1 = ny * CT + nz * ST, z1 = nz * CT - ny * ST;
      return (nx * cb + z1 * sb) * (camera[0] - o[0]) + y1 * (camera[1] - o[1]) + (z1 * cb - nx * sb) * (camera[2] - o[2]);
    }
    const faces = (nx, ny, nz, o) => facing(nx, ny, nz, o) > 0;
    function drawStem() {
      const on = ease((elapsed - 22.6) / .6);
      if (on <= 0) return;
      const p = new Path2D(), y0 = S3 + HUB_H + 2, tx = ENTRY_W[0], ty = ENTRY_W[1], tz = ENTRY_W[2];
      const ringAt = (u, r, q, o) => set3(o, mix(AX, tx, u) + r * Math.cos(q), mix(y0, ty, u), mix(0, tz, u) + r * Math.sin(q));
      for (let k = 0; k < 6; k++) { const q = k / 6 * TAU; ringAt(0, 12, q, pa); ringAt(1, 7, q, pb); segment3(pa[0], pa[1], pa[2], pb[0], pb[1], pb[2], p); }
      for (const [u, r] of [[0, 12], [.5, 9.5], [.9, 7.5]]) for (let k = 0; k < 12; k++) {
        ringAt(u, r, k / 12 * TAU, pa); ringAt(u, r, (k + 1) / 12 * TAU, pb);
        segment3(pa[0], pa[1], pa[2], pb[0], pb[1], pb[2], p);
      }
      ctx.globalAlpha = on * .55; ctx.strokeStyle = "#a8f5ee"; ctx.lineWidth = .8; ctx.stroke(p); ctx.globalAlpha = 1;
    }
    function edgePoint(h, e, k0, k1, k2, k3, out) {
      const kA = e === 1 ? k1 : e === 2 ? k3 : k0, kB = e === 0 ? k1 : e === 3 ? k3 : k2;
      const t = h.V[kA] / (h.V[kA] - h.V[kB]), WP = h.WP, i = 3 * kA, j = 3 * kB;
      return project(WP[i] + (WP[j] - WP[i]) * t, WP[i + 1] + (WP[j + 1] - WP[i + 1]) * t, WP[i + 2] + (WP[j + 2] - WP[i + 2]) * t, out);
    }
    function drawSilhouette(h, color) {
      const {P, N, D, V, WP} = h;
      for (let k = 0, o = 0; k < NG; k++, o += 3) {
        toW(P[o], P[o + 1], P[o + 2], c3);
        WP[o] = c3[0]; WP[o + 1] = c3[1]; WP[o + 2] = c3[2];
        V[k] = facing(N[o], N[o + 1], N[o + 2], c3);
      }
      const lit = new Path2D(), dim = new Path2D();
      for (let i = 0; i < NA; i++) for (let j = 0; j < NB; j++) {
        const k0 = i * GW + j, k1 = k0 + GW, k2 = k1 + 1, k3 = k0 + 1;
        const code = (V[k0] > 0 ? 1 : 0) | (V[k1] > 0 ? 2 : 0) | (V[k2] > 0 ? 4 : 0) | (V[k3] > 0 ? 8 : 0);
        if (!code || code === 15) continue;
        const target = Math.max(D[k0], D[k1], D[k2], D[k3]) > frontR ? dim : lit, list = MS[code];
        for (let m = 0; m < list.length; m += 2) if (edgePoint(h, list[m], k0, k1, k2, k3, a) && edgePoint(h, list[m + 1], k0, k1, k2, k3, b)) { target.moveTo(a[0], a[1]); target.lineTo(b[0], b[1]); }
      }
      ctx.strokeStyle = color; ctx.lineWidth = 1.25;
      ctx.globalAlpha = ghost * .24; ctx.stroke(dim);
      ctx.globalAlpha = 1; ctx.stroke(lit);
    }
    function drawGyri() {
      for (let k = 0; k < GN; k++) {
        const o = 3 * k;
        toW(GP[o], GP[o + 1], GP[o + 2], c3);
        GOK[k] = project(c3[0], c3[1], c3[2], a) ? 1 : 0; GX[k] = a[0]; GY[k] = a[1];
        GF[k] = faces(GNRM[o], GNRM[o + 1], GNRM[o + 2], c3) ? 1 : 0;
      }
      const front = new Path2D(), back = new Path2D();
      for (const line of GL) for (let k = line.s; k < line.s + line.n - 1; k++) {
        if (!GOK[k] || !GOK[k + 1] || GD[k] > frontR || GD[k + 1] > frontR) continue;
        const target = GF[k] ? front : back;
        target.moveTo(GX[k], GY[k]); target.lineTo(GX[k + 1], GY[k + 1]);
      }
      ctx.lineWidth = .9; ctx.strokeStyle = "#f3b668"; ctx.globalAlpha = .2; ctx.stroke(back);
      ctx.strokeStyle = "#ffd9a8"; ctx.globalAlpha = .78; ctx.stroke(front);
      if (energy <= 0) { ctx.globalAlpha = 1; return; }
      ctx.globalCompositeOperation = "lighter";
      const comet = new Path2D(), heads = new Path2D();
      LONG.forEach((line, m) => {
        const end = line.s + Math.floor(frac(clock * (.12 + .08 * hash(m + 11)) + hash(m + 5)) * (line.n - 1));
        let started = false;
        for (let k = Math.max(line.s, end - 9); k <= end; k++) {
          if (!GOK[k] || !GF[k]) { started = false; continue; }
          if (started) comet.lineTo(GX[k], GY[k]); else { comet.moveTo(GX[k], GY[k]); started = true; }
        }
        if (GOK[end] && GF[end]) heads.rect(GX[end] - 1.4, GY[end] - 1.4, 2.8, 2.8);
      });
      ctx.globalAlpha = .85 * energy; ctx.strokeStyle = "#fff0d6"; ctx.lineWidth = 1.6; ctx.stroke(comet);
      ctx.fillStyle = "#ffffff"; ctx.fill(heads);
      ctx.globalCompositeOperation = "source-over"; ctx.globalAlpha = 1;
    }
    function drawAI() {
      for (let k = 0; k < NODES; k++) {
        const o = 3 * k;
        toW(AN[o], AN[o + 1], AN[o + 2], c3);
        AOK[k] = project(c3[0], c3[1], c3[2], a) ? 1 : 0; ASX[k] = a[0]; ASY[k] = a[1];
        AF[k] = faces(ANN[o], ANN[o + 1], ANN[o + 2], c3) ? 1 : 0;
        AV[k] = AD[k] < frontR ? 1 : 0;
      }
      const front = new Path2D(), back = new Path2D();
      for (const [i, j] of AE) {
        if (!AOK[i] || !AOK[j] || !AV[i] || !AV[j]) continue;
        const target = AF[i] || AF[j] ? front : back;
        target.moveTo(ASX[i], ASY[i]); target.lineTo(ASX[j], ASY[j]);
      }
      ctx.lineWidth = .8; ctx.strokeStyle = "#31e5dc"; ctx.globalAlpha = .16; ctx.stroke(back);
      ctx.strokeStyle = "#7ffff2"; ctx.globalAlpha = .55; ctx.stroke(front);
      const wires = new Path2D(), pads = new Path2D();
      for (const t of TRACES) {
        let started = false;
        for (let k = 0; k < t.pts.length; k += 3) {
          toW(t.pts[k], t.pts[k + 1], t.pts[k + 2], c3);
          if (t.d[k / 3] > frontR || !faces(t.n[k], t.n[k + 1], t.n[k + 2], c3) || !project(c3[0], c3[1], c3[2], a)) { started = false; continue; }
          if (started) wires.lineTo(a[0], a[1]); else { wires.moveTo(a[0], a[1]); started = true; }
          if (k === t.pts.length - 3) pads.rect(a[0] - 2, a[1] - 2, 4, 4);
        }
      }
      ctx.strokeStyle = "#5fe9e0"; ctx.globalAlpha = .5; ctx.lineWidth = 1; ctx.stroke(wires); ctx.stroke(pads);
      ctx.globalCompositeOperation = "lighter";
      const nodes = new Path2D(), hot = new Path2D();
      for (let k = 0; k < NODES; k++) {
        if (!AOK[k] || !AV[k]) continue;
        const fire = Math.exp(-frac(clock * NODE_RATE[k] + NODE_PHASE[k]) * 6) * energy, size = (AF[k] ? 2.2 : 1.4) + fire * 2.2;
        (fire > .45 ? hot : nodes).rect(ASX[k] - size / 2, ASY[k] - size / 2, size, size);
      }
      ctx.globalAlpha = .85; ctx.fillStyle = "#6ffff0"; ctx.fill(nodes);
      ctx.fillStyle = "#e9fffd"; ctx.fill(hot);
      if (energy > 0) {
        const packets = new Path2D();
        for (let m = 0; m < 22; m++) {
          const cyc = clock * (.9 + .6 * hash(m + 31)) + hash(m + 77), [i, j] = AE[Math.floor(hash(Math.floor(cyc) * 97 + m) * AE.length)], u = frac(cyc);
          if (!AOK[i] || !AOK[j] || !AV[i] || !AV[j]) continue;
          packets.rect(mix(ASX[i], ASX[j], u) - 1.3, mix(ASY[i], ASY[j], u) - 1.3, 2.6, 2.6);
        }
        ctx.globalAlpha = energy; ctx.fillStyle = "#ffffff"; ctx.fill(packets);
      }
      ctx.globalCompositeOperation = "source-over"; ctx.globalAlpha = 1;
    }
    function drawRims() {
      RIMS.forEach((rim, n) => {
        const p = new Path2D();
        let started = false;
        for (let i = 0; i <= NA; i++) {
          const o = 3 * i;
          if (rim.D[i] > frontR) { started = false; continue; }
          toW(rim.P[o], rim.P[o + 1], rim.P[o + 2], c3);
          if (!project(c3[0], c3[1], c3[2], a)) { started = false; continue; }
          if (started) p.lineTo(a[0], a[1]); else { p.moveTo(a[0], a[1]); started = true; }
        }
        ctx.globalAlpha = .9; ctx.strokeStyle = n ? "rgba(150,255,246,.8)" : "rgba(255,220,176,.8)"; ctx.lineWidth = 1.1; ctx.stroke(p);
      });
      ctx.globalAlpha = 1;
    }
    const bridgePt = (br, u, o) => { const v = 1 - u, w0 = v * v, w1 = 2 * v * u, w2 = u * u; return toW(w0 * br[0] + w1 * br[3] + w2 * br[6], w0 * br[1] + w1 * br[4] + w2 * br[7], w0 * br[2] + w1 * br[5] + w2 * br[8], o); };
    function drawBridges() {
      const on = ease((elapsed - 24.8) / .6);
      if (on <= 0) return;
      const left = new Path2D(), right = new Path2D();
      for (const br of BRIDGES) for (let i = 0; i < 12; i++) {
        bridgePt(br, i / 12, pa); bridgePt(br, (i + 1) / 12, pb);
        segment3(pa[0], pa[1], pa[2], pb[0], pb[1], pb[2], i < 6 ? left : right);
      }
      ctx.globalAlpha = on * .55; ctx.lineWidth = .9;
      ctx.strokeStyle = "#ffcf8f"; ctx.stroke(left); ctx.strokeStyle = "#7ffff2"; ctx.stroke(right);
      ctx.globalCompositeOperation = "lighter";
      BRIDGES.forEach((br, k) => {
        for (let m = 0; m < 2; m++) {
          const s = frac(clock * .55 + hash(k * 3 + m)), u = m ? 1 - s : s;
          if (!project(...bridgePt(br, u, pa), a)) continue;
          ctx.globalAlpha = on * Math.sin(s * Math.PI) * energy; ctx.fillStyle = u < .5 ? "#ffe2b8" : "#c9fffa";
          ctx.fillRect(a[0] - 1.5, a[1] - 1.5, 3, 3);
        }
      });
      ctx.globalCompositeOperation = "source-over"; ctx.globalAlpha = 1;
    }
    function drawSynapses() {
      if (energy <= 0) return;
      ctx.globalCompositeOperation = "lighter"; ctx.lineWidth = 1;
      for (let m = 0; m < 10; m++) {
        const cyc = clock * (.7 + .5 * hash(m + 3)) + hash(m + 9), u = frac(cyc), k = Math.floor(hash(Math.floor(cyc) * 131 + m) * GN);
        if (!GOK[k] || !GF[k] || GD[k] > frontR) continue;
        ctx.globalAlpha = (1 - u) * energy * .7; ctx.strokeStyle = "#ffd9a8";
        ctx.beginPath(); ctx.arc(GX[k], GY[k], 1.5 + u * 6, 0, TAU); ctx.stroke();
        ctx.fillStyle = "#fff4e4"; ctx.fillRect(GX[k] - 1.2, GY[k] - 1.2, 2.4, 2.4);
      }
      ctx.globalCompositeOperation = "source-over"; ctx.globalAlpha = 1;
    }
    function drawBrain() {
      drawStem();
      if (ghost <= 0) return;
      if (frontR > 0) {
        const shown = Math.min(1, frontR / 60);
        ctx.globalCompositeOperation = "lighter";
        for (const [x, rgb] of [[-62, "255,180,110"], [62, "60,230,220"]]) {
          if (!project(...toW(x, 16, 0, c3), a)) continue;
          const r = 150 * a[2], g = ctx.createRadialGradient(a[0], a[1], 0, a[0], a[1], r);
          g.addColorStop(0, `rgba(${rgb},${(.1 + .08 * energy).toFixed(3)})`); g.addColorStop(1, `rgba(${rgb},0)`);
          ctx.globalAlpha = shown; ctx.fillStyle = g; ctx.fillRect(a[0] - r, a[1] - r, 2 * r, 2 * r);
        }
        ctx.globalCompositeOperation = "source-over";
      }
      drawSilhouette(hemis[0], "rgba(255,214,166,.85)");
      drawSilhouette(hemis[1], "rgba(140,255,246,.85)");
      if (frontR <= 0) { ctx.globalAlpha = 1; return; }
      drawGyri(); drawAI(); drawRims(); drawBridges(); drawSynapses();
    }
    const beamPt = (c, u, o) => {
      const v = 1 - u, w0 = v * v * v, w1 = 3 * v * v * u, w2 = 3 * v * u * u, w3 = u * u * u;
      o[0] = w0 * c[0] + w1 * c[3] + w2 * c[6] + w3 * c[9];
      o[1] = w0 * c[1] + w1 * c[4] + w2 * c[7] + w3 * c[10];
      o[2] = w0 * c[2] + w1 * c[5] + w2 * c[8] + w3 * c[11];
      return o;
    };
    function drawBeams() {
      const on = ease((elapsed - BEAM0) / .5);
      if (on <= 0) return;
      const dashed = new Path2D();
      BEAMS.forEach((beam, k) => {
        const c = beam.c, [dx, dy, dz] = beam.dst;
        toW(beam.src[0], beam.src[1], beam.src[2], c3);
        c[0] = c3[0]; c[1] = c3[1]; c[2] = c3[2];
        c[3] = c3[0] + beam.side * 190; c[4] = c3[1] - 40; c[5] = c3[2] - 20;
        c[6] = dx + beam.side * 200; c[7] = dy + 200; c[8] = dz - 30;
        c[9] = dx; c[10] = dy; c[11] = dz;
        const f = ease((elapsed - BEAM0 - k * .1) / 1.1);
        let started = false;
        for (let i = 0; i <= 40; i++) {
          const u = Math.min(f, i / 40);
          if (!project(...beamPt(c, u, pa), a)) { started = false; continue; }
          if (started) dashed.lineTo(a[0], a[1]); else { dashed.moveTo(a[0], a[1]); started = true; }
          if (u >= f) break;
        }
      });
      ctx.setLineDash([3, 6]); ctx.globalAlpha = on * .75; ctx.strokeStyle = "rgba(243,182,104,.6)"; ctx.lineWidth = 1; ctx.stroke(dashed); ctx.setLineDash([]);
      ctx.globalCompositeOperation = "lighter";
      BEAMS.forEach((beam, k) => {
        if (elapsed < BEAM0 + 1 + k * .1) return;
        for (let m = 0; m < 2; m++) {
          const s = frac(clock * .32 + k * .23 + m * .5);
          if (project(...beamPt(beam.c, s * s * (3 - 2 * s), pa), a)) { ctx.globalAlpha = on * Math.min(1, s * 6); ctx.fillStyle = "#ffe2b0"; ctx.beginPath(); ctx.arc(a[0], a[1], 2.1, 0, TAU); ctx.fill(); }
          if (s > .86 && project(beam.dst[0], beam.dst[1], beam.dst[2], a)) {
            const r = (s - .86) / .14;
            ctx.globalAlpha = on * (1 - r) * .85; ctx.strokeStyle = "#ffd393"; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.arc(a[0], a[1], 3 + r * 12, 0, TAU); ctx.stroke();
          }
        }
      });
      ctx.globalCompositeOperation = "source-over"; ctx.globalAlpha = 1;
    }

    /* ---------- Rendu : les enregistrements ---------- */
    const WAIT = -1, RISE = 0, REST = 1, DROP = 2, TO2 = 3, SLOT = 4, TO3 = 5, SILO = 6, SPOKE = 7, HUB = 8, UPB = 9, HIT = 10, GONE = 11;
    const targetWorld = (p, o) => { const src = p.side < 0 ? GP : AN, k = 3 * p.target; return toW(src[k], src[k + 1], src[k + 2], o); };
    function upPath(p, u, out) {
      const v = 1 - u, w0 = v * v * v, w1 = 3 * v * v * u, w2 = 3 * v * u * u, w3 = u * u * u;
      targetWorld(p, c3);
      out[0] = w0 * AX + w1 * ENTRY_W[0] + w2 * BRAIN[0] + w3 * c3[0];
      out[1] = w0 * (S3 + HUB_H) + w1 * ENTRY_W[1] + w2 * (BRAIN[1] + bob) + w3 * c3[1];
      out[2] = w1 * ENTRY_W[2] + w2 * BRAIN[2] + w3 * c3[2];
      return out;
    }
    // Position et étape d'un enregistrement à l'instant t
    function rec(p, t, out) {
      if (t < p.t0) return WAIT;
      if (t < p.t1) {
        const u = (t - p.t0) / (p.t1 - p.t0), g = ease(u * 1.1), j = 4 * (1 - u);
        set3(out, mix(p.x, p.ex, g) + j * Math.sin(clock * 5.3 + p.jp), mix(p.y, S1, 1 - (1 - u) ** 2.2), mix(p.z, p.ez, g) + j * Math.sin(clock * 4.1 + p.jq));
        return RISE;
      }
      if (p.bad) {
        if (t < p.tScan) { set3(out, p.ex, S1, p.ez); return REST; }
        const u = (t - p.tScan - (p.bad === 2 ? .3 : .15)) / .9;
        if (u >= 1) return GONE;
        set3(out, p.ex, S1 - 70 * Math.max(0, u) ** 2, p.ez);
        return DROP;
      }
      if (t < p.tL1) { set3(out, p.ex, S1, p.ez); return REST; }
      if (t < p.tSnap) {
        const u = (t - p.tL1) / (p.tSnap - p.tL1), g = ease(u);
        set3(out, mix(p.ex, p.sx, g), mix(S1 + p.h, S2 + .6, ease(u * 1.05)), mix(p.ez, p.sz, g));
        return TO2;
      }
      if (t < p.tL2) { set3(out, p.sx, S2 + .6, p.sz); return SLOT; }
      if (t < p.tA3) {
        const u = (t - p.tL2) / (p.tA3 - p.tL2), g = ease(u);
        set3(out, mix(p.sx, p.nx, g), mix(S2, p.ny, 1 - (1 - u) ** 2), mix(p.sz, p.nz, g));
        return TO3;
      }
      if (t < p.tS) { set3(out, p.nx, p.ny, p.nz); return SILO; }
      if (t < p.tH) {
        const u = ease((t - p.tS) / (p.tH - p.tS));
        set3(out, mix(p.nx, AX, u), mix(p.ny, S3 + HUB_H * .5, u), mix(p.nz, 0, u));
        return SPOKE;
      }
      if (t < p.tB0) return HUB;
      if (t < p.t5) { upPath(p, (t - p.tB0) / (p.t5 - p.tB0), out); return UPB; }
      if (t < p.t5 + .5) { targetWorld(p, out); return HIT; }
      return GONE;
    }
    // Une forme par famille de données brutes : rond, triangle, losange, croix
    function glyph(path, f, x, y, s) {
      if (f === 0) { path.moveTo(x + s, y); path.arc(x, y, s, 0, TAU); }
      else if (f === 1) { path.moveTo(x, y - s * 1.15); path.lineTo(x + s, y + s * .75); path.lineTo(x - s, y + s * .75); path.closePath(); }
      else if (f === 2) { path.moveTo(x, y - s * 1.25); path.lineTo(x + s, y); path.lineTo(x, y + s * 1.25); path.lineTo(x - s, y); path.closePath(); }
      else { const w = s * .38; path.rect(x - s, y - w, 2 * s, 2 * w); path.rect(x - w, y - s, 2 * w, 2 * s); }
    }
    const paths = n => Array.from({length: n}, () => new Path2D());
    function drawRecords() {
      const t = elapsed;
      if (t < DOWN0 || t > 28.4) return;
      const famTrail = paths(4), famHead = paths(4), famBar = paths(4), twinBar = paths(4), sideTrail = paths(2), sideHead = paths(2);
      const okBar = new Path2D(), okHead = new Path2D(), miss = new Path2D(), redLine = new Path2D(), redDot = new Path2D();
      const cyanTrail = new Path2D(), cyanHead = new Path2D(), white = new Path2D(), rings = [];
      const scanX = t >= SC0 && t <= SC1 ? AX - H1 + scanP(t) * 2 * H1 : null;
      for (const p of particles) {
        const st = rec(p, t, pa);
        if (st === WAIT || st === GONE || st === HUB) continue;
        if (st === SLOT) { if (t - p.tSnap < .35 && project(pa[0], pa[1], pa[2], a)) rings.push(a[0], a[1], (t - p.tSnap) / .35, 4, "#bffff9"); continue; }
        if (!project(pa[0], pa[1], pa[2], a)) continue;
        const x = a[0], y = a[1], k = Math.min(1.6, Math.max(.7, a[2] * .9));
        if (st === REST) {
          if (p.bad === 1) { miss.rect(x - 2.2 * k, y - 2.2 * k, 4.4 * k, 4.4 * k); continue; }
          const hh = p.h * ease((t - p.t1) / .35), checked = !p.bad && t >= p.tScan;
          if (!project(p.ex, S1 + hh, p.ez, b)) continue;
          if (checked) {
            okBar.moveTo(x, y); okBar.lineTo(b[0], b[1]); okHead.rect(b[0] - 1.3, b[1] - 1.3, 2.6, 2.6);
            if (t - p.tScan < .25) white.rect(b[0] - 2, b[1] - 2, 4, 4);
          } else {
            famBar[p.fam].moveTo(x, y); famBar[p.fam].lineTo(b[0], b[1]); glyph(famHead[p.fam], p.fam, b[0], b[1], 1.8 * k);
            if (scanX !== null && Math.abs(p.ex - scanX) < 6) white.rect(b[0] - 2, b[1] - 2, 4, 4);
          }
          // Doublon : un jumeau décalé qui fusionne avec l'original au passage du contrôle
          if (p.dup) {
            const m = checked ? clamp((t - p.tScan) / .35) : 0;
            if (m < 1) {
              const off = 4.5 * (1 - m), gx = p.ex + Math.cos(p.dupA) * off, gz = p.ez + Math.sin(p.dupA) * off;
              if (project(gx, S1, gz, g0) && project(gx, S1 + hh * .95, gz, g1)) { twinBar[p.fam].moveTo(g0[0], g0[1]); twinBar[p.fam].lineTo(g1[0], g1[1]); }
            } else if (t - p.tScan < .8) rings.push(b[0], b[1], (t - p.tScan - .35) / .45, 7, "#ffc38a");
          }
          continue;
        }
        if (st === DROP) {
          const age = t - p.tScan;
          if (age < .45) rings.push(x, y, age / .45, 10, "#ff7f6e");
          if (p.bad === 2 && age < .3 && project(p.ex, S1 + p.h * (1 - age / .3), p.ez, b)) { redLine.moveTo(x, y); redLine.lineTo(b[0], b[1]); }
          redDot.rect(x - 1.5, y - 1.5, 3, 3);
          if (rec(p, t - .07, pb) === DROP && project(pb[0], pb[1], pb[2], b)) { redLine.moveTo(b[0], b[1]); redLine.lineTo(x, y); }
          continue;
        }
        if (st === HIT) { rings.push(x, y, (t - p.t5) / .5, 5, p.side < 0 ? "#ffd9a8" : "#7ffff2"); continue; }
        if (st === SILO) { cyanHead.rect(x - .9, y - .9, 1.8, 1.8); continue; }
        // Déplacements : traînée + tête
        const before = rec(p, t - .065, pb) === st && project(pb[0], pb[1], pb[2], b);
        let trail = cyanTrail;
        if (st === RISE) {
          trail = famTrail[p.fam];
          glyph(famHead[p.fam], p.fam, x, y, (1.5 + p.size * .8) * k);
          if (p.spark && t - p.t0 < .25) rings.push(x, y, (t - p.t0) / .25, 4, FAMILIES[p.fam].color);
        } else if (st === TO2) {
          // Traversée de la dalle : la forme d'origine devient un carré standard
          const m = clamp((pa[1] - (S2 - SLAB)) / SLAB);
          if (m < 1) {
            trail = famTrail[p.fam];
            glyph(famHead[p.fam], p.fam, x, y, 2.2 * k * (1 - .25 * m));
            if (m > 0) white.rect(x - .8, y - .8, 1.6, 1.6);
          } else cyanHead.rect(x - 1.6 * k, y - 1.6 * k, 3.2 * k, 3.2 * k);
        } else if (st === TO3) cyanHead.rect(x - 1.3 * k, y - 1.3 * k, 2.6 * k, 2.6 * k);
        else if (st === SPOKE) white.rect(x - 1.3 * k, y - 1.3 * k, 2.6 * k, 2.6 * k);
        else if (st === UPB) {
          if ((t - p.tB0) / (p.t5 - p.tB0) < .45) white.rect(x - 1.2, y - 1.2, 2.4, 2.4);
          else { trail = sideTrail[p.side < 0 ? 0 : 1]; sideHead[p.side < 0 ? 0 : 1].rect(x - 1.3, y - 1.3, 2.6, 2.6); }
        }
        if (before) { trail.moveTo(b[0], b[1]); trail.lineTo(x, y); }
      }
      ctx.lineCap = "round";
      FAMILIES.forEach((fam, f) => {
        ctx.strokeStyle = fam.color; ctx.fillStyle = fam.color;
        ctx.globalAlpha = .45; ctx.lineWidth = 1; ctx.stroke(famTrail[f]);
        ctx.globalAlpha = .4; ctx.stroke(twinBar[f]);
        ctx.globalAlpha = .85; ctx.lineWidth = 1.3; ctx.stroke(famBar[f]);
        ctx.globalAlpha = 1; ctx.fill(famHead[f]);
      });
      ctx.strokeStyle = "#9fb3bd"; ctx.globalAlpha = .75; ctx.lineWidth = 1; ctx.stroke(miss);
      ctx.globalCompositeOperation = "lighter";
      ctx.strokeStyle = "#bffff6"; ctx.globalAlpha = .8; ctx.lineWidth = 1.3; ctx.stroke(okBar);
      ctx.fillStyle = "#7ffff2"; ctx.globalAlpha = 1; ctx.fill(okHead);
      ctx.strokeStyle = "#31e5dc"; ctx.globalAlpha = .5; ctx.lineWidth = 1; ctx.stroke(cyanTrail);
      ctx.fillStyle = "#9ffcf4"; ctx.globalAlpha = 1; ctx.fill(cyanHead);
      ["#ffcf8f", "#7ffff2"].forEach((color, i) => { ctx.strokeStyle = color; ctx.globalAlpha = .5; ctx.stroke(sideTrail[i]); ctx.fillStyle = color; ctx.globalAlpha = 1; ctx.fill(sideHead[i]); });
      ctx.fillStyle = "#ffffff"; ctx.fill(white);
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = "#ff6f61"; ctx.globalAlpha = .9; ctx.lineWidth = 1.3; ctx.stroke(redLine);
      ctx.fillStyle = "#ff8f80"; ctx.globalAlpha = 1; ctx.fill(redDot);
      ctx.lineWidth = 1;
      for (let i = 0; i < rings.length; i += 5) {
        const u = rings[i + 2];
        ctx.globalAlpha = (1 - u) * .7; ctx.strokeStyle = rings[i + 4];
        ctx.beginPath(); ctx.arc(rings[i], rings[i + 1], 1.2 + u * rings[i + 3], 0, TAU); ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }
    // Flux continu après l'introduction : métiers → nettoyage → modèle commun → source → référentiel → cerveau
    function idlePos(q, u, out) {
      let i = 0;
      while (i < 4 && u >= LEGS[i + 1]) i++;
      const v = ease((u - LEGS[i]) / (LEGS[i + 1] - LEGS[i]));
      if (i === 0) set3(out, mix(q.x, q.ex, v), mix(q.y, S1, 1 - (1 - v) ** 2), mix(q.z, q.ez, v));
      else if (i === 1) set3(out, mix(q.ex, q.sx, v), mix(S1, S2, v), mix(q.ez, q.sz, v));
      else if (i === 2) set3(out, mix(q.sx, q.nx, v), mix(S2, q.ny, v), mix(q.sz, q.nz, v));
      else if (i === 3) set3(out, mix(q.nx, AX, v), mix(q.ny, S3 + HUB_H * .5, v), mix(q.nz, 0, v));
      else upPath(q, v, out);
      return i;
    }
    function drawIdle() {
      const on = ease((elapsed - IDLE0) / 1.6) * .8;
      if (on <= 0) return;
      const trails = paths(7), heads = paths(7), colors = FAMILIES.map(f => f.color).concat(["#9ffcf4", "#ffcf8f", "#7ffff2"]);
      for (const q of idle) {
        const u = frac(clock / IDLE_PERIOD + q.phase), leg = idlePos(q, u, pa);
        if (!project(pa[0], pa[1], pa[2], a)) continue;
        const g = leg === 0 ? q.fam : leg < 4 || u < .82 ? 4 : q.side < 0 ? 5 : 6, ub = u - .012;
        if (ub > LEGS[leg] && idlePos(q, ub, pb) === leg && project(pb[0], pb[1], pb[2], b)) { trails[g].moveTo(b[0], b[1]); trails[g].lineTo(a[0], a[1]); }
        heads[g].rect(a[0] - 1.2, a[1] - 1.2, 2.4, 2.4);
      }
      ctx.globalCompositeOperation = "lighter"; ctx.lineWidth = 1; ctx.lineCap = "round";
      colors.forEach((color, g) => {
        ctx.strokeStyle = color; ctx.globalAlpha = on * .5; ctx.stroke(trails[g]);
        ctx.fillStyle = color; ctx.globalAlpha = on; ctx.fill(heads[g]);
      });
      ctx.globalCompositeOperation = "source-over"; ctx.globalAlpha = 1;
    }
    function textTag(text, x, y, color, alpha, font, boxed) {
      setFont(font); ctx.textAlign = "center"; ctx.textBaseline = "middle";
      if (boxed) {
        const w = textWidth(text, font);
        ctx.globalAlpha = alpha * .85; ctx.fillStyle = "rgba(6,14,20,.82)"; ctx.fillRect(x - w / 2 - 5, y - 8, w + 10, 16);
        ctx.globalAlpha = alpha * .6; ctx.strokeStyle = color; ctx.lineWidth = 1; ctx.strokeRect(x - w / 2 - 5.5, y - 8.5, w + 11, 17);
      }
      ctx.globalAlpha = alpha; ctx.fillStyle = color; ctx.fillText(text, x, y);
    }
    function drawCanvasLabels() {
      const t = elapsed;
      setSpacing("1px");
      // 03 : quelques enregistrements signalés par le contrôle (décalés vers le haut s'ils se chevauchent)
      const flagBoxes = [];
      for (const fl of FLAGS) {
        const age = t - fl.p.tScan, al = win(age, 0, 1.1, .12, .35);
        if (al <= 0 || !project(fl.p.ex, S1 + (fl.p.bad === 1 ? 6 : fl.p.h) + 10 + 6 * easeOut(age / 1.4), fl.p.ez, a)) continue;
        const w = textWidth(fl.text, `700 9px ${MONO}`) + 14;
        let y = a[1];
        for (let k = 0; k < 4 && flagBoxes.some(r => Math.abs(r[0] - a[0]) < (r[2] + w) / 2 && Math.abs(r[1] - y) < 19); k++) y -= 20;
        flagBoxes.push([a[0], y, w]);
        textTag(fl.text, a[0], y, fl.kind ? "#ffc38a" : "#ff8f80", al, `700 9px ${MONO}`, true);
      }
      // 04 : colonnes du modèle commun et conversions en cours
      const s2 = ease((t - 13.4) / .8) * (1 - ease((t - 19.2) / .8));
      FAMILIES.forEach((fam, f) => {
        if (s2 > 0 && project(FAM_X[f], S2, -H2 - 14, a)) textTag(fam.name, a[0], a[1], "#9ffcf4", s2 * .9, `700 9px ${MONO}`, false);
        const u = (t - TOK0 - f * TOK_STEP) / TOK_DUR;
        if (u <= 0 || u >= 1) return;
        const y = mix(S2 - 58, S2 + 34, ease(u)), al = ease(u / .15) * (1 - ease((u - .82) / .18)), m = clamp((y - (S2 - 6)) / 10);
        if (!project(FAM_X[f], y, -H2 * .45, a)) return;
        if (m < 1) textTag(fam.raw, a[0], a[1], fam.color, al * (1 - m), `700 11px ${MONO}`, true);
        if (m > 0) textTag(fam.std, a[0], a[1], "#bffff9", al * m, `700 11px ${MONO}`, true);
      });
      // 05 : systèmes sources et référentiel unique
      const s3 = ease((t - 18.5) / .8) * (1 - ease((t - 23.6) / .8));
      if (s3 > 0) for (const nd of NODES3) if (project(nd.x, S3 + 34, nd.z, a)) textTag(nd.name, a[0], a[1], nd.kind ? "#ffcf8f" : "#8ff7ef", s3 * .95, `700 9px ${MONO}`, false);
      const hub = ease((t - CONS0 - .6) / .6) * (1 - ease((t - 24.6) / .8));
      if (hub > 0 && project(AX, S3 + HUB_H + 16, 0, a)) textTag(T.hub, a[0], a[1], "#e9fffd", hub, `700 10px ${MONO}`, true);
      setSpacing("0px"); ctx.globalAlpha = 1;
    }

    /* ---------- Rendu : finitions ---------- */
    function drawShade() {
      const r = ease((elapsed - REVEAL) / 1.6);
      if (r <= 0) return;
      let g;
      if (layout.stacked) {
        g = ctx.createLinearGradient(0, Math.max(0, layout.heroTop - 60), 0, height);
        g.addColorStop(0, "rgba(10,14,19,0)"); g.addColorStop(.25, "rgba(10,14,19,.6)"); g.addColorStop(1, "rgba(10,14,19,.86)");
      } else {
        g = ctx.createLinearGradient(0, 0, Math.min(width, layout.heroRight + 80), 0);
        g.addColorStop(0, "rgba(10,14,19,.74)"); g.addColorStop(.75, "rgba(10,14,19,.38)"); g.addColorStop(1, "rgba(10,14,19,0)");
      }
      ctx.globalAlpha = r; ctx.fillStyle = g; ctx.fillRect(0, 0, width, height); ctx.globalAlpha = 1;
    }
    function placeTags() {
      const fin = ease((elapsed - REVEAL) / 1.4);
      const minX = layout.stacked ? 14 : mix(layout.chapterRight, layout.heroRight, fin) + 22;
      const maxX = width - (layout.stacked ? 14 : 48), minY = layout.headerBottom + 6;
      const maxY = layout.stacked ? mix(layout.chapterTop, layout.heroTop, fin) - 10 : height - 90;
      for (const t of TAGS) {
        t.a = t.alpha(elapsed);
        if (t.a > .004 && t.anchor(c3) && project(c3[0], c3[1], c3[2], a)) { t.ax = a[0]; t.ay = a[1]; } else { t.a = 0; continue; }
        let compact = t.compact ? t.compact(elapsed) : false, w = compact ? t.cw : t.w;
        if (!compact && t.lines && ((t.side === "right" && t.ax + 18 + w > maxX) || (t.side === "left" && t.ax - 18 - w < minX))) { compact = true; w = t.cw; }
        t.compactNow = compact; t.wNow = w; t.hNow = compact ? t.ch : t.h;
        if (t.side === "right") { t.x = t.ax + 18; t.y = t.ay - t.th / 2; }
        else if (t.side === "left") { t.x = t.ax - 18 - w; t.y = t.ay - t.th / 2; }
        else if (t.side === "up") { t.x = t.ax - w / 2; t.y = t.ay - 26 - t.hNow; }
        else { t.x = t.ax - w / 2; t.y = t.ay - t.hNow / 2; }
      }
      // HUMAIN et IA restent symétriques : si l'un perd son sous-titre faute de place, l'autre aussi.
      if (BRAIN_TAGS.every(t => t.a) && BRAIN_TAGS.some(t => t.compactNow)) for (const t of BRAIN_TAGS) {
        if (t.compactNow) continue;
        t.compactNow = true; t.wNow = t.cw; t.hNow = t.ch;
        if (t.side === "left") t.x = t.ax - 18 - t.wNow;
      }
      let rail = -Infinity, cap = Infinity;
      for (const t of FILTERS) if (t.a) { rail = Math.max(rail, t.x); cap = Math.min(cap, maxX - t.wNow); }
      for (const t of FILTERS) if (t.a) t.x = Math.min(rail, cap);
      for (const t of TAGS) if (t.a) { t.x = Math.max(minX, Math.min(maxX - t.wNow, t.x)); t.y = Math.max(minY, Math.min(maxY - t.hNow, t.y)); }
      // Les étiquettes des stations gardent leur ordre vertical (01 en bas) ; les autres s'écartent ensuite.
      const placed = [];
      for (const t of FILTERS) {
        if (!t.a) continue;
        const below = placed[placed.length - 1];
        if (below) t.y = Math.min(t.y, below.y - t.hNow - 3);
        placed.push(t);
      }
      if (placed.length && placed[placed.length - 1].y < minY) { const shift = minY - placed[placed.length - 1].y; for (const t of placed) t.y += shift; }
      // Si l'empilement ne tient plus au-dessus du titre (petit écran, dernier mouvement de caméra), les stations s'effacent.
      if (placed.length && placed[0].y + placed[0].hNow > maxY) { for (const t of placed) t.a = 0; placed.length = 0; }
      // Une étiquette qui en chevauche une autre prend la position libre la plus proche (dessus, dessous ou à côté).
      const free = (t, x, y) => placed.every(o => x >= o.x + o.wNow + 6 || o.x >= x + t.wNow + 6 || y >= o.y + o.hNow + 4 || o.y >= y + t.hNow + 4);
      for (const t of PLACE_ORDER) {
        if (!t.a) continue;
        if (!free(t, t.x, t.y)) {
          let best = null, bestD = Infinity;
          const tryAt = (x, y) => {
            if (x < minX || x > maxX - t.wNow || y < minY || y > maxY - t.hNow || !free(t, x, y)) return;
            const d = Math.abs(x - t.x) + Math.abs(y - t.y);
            if (d < bestD) { bestD = d; best = [x, y]; }
          };
          for (const o of placed) {
            tryAt(t.x, o.y + o.hNow + 4); tryAt(t.x, o.y - t.hNow - 4);
            tryAt(o.x + o.wNow + 8, t.y); tryAt(o.x - t.wNow - 8, t.y);
          }
          if (best) { t.x = best[0]; t.y = best[1]; }
        }
        placed.push(t);
      }
      ctx.lineWidth = 1;
      for (const t of TAGS) {
        if (!t.a) { if (t.shown) { t.el.style.visibility = "hidden"; t.shown = false; } continue; }
        if (!t.shown) { t.el.style.visibility = "visible"; t.shown = true; }
        if (t.compactNow !== t.isCompact) { t.el.classList.toggle("compact", t.compactNow); t.isCompact = t.compactNow; }
        const tf = `translate3d(${t.x.toFixed(1)}px,${t.y.toFixed(1)}px,0)`, op = t.a.toFixed(3);
        if (tf !== t.tf) { t.el.style.transform = tf; t.tf = tf; }
        if (op !== t.op) { t.el.style.opacity = op; t.op = op; }
        if (!t.lead) continue;
        const ex = t.side === "right" ? t.x - 6 : t.side === "left" ? t.x + t.wNow + 6 : t.x + t.wNow / 2;
        const ey = t.side === "up" ? t.y + t.hNow + 5 : t.y + t.th / 2;
        ctx.globalAlpha = t.a * .55; ctx.strokeStyle = `rgb(${t.color})`;
        ctx.beginPath(); ctx.moveTo(t.ax, t.ay); ctx.lineTo(ex, ey); ctx.stroke();
        ctx.globalAlpha = t.a; ctx.fillStyle = `rgb(${t.color})`; ctx.fillRect(t.ax - 1.5, t.ay - 1.5, 3, 3);
      }
      ctx.globalAlpha = 1;
    }
    // Étiquettes des moniteurs, dessinées dans le canevas
    function plate(text, x, y, z, color, dx, dy, align) {
      if (!project(x, y, z, a)) return;
      const ax = a[0], ay = a[1], font = `700 9px ${MONO}`;
      const w = textWidth(text, font) + 12;
      setFont(font);
      let bx = align < 0 ? ax + dx - w : align > 0 ? ax + dx : ax + dx - w / 2;
      bx = Math.max(4, Math.min(width - w - 4, bx));
      const by = Math.max(4, Math.min(height - 22, ay + dy - 9));
      ctx.lineWidth = 1; ctx.strokeStyle = color;
      ctx.globalAlpha = .5; ctx.beginPath(); ctx.moveTo(ax, ay);
      ctx.lineTo(align < 0 ? bx + w : align > 0 ? bx : bx + w / 2, align ? by + 9 : by + 18); ctx.stroke();
      ctx.globalAlpha = 1; ctx.fillStyle = color; ctx.fillRect(ax - 1.5, ay - 1.5, 3, 3);
      ctx.globalAlpha = .92; ctx.fillStyle = "rgba(6,14,20,.88)"; ctx.fillRect(bx, by, w, 18);
      ctx.globalAlpha = .45; ctx.strokeRect(bx + .5, by + .5, w - 1, 17);
      ctx.globalAlpha = 1; ctx.fillStyle = color; ctx.textAlign = "left"; ctx.textBaseline = "middle"; ctx.fillText(text, bx + 6, by + 9.5);
    }
    function drawViewLabels() {
      if (width < 260 || height < 150) return;
      const k = view.labels, cyan = "#8ff7ef", amber = "#ffcf8f";
      setSpacing("1px");
      if (k === "factory" || k === "signals") {
        plate(T.production[0], -20, PEAK + 4, 0, cyan, 0, -30, 0);
        plate(T.support[0], ANT[0], ANT[1] + 3, ANT[2], amber, 0, -26, 0);
        if (k === "signals") plate(T.stations[0], AX + H1, S1, 0, cyan, 22, 0, 1);
      } else if (k === "refinery" || k === "performance") {
        plate(T.stations[0], AX + H1, S1, 0, cyan, 22, 0, 1);
        plate(T.stations[1], AX + H2, S2, 0, cyan, 22, 0, 1);
        plate(T.stations[2], AX + R3 + 26, S3 + 11, 0, cyan, 22, 0, 1);
      } else if (k === "hub") {
        // Les noms des douze systèmes ne tiennent que sur un grand moniteur.
        if (width >= 440) for (const nd of NODES3) if (project(nd.x, S3 + 34, nd.z, a)) textTag(nd.name, a[0], a[1], nd.kind ? amber : cyan, .9, `700 9px ${MONO}`, false);
        if (project(AX, S3 + HUB_H + 16, 0, a)) textTag(T.hub, a[0], a[1], "#e9fffd", 1, `700 10px ${MONO}`, true);
      }
      if (k === "brain" || k === "performance") {
        tiltW(-CXH - AXH * .93 - 22, 8, 10, c3); plate(T.human[0], c3[0], c3[1], c3[2], amber, -22, 0, -1);
        tiltW(CXH + AXH * .93 + 22, 8, 10, c3); plate(T.ai[0], c3[0], c3[1], c3[2], cyan, 22, 0, 1);
      }
      setSpacing("0px"); ctx.globalAlpha = 1;
    }
    function draw() {
      setCamera(); brainState();
      const skip = parts || {}, top = factoryTop(), boosted = elapsed >= UP0;
      drawBackground();
      if (!skip.floor) drawFloor();
      if (!skip.factory) { drawNetwork(); drawGhost(); drawWindows(top, boosted); drawFactoryLines(top, boosted); drawMachines(top, boosted); drawScan(); }
      drawStation1(); drawStation2(); drawStation3(); drawBeams();
      if (skip.brain) drawStem(); else drawBrain();
      drawRecords(); drawIdle();
      if (view) drawViewLabels();
      else { drawCanvasLabels(); drawShade(); placeTags(); }
    }

    /* ---------- Surfaces de rendu : un canevas, sa taille et son propre temps ---------- */
    class Surface {
      constructor(canvas, maxDpr) {
        this.canvas = canvas; this.maxDpr = maxDpr;
        let context = null;
        try { context = canvas.getContext("2d", {alpha: false}); }
        catch (error) { console.warn("Le dessin de la scène 3D est indisponible.", error); }
        this.ctx = context;
        this.w = 0; this.h = 0; this.dpr = 0;
        this.elapsed = DURATION; this.clock = 0; this.idleT = 0; this.work = 0;
      }
      fit() {
        const w = Math.max(1, Math.round(this.canvas.clientWidth)), h = Math.max(1, Math.round(this.canvas.clientHeight));
        const dpr = Math.min(window.devicePixelRatio || 1, this.maxDpr);
        if (w === this.w && h === this.h && dpr === this.dpr) return;
        this.w = w; this.h = h; this.dpr = dpr;
        this.canvas.width = Math.round(w * dpr); this.canvas.height = Math.round(h * dpr);
        this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        this.ctx._font = null;
      }
      render(v, p) {
        ctx = this.ctx; width = this.w; height = this.h; view = v; parts = p;
        elapsed = this.elapsed; clock = this.clock; idleT = this.idleT; work = this.work;
        draw();
      }
    }

    /* ---------- Boucle d'animation partagée et visibilité ---------- */
    let reduced = motion.matches, rafId = null, lastTs = null;
    const running = new Set(), items = [];
    function loop(ts) {
      rafId = null;
      const dt = lastTs === null ? 0 : Math.min((ts - lastTs) / 1000, .08);
      lastTs = ts;
      for (const item of running) {
        try { item.tick(dt); }
        catch (error) { console.warn("La scène 3D a été interrompue.", error); running.delete(item); item.fail(); }
      }
      if (running.size && !document.hidden) rafId = requestAnimationFrame(loop); else lastTs = null;
    }
    function setRunning(item, on) {
      if (on) running.add(item); else running.delete(item);
      if (running.size && rafId === null && !document.hidden) rafId = requestAnimationFrame(loop);
    }
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) { if (rafId !== null) cancelAnimationFrame(rafId); rafId = null; lastTs = null; }
      else if (running.size && rafId === null) rafId = requestAnimationFrame(loop);
    });
    const watchers = new Map();
    const io = "IntersectionObserver" in window ? new IntersectionObserver(entries => {
      for (const entry of entries) { const cb = watchers.get(entry.target); if (cb) cb(entry.isIntersecting); }
    }, {rootMargin: "80px 0px"}) : null;
    function watch(el, cb) { if (io) { watchers.set(el, cb); io.observe(el); } else cb(true); }
    const ro = "ResizeObserver" in window ? new ResizeObserver(entries => {
      for (const entry of entries) { const item = items.find(i => i.root === entry.target); if (item) item.resize(); }
    }) : null;

    /* ---------- Pages : moniteurs ---------- */
    // Zone de l'image (fractions du canevas) où la vue est cadrée ; le reste accueille les étiquettes.
    const BOXES = {refinery: [.03, .7, .07, .93], performance: [.04, .72, .05, .95], brain: [.2, .8, .1, .92], hub: [.05, .95, .1, .9]};
    function createView(root) {
      const key = PRESETS[root.dataset.sceneView] ? root.dataset.sceneView : "performance";
      const canvas = root.querySelector("canvas");
      if (!canvas) return null;
      const S = new Surface(canvas, 1.75);
      if (!S.ctx) { root.classList.add("is-static"); return null; }
      S.clock = 6 + 40 * hash(viewRoots.indexOf(root) + 11); S.work = 12;
      const state = {cam: PRESETS[key].cam, sway: 1, box: [0, 1, 0, 1], labels: key}, skip = PRESETS[key].skip;
      let visible = false, acc = 0;
      const api = {
        root,
        tick(dt) {
          acc += dt;
          if (acc < 1 / 32) return;
          S.clock += acc; S.work += acc * 1.5; acc = 0;
          S.render(state, skip);
        },
        resize() {
          S.fit();
          const f = BOXES[key] || [.06, .94, .08, .92];
          state.box = [f[0] * S.w, f[1] * S.w, f[2] * S.h, f[3] * S.h];
          S.render(state, skip);
        },
        redraw() { S.render(state, skip); },
        motionChanged() { update(); S.render(state, skip); },
        fail() { root.classList.add("is-static"); }
      };
      function update() { setRunning(api, visible && !reduced); }
      watch(root, on => { visible = on; update(); });
      api.resize();
      root.classList.add("is-live");
      return api;
    }

    /* ---------- Accueil : introduction cinématique ---------- */
    function createIntro(root) {
      const q = sel => root.querySelector(sel);
      const canvas = q("[data-scene-canvas]");
      const S = canvas ? new Surface(canvas, 2) : null;
      if (!S || !S.ctx) { root.classList.add("is-static"); return null; }
      const chapter = q("[data-scene-chapter]"), chapterNumber = q("[data-chapter-num]"), chapterTitle = q("[data-chapter-title]");
      const chapterDetail = q("[data-chapter-detail]"), metricsEl = q("[data-chapter-metrics]");
      const progress = q("[data-scene-progress]"), phaseLabel = q("[data-scene-phase]"), percent = q("[data-scene-percent]");
      const fills = Array.from(root.querySelectorAll("[data-scene-track] i"));
      const kpi = q("[data-scene-kpi]"), kpiValue = q("[data-kpi-value]"), kpiDelta = q("[data-kpi-delta]"), kpiLine = q("[data-kpi-line]"), kpiDot = q("[data-kpi-dot]");
      const skip = q("[data-scene-skip]"), pause = q("[data-scene-pause]"), replay = q("[data-scene-replay]"), status = q("[data-scene-status]");
      const copy = q(".hero-copy"), heroParts = copy ? Array.from(copy.children) : [], ctas = q(".hero-ctas");
      const header = document.querySelector(".site-header");
      const cfg = window.SITE_CONFIG || {};
      const mode = cfg.intro === "off" || cfg.intro === "always" ? cfg.intro : "auto";
      const lenis = () => window.AR && window.AR.lenis;
      let paused = false, playing = false, played = false, visible = true, chapterIndex = -1, metricRows = [], focusCta = false, kpiPath = "";

      function remember() {
        try { sessionStorage.setItem("ar-intro-seen", "1"); }
        catch (error) { console.warn("Impossible de mémoriser le passage de l'introduction.", error); }
      }
      function lock(on) {
        if (on) played = true;
        if (playing === on) return;
        playing = on;
        html.classList.toggle("scene-playing", on);
        // Les écouteurs bloquants (molette, toucher) ne restent actifs que pendant l'introduction.
        clearTimeout(unhookTimer);
        if (on) hook(true); else unhookTimer = setTimeout(() => hook(false), 800);
      }
      function measureChapter() {
        if (chapter.hidden) return;
        const r = chapter.getBoundingClientRect(), rr = root.getBoundingClientRect();
        if (r.width) { layout.chapterRight = r.right - rr.left; layout.chapterTop = r.top - rr.top; }
      }
      function measureTags() {
        for (const t of TAGS) {
          const el = t.el, had = el.classList.contains("compact");
          el.classList.remove("compact"); t.w = el.offsetWidth; t.h = el.offsetHeight;
          el.classList.add("compact"); t.cw = el.offsetWidth; t.ch = el.offsetHeight;
          t.th = el.firstChild.offsetHeight || 12;
          el.classList.toggle("compact", had);
        }
      }
      function measure() {
        const W = S.w, H = S.h, rr = root.getBoundingClientRect();
        // Pendant l'introduction, seule la partie visible du hero compte (il peut dépasser l'écran sur les petites hauteurs).
        const VH = Math.min(H, window.innerHeight || H);
        layout.stacked = W < 900 && VH >= 500;
        layout.short = VH < 500;
        layout.headerBottom = header ? header.offsetHeight : 0;
        let right = 0, top = Infinity;
        for (const el of heroParts) {
          // Le décalage d'apparition (translateY) ne doit pas fausser la position mesurée du titre.
          const r = el.getBoundingClientRect(), dy = el._ty || 0;
          if (r.width && r.height) { right = Math.max(right, r.right - rr.left); top = Math.min(top, r.top - dy - rr.top); }
        }
        if (right) { layout.heroRight = right; layout.heroTop = top; } else { layout.heroRight = W * .45; layout.heroTop = H * .42; }
        measureChapter();
        if (!layout.chapterRight) { layout.chapterRight = Math.min(W * .45, 440); layout.chapterTop = H * (layout.stacked ? .5 : .36); }
        const hb = layout.headerBottom;
        if (layout.stacked) {
          layout.intro = [W * .04, W * .96, hb + 10, Math.max(hb + 150, layout.chapterTop - 16)];
          layout.final = [W * .04, W * .96, hb + 8, Math.max(hb + 120, Math.min(layout.heroTop, VH) - 18)];
        } else if (layout.short) {
          layout.intro = [Math.max(W * .44, layout.chapterRight + 16), W * .98, hb + 4, VH * .9];
          layout.final = [Math.max(W * .5, layout.heroRight + 24), W * .98, hb + 4, VH * .9];
        } else {
          layout.intro = [Math.max(W * .3, layout.chapterRight + 24), W - 36, hb + 12, VH - 70];
          layout.final = [Math.max(W * .46, layout.heroRight + 40), W - 32, hb + 6, VH - 60];
        }
        const fw = layout.final[1] - layout.final[0], fh = layout.final[3] - layout.final[2];
        layout.density = fh >= 340 && fw >= 340 ? 2 : fh >= 200 ? 1 : 0;
        // Sur petit écran, l'image finale se resserre sur le cerveau et le référentiel.
        const tight = layout.stacked || layout.short || fh < 420;
        layout.endDy = tight ? 110 : 0; layout.endRw = tight ? .9 : 1; layout.endRh = tight ? .66 : 1;
        measureTags();
      }
      function buildMetrics(list) {
        metricsEl.textContent = "";
        metricRows = (list || []).map(m => {
          const row = document.createElement("div"), dt = document.createElement("dt"), dd = document.createElement("dd");
          const from = document.createElement("span"), arrow = document.createElement("span"), to = document.createElement("span");
          from.className = "from"; arrow.className = "arrow"; to.className = "to";
          dt.textContent = m.label; arrow.textContent = m.to ? " → " : ""; to.textContent = m.to || "";
          dd.append(from, arrow, to); row.append(dt, dd);
          if (m.cls) row.className = m.cls;
          metricsEl.appendChild(row);
          return {m, row, from, text: null, done: null};
        });
      }
      function updateMetrics(t) {
        for (const r of metricRows) {
          const text = typeof r.m.value === "function" ? r.m.value(t) : r.m.value;
          if (text !== r.text) { r.from.textContent = text; r.text = text; }
          const done = !!r.m.to && t >= r.m.at;
          if (done !== r.done) { r.row.classList.toggle("done", done); r.done = done; }
        }
      }
      function updateKpi(t) {
        const swap = ease((t - KPI_SWAP) / .45);
        const grow = easeOut((t - KPI0) / (KPI1 - KPI0)), live = t >= DURATION && !reduced ? .25 * Math.sin(S.clock * .8) : 0, value = 64 + 23 * grow + live;
        kpi.style.opacity = swap.toFixed(3); kpi.style.visibility = swap > 0 ? "visible" : "hidden";
        kpi.style.transform = `translateY(${((1 - swap) * 8).toFixed(1)}px)`;
        progress.style.opacity = (1 - swap).toFixed(3);
        progress.style.visibility = swap < 1 ? "visible" : "hidden";
        const text = fmt(value, 1) + T.pct, delta = "▲ +" + Math.round(value - 64) + " pts";
        if (kpiValue.textContent !== text) kpiValue.textContent = text;
        if (kpiDelta.textContent !== delta) kpiDelta.textContent = delta;
        const count = Math.max(2, Math.ceil(SPARK.length * grow));
        let d = "", px = 0, py = 0;
        for (let i = 0; i < count; i++) {
          const v = i === count - 1 && t >= DURATION ? value : SPARK[i];
          px = i / (SPARK.length - 1) * 200; py = 22 - (v - 60) / 30 * 20;
          d += (i ? "L" : "M") + px.toFixed(1) + " " + py.toFixed(1);
        }
        if (d !== kpiPath) { kpiLine.setAttribute("d", d); kpiDot.setAttribute("cx", px.toFixed(1)); kpiDot.setAttribute("cy", py.toFixed(1)); kpiPath = d; }
      }
      function sync() {
        const t = S.elapsed, final = t >= DURATION, ctaReady = t >= REVEAL + .7;
        heroParts.forEach((el, k) => {
          const v = easeOut((t - REVEAL - .12 - k * .085) / .7), op = v.toFixed(3), dy = (1 - v) * 16, tf = v >= 1 ? "" : `translateY(${dy.toFixed(1)}px)`;
          el._ty = v >= 1 ? 0 : dy;
          if (el._op !== op) { el.style.opacity = op; el._op = op; }
          if (el._tf !== tf) { el.style.transform = tf; el._tf = tf; }
        });
        if (ctas) ctas.inert = !ctaReady;
        if (focusCta && ctaReady) { focusCta = false; const first = ctas && ctas.querySelector("a, button"); if (first) first.focus({preventScroll: true}); }
        let k = CHAPTERS.findIndex(c => t < c.end);
        if (k < 0) k = CHAPTERS.length - 1;
        const current = CHAPTERS[k];
        chapter.hidden = t >= TEXT_END;
        if (k !== chapterIndex) {
          chapterIndex = k; chapterNumber.textContent = current.num; chapterTitle.textContent = current.title; chapterDetail.textContent = current.detail;
          buildMetrics(current.metrics); measureChapter();
        }
        updateMetrics(t);
        const fadeIn = ease((t - current.start - (k ? 0 : .15)) / .45), fadeOut = ease((t - (Math.min(current.end, TEXT_END) - .4)) / .4);
        chapter.style.opacity = (fadeIn * (1 - fadeOut)).toFixed(3);
        chapter.style.transform = `translateY(${((1 - fadeIn) * 12 - fadeOut * 10).toFixed(2)}px)`;
        skip.hidden = t >= REVEAL;
        pause.disabled = reduced; replay.disabled = reduced;
        const pauseText = paused ? T.resume : T.pause;
        if (pause.textContent !== pauseText) pause.textContent = pauseText;
        pause.setAttribute("aria-pressed", String(paused));
        percent.textContent = String(Math.round(t / DURATION * 100)).padStart(2, "0") + "%";
        CHAPTERS.forEach((c, i) => { if (fills[i]) fills[i].style.transform = `scaleX(${clamp((t - c.start) / (c.end - c.start)).toFixed(4)})`; });
        const label = reduced ? T.labels.reduced : paused ? T.labels.paused : final ? T.labels.final : current.label;
        if (phaseLabel.textContent !== label) phaseLabel.textContent = label;
        updateKpi(t);
        root.classList.toggle("is-final", t >= REVEAL);
        const message = reduced ? "" : t >= TEXT_END ? (played ? T.status.done : "") : paused ? T.status.paused
          : `${current.num.replace(" / ", EN ? ": " : " : ")}. ${current.title}`;
        if (status.textContent !== message) status.textContent = message;
        if (playing && t >= TEXT_END) { lock(false); remember(); }
      }
      function redraw() { S.render(null, null); sync(); }
      const api = {
        root,
        tick(dt) {
          S.elapsed = Math.min(DURATION, S.elapsed + dt); S.clock += dt;
          S.work += dt * (S.elapsed >= UP1 ? 1.5 : 1);
          if (S.elapsed >= DURATION) S.idleT += dt;
          redraw();
        },
        resize() { S.fit(); measure(); redraw(); },
        redraw() { measure(); redraw(); },
        motionChanged() {
          paused = false;
          if (reduced) { staticFrame(); lock(false); }
          update(); redraw();
        },
        fail() {
          lock(false);
          root.classList.add("is-static");
          heroParts.forEach(el => { el.style.opacity = ""; el.style.transform = ""; });
          if (ctas) ctas.inert = false;
        }
      };
      function update() { setRunning(api, visible && !paused && !reduced); }
      function staticFrame() { S.elapsed = DURATION; S.clock = 7.3; S.work = 2; S.idleT = 0; }
      function finish() {
        if (S.elapsed < TEXT_END) S.elapsed = TEXT_END;
        focusCta = document.activeElement === skip || document.activeElement === document.body;
        paused = false;
        lock(false); remember(); update(); redraw();
      }
      skip.addEventListener("click", finish);
      pause.addEventListener("click", () => { paused = !paused; update(); sync(); });
      replay.addEventListener("click", () => {
        paused = false; S.elapsed = 0; S.clock = 0; S.idleT = 0; S.work = 0; chapterIndex = -1; focusCta = false;
        const l = lenis();
        if (l) l.scrollTo(0, {immediate: true}); else window.scrollTo(0, 0);
        lock(true); update(); redraw();
        skip.focus({preventScroll: true});
      });
      // Pendant l'introduction, une intention de défilement la termine ; ce premier geste est absorbé
      // (et ceux qui suivent de près) pour laisser apparaître le titre au lieu de faire défiler la page.
      let grace = 0, unhookTimer = 0;
      const swallow = event => {
        if (playing) { finish(); grace = performance.now() + 700; }
        else if (performance.now() > grace) return;
        if (event.cancelable) event.preventDefault();
        event.stopImmediatePropagation();
      };
      const onScroll = () => { if (playing && window.scrollY > 2) finish(); };
      function hook(on) {
        const method = on ? "addEventListener" : "removeEventListener";
        window[method]("wheel", swallow, {capture: true, passive: false});
        window[method]("touchmove", swallow, {capture: true, passive: false});
        window[method]("scroll", onScroll, {passive: true});
      }
      document.addEventListener("click", event => { if (playing && event.target.closest && event.target.closest("a[href]")) finish(); }, true);
      const SKIP_KEYS = new Set(["Escape", "PageDown", "PageUp", "ArrowDown", "ArrowUp", "Home", "End", " "]);
      document.addEventListener("keydown", event => {
        if (!playing || !SKIP_KEYS.has(event.key)) return;
        const target = event.target;
        if (target && target.closest && target.closest(event.key === " " ? "a, button, input, textarea, select, [contenteditable]" : "input, textarea, select, [contenteditable]")) return;
        event.preventDefault(); finish();
      });
      document.addEventListener("focusin", event => {
        if (playing && !root.contains(event.target) && !(header && header.contains(event.target))) finish();
      });
      watch(root, on => { visible = on; update(); });

      let seen = false;
      try { seen = sessionStorage.getItem("ar-intro-seen") === "1"; }
      catch (error) { console.warn("Impossible de lire le passage de l'introduction.", error); }
      const play = !reduced && (mode === "always" || (mode === "auto" && !seen));
      // Arrivée directe sur une ancre (#contact…) ou page déjà défilée : pas d'introduction.
      const deepLink = window.scrollY > 2 || (location.hash.length > 1 && location.hash !== "#top");
      // Filet de sécurité déjà déclenché (scripts lents) : le titre est visible, on ne le masque plus.
      const late = !reduced && !html.classList.contains("scene-wait");
      if (reduced) staticFrame();
      else if (late || deepLink) { S.elapsed = DURATION; S.clock = 20 * hash(5); }
      else if (play) S.elapsed = 0;
      else { S.elapsed = TEXT_END; S.clock = 20 * hash(5); }
      S.fit(); measure(); redraw();
      lock(play && !late && !deepLink);
      update();
      root.classList.add("is-live");
      return api;
    }

    /* ---------- Démarrage ---------- */
    if (introRoot) { const intro = createIntro(introRoot); if (intro) items.push(intro); }
    for (const root of viewRoots) { const item = createView(root); if (item) items.push(item); }
    html.classList.add("scene-ready");
    html.classList.remove("scene-wait");
    if (ro) items.forEach(item => ro.observe(item.root));
    else window.addEventListener("resize", () => items.forEach(item => item.resize()));
    motion.addEventListener("change", () => { reduced = motion.matches; items.forEach(item => item.motionChanged()); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { textWidths.clear(); items.forEach(item => item.redraw()); });
  }

  function start() {
    try { boot(); }
    catch (error) {
      console.warn("La scène 3D n'a pas pu démarrer : le contenu reste affiché.", error);
      html.classList.remove("scene-wait", "scene-playing");
    }
  }
  // Accueil : juste après le premier affichage. Pages : quand le navigateur est disponible.
  if (introRoot || !("requestIdleCallback" in window)) setTimeout(start, 0);
  else requestIdleCallback(start, {timeout: 700});
})();
