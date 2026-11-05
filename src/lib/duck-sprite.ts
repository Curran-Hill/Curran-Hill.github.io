// Pixel runs shared by the player renderer and journal portraits.
export type PixelRun = {
  x: number;
  y: number;
  width: number;
  token: string;
  color: string;
};
export const duckHeadroom = 10;
export function rubberDuck(propellerHat = false, frame = 0): PixelRun[] {
  const palette: Record<string, string> = {
    O: "#ad7928",
    Y: "#ffd653",
    F: "#fff0a5",
    S: "#edb53d",
    A: "#c9912e",
    H: "#fff7cb",
    B: "#ee8e35",
    C: "#ffc068",
    E: "#182b2c",
    W: "#ffffff",
    N: "#263f4a",
    R: "#e26458",
    G: "#63ae7b",
    U: "#69b5df",
    P: "#f4cf64",
  };
  const grid = Array.from({ length: 32 + duckHeadroom }, () =>
    Array(36).fill("."),
  );
  const box = (token: string, x: number, y: number, w: number, h: number) => {
    for (let j = y + duckHeadroom; j < y + duckHeadroom + h; j++)
      for (let i = x; i < x + w; i++) grid[j][i] = token;
  };
  // Round toy head, high beak, and the raised tail of a bath duck.
  box("O", 15, 1, 10, 2);
  box("O", 12, 3, 15, 3);
  box("O", 11, 6, 17, 10);
  box("O", 13, 16, 13, 3);
  box("Y", 15, 3, 10, 2);
  box("Y", 13, 5, 13, 10);
  box("Y", 15, 15, 11, 5);
  box("F", 16, 4, 7, 2);
  box("F", 14, 6, 4, 6);
  box("S", 14, 15, 4, 3);
  box("B", 26, 10, 9, 5);
  box("C", 27, 10, 6, 2);
  box("O", 28, 15, 5, 1);
  box("E", 23, 7, 2, 3);
  box("W", 23, 7, 1, 1);
  box("O", 3, 17, 7, 3);
  box("O", 5, 20, 24, 7);
  box("O", 8, 27, 18, 3);
  box("Y", 4, 18, 5, 3);
  box("Y", 7, 20, 20, 7);
  box("Y", 10, 27, 14, 1);
  box("F", 9, 20, 9, 2);
  box("S", 9, 26, 16, 2);
  box("S", 10, 22, 9, 3);
  box("Y", 10, 22, 8, 2);
  box("F", 10, 22, 5, 1);
  // Small contour steps and three shadow bands retain the molded toy silhouette.
  box("S", 25, 6, 2, 4);
  box("S", 24, 15, 2, 3);
  box("A", 8, 27, 2, 1);
  box("A", 11, 28, 12, 1);
  box("F", 7, 21, 2, 3);
  box("H", 15, 6, 2, 2);
  box("O", 13, 24, 7, 1);
  box("S", 12, 23, 1, 2);
  box("Y", 14, 24, 5, 1);
  box("H", 11, 21, 3, 1);
  box("O", 29, 13, 5, 1);
  box("B", 33, 11, 2, 2);
  if (frame % 40 === 38) {
    box("Y", 23, 7, 2, 3);
    box("E", 22, 9, 3, 1);
  }
  if (propellerHat) {
    // A colorful beanie, upright spindle, and two bright propeller blades.
    box("N", 14, -3, 12, 5);
    box("N", 12, -1, 16, 4);
    box("R", 13, 0, 6, 2);
    box("G", 16, -2, 5, 4);
    box("U", 21, -2, 4, 4);
    box("P", 25, 0, 2, 2);
    box("N", 11, 2, 18, 2);
    box("U", 12, 2, 16, 1);
    box("N", 19, -7, 2, 4);
    box("P", 20, -6, 1, 3);
    box("R", 10, -9, 10, 2);
    box("U", 21, -9, 10, 2);
    box("W", 12, -9, 5, 1);
    box("W", 24, -9, 4, 1);
    box("P", 19, -9, 3, 2);
    if (frame % 2) {
      box(".", 10, -9, 21, 2);
      box("R", 15, -10, 5, 2);
      box("U", 21, -8, 5, 2);
      box("W", 16, -10, 3, 1);
      box("P", 19, -9, 3, 2);
    }
  }
  return grid.flatMap((row, y) => {
    const runs: PixelRun[] = [];
    let x = 0;
    while (x < row.length) {
      const token = row[x],
        start = x;
      while (x < row.length && row[x] === token) x++;
      if (token !== ".")
        runs.push({
          x: start,
          y: y - duckHeadroom,
          width: x - start,
          token,
          color: palette[token],
        });
    }
    return runs;
  });
}

// Native 36×32 mallard. Its body shares the player's waterline and draw anchor.
export function mallardDuck(frame = 0): PixelRun[] {
  const palette: Record<string, string> = {
    O: "#233a37",
    D: "#536e65",
    B: "#82978b",
    G: "#b6c2ac",
    H: "#dae0c8",
    N: "#174d3d",
    J: "#287659",
    K: "#5caa72",
    L: "#9acb86",
    C: "#79523d",
    S: "#a5764d",
    W: "#f3ead0",
    Y: "#dab74b",
    F: "#f7d66a",
    E: "#142b2c",
    P: "#535a8e",
  };
  const grid = Array.from({ length: 32 }, () => Array(36).fill("."));
  const box = (t: string, x: number, y: number, w: number, h: number) => {
    for (let j = y; j < y + h; j++)
      for (let i = x; i < x + w; i++) grid[j][i] = t;
  };
  box("O", 3, 18, 7, 4);
  box("D", 4, 19, 7, 2);
  box("O", 7, 18, 22, 8);
  box("O", 10, 26, 16, 3);
  box("B", 8, 19, 18, 7);
  box("G", 10, 19, 12, 3);
  box("H", 11, 19, 9, 1);
  box("D", 10, 25, 15, 2);
  box("O", 11, 22, 11, 3);
  box("B", 11, 21, 9, 3);
  box("G", 12, 21, 7, 1);
  box("P", 14, 23, 7, 2);
  box("W", 15, 23, 5, 1);
  box("D", 12, 25, 9, 1);
  box("C", 22, 15, 6, 10);
  box("S", 23, 17, 3, 5);
  box("O", 17, 3, 8, 2);
  box("O", 15, 5, 12, 9);
  box("N", 16, 5, 10, 10);
  box("J", 17, 5, 7, 9);
  box("K", 18, 5, 4, 6);
  box("L", 19, 5, 2, 2);
  box("N", 18, 13, 9, 4);
  box("W", 19, 15, 7, 2);
  box("O", 26, 9, 9, 4);
  box("Y", 26, 9, 8, 3);
  box("F", 27, 9, 6, 1);
  box("E", 23, 7, 2, 2);
  if (frame % 48 === 46) box("E", 23, 8, 3, 1);
  else box("W", 23, 7, 1, 1);
  return grid.flatMap((row, y) => {
    const runs: PixelRun[] = [];
    let x = 0;
    while (x < row.length) {
      const token = row[x],
        start = x;
      while (x < row.length && row[x] === token) x++;
      if (token !== ".")
        runs.push({
          x: start,
          y,
          width: x - start,
          token,
          color: palette[token],
        });
    }
    return runs;
  });
}
