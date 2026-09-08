module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        gameBg: "#e8eaed",
        gameSurface: "#f1f3f4",
        gameBorder: "#121212",
        gameAccent: "#121212",
        gameAccentHover: "#202124",
        gameText: "#121212",
        gameMuted: "#5f6368",
      },
      borderRadius: {
        game: "0px",
      },
      boxShadow: {
        game: "4px 4px 0px #121212",
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
