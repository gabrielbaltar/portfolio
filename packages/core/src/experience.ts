export const DEFAULT_EXPERIENCE_TASK_LINE_HEIGHT = 21;

export function clampExperienceTaskLineHeight(value: number) {
  return Math.max(16, Math.min(40, Math.round(value)));
}
