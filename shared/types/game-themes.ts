export type GamePreviewKind = "flappy-flap" | "who-who" | "chalk-rush" | "bluff-box";

export interface GamePalette {
  canvas: string;
  surface: string;
  ink: string;
  muted: string;
  grid: string;
  primary: string;
  primaryHover: string;
  secondary: string;
  coral: string;
  gold: string;
  success: string;
  danger: string;
  shadow: string;
}

export interface GamePreviewColors {
  sky: string;
  horizon: string;
  terrain: string;
  obstacle: string;
  character: string;
}

export interface GameTheme {
  palette: GamePalette;
  previewColors: GamePreviewColors;
  preview: GamePreviewKind;
}

export const GAME_THEMES: Record<GamePreviewKind, GameTheme> = {
  "flappy-flap": {
    palette: {
      canvas: "#f8f4dc",
      surface: "#f8f4dc",
      ink: "#26383a",
      muted: "#5b4625",
      grid: "#85642c",
      primary: "#f5e29b",
      primaryHover: "#e8d17f",
      secondary: "#b5e8d4",
      coral: "#e87519",
      gold: "#ffd43b",
      success: "#5adb54",
      danger: "#e87519",
      shadow: "#26383a",
    },
    previewColors: {
      sky: "#5bc2d2",
      horizon: "#b5e8d4",
      terrain: "#5adb54",
      obstacle: "#72c735",
      character: "#ffd43b",
    },
    preview: "flappy-flap",
  },
  "who-who": {
    palette: {
      canvas: "#FAF7F2",
      surface: "#FFFFFF",
      ink: "#1A1A1A",
      muted: "#57534E",
      grid: "#DDD4C8",
      primary: "#F59E0B",
      primaryHover: "#D97706",
      secondary: "#10B981",
      coral: "#FF6B6B",
      gold: "#FCD34D",
      success: "#34D399",
      danger: "#EF4444",
      shadow: "#000000",
    },
    previewColors: {
      sky: "#FAF7F2",
      horizon: "#FF6B6B",
      terrain: "#FCD34D",
      obstacle: "#34D399",
      character: "#F59E0B",
    },
    preview: "who-who",
  },
  "chalk-rush": {
    palette: {
      canvas: "#204b42",
      surface: "#eaf0dc",
      ink: "#16362f",
      muted: "#356859",
      grid: "#356859",
      primary: "#e9c66c",
      primaryHover: "#d7b454",
      secondary: "#356859",
      coral: "#e8756c",
      gold: "#f3e9c7",
      success: "#73b89f",
      danger: "#e8756c",
      shadow: "#16362f",
    },
    previewColors: {
      sky: "#204b42",
      horizon: "#356859",
      terrain: "#173b34",
      obstacle: "#f3e9c7",
      character: "#fff3c6",
    },
    preview: "chalk-rush",
  },
  "bluff-box": {
    palette: {
      canvas: "#40345e",
      surface: "#f3eddf",
      ink: "#342a4a",
      muted: "#6d5891",
      grid: "#6d5891",
      primary: "#ddb665",
      primaryHover: "#cda34e",
      secondary: "#6d5891",
      coral: "#df776e",
      gold: "#f5d894",
      success: "#83a77b",
      danger: "#df776e",
      shadow: "#342a4a",
    },
    previewColors: {
      sky: "#40345e",
      horizon: "#6d5891",
      terrain: "#302443",
      obstacle: "#e5aa5e",
      character: "#f5d894",
    },
    preview: "bluff-box",
  },
};

export const FLAPPY_FLAP_THEME = GAME_THEMES["flappy-flap"];
export const WHO_WHO_THEME = GAME_THEMES["who-who"];
