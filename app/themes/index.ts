import { dreadmoorTheme } from './dreadmoor';
import { taetuTheme } from './taetu';

export type Theme = typeof dreadmoorTheme;

export const themes = {
  dreadmoor: dreadmoorTheme,
  taetu: taetuTheme,
};

export function getTheme(): Theme {
  const themeName = process.env.NEXT_PUBLIC_THEME || 'dreadmoor';
  return themes[themeName as keyof typeof themes] || dreadmoorTheme;
}

export { dreadmoorTheme, taetuTheme };
