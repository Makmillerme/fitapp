import fs from "node:fs";
import path from "node:path";

const svgPath = path.resolve("public/skeleton.svg");
const svg = fs.readFileSync(svgPath, "utf8");
const match = svg.match(/\sd="([^"]+)"/);
if (!match) {
  console.error("No path d= in public/skeleton.svg");
  process.exit(1);
}

const subpaths = match[1]
  .trim()
  .split(/(?=[Mm])/)
  .map((s) => s.trim())
  .filter(Boolean);

function coords(d) {
  const nums = d.match(/-?\d+(?:\.\d+)?/g)?.map(Number) ?? [];
  const pts = [];
  for (let i = 0; i + 1 < nums.length; i += 2) {
    pts.push({ x: nums[i], y: nums[i + 1] });
  }
  return pts;
}

function stats(pts) {
  if (!pts.length) return { cx: 0, cy: 0, minX: 0, maxX: 0, minY: 0, maxY: 0, w: 0, h: 0 };
  let sx = 0;
  let sy = 0;
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const p of pts) {
    sx += p.x;
    sy += p.y;
    minX = Math.min(minX, p.x);
    maxX = Math.max(maxX, p.x);
    minY = Math.min(minY, p.y);
    maxY = Math.max(maxY, p.y);
  }
  return {
    cx: sx / pts.length,
    cy: sy / pts.length,
    minX,
    maxX,
    minY,
    maxY,
    w: maxX - minX,
    h: maxY - minY,
  };
}

const rows = subpaths.map((d, idx) => ({ idx, d, ...stats(coords(d)) }));
const holes = rows.filter((r) => r.idx > 0);

const bands = [
  ["head", 70, 175],
  ["neck", 175, 245],
  ["shoulders_chest", 245, 340],
  ["upper_abs_arms", 340, 420],
  ["waist_obliques", 420, 480],
  ["pelvis", 480, 545],
  ["upper_thigh", 545, 630],
  ["lower_thigh_knee", 630, 710],
  ["calf", 710, 880],
  ["feet", 880, 970],
];

const fmt = (n) => n.toFixed(0).padStart(4);

console.log("idx |   cx |   cy |  minX-maxX |  minY-maxY |   w |   h | band");
console.log("-".repeat(78));
for (const r of holes) {
  const band = bands.find(([, a, b]) => r.cy >= a && r.cy < b)?.[0] ?? "?";
  console.log(
    `${String(r.idx).padStart(3)} | ${fmt(r.cx)} | ${fmt(r.cy)} | ${fmt(r.minX)}-${fmt(r.maxX)} | ${fmt(r.minY)}-${fmt(r.maxY)} | ${fmt(r.w)} | ${fmt(r.h)} | ${band}`,
  );
}

const proposed = {
  neckCm: [7, 8, 9],
  chestCm: [16, 17, 18, 19],
  waistCm: [30, 31, 36, 37, 38, 39, 42, 43],
  hipsCm: [48, 49, 50],
  bicepsCm: [20, 21],
  thighCm: [53, 54, 55, 56, 61, 62],
  calfCm: [69, 70, 73, 74],
};

const altChest = [16, 17, 18, 19];
const altThigh = [53, 54, 55, 56, 63, 64];
const altCalf = [71, 72, 75, 76];

function collisions(map) {
  const seen = new Map();
  const dups = [];
  for (const [zone, idxs] of Object.entries(map)) {
    for (const i of idxs) {
      if (seen.has(i)) dups.push(`${i}: ${seen.get(i)} + ${zone}`);
      else seen.set(i, zone);
    }
  }
  return dups;
}

console.log("\n=== proposed counts ===");
for (const [k, v] of Object.entries(proposed)) {
  console.log(`${k}: ${v.length} -> ${v.join(",")}`);
  for (const i of v) {
    const r = rows[i];
    console.log(`    ${i}: cx=${r.cx.toFixed(0)} cy=${r.cy.toFixed(0)} y=${r.minY.toFixed(0)}-${r.maxY.toFixed(0)} x=${r.minX.toFixed(0)}-${r.maxX.toFixed(0)}`);
  }
}
console.log("collisions:", collisions(proposed).join("; ") || "none");
console.log("altChest 16,17,18,19 vs 18,19,26,27");
for (const i of [...new Set([...altChest, ...proposed.chestCm])]) {
  const r = rows[i];
  console.log(`  ${i}: cx=${r.cx.toFixed(0)} cy=${r.cy.toFixed(0)} y=${r.minY.toFixed(0)}-${r.maxY.toFixed(0)} x=${r.minX.toFixed(0)}-${r.maxX.toFixed(0)} w=${r.w.toFixed(0)} h=${r.h.toFixed(0)}`);
}
console.log("altThigh 63,64 vs 61,62:");
for (const i of [61, 62, 63, 64, 65, 66]) {
  const r = rows[i];
  console.log(`  ${i}: cx=${r.cx.toFixed(0)} cy=${r.cy.toFixed(0)} y=${r.minY.toFixed(0)}-${r.maxY.toFixed(0)} x=${r.minX.toFixed(0)}-${r.maxX.toFixed(0)} w=${r.w.toFixed(0)} h=${r.h.toFixed(0)}`);
}
console.log("calf candidates 71-80:");
for (const i of [71, 72, 73, 74, 75, 76, 77, 78, 79, 80]) {
  const r = rows[i];
  console.log(`  ${i}: cx=${r.cx.toFixed(0)} cy=${r.cy.toFixed(0)} y=${r.minY.toFixed(0)}-${r.maxY.toFixed(0)} x=${r.minX.toFixed(0)}-${r.maxX.toFixed(0)} w=${r.w.toFixed(0)} h=${r.h.toFixed(0)}`);
}
console.log("biceps 20-25:");
for (const i of [20, 21, 22, 23, 24, 25]) {
  const r = rows[i];
  console.log(`  ${i}: cx=${r.cx.toFixed(0)} cy=${r.cy.toFixed(0)} y=${r.minY.toFixed(0)}-${r.maxY.toFixed(0)} x=${r.minX.toFixed(0)}-${r.maxX.toFixed(0)} w=${r.w.toFixed(0)} h=${r.h.toFixed(0)}`);
}
console.log("chest-adjacent 14-19,26-29:");
for (const i of [14, 15, 16, 17, 18, 19, 26, 27, 28, 29]) {
  const r = rows[i];
  console.log(`  ${i}: cx=${r.cx.toFixed(0)} cy=${r.cy.toFixed(0)} y=${r.minY.toFixed(0)}-${r.maxY.toFixed(0)} x=${r.minX.toFixed(0)}-${r.maxX.toFixed(0)} w=${r.w.toFixed(0)} h=${r.h.toFixed(0)}`);
}
console.log("waist-adjacent 28-45:");
for (const i of [28, 29, 30, 31, 36, 37, 38, 39, 42, 43, 44, 45, 46, 47]) {
  const r = rows[i];
  console.log(`  ${i}: cx=${r.cx.toFixed(0)} cy=${r.cy.toFixed(0)} y=${r.minY.toFixed(0)}-${r.maxY.toFixed(0)} x=${r.minX.toFixed(0)}-${r.maxX.toFixed(0)} w=${r.w.toFixed(0)} h=${r.h.toFixed(0)}`);
}

const palette = {
  neckCm: "#eab308",
  chestCm: "#1d4ed8",
  waistCm: "#16a34a",
  hipsCm: "#7c3aed",
  bicepsCm: "#db2777",
  thighCm: "#ea580c",
  calfCm: "#06b6d4",
};

function zoneOf(idx, map) {
  for (const [k, v] of Object.entries(map)) {
    if (v.includes(idx)) return k;
  }
  return null;
}

function htmlFor(map, name) {
  const labeled = holes
    .map((r) => {
      const z = zoneOf(r.idx, map);
      const fill = z ? palette[z] : "rgba(255,255,255,0.15)";
      return `<path d="${r.d}" fill="${fill}" stroke="#111" stroke-width="0.6"/><text x="${r.cx}" y="${r.cy}" font-size="11" text-anchor="middle" fill="#111" font-family="sans-serif">${r.idx}</text>`;
    })
    .join("\n");
  return `<!doctype html><html><body style="margin:0;background:#222">
<svg viewBox="0 0 1024 1024" width="520" xmlns="http://www.w3.org/2000/svg">
<path d="${subpaths[0]}" fill="#3a0a0a" opacity="0.4"/>
${labeled}
</svg>
<pre style="color:#eee;font:12px monospace">${name}\n${JSON.stringify(map, null, 2)}</pre>
</body></html>`;
}

const outDir = path.resolve(".cursor/scripts");
fs.writeFileSync(path.join(outDir, "audit-zones-proposed.html"), htmlFor(proposed, "proposed"));
fs.writeFileSync(
  path.join(outDir, "audit-zones-alt.html"),
  htmlFor(
    {
      ...proposed,
      chestCm: altChest,
      thighCm: altThigh,
      calfCm: altCalf,
    },
    "alt chest/thigh/calf",
  ),
);
console.log("\nwrote .cursor/scripts/audit-zones-proposed.html and audit-zones-alt.html");
