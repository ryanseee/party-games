import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { WHO_WHO_THEME } from '../../../../../shared/types/game-themes';

const { palette } = WHO_WHO_THEME;
const themeVariables: Record<string, string> = {
  '--chalk-paper': palette.canvas,
  '--chalk-surface': palette.surface,
  '--chalk-ink': palette.ink,
  '--chalk-muted': palette.muted,
  '--chalk-grid': palette.grid,
  '--chalk-amber': palette.primary,
  '--chalk-amber-hover': palette.primaryHover,
  '--chalk-mint': palette.secondary,
  '--chalk-coral': palette.coral,
  '--chalk-gold': palette.gold,
  '--chalk-success': palette.success,
  '--chalk-danger': palette.danger,
  '--chalk-shadow': palette.shadow,
};

Object.entries(themeVariables).forEach(([name, value]) => {
  document.documentElement.style.setProperty(name, value);
});
document
  .querySelector<HTMLMetaElement>('meta[name="theme-color"]')
  ?.setAttribute("content", palette.canvas);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
