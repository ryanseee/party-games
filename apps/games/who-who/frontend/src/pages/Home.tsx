import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { useSession } from "../context/SessionContext";

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { clearSession } = useSession();

  useEffect(() => {
    clearSession();
  }, [clearSession]);

  return (
    <Layout showNav={true} title="Welcome to Who Who">
      <div className="flex flex-col items-center justify-center max-w-5xl mx-auto space-y-12">
        {/* Hero Banner */}
        <section className="w-full text-center flex flex-col items-center pt-4">
          <div className="inline-flex items-center gap-2 px-4 py-1 bg-gameGold border-2 border-gameBorder shadow-[2px_2px_0px_var(--chalk-shadow)] mb-6">
            <span className="w-2 h-2 bg-gameBorder" />
            <span className="font-['Space_Mono',_monospace] text-[10px] uppercase tracking-widest text-gameText font-bold">
              Party Mode Ready
            </span>
          </div>
          <h1 className="font-['Space_Mono'] text-3xl sm:text-4xl text-gameText uppercase tracking-tight mb-2 sm:mb-4 font-bold">
            Who Who
          </h1>
          <p className="font-['Space_Mono',_monospace] text-base text-gameMuted max-w-xl mx-auto tracking-normal">
            A fun photo sharing game for friends, teams, and events.
          </p>
          <div className="w-24 h-[3px] bg-gameBorder mt-8" />
        </section>

        {/* Action Cards Grid */}
        <section className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Join a Game */}
          <div className="flex flex-col justify-between bg-gameSurface border-2 border-gameBorder p-8 shadow-[4px_4px_0px_var(--chalk-shadow)] transition-transform duration-100 hover:-translate-y-0.5 hover:-translate-x-0.5 hover:shadow-[6px_6px_0px_var(--chalk-shadow)]">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 bg-gameAccent border-2 border-gameBorder flex items-center justify-center text-gameText shadow-[2px_2px_0px_var(--chalk-shadow)]">
                  <span className="material-symbols-outlined text-[24px]">
                    group
                  </span>
                </div>
                <span className="font-['Space_Mono',_monospace] text-[10px] uppercase bg-gameAccent px-2 py-0.5 border border-gameBorder text-gameText font-bold">
                  PLAYER PORTAL
                </span>
              </div>
              <h2 className="font-['Space_Mono'] text-xl text-gameText uppercase tracking-tight mb-2 font-bold">
                Join a Game
              </h2>
              <p className="font-['Space_Mono',_monospace] text-sm text-gameMuted mb-8 leading-relaxed">
                Enter a session code to join an existing game and get matched
                with your secret photo assignment.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate("/join")}
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-6 bg-gameAccent text-gameText border-2 border-gameBorder font-['Space_Mono'] text-base uppercase tracking-wider shadow-[4px_4px_0px_var(--chalk-shadow)] active:translate-x-1 active:translate-y-1 active:shadow-none hover:brightness-95 transition-all cursor-pointer font-bold"
            >
              <span>[ Join Session ]</span>
              <span className="material-symbols-outlined text-[20px]">
                arrow_forward
              </span>
            </button>
          </div>

          {/* Card 2: Create a Game */}
          <div className="flex flex-col justify-between bg-gameSurface border-2 border-gameBorder p-8 shadow-[4px_4px_0px_var(--chalk-shadow)] transition-transform duration-100 hover:-translate-y-0.5 hover:-translate-x-0.5 hover:shadow-[6px_6px_0px_var(--chalk-shadow)]">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 bg-gameMint border-2 border-gameBorder flex items-center justify-center text-gameText shadow-[2px_2px_0px_var(--chalk-shadow)]">
                  <span className="material-symbols-outlined text-[24px]">
                    photo_camera
                  </span>
                </div>
                <span className="font-['Space_Mono',_monospace] text-[10px] uppercase bg-gameMint px-2 py-0.5 border border-gameBorder text-gameText font-bold">
                  HOST DECK
                </span>
              </div>
              <h2 className="font-['Space_Mono'] text-xl text-gameText uppercase tracking-tight mb-2 font-bold">
                Create a Game
              </h2>
              <p className="font-['Space_Mono',_monospace] text-sm text-gameMuted mb-8 leading-relaxed">
                Start a new game session as an admin, upload picture sets, and
                direct the flow in real-time.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate("/admin")}
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-6 bg-gameMint text-gameText border-2 border-gameBorder font-['Space_Mono'] text-base uppercase tracking-wider shadow-[4px_4px_0px_var(--chalk-shadow)] active:translate-x-1 active:translate-y-1 active:shadow-none hover:brightness-95 transition-all cursor-pointer font-bold"
            >
              <span>[ Create Session ]</span>
              <span className="material-symbols-outlined text-[20px]">
                add_circle
              </span>
            </button>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="w-full bg-gameSurface border-2 border-gameBorder p-8 shadow-[4px_4px_0px_var(--chalk-shadow)]">
          <div className="border-b-2 border-gameBorder pb-4 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="font-['Space_Mono',_monospace] text-[10px] uppercase tracking-widest text-gameMuted font-bold block mb-1">
                EXECUTION SEQUENCE
              </span>
              <h3 className="font-['Space_Mono'] text-xl text-gameText uppercase tracking-tight font-bold">
                How It Works
              </h3>
            </div>
            <span className="font-['Space_Mono',_monospace] text-xs text-gameText font-bold bg-gameGold border border-gameBorder px-3 py-1 self-start sm:self-auto">
              3-STEP PROTOCOL
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col border-2 border-gameBorder bg-gameBg p-6 shadow-[2px_2px_0px_var(--chalk-shadow)]">
              <div className="flex items-center justify-between mb-4">
                <span className="w-8 h-8 bg-gameCoral text-gameText font-['Space_Mono'] text-base flex items-center justify-center font-bold">
                  01
                </span>
                <span className="material-symbols-outlined text-gameText text-[20px]">
                  upload_file
                </span>
              </div>
              <h4 className="font-['Space_Mono'] text-base text-gameText uppercase mb-1 font-bold">
                Create a Session
              </h4>
              <p className="font-['Space_Mono',_monospace] text-xs text-gameMuted">
                Admin creates a game and uploads photos for the room.
              </p>
            </div>

            <div className="flex flex-col border-2 border-gameBorder bg-gameBg p-6 shadow-[2px_2px_0px_var(--chalk-shadow)]">
              <div className="flex items-center justify-between mb-4">
                <span className="w-8 h-8 bg-gameGold text-gameText font-['Space_Mono'] text-base flex items-center justify-center font-bold">
                  02
                </span>
                <span className="material-symbols-outlined text-gameText text-[20px]">
                  key
                </span>
              </div>
              <h4 className="font-['Space_Mono'] text-base text-gameText uppercase mb-1 font-bold">
                Join the Game
              </h4>
              <p className="font-['Space_Mono',_monospace] text-xs text-gameMuted">
                Participants join using the generated session code.
              </p>
            </div>

            <div className="flex flex-col border-2 border-gameBorder bg-gameBg p-6 shadow-[2px_2px_0px_var(--chalk-shadow)]">
              <div className="flex items-center justify-between mb-4">
                <span className="w-8 h-8 bg-gameSuccess text-gameText font-['Space_Mono'] text-base flex items-center justify-center font-bold">
                  03
                </span>
                <span className="material-symbols-outlined text-gameText text-[20px]">
                  shuffle
                </span>
              </div>
              <h4 className="font-['Space_Mono'] text-base text-gameText uppercase mb-1 font-bold">
                Receive Photos
              </h4>
              <p className="font-['Space_Mono',_monospace] text-xs text-gameMuted">
                Each participant gets assigned a random photo to inspect and
                guess.
              </p>
            </div>
          </div>
        </section>

        {/* Callout Banner */}
        <section className="w-full bg-gameCoral border-2 border-gameBorder p-6 shadow-[4px_4px_0px_var(--chalk-shadow)] flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-10 h-10 bg-gameBorder text-white flex items-center justify-center shrink-0 border border-gameBorder">
            <span className="material-symbols-outlined text-[24px]">
              auto_awesome
            </span>
          </div>
          <div className="flex-1">
            <p className="font-['Space_Mono'] text-base text-gameText uppercase tracking-tight font-bold">
              Perfect for team building &amp; events
            </p>
            <p className="font-['Space_Mono',_monospace] text-xs text-gameMuted mt-0.5">
              Use Who Who for ice breakers, family gatherings, corporate
              meetups, and party nights.
            </p>
          </div>
          <div className="shrink-0 self-end sm:self-center">
            <span className="font-['Space_Mono',_monospace] text-[10px] font-bold tracking-widest text-gameText border border-gameBorder px-3 py-1 bg-gameSurface">
              INSTANT DEPLOY
            </span>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Home;
