export type Point = { x: number; y: number };
export const lostDucks = [
  { id: "wildflowers", x: 0.31, y: 0.5, hint: "Below the cabin wildflowers" },
  { id: "reeds", x: 0.48, y: 0.425, hint: "Beside the northern reeds" },
  { id: "pennants", x: 0.7, y: 0.52, hint: "Below the competition pennants" },
  { id: "dock", x: 0.53, y: 0.645, hint: "Beside the far end of the dock" },
  { id: "lilies", x: 0.52, y: 0.725, hint: "Near the southern lily pads" },
] as const;
export const landmarks = [
  // Interaction points stay beside the physical objects; approaches are water
  // destinations used to verify that each object remains reachable by swimming.
  {
    id: "about",
    x: 0.33,
    y: 0.4,
    approach: { x: 0.36, y: 0.47 },
    href: "/about/",
    name: "About me",
    action: "Open cabin",
  },
  {
    id: "htb",
    x: 0.7,
    y: 0.43,
    approach: { x: 0.63, y: 0.49 },
    href: "/htb.html",
    name: "HTB write-ups",
    action: "Read HTB write-ups",
  },
  {
    id: "ctf",
    x: 0.79,
    y: 0.53,
    approach: { x: 0.7, y: 0.52 },
    href: "/ctf.html",
    name: "CTF write-ups",
    action: "Read CTF write-ups",
  },
  {
    id: "contact",
    x: 0.25,
    y: 0.64,
    approach: { x: 0.29, y: 0.575 },
    href: "/contact/",
    name: "Contact",
    action: "Open mailbox",
  },
  {
    id: "blog",
    x: 0.61,
    y: 0.65,
    approach: { x: 0.53, y: 0.645 },
    href: "/blog.html",
    name: "Blog",
    action: "Read the blog",
  },
] as const;
// Traced against the aligned 1536 × 1024 day/night artwork, in art pixels.
// The island's silhouette is much larger than its actual water surface.
const polygon = (pixels: number[][]): Point[] =>
  pixels.map(([x, y]) => ({ x: x / 1536, y: y / 1024 }));
const shoreline = polygon([
  [225, 553],
  [270, 520],
  [320, 495],
  [365, 468],
  [430, 449],
  [477, 421],
  [545, 405],
  [609, 390],
  [651, 380],
  [704, 380],
  [765, 365],
  [812, 337],
  [845, 352],
  [884, 354],
  [924, 369],
  [976, 391],
  [1030, 441],
  [1064, 461],
  [1133, 477],
  [1191, 517],
  [1250, 547],
  [1225, 575],
  [1213, 604],
  [1228, 654],
  [1229, 688],
  [1207, 720],
  [1177, 751],
  [1121, 776],
  [1040, 795],
  [987, 815],
  [947, 812],
  [915, 804],
  [876, 819],
  [825, 810],
  [790, 821],
  [746, 812],
  [716, 788],
  [694, 782],
  [674, 761],
  [656, 739],
  [628, 740],
  [598, 720],
  [566, 716],
  [543, 719],
  [508, 702],
  [482, 702],
  [451, 684],
  [421, 679],
  [391, 659],
  [356, 651],
  [326, 644],
  [298, 628],
  [264, 621],
  [239, 594],
]);
const dock = polygon([
  [895, 622],
  [923, 618],
  [932, 631],
  [979, 610],
  [979, 591],
  [1006, 586],
  [1010, 611],
  [1085, 638],
  [1086, 607],
  [1102, 580],
  [1118, 580],
  [1133, 605],
  [1132, 645],
  [1189, 667],
  [1192, 657],
  [1217, 653],
  [1222, 674],
  [1236, 691],
  [1238, 723],
  [1125, 762],
  [1124, 779],
  [1099, 782],
  [1096, 746],
  [929, 691],
  [925, 710],
  [905, 711],
  [901, 689],
  [897, 685],
]);
const obstacles = [
  dock,
  // The mailbox projects over the water in the flattened artwork. Keep its
  // visible box and post solid rather than hiding the whole nearby cove.
  polygon([
    [285, 557],
    [323, 551],
    [353, 569],
    [355, 620],
    [337, 632],
    [336, 658],
    [315, 652],
    [315, 631],
    [283, 620],
    [278, 583],
  ]),
  polygon([
    [610, 729],
    [644, 655],
    [681, 662],
    [717, 765],
    [703, 813],
    [652, 802],
  ]),
  polygon([
    [1165, 552],
    [1210, 555],
    [1227, 594],
    [1234, 647],
    [1213, 672],
    [1183, 667],
    [1158, 634],
    [1157, 600],
  ]),
];
const boundaries = [shoreline, ...obstacles];
function inside(point: Point, polygon: Point[]) {
  let result = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const a = polygon[i],
      b = polygon[j];
    if (
      a.y > point.y !== b.y > point.y &&
      point.x < ((b.x - a.x) * (point.y - a.y)) / (b.y - a.y) + a.x
    )
      result = !result;
  }
  return result;
}
export const inWater = (p: Point) =>
  inside(p, shoreline) && !obstacles.some((o) => inside(p, o));

// Only the base of the duck displaces water. The raised head and decorative
// wake can overhang this footprint; including them made the pond feel fenced in.
// These art-space dimensions cover the lower body at both overview and swim scale.
const swimmerHull = {
  radiusX: 36 / 1536,
  radiusY: 12 / 1024,
  offsetY: 6 / 1024,
};
function hullSeparation(a: Point, b: Point, center: Point) {
  // Transform the ellipse into a unit circle before measuring an edge.
  const ax = (a.x - center.x) / swimmerHull.radiusX;
  const ay = (a.y - center.y) / swimmerHull.radiusY;
  const dx = (b.x - a.x) / swimmerHull.radiusX;
  const dy = (b.y - a.y) / swimmerHull.radiusY;
  const lengthSquared = dx * dx + dy * dy;
  const t = lengthSquared
    ? Math.max(0, Math.min(1, -(ax * dx + ay * dy) / lengthSquared))
    : 0;
  return { x: -(ax + t * dx), y: -(ay + t * dy) };
}
function touchesHull(a: Point, b: Point, center: Point) {
  const separation = hullSeparation(a, b, center);
  return separation.x ** 2 + separation.y ** 2 <= 1;
}

// Normals are measured in artwork pixels, so horizontal and vertical input
// slide at the same screen speed despite the map's 3:2 coordinate system.
function contactNormal(p: Point, velocity: Point): Point | null {
  const center = { x: p.x, y: p.y + swimmerHull.offsetY };
  let normal: Point | null = null;
  let strongest = 0;
  for (const boundary of boundaries) {
    for (let i = 0; i < boundary.length; i++) {
      const separation = hullSeparation(
        boundary[i],
        boundary[(i + 1) % boundary.length],
        center,
      );
      if (separation.x ** 2 + separation.y ** 2 > 1.002) continue;
      const nx = separation.x / (swimmerHull.radiusX * 1536);
      const ny = separation.y / (swimmerHull.radiusY * 1024);
      const length = Math.hypot(nx, ny);
      if (!length) continue;
      const n = { x: nx / length, y: ny / length };
      const inward = velocity.x * n.x + velocity.y * n.y;
      if (inward < strongest) {
        normal = n;
        strongest = inward;
      }
    }
  }
  return normal;
}

/** Fit a rounded waterline hull against the actual shore, dock and reeds. */
export function swimmable(p: Point) {
  if (!Number.isFinite(p.x) || !Number.isFinite(p.y)) return false;
  const center = { x: p.x, y: p.y + swimmerHull.offsetY };
  if (!inWater(center)) return false;
  return !boundaries.some((boundary) =>
    boundary.some((a, i) =>
      touchesHull(a, boundary[(i + 1) % boundary.length], center),
    ),
  );
}
export function move(p: Point, dx: number, dy: number): Point {
  let next = { ...p };
  if (!Number.isFinite(dx) || !Number.isFinite(dy)) return next;
  // Sweep small steps to prevent tunneling, then spend the remainder of each
  // step sliding along the real contact tangent rather than trying X then Y.
  const steps = Math.max(1, Math.ceil(Math.hypot(dx, dy) / 0.004));
  for (let step = 0; step < steps; step++) {
    let remaining = { x: (dx * 1536) / steps, y: (dy * 1024) / steps };
    for (let contact = 0; contact < 4; contact++) {
      if (Math.hypot(remaining.x, remaining.y) < 0.00001) break;
      const candidate = {
        x: next.x + remaining.x / 1536,
        y: next.y + remaining.y / 1024,
      };
      if (swimmable(candidate)) {
        next = candidate;
        break;
      }
      // Advance right up to the contact instead of dropping the entire frame.
      let low = 0,
        high = 1;
      for (let i = 0; i < 12; i++) {
        const t = (low + high) / 2;
        if (
          swimmable({
            x: next.x + (remaining.x * t) / 1536,
            y: next.y + (remaining.y * t) / 1024,
          })
        )
          low = t;
        else high = t;
      }
      next = {
        x: next.x + (remaining.x * low) / 1536,
        y: next.y + (remaining.y * low) / 1024,
      };
      remaining = { x: remaining.x * (1 - low), y: remaining.y * (1 - low) };
      const normal = contactNormal(next, remaining);
      if (!normal) break;
      const inward = remaining.x * normal.x + remaining.y * normal.y;
      remaining = {
        x: remaining.x - normal.x * inward,
        y: remaining.y - normal.y * inward,
      };
      // A sub-pixel skin avoids repeatedly re-hitting the same edge on the
      // next frame. It never enlarges the accessible water or crosses a bank.
      const skin = {
        x: next.x + (normal.x * 0.02) / 1536,
        y: next.y + (normal.y * 0.02) / 1024,
      };
      if (Math.hypot(remaining.x, remaining.y) > 0.00001 && swimmable(skin))
        next = skin;
    }
  }
  return next;
}
export const distance = (a: Point, b: Point) =>
  Math.hypot(a.x - b.x, ((a.y - b.y) * 2) / 3);

/** Check the entire segment so routes cannot cut across a building or a bank. */
export function clearPath(a: Point, b: Point) {
  const steps = Math.max(
    1,
    Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) / 0.004),
  );
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    if (!swimmable({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t }))
      return false;
  }
  return true;
}

/** A small bounded grid search, followed by smoothing, for click/tap movement. */
export function findPath(start: Point, target: Point): Point[] {
  if (!swimmable(start) || !swimmable(target)) return [];
  if (clearPath(start, target)) return [target];
  const point = (x: number, y: number) => ({ x: x / 100, y: y / 100 });
  const key = (x: number, y: number) => x * 101 + y;
  const queue: { x: number; y: number; parent: number }[] = [];
  const visited = new Set<number>();
  const sx = Math.round(start.x * 100),
    sy = Math.round(start.y * 100);
  for (let x = sx - 1; x <= sx + 1; x++)
    for (let y = sy - 1; y <= sy + 1; y++) {
      if (clearPath(start, point(x, y))) {
        queue.push({ x, y, parent: -1 });
        visited.add(key(x, y));
      }
    }
  let found = -1;
  for (let i = 0; i < queue.length; i++) {
    const node = queue[i],
      p = point(node.x, node.y);
    if (distance(p, target) < 0.016 && clearPath(p, target)) {
      found = i;
      break;
    }
    for (let dx = -1; dx <= 1; dx++)
      for (let dy = -1; dy <= 1; dy++) {
        if (!dx && !dy) continue;
        const x = node.x + dx,
          y = node.y + dy;
        if (x < 0 || x > 100 || y < 0 || y > 100 || visited.has(key(x, y)))
          continue;
        if (!clearPath(p, point(x, y))) continue;
        visited.add(key(x, y));
        queue.push({ x, y, parent: i });
      }
  }
  if (found < 0) return [];
  const raw = [target];
  for (let i = found; i >= 0; i = queue[i].parent)
    raw.unshift(point(queue[i].x, queue[i].y));
  const route: Point[] = [];
  let anchor = start,
    index = 0;
  while (index < raw.length) {
    let next = raw.length - 1;
    while (next > index && !clearPath(anchor, raw[next])) next--;
    route.push(raw[next]);
    anchor = raw[next];
    index = next + 1;
  }
  return route;
}

const mallardHomes = [
  { x: 0.37, y: 0.54, phase: 0 },
  { x: 0.59, y: 0.48, phase: 2.5 },
  { x: 0.51, y: 0.62, phase: 4 },
] as const;

/** Ambient ducks use the same swept water collision as the player. */
export function mallardsAt(time: number) {
  return mallardHomes.map((home) => ({
    ...move(
      home,
      Math.sin(time * 0.16 + home.phase) * 0.028,
      Math.cos(time * 0.12 + home.phase) * 0.013,
    ),
    facing: Math.cos(time * 0.16 + home.phase) > 0 ? 1 : -1,
    bob: Math.sin(time * 1.4 + home.phase) * 0.7,
  }));
}
export function cleanCollected(value: unknown): string[] {
  return Array.isArray(value)
    ? [
        ...new Set(
          value.filter(
            (v): v is string =>
              typeof v === "string" && lostDucks.some((d) => d.id === v),
          ),
        ),
      ]
    : [];
}
