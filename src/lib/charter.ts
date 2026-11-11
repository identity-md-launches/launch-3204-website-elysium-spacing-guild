export const DISCIPLINES = [
  {
    id: 'navigator',
    name: 'Navigator',
    summary: 'Plot burns, read the sky and bring every crew home on time.',
    trial: 'Trial: fly a Lagos to Tycho transfer with the computer switched off.',
  },
  {
    id: 'engineer',
    name: 'Engineer',
    summary: 'Keep drives lit and air moving, far from any repair yard.',
    trial: 'Trial: restart a cold reactor loop inside one watch.',
  },
  {
    id: 'medic',
    name: 'Medic',
    summary: 'Care for bodies under thrust, in freefall and after long dark.',
    trial: 'Trial: run a sick bay through a simulated 1\u00a0g emergency burn.',
  },
  {
    id: 'cartographer',
    name: 'Cartographer',
    summary: 'Survey new lanes and keep the guild charts honest.',
    trial: 'Trial: chart a debris field and file a route others can trust.',
  },
] as const;

export type DisciplineId = (typeof DISCIPLINES)[number]['id'];

export interface CharterInput {
  name: string;
  stationName: string;
  discipline: DisciplineId;
  /** ISO date, e.g. 2026-11-11 */
  date: string;
}

/** A stable charter number derived from the entries, so the same entries give the same number. */
export function charterNumber(input: CharterInput): string {
  const text = `${input.name.trim().toLowerCase()}|${input.stationName}|${input.discipline}|${input.date}`;
  let hash = 2166136261;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  const n = (hash >>> 0) % 1_000_000;
  return `ESG-${n.toString().padStart(6, '0')}`;
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function disciplineName(id: DisciplineId): string {
  return DISCIPLINES.find((d) => d.id === id)?.name ?? id;
}

/** Draws the charter as a standalone SVG document. */
export function charterSvg(input: CharterInput): string {
  const name = escapeXml(input.name.trim());
  const station = escapeXml(input.stationName);
  const role = escapeXml(disciplineName(input.discipline));
  const number = charterNumber(input);
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
  <rect width="1200" height="800" fill="#0b0f1a"/>
  <rect x="40" y="40" width="1120" height="720" rx="24" fill="none" stroke="#f5a748" stroke-width="3"/>
  <ellipse cx="600" cy="170" rx="70" ry="28" fill="none" stroke="#f5a748" stroke-width="4" transform="rotate(-24 600 170)"/>
  <circle cx="600" cy="170" r="22" fill="#f2f4fa"/>
  <text x="600" y="290" text-anchor="middle" font-family="Space Grotesk, system-ui, sans-serif" font-size="36" fill="#c9cfdd">Elysium Spacing Guild charter</text>
  <text x="600" y="400" text-anchor="middle" font-family="Space Grotesk, system-ui, sans-serif" font-size="72" font-weight="600" fill="#f2f4fa">${name}</text>
  <text x="600" y="480" text-anchor="middle" font-family="system-ui, sans-serif" font-size="32" fill="#c9cfdd">${role}, home station ${station}</text>
  <text x="600" y="600" text-anchor="middle" font-family="system-ui, sans-serif" font-size="28" fill="#f5a748">Untethered, we go further.</text>
  <text x="600" y="700" text-anchor="middle" font-family="system-ui, sans-serif" font-size="24" fill="#c9cfdd">${number}  ·  signed ${escapeXml(input.date)}</text>
</svg>
`;
}

/** Saves text as a file through a temporary object URL. */
export function downloadFile(filename: string, content: string, type: string): void {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function charterFilename(input: CharterInput): string {
  const slug = input.name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return `elysium-charter-${slug || 'member'}.svg`;
}
