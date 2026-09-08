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
}

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
    url: "http://localhost:8080",
    enabled: true,
  },
  {
    id: "chalk-rush",
    title: "CHALK RUSH",
    subtitle: "RAPID PIXEL PICTIONARY",
    category: "02 // SPEED DRAW",
    minPlayers: 3,
    maxPlayers: 10,
    description:
      "Sketch lightning prompts with scarce chalk strokes. Friends must guess before time expires.",
    url: "#",
    enabled: false,
  },
  {
    id: "bluff-box",
    title: "BLUFF BOX",
    subtitle: "OBSCURE TRIVIA FORGERY",
    category: "03 // DECEPTION",
    minPlayers: 2,
    maxPlayers: 8,
    description:
      "Invent convincing fake facts to absurd trivia questions. Earn points when friends believe your bluffs.",
    url: "#",
    enabled: false,
  },
];
