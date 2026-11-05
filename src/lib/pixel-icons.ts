/** Original 20 × 20 UI sprites. Rectangles stay on an integer pixel grid. */
export type IconPixel = { x: number; y: number; width: number; tone: number };
type Brush = {
  box(x: number, y: number, width: number, height: number, tone?: number): void;
  line(x: number, y: number, endX: number, endY: number, tone?: number): void;
};
function sprite(draw: (brush: Brush) => void): IconPixel[] {
  const grid = Array.from({ length: 20 }, () => Array<number>(20).fill(0));
  const box: Brush["box"] = (x, y, w, h, tone = 1) => {
    for (let j = y; j < y + h; j++)
      for (let i = x; i < x + w; i++)
        if (grid[j] && i >= 0 && i < 20) grid[j][i] = tone;
  };
  const line: Brush["line"] = (x, y, endX, endY, tone = 1) => {
    const dx = Math.abs(endX - x),
      dy = -Math.abs(endY - y);
    const sx = x < endX ? 1 : -1,
      sy = y < endY ? 1 : -1;
    let error = dx + dy;
    for (;;) {
      box(x, y, 1, 1, tone);
      if (x === endX && y === endY) break;
      const twice = 2 * error;
      if (twice >= dy) {
        error += dy;
        x += sx;
      }
      if (twice <= dx) {
        error += dx;
        y += sy;
      }
    }
  };
  draw({ box, line });
  return grid.flatMap((row, y) => {
    const runs: IconPixel[] = [];
    for (let x = 0; x < 20;) {
      const start = x,
        tone = row[x];
      while (x < 20 && row[x] === tone) x++;
      if (tone) runs.push({ x: start, y, width: x - start, tone });
    }
    return runs;
  });
}
const right = sprite(({ box, line }) => {
  box(3, 9, 13, 2);
  line(10, 4, 16, 10);
  line(11, 4, 17, 10);
  line(16, 10, 10, 16);
  line(17, 10, 11, 16);
});
function rotate(pixels: IconPixel[], turns: number) {
  return sprite(({ box }) =>
    pixels.forEach((p) => {
      for (let x = p.x; x < p.x + p.width; x++) {
        let point = { x, y: p.y };
        for (let i = 0; i < turns; i++) point = { x: 19 - point.y, y: point.x };
        box(point.x, point.y, 1, 1, p.tone);
      }
    }),
  );
}
const down = sprite(({ line }) => {
  line(4, 7, 10, 13);
  line(4, 8, 10, 14);
  line(10, 13, 16, 7);
  line(10, 14, 16, 8);
});
export const pixelIcons = {
  journal: sprite(({ box }) => {
    box(3, 2, 14, 16); box(2, 4, 2, 12);
    box(5, 3, 10, 2, 2); box(5, 15, 10, 2, 2);
    box(7, 7, 6, 1, 2); box(7, 10, 5, 1, 2);
  }),
  plus: sprite(({ box }) => { box(9, 3, 2, 14); box(3, 9, 14, 2); }),
  "arrow-right": right,
  "arrow-down": rotate(right, 1),
  "arrow-left": rotate(right, 2),
  "arrow-up": rotate(right, 3),
  "arrow-up-right": sprite(({ box, line }) => {
    box(7, 4, 9, 2);
    box(14, 4, 2, 9);
    line(4, 15, 14, 5);
    line(5, 16, 15, 6);
  }),
  "chevron-down": down,
  "chevron-up": rotate(down, 2),
  close: sprite(({ line }) => {
    line(5, 4, 15, 14);
    line(4, 5, 14, 15);
    line(5, 15, 15, 5);
    line(4, 14, 14, 4);
  }),
  moon: sprite(({ box }) => {
    box(8, 2, 4, 1);
    box(5, 3, 4, 1);
    box(4, 4, 4, 2);
    box(3, 6, 4, 6);
    box(4, 12, 5, 2);
    box(6, 14, 8, 2);
    box(9, 16, 5, 1);
    box(14, 12, 3, 3);
    box(16, 10, 2, 3);
    box(9, 3, 2, 7, 0);
    box(8, 4, 3, 7, 0);
    box(10, 9, 7, 3, 0);
    box(5, 6, 1, 6, 2);
    box(8, 14, 5, 1, 2);
  }),
  sun: sprite(({ box }) => {
    box(8, 6, 4, 8);
    box(6, 8, 8, 4);
    box(7, 7, 6, 6);
    box(8, 8, 4, 4, 0);
    box(9, 1, 2, 3);
    box(9, 16, 2, 3);
    box(1, 9, 3, 2);
    box(16, 9, 3, 2);
    box(3, 3, 2, 2);
    box(15, 3, 2, 2);
    box(3, 15, 2, 2);
    box(15, 15, 2, 2);
  }),
  volume: sprite(({ box }) => {
    box(2, 7, 4, 6);
    box(6, 6, 2, 8);
    box(8, 4, 2, 12);
    box(5, 8, 3, 4, 2);
    box(12, 7, 1, 6);
    box(13, 8, 1, 4);
    box(15, 4, 1, 2);
    box(16, 6, 1, 8);
    box(15, 14, 1, 2);
  }),
  muted: sprite(({ box, line }) => {
    box(2, 7, 4, 6);
    box(6, 6, 2, 8);
    box(8, 4, 2, 12);
    box(5, 8, 3, 4, 2);
    line(13, 7, 18, 12);
    line(13, 12, 18, 7);
  }),
  pause: sprite(({ box }) => {
    box(5, 4, 4, 12);
    box(12, 4, 4, 12);
    box(6, 5, 1, 10, 2);
    box(13, 5, 1, 10, 2);
  }),
  play: sprite(({ box }) => {
    box(5, 3, 2, 14);
    box(7, 4, 2, 12);
    box(9, 5, 2, 10);
    box(11, 7, 2, 6);
    box(13, 8, 2, 4);
    box(15, 9, 1, 2);
    box(6, 5, 1, 10, 2);
  }),
  overview: sprite(({ box }) => {
    for (const x of [3, 11])
      for (const y of [3, 11]) {
        box(x, y, 6, 6);
        box(x + 1, y + 1, 4, 4, 0);
        box(x + 1, y + 1, 4, 1, 2);
      }
  }),
  mail: sprite(({ box, line }) => {
    box(2, 5, 16, 11);
    box(4, 7, 12, 7, 0);
    line(3, 6, 10, 11);
    line(10, 11, 17, 6);
    line(3, 15, 7, 11);
    line(17, 15, 13, 11);
    box(4, 6, 12, 1, 2);
  }),
  code: sprite(({ line, box }) => {
    line(6, 5, 2, 10);
    line(2, 10, 6, 15);
    line(14, 5, 18, 10);
    line(18, 10, 14, 15);
    box(10, 4, 2, 4);
    box(9, 8, 2, 4);
    box(8, 12, 2, 4);
  }),
  profile: sprite(({ box }) => {
    box(7, 2, 6, 2);
    box(5, 4, 10, 5);
    box(7, 9, 6, 2);
    box(7, 4, 6, 4, 0);
    box(5, 13, 10, 2);
    box(3, 15, 14, 3);
    box(6, 15, 8, 1, 2);
  }),
  box: sprite(({ box, line }) => {
    line(3, 6, 10, 2);
    line(10, 2, 17, 6);
    line(3, 6, 10, 10);
    line(10, 10, 17, 6);
    box(2, 6, 2, 9);
    box(16, 6, 2, 9);
    box(9, 10, 2, 9);
    line(3, 14, 10, 18);
    line(10, 18, 17, 14);
    line(7, 4, 14, 8, 2);
  }),
} as const;
