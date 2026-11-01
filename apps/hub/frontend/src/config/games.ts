import {
  GAME_THEMES,
  type GameTheme,
} from "../../../../../shared/types/game-themes";

export interface GameInfo {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  minPlayers: number;
  maxPlayers: number;
  description: string;
  url: string;
  enabled: boolean;
  theme: GameTheme;
}

export const WHO_WHO_URL =
  import.meta.env.VITE_WHO_WHO_URL || "http://localhost:5101";

export const FLAPPY_FLAP_URL =
  import.meta.env.VITE_FLAPPY_FLAP_URL || "http://localhost:5301";

export const GAME_CATALOG: GameInfo[] = [
  {
    id: "who-who",
    title: "WHO WHO?",
    subtitle: "THE SECRET PHOTO PARLOR",
    category: "01 // DEDUCTION",
    minPlayers: 2,
    maxPlayers: 50,
    description:
      "Everyone gets a secret photo identity assigned by the host. Ask questions and guess assignments before your time runs out.",
    url: WHO_WHO_URL,
    enabled: true,
    theme: GAME_THEMES["who-who"],
  },
  {
    id: "flappy-flap",
    title: "FLAPPY FLAP",
    subtitle: "ARCADE FLIGHT",
    category: "02 // ARCADE FLIGHT",
    minPlayers: 1,
    maxPlayers: 1,
    description:
      "Guide a bird through floating gates. Tap or press Space to flap, dodge the clouds, and beat your high score.",
    url: FLAPPY_FLAP_URL,
    enabled: true,
    theme: GAME_THEMES["flappy-flap"],
  },
  {
    id: "chalk-rush",
    title: "CHALK RUSH",
    subtitle: "RAPID PIXEL PICTIONARY",
    category: "03 // SPEED DRAW",
    minPlayers: 3,
    maxPlayers: 10,
    description:
      "Sketch lightning prompts with scarce chalk strokes. Friends must guess before time expires.",
    url: "#",
    enabled: false,
    theme: GAME_THEMES["chalk-rush"],
  },
  {
    id: "bluff-box",
    title: "BLUFF BOX",
    subtitle: "OBSCURE TRIVIA FORGERY",
    category: "04 // DECEPTION",
    minPlayers: 2,
    maxPlayers: 8,
    description:
      "Invent convincing fake facts to absurd trivia questions. Earn points when friends believe your bluffs.",
    url: "#",
    enabled: false,
    theme: GAME_THEMES["bluff-box"],
  },
];
