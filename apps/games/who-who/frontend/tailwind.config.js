module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        gameBg: "var(--chalk-paper)",
        gameSurface: "var(--chalk-surface)",
        gameBorder: "var(--chalk-ink)",
        gameAccent: "var(--chalk-amber)",
        gameAccentHover: "var(--chalk-amber-hover)",
        gameText: "var(--chalk-ink)",
        gameMuted: "var(--chalk-muted)",
        gameMint: "var(--chalk-mint)",
        gameCoral: "var(--chalk-coral)",
        gameGold: "var(--chalk-gold)",
        gameSuccess: "var(--chalk-success)",
        gameDanger: "var(--chalk-danger)",
      },
      borderRadius: {
        game: "0px",
      },
      boxShadow: {
        game: "4px 4px 0px var(--chalk-shadow)",
      },
      fontFamily: {
        pixel: ['"Press Start 2P"', "monospace"],
        silkscreen: ['"Silkscreen"', "monospace"],
        mono: ['"Space Mono"', "monospace"],
      },
    },
  },
  plugins: [],
};
