import { useCallback, useEffect, useRef, useState } from "react";
import { FLAPPY_FLAP_THEME } from "../../../../../shared/types/game-themes";

const WIDTH = 288;
const HEIGHT = 512;
const GROUND_HEIGHT = 112;
const GROUND_Y = HEIGHT - GROUND_HEIGHT;
const BIRD_X = 72;
const BIRD_RADIUS = 12;
const BIRD_WIDTH = 34;
const BIRD_HEIGHT = 24;
const PIPE_WIDTH = 52;
const PIPE_HEIGHT = 320;
const GAP_HEIGHT = 108;
const GRAVITY = 900;
const FLAP_VELOCITY = -310;
const START_SPEED = 120;
const PIPE_SPAWN_INTERVAL = 1.45;

const SPRITE_URLS = {
  background: new URL("../../assets/themes/classic/background/day.png", import.meta.url).href,
  base: new URL("../../assets/themes/classic/terrain/ground.png", import.meta.url).href,
  pipe: new URL("../../assets/themes/classic/obstacles/pipe-green.png", import.meta.url).href,
  birdBlueDown: new URL("../../assets/themes/classic/bird/blue/down.png", import.meta.url).href,
  birdBlueMid: new URL("../../assets/themes/classic/bird/blue/mid.png", import.meta.url).href,
  birdBlueUp: new URL("../../assets/themes/classic/bird/blue/up.png", import.meta.url).href,
  birdRedDown: new URL("../../assets/themes/classic/bird/red/down.png", import.meta.url).href,
  birdRedMid: new URL("../../assets/themes/classic/bird/red/mid.png", import.meta.url).href,
  birdRedUp: new URL("../../assets/themes/classic/bird/red/up.png", import.meta.url).href,
  birdYellowDown: new URL("../../assets/themes/classic/bird/yellow/down.png", import.meta.url).href,
  birdYellowMid: new URL("../../assets/themes/classic/bird/yellow/mid.png", import.meta.url).href,
  birdYellowUp: new URL("../../assets/themes/classic/bird/yellow/up.png", import.meta.url).href,
  message: new URL("../../assets/themes/classic/ui/ready-message.png", import.meta.url).href,
  gameOver: new URL("../../assets/themes/classic/ui/game-over.png", import.meta.url).href,
  zero: new URL("../../assets/themes/classic/ui/score/0.png", import.meta.url).href,
  one: new URL("../../assets/themes/classic/ui/score/1.png", import.meta.url).href,
  two: new URL("../../assets/themes/classic/ui/score/2.png", import.meta.url).href,
  three: new URL("../../assets/themes/classic/ui/score/3.png", import.meta.url).href,
  four: new URL("../../assets/themes/classic/ui/score/4.png", import.meta.url).href,
  five: new URL("../../assets/themes/classic/ui/score/5.png", import.meta.url).href,
  six: new URL("../../assets/themes/classic/ui/score/6.png", import.meta.url).href,
  seven: new URL("../../assets/themes/classic/ui/score/7.png", import.meta.url).href,
  eight: new URL("../../assets/themes/classic/ui/score/8.png", import.meta.url).href,
  nine: new URL("../../assets/themes/classic/ui/score/9.png", import.meta.url).href,
} as const;

type SpriteKey = keyof typeof SPRITE_URLS;
type Sprites = Record<SpriteKey, HTMLImageElement>;
type BirdColor = "blue" | "red" | "yellow";
type GameMode = "ready" | "playing" | "paused" | "over";

interface Pipe {
  x: number;
  gapTop: number;
  scored: boolean;
}

interface GameEngine {
  mode: GameMode;
  birdColor: BirdColor;
  birdY: number;
  velocity: number;
  pipes: Pipe[];
  spawnTimer: number;
  groundOffset: number;
  score: number;
}

const makeEngine = (): GameEngine => ({
  mode: "ready",
  birdColor: (["blue", "red", "yellow"] as const)[Math.floor(Math.random() * 3)],
  birdY: 190,
  velocity: 0,
  pipes: [],
  spawnTimer: 0,
  groundOffset: 0,
  score: 0,
});

const HUB_URL = import.meta.env.VITE_HUB_URL || "http://localhost:5173";

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine>(makeEngine());
  const [mode, setMode] = useState<GameMode>("ready");
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);

  const flap = useCallback(() => {
    const engine = engineRef.current;
    if (engine.mode === "paused") {
      engine.mode = "playing";
      setMode("playing");
    } else if (engine.mode !== "playing") {
      Object.assign(engine, makeEngine(), { mode: "playing" as const });
      setMode("playing");
      setScore(0);
    }
    engineRef.current.velocity = FLAP_VELOCITY;
  }, []);

  const togglePause = useCallback(() => {
    const engine = engineRef.current;
    if (engine.mode === "playing") {
      engine.mode = "paused";
      setMode("paused");
    } else if (engine.mode === "paused") {
      engine.mode = "playing";
      setMode("playing");
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    context.imageSmoothingEnabled = false;
    const sprites: Sprites = {
      background: new Image(),
      base: new Image(),
      pipe: new Image(),
      birdBlueDown: new Image(),
      birdBlueMid: new Image(),
      birdBlueUp: new Image(),
      birdRedDown: new Image(),
      birdRedMid: new Image(),
      birdRedUp: new Image(),
      birdYellowDown: new Image(),
      birdYellowMid: new Image(),
      birdYellowUp: new Image(),
      message: new Image(),
      gameOver: new Image(),
      zero: new Image(),
      one: new Image(),
      two: new Image(),
      three: new Image(),
      four: new Image(),
      five: new Image(),
      six: new Image(),
      seven: new Image(),
      eight: new Image(),
      nine: new Image(),
    };

    const spriteEntries: Array<[HTMLImageElement, string]> = [
      [sprites.background, SPRITE_URLS.background],
      [sprites.base, SPRITE_URLS.base],
      [sprites.pipe, SPRITE_URLS.pipe],
      [sprites.birdBlueDown, SPRITE_URLS.birdBlueDown],
      [sprites.birdBlueMid, SPRITE_URLS.birdBlueMid],
      [sprites.birdBlueUp, SPRITE_URLS.birdBlueUp],
      [sprites.birdRedDown, SPRITE_URLS.birdRedDown],
      [sprites.birdRedMid, SPRITE_URLS.birdRedMid],
      [sprites.birdRedUp, SPRITE_URLS.birdRedUp],
      [sprites.birdYellowDown, SPRITE_URLS.birdYellowDown],
      [sprites.birdYellowMid, SPRITE_URLS.birdYellowMid],
      [sprites.birdYellowUp, SPRITE_URLS.birdYellowUp],
      [sprites.message, SPRITE_URLS.message],
      [sprites.gameOver, SPRITE_URLS.gameOver],
      [sprites.zero, SPRITE_URLS.zero],
      [sprites.one, SPRITE_URLS.one],
      [sprites.two, SPRITE_URLS.two],
      [sprites.three, SPRITE_URLS.three],
      [sprites.four, SPRITE_URLS.four],
      [sprites.five, SPRITE_URLS.five],
      [sprites.six, SPRITE_URLS.six],
      [sprites.seven, SPRITE_URLS.seven],
      [sprites.eight, SPRITE_URLS.eight],
      [sprites.nine, SPRITE_URLS.nine],
    ];

    spriteEntries.forEach(([image, source]) => {
      image.onerror = () => console.error(`Failed to load game sprite: ${source}`);
      image.src = source;
    });

    let frameId = 0;
    let previousTime = 0;
    let isMounted = true;

    const finishRun = () => {
      const engine = engineRef.current;
      engine.mode = "over";
      setMode("over");
      setBest((currentBest) => Math.max(currentBest, engine.score));
    };

    const drawScore = (value: number, centerX: number, y: number) => {
      const digits: Record<string, HTMLImageElement> = {
        "0": sprites.zero,
        "1": sprites.one,
        "2": sprites.two,
        "3": sprites.three,
        "4": sprites.four,
        "5": sprites.five,
        "6": sprites.six,
        "7": sprites.seven,
        "8": sprites.eight,
        "9": sprites.nine,
      };
      const scoreText = String(value);
      const digitWidth = 24;
      const digitHeight = 36;
      const spacing = 2;
      const scoreWidth = scoreText.length * digitWidth + (scoreText.length - 1) * spacing;
      let x = centerX - scoreWidth / 2;
      [...scoreText].forEach((digit) => {
        const image = digits[digit];
        const width = digit === "1" ? 16 : digitWidth;
        context.drawImage(
          image,
          x + (digitWidth - width) / 2,
          y,
          width,
          digitHeight,
        );
        x += digitWidth + spacing;
      });
    };

    const drawPipes = (pipe: Pipe) => {
      context.drawImage(
        sprites.pipe,
        pipe.x,
        pipe.gapTop + GAP_HEIGHT,
        PIPE_WIDTH,
        PIPE_HEIGHT,
      );

      context.save();
      context.translate(pipe.x, pipe.gapTop);
      context.scale(1, -1);
      context.drawImage(sprites.pipe, 0, 0, PIPE_WIDTH, PIPE_HEIGHT);
      context.restore();
    };

    const drawBird = (engine: GameEngine, timestamp: number) => {
      const flapFrame = Math.floor(timestamp / 100) % 3;
      const birdFrames = {
        blue: [sprites.birdBlueUp, sprites.birdBlueMid, sprites.birdBlueDown],
        red: [sprites.birdRedUp, sprites.birdRedMid, sprites.birdRedDown],
        yellow: [sprites.birdYellowUp, sprites.birdYellowMid, sprites.birdYellowDown],
      }[engine.birdColor];
      const birdSprite =
        flapFrame === 0
          ? birdFrames[0]
          : flapFrame === 1
            ? birdFrames[1]
            : birdFrames[2];
      const displayY =
        engine.mode === "ready"
          ? engine.birdY + Math.sin(timestamp / 240) * 4
          : engine.birdY;
      const rotation =
        engine.mode === "playing"
          ? Math.max(-0.45, Math.min(0.65, engine.velocity / 650))
          : 0;

      context.save();
      context.translate(BIRD_X, displayY);
      context.rotate(rotation);
      context.drawImage(
        birdSprite,
        -BIRD_WIDTH / 2,
        -BIRD_HEIGHT / 2,
        BIRD_WIDTH,
        BIRD_HEIGHT,
      );
      context.restore();
    };

    const drawBackground = () => {
      context.drawImage(sprites.background, 0, 0, WIDTH, HEIGHT);
    };

    const drawBase = (engine: GameEngine) => {
      const baseWidth = 336;
      const baseOffset = engine.groundOffset % baseWidth;
      context.drawImage(
        sprites.base,
        -baseOffset,
        GROUND_Y,
        baseWidth,
        GROUND_HEIGHT,
      );
      context.drawImage(
        sprites.base,
        baseWidth - baseOffset,
        GROUND_Y,
        baseWidth,
        GROUND_HEIGHT,
      );
    };

    const drawReadyMessage = () => {
      context.drawImage(sprites.message, (WIDTH - 184) / 2, 55, 184, 267);
    };

    const drawGameOver = (engine: GameEngine) => {
      context.drawImage(sprites.gameOver, (WIDTH - 192) / 2, 88, 192, 42);
      context.fillStyle = "#ded895";
      context.fillRect(46, 155, 196, 86);
      context.strokeStyle = "#543b2b";
      context.lineWidth = 2;
      context.strokeRect(46, 155, 196, 86);
      context.fillStyle = "#543b2b";
      context.font = "bold 11px monospace";
      context.textAlign = "left";
      context.fillText("SCORE", 59, 178);
      context.fillText("BEST", 59, 210);
      drawScore(engine.score, 192, 163);
      drawScore(best, 192, 202);
    };

    const draw = (timestamp: number) => {
      const delta = previousTime
        ? Math.min((timestamp - previousTime) / 1000, 0.033)
        : 0;
      previousTime = timestamp;

      const engine = engineRef.current;
      const assetsReady = spriteEntries.every(
        ([image]) => image.complete && image.naturalWidth > 0,
      );

      if (assetsReady) {
        if (engine.mode === "playing") {
          const speed = START_SPEED + Math.min(engine.score * 2, 36);
          engine.velocity += GRAVITY * delta;
          engine.birdY += engine.velocity * delta;
          engine.spawnTimer += delta;
          engine.groundOffset = (engine.groundOffset + speed * delta) % 336;

          if (engine.spawnTimer >= PIPE_SPAWN_INTERVAL) {
            engine.spawnTimer -= PIPE_SPAWN_INTERVAL;
            const minGapTop = 70;
            const maxGapTop = GROUND_Y - GAP_HEIGHT - 72;
            const gapTop = minGapTop + Math.random() * (maxGapTop - minGapTop);
            engine.pipes.push({ x: WIDTH + 8, gapTop, scored: false });
          }

          engine.pipes.forEach((pipe) => {
            pipe.x -= speed * delta;
            if (!pipe.scored && pipe.x + PIPE_WIDTH < BIRD_X - BIRD_RADIUS) {
              pipe.scored = true;
              engine.score += 1;
              setScore(engine.score);
            }
          });
          engine.pipes = engine.pipes.filter((pipe) => pipe.x + PIPE_WIDTH > -8);

          const hitGround = engine.birdY + BIRD_RADIUS >= GROUND_Y;
          const hitCeiling = engine.birdY - BIRD_RADIUS <= 0;
          const hitPipe = engine.pipes.some((pipe) => {
            const overlapsBird =
              BIRD_X + BIRD_RADIUS > pipe.x &&
              BIRD_X - BIRD_RADIUS < pipe.x + PIPE_WIDTH;
            const outsideGap =
              engine.birdY - BIRD_RADIUS < pipe.gapTop ||
              engine.birdY + BIRD_RADIUS > pipe.gapTop + GAP_HEIGHT;
            return overlapsBird && outsideGap;
          });
          if (hitGround || hitCeiling || hitPipe) finishRun();
        } else if (engine.mode === "ready") {
          engine.groundOffset = (engine.groundOffset + 28 * delta) % 336;
        }

        drawBackground();
        engine.pipes.forEach(drawPipes);
        drawBase(engine);
        drawBird(engine, timestamp);

        if (engine.mode === "ready") {
          drawReadyMessage();
        } else if (engine.mode === "over") {
          drawGameOver(engine);
        } else {
          drawScore(engine.score, WIDTH / 2, 35);
        }
      }

      if (isMounted) frameId = window.requestAnimationFrame(draw);
    };

    frameId = window.requestAnimationFrame(draw);
    return () => {
      isMounted = false;
      window.cancelAnimationFrame(frameId);
      spriteEntries.forEach(([image]) => {
        image.onload = null;
        image.onerror = null;
      });
    };
  }, [best]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === "Space" || event.code === "ArrowUp") {
        event.preventDefault();
        if (!event.repeat) flap();
      }
      if (event.code === "Escape") togglePause();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [flap, togglePause]);

  return (
    <main
      className="page"
      style={{ backgroundColor: FLAPPY_FLAP_THEME.palette.surface }}
    >
      <header className="topbar">
        <a className="back-link" href={HUB_URL}>
          <span aria-hidden="true">←</span> PARTY HUB
        </a>
        <span className="topbar-label">FLAPPY FLAP</span>
      </header>

      <section className="game-card" aria-label="Flappy Flap game">
        <div
          className="game-stage"
          style={{
            backgroundColor: FLAPPY_FLAP_THEME.previewColors.sky,
            borderColor: FLAPPY_FLAP_THEME.palette.ink,
          }}
        >
          <canvas
            ref={canvasRef}
            width={WIDTH}
            height={HEIGHT}
            aria-label={`Flappy Flap game. Current score: ${score}. Tap or press Space to flap.`}
            onPointerDown={(event) => {
              event.preventDefault();
              flap();
            }}
          />
          {mode === "playing" || mode === "paused" ? (
            <button
              className="pause-button"
              type="button"
              aria-label={mode === "playing" ? "Pause game" : "Resume game"}
              onPointerDown={(event) => event.stopPropagation()}
              onClick={togglePause}
            >
              {mode === "playing" ? (
                <span className="pause-glyph" aria-hidden="true" />
              ) : (
                <span className="play-glyph" aria-hidden="true">▶</span>
              )}
            </button>
          ) : null}
          {mode === "paused" && <div className="pause-label">PAUSED</div>}
          {mode === "over" && (
            <button
              className="play-button"
              onPointerDown={(event) => event.stopPropagation()}
              onClick={flap}
              type="button"
            >
              FLY AGAIN
            </button>
          )}
        </div>
      </section>
    </main>
  );
}

export default App;
