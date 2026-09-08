import React, { useState } from "react";
import { GAME_CATALOG } from "../config/games";

const Hub: React.FC = () => {
  const [roomCode, setRoomCode] = useState("");
  const [isSoundOn, setIsSoundOn] = useState(true);

  const handleEnterRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomCode.trim()) return;
    window.location.href = `http://localhost:8080/join?code=${encodeURIComponent(roomCode.trim().toUpperCase())}`;
  };

  const handleLaunchGame = (url: string) => {
    if (url !== "#") {
      window.location.href = url;
    }
  };

  return (
    <div className="min-h-screen text-[#121212] font-['Space_Mono',_monospace] flex flex-col justify-between scanlines selection:bg-[#121212] selection:text-[#f1f3f4]">
      {/* Top Header */}
      <header className="w-full bg-[#f1f3f4] border-b-4 border-[#121212] sticky top-0 z-30 px-4 py-3">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 font-['Silkscreen',_monospace] text-xs">
          <div className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="inline-block w-3.5 h-3.5 bg-[#121212] animate-pulse"
            />
            <a
              href="#"
              className="font-['Press_Start_2P',_monospace] text-xs sm:text-sm tracking-wider font-bold hover:underline"
            >
              [ OUT OF CHALK : PARTY ]
            </a>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[11px]">
            <div className="px-2 py-1 bg-[#e8eaed] border-2 border-[#121212] shadow-[2px_2px_0px_#121212] flex items-center gap-1.5">
              <span className="w-2 h-2 bg-emerald-700 inline-block" />
              <span>STATUS: ONLINE</span>
            </div>
            <button
              type="button"
              onClick={() => setIsSoundOn(!isSoundOn)}
              className="px-2.5 py-1 bg-[#f1f3f4] hover:bg-[#dedfe2] border-2 border-[#121212] shadow-[2px_2px_0px_#121212] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
            >
              [SOUND: {isSoundOn ? "ON" : "OFF"}]
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl w-full mx-auto px-4 py-8 md:py-12 flex-1 flex flex-col gap-10">
        {/* Hero Section */}
        <section className="bg-[#f1f3f4] border-3 border-[#121212] shadow-[4px_4px_0px_#121212] p-6 md:p-8 relative">
          <div className="absolute -top-3 -left-3 bg-[#121212] text-[#f1f3f4] font-['Press_Start_2P',_monospace] text-[9px] px-2 py-1 uppercase tracking-widest">
            CARTRIDGE ENGINE v1.0
          </div>

          <div className="max-w-3xl">
            <h1 className="font-['Press_Start_2P',_monospace] text-xl sm:text-2xl md:text-3xl font-black text-[#121212] tracking-tight leading-relaxed mb-3">
              OUT OF CHALK // PARTY HUB
            </h1>
            <p className="font-['Space_Mono',_monospace] text-sm md:text-base text-[#202124] leading-relaxed max-w-2xl mb-6">
              Minimalist multiplayer parlor games on a shared digital slate.
              Pick a cartridge below, join an active parlor room, or strike a
              new match before your chalk runs dry.
            </p>

            {/* Room Input Form */}
            <form
              onSubmit={handleEnterRoom}
              className="flex flex-wrap items-center gap-3 pt-2 font-['Silkscreen',_monospace] text-xs"
            >
              <div className="flex items-center bg-white border-3 border-[#121212] px-3 py-2 shadow-[2px_2px_0px_#121212]">
                <label
                  htmlFor="roomInput"
                  className="text-[#5f6368] font-bold mr-2 text-[10px]"
                >
                  ROOM CODE:
                </label>
                <input
                  id="roomInput"
                  type="text"
                  maxLength={6}
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  placeholder="____"
                  className="w-20 bg-transparent border-0 p-0 text-center font-['Press_Start_2P',_monospace] text-sm uppercase tracking-widest text-[#121212] focus:ring-0 focus:outline-none placeholder:text-[#9aa0a6]"
                />
              </div>
              <button
                type="submit"
                disabled={!roomCode.trim()}
                className="px-4 py-2.5 bg-[#121212] text-[#f1f3f4] font-['Press_Start_2P',_monospace] text-[11px] border-3 border-[#121212] shadow-[4px_4px_0px_#121212] hover:bg-[#202124] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-1 active:translate-y-1 active:shadow-none transition-all cursor-pointer disabled:opacity-50"
              >
                [ ENTER ROOM ]
              </button>
            </form>
          </div>
        </section>

        {/* Game Selection Grid */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b-3 border-[#121212] pb-2">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2.5 h-2.5 bg-[#121212]" />
              <h2 className="font-['Press_Start_2P',_monospace] text-xs sm:text-sm tracking-wide uppercase">
                SELECT A CARTRIDGE
              </h2>
            </div>
            <span className="font-['Silkscreen',_monospace] text-[11px] text-[#5f6368]">
              {GAME_CATALOG.length} SLOTS AVAILABLE
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {GAME_CATALOG.map((game) => (
              <article
                key={game.id}
                className="border-3 border-[#121212] shadow-[4px_4px_0px_#121212] bg-[#f1f3f4] flex flex-col justify-between hover:bg-white transition-colors duration-75"
              >
                <div className="p-5">
                  <div className="flex items-center justify-between pb-3 mb-4 border-b-2 border-[#121212]">
                    <span className="font-['Silkscreen',_monospace] text-[10px] uppercase font-bold tracking-wider bg-[#dedfe2] px-2 py-0.5 border border-[#121212]">
                      {game.category}
                    </span>
                    <span className="font-['Space_Mono',_monospace] text-xs font-bold text-[#202124]">
                      {game.minPlayers}-{game.maxPlayers} PLAYERS
                    </span>
                  </div>

                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-16 h-16 bg-[#121212] text-[#f1f3f4] border-2 border-[#121212] shrink-0 flex items-center justify-center relative font-['Press_Start_2P',_monospace] text-xs">
                      <div className="text-center text-[9px] select-none">
                        [?]
                        <div className="text-[8px] tracking-widest mt-1">
                          ---
                        </div>
                      </div>
                      <div className="absolute -top-1.5 bg-white text-[#121212] text-[8px] border border-[#121212] px-1 font-mono font-bold">
                        NOTE
                      </div>
                    </div>
                    <div>
                      <h3 className="font-['Press_Start_2P',_monospace] text-sm md:text-base font-bold text-[#121212] mb-1">
                        {game.title}
                      </h3>
                      <span className="text-[11px] font-['Silkscreen',_monospace] text-[#5f6368] block">
                        {game.subtitle}
                      </span>
                    </div>
                  </div>

                  <p className="font-['Space_Mono',_monospace] text-xs text-[#202124] leading-relaxed mb-4">
                    {game.description}
                  </p>
                </div>

                <div className="p-5 pt-0 mt-auto">
                  <button
                    type="button"
                    onClick={() => handleLaunchGame(game.url)}
                    disabled={!game.enabled}
                    className={`w-full py-3 font-['Press_Start_2P',_monospace] text-xs uppercase border-3 border-[#121212] shadow-[4px_4px_0px_#121212] flex items-center justify-center gap-2 transition-all ${
                      game.enabled
                        ? "bg-[#121212] text-[#f1f3f4] hover:bg-[#202124] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-1 active:translate-y-1 active:shadow-none cursor-pointer"
                        : "bg-[#9aa0a6] text-[#202124] cursor-not-allowed opacity-60 shadow-none"
                    }`}
                  >
                    <span>
                      {game.enabled ? "[ PLAY NOW ]" : "[ COMING SOON ]"}
                    </span>
                    {game.enabled && <span aria-hidden="true">&gt;&gt;</span>}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t-4 border-[#121212] bg-[#f1f3f4] py-6 px-4 text-center font-['Silkscreen',_monospace] text-xs text-[#202124]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <span>JUSTCORE PLATFORM ENGINE</span>
            <span className="mx-2 text-[#9aa0a6]">|</span>
            <span className="text-[#5f6368]">OUT OF CHALK THEME</span>
          </div>
          <div className="flex items-center gap-4 text-[10px] text-[#5f6368]">
            <span>V1.0.0</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Hub;
