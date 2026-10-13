import { renderClassicCard } from "./themes/classic.js";
import { renderCuteCard } from "./themes/cute.js";

export const THEMES = ["cute", "classic"];
export const DEFAULT_THEME = "cute";

/** `?theme=` → known theme id; anything else falls back to the default. */
export function resolveTheme(value) {
  const v = String(value ?? "").trim().toLowerCase();
  return THEMES.includes(v) ? v : DEFAULT_THEME;
}

/**
 * @param {{ profile: object, zodiac: object, stats: object, meta?: { source?: string, width?: number, glow?: boolean, theme?: string } }} input
 */
export function renderZodiacCard(input) {
  const theme = resolveTheme(input?.meta?.theme);
  return theme === "classic" ? renderClassicCard(input) : renderCuteCard(input);
}

export const CARD_SIZE = {
  width: 600,
  height: 320,
  defaultDisplayWidth: 360,
};
