export type GamePreviewKind = "flappy-flap" | "who-who" | "chalk-rush" | "bluff-box";

export interface GameTheme {
  sky: string;
  horizon: string;
  terrain: string;
  obstacle: string;
  character: string;
  accent: string;
  surface: string;
  ink: string;
  shadow: string;
  preview: GamePreviewKind;
}

export const GAME_THEMES: Record<GamePreviewKind, GameTheme> = {
  "flappy-flap": {
    sky: "#5bc2d2",
    horizon: "#b5e8d4",
    terrain: "#5adb54",
    obstacle: "#72c735",
    character: "#ffd43b",
    accent: "#f5e29b",
    surface: "#f8f4dc",
    ink: "#26383a",
    shadow: "#26383a",
    preview: "flappy-flap",
  },
  "who-who": {
    sky: "#e8eaed",
    horizon: "#c5cbd1",
    terrain: "#f8f9fb",
    obstacle: "#767b82",
    character: "#34383d",
    accent: "#aeb5bd",
    surface: "#f1f3f4",
    ink: "#121212",
    shadow: "#121212",
    preview: "who-who",
  },
  "chalk-rush": {
    sky: "#204b42",
    horizon: "#356859",
    terrain: "#173b34",
    obstacle: "#f3e9c7",
    character: "#fff3c6",
    accent: "#e9c66c",
    surface: "#eaf0dc",
    ink: "#16362f",
    shadow: "#16362f",
    preview: "chalk-rush",
  },
  "bluff-box": {
    sky: "#40345e",
    horizon: "#6d5891",
    terrain: "#302443",
    obstacle: "#e5aa5e",
    character: "#f5d894",
    accent: "#ddb665",
    surface: "#f3eddf",
    ink: "#342a4a",
    shadow: "#342a4a",
    preview: "bluff-box",
  },
};

export const FLAPPY_FLAP_THEME = GAME_THEMES["flappy-flap"];
