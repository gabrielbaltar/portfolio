export const DEFAULT_STACK_LOGO_RADIUS = 0;

export function clampStackLogoRadius(value: number) {
  const normalized = Number(value);
  if (Number.isNaN(normalized)) {
    return DEFAULT_STACK_LOGO_RADIUS;
  }

  return Math.max(0, Math.min(24, Math.round(normalized)));
}
