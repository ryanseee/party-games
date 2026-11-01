import type { GameTheme } from "../../../../../shared/types/game-themes";
import flappyFlapSprite from "../../../../../shared/assets/game-previews/flappy-flap/bird.png";

interface GamePreviewProps {
  theme: GameTheme;
}

const GamePreview = ({ theme }: GamePreviewProps) => {
  const { palette, previewColors } = theme;
  const frameStyle = {
    backgroundColor: previewColors.sky,
    borderColor: palette.ink,
  };

  return (
    <div
      aria-hidden="true"
      className="relative h-16 w-16 shrink-0 overflow-hidden border-2"
      style={frameStyle}
    >
      {theme.preview === "flappy-flap" && (
        <>
          <div
            className="absolute inset-x-0 bottom-3 h-3"
            style={{ backgroundColor: previewColors.horizon }}
          />
          <div
            className="absolute inset-x-0 bottom-0 h-3"
            style={{ backgroundColor: previewColors.terrain }}
          />
          <div
            className="absolute right-2 top-0 h-7 w-2 border-x border-b-2"
            style={{ backgroundColor: previewColors.obstacle, borderColor: palette.ink }}
          />
          <div
            className="absolute bottom-3 right-2 h-2 w-3 border-2"
            style={{ backgroundColor: previewColors.obstacle, borderColor: palette.ink }}
          />
          <img
            alt=""
            className="absolute left-5 top-7 h-3 w-[17px] object-contain"
            src={flappyFlapSprite}
          />
        </>
      )}

      {theme.preview === "who-who" && (
        <>
          <div
            className="absolute left-2 top-2 h-10 w-6 rotate-[-6deg] border-2 bg-white"
            style={{ borderColor: palette.ink }}
          >
            <div
              className="mx-auto mt-1 h-3 w-3 rounded-full"
              style={{ backgroundColor: previewColors.obstacle }}
            />
            <div
              className="mx-auto mt-1 h-3 w-4"
              style={{ backgroundColor: previewColors.horizon }}
            />
          </div>
          <div
            className="absolute right-2 top-4 h-10 w-6 rotate-[7deg] border-2 bg-white"
            style={{ borderColor: palette.ink }}
          >
            <div
              className="mx-auto mt-1 h-3 w-3 rounded-full"
              style={{ backgroundColor: previewColors.character }}
            />
            <div
              className="mx-auto mt-1 h-3 w-4"
              style={{ backgroundColor: previewColors.obstacle }}
            />
          </div>
        </>
      )}

      {theme.preview === "chalk-rush" && (
        <>
          <div
            className="absolute left-2 top-3 h-1 w-9 rotate-[-18deg]"
            style={{ backgroundColor: previewColors.obstacle }}
          />
          <div
            className="absolute left-3 top-7 h-1 w-7 rotate-[12deg]"
            style={{ backgroundColor: previewColors.character }}
          />
          <div
            className="absolute left-3 top-11 h-1 w-8 rotate-[-9deg]"
            style={{ backgroundColor: palette.primary }}
          />
        </>
      )}

      {theme.preview === "bluff-box" && (
        <>
          <div
            className="absolute left-2 top-3 h-10 w-8 rotate-[-9deg] border-2"
            style={{ backgroundColor: palette.surface, borderColor: palette.ink }}
          />
          <div
            className="absolute right-2 top-2 flex h-10 w-8 rotate-[8deg] items-center justify-center border-2 font-['Press_Start_2P',_monospace] text-sm"
            style={{
              backgroundColor: palette.primary,
              borderColor: palette.ink,
              color: palette.ink,
            }}
          >
            ?
          </div>
        </>
      )}
    </div>
  );
};

export default GamePreview;
