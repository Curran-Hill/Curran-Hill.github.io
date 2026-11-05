// Draw sprites in CSS pixels, at integer scale, independently of the map image.
export function spriteScale(sceneWidth: number): number {
  return Math.max(1, Math.round(sceneWidth / 640));
}
export function spriteFrame(time: number, paused: boolean): number {
  return paused ? 0 : Math.max(0, Math.floor(time * 8));
}
