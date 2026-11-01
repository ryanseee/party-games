import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { useSession } from "../context/SessionContext";

const ParticipantView: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();

  const {
    currentSession,
    participant,
    participants,
    photos,
    isSessionEnded,
    leaveSession,
    clearSession,
  } = useSession();

  const [assignedPhoto, setAssignedPhoto] = useState<string | null>(null);
  const [photoMeta, setPhotoMeta] = useState<{
    name?: string;
    hint?: string;
  } | null>(null);

  // Local state for exit confirmation modal
  const [showExitConfirmModal, setShowExitConfirmModal] = useState(false);

  useEffect(() => {
    if (
      !currentSession ||
      (code && currentSession.code !== code.toUpperCase())
    ) {
      return;
    }

    const currentP =
      participants.find((p) => p.id === participant?.id) || participant;

    if (currentP && currentP.photo_assigned) {
      const matchedPhoto = photos.find((p) => p.id === currentP.photo_assigned);
      if (matchedPhoto) {
        setAssignedPhoto(matchedPhoto.url);
        setPhotoMeta({
          name: matchedPhoto.title || "",
          hint: "",
        });
      } else {
        setAssignedPhoto(null);
        setPhotoMeta(null);
      }
    } else {
      setAssignedPhoto(null);
      setPhotoMeta(null);
    }
  }, [currentSession, participant, participants, photos, code]);

  const confirmAndLeaveSession = () => {
    leaveSession();
    setShowExitConfirmModal(false);
    navigate("/");
  };

  const handleSessionEndedDismiss = () => {
    clearSession();
    navigate("/");
  };

  return (
    <Layout title="Participant Portal">
      <div className="w-full max-w-2xl mx-auto space-y-6">
        {/* Active Lobby Header Bar */}
        <div className="bg-gameSurface border-2 border-gameBorder p-4 shadow-[4px_4px_0px_var(--chalk-shadow)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-gameMint animate-pulse" />
            <div>
              <span className="font-['Space_Mono',_monospace] text-[10px] uppercase text-gameMuted font-bold block">
                ACTIVE LOBBY
              </span>
              <h2 className="font-['Space_Mono'] text-lg text-gameText font-bold uppercase tracking-tight">
                CODE: {currentSession?.code || code}
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-gameBorder">
            <div className="bg-gameAccent border border-gameBorder px-3 py-1">
              <span className="font-['Space_Mono',_monospace] text-xs font-bold text-gameText uppercase">
                PLAYER: {participant?.name || "PLAYER"}
              </span>
            </div>
            <button
              onClick={() => setShowExitConfirmModal(true)}
              type="button"
              className="bg-gameDanger text-gameText font-['Space_Mono'] text-xs uppercase px-3 py-1.5 border-2 border-gameBorder shadow-[2px_2px_0px_var(--chalk-shadow)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none hover:brightness-95 transition-all cursor-pointer font-bold"
            >
              [ EXIT ]
            </button>
          </div>
        </div>

        {/* Display Card */}
        <div className="bg-gameSurface border-2 border-gameBorder p-6 sm:p-8 shadow-[6px_6px_0px_var(--chalk-shadow)]">
          {/* Card Top Label */}
          <div className="border-b-2 border-gameBorder pb-4 mb-6 flex items-center justify-between">
            <div>
              <span className="font-['Space_Mono',_monospace] text-[10px] uppercase tracking-widest text-gameMuted bg-gameGold px-2 py-0.5 border border-gameBorder font-bold">
                ASSIGNMENT FEED // 02
              </span>
              <h3 className="font-['Space_Mono'] text-xl text-gameText uppercase tracking-tight font-bold mt-1">
                Your Secret Photo
              </h3>
            </div>
            <span className="material-symbols-outlined text-gameText text-[24px]">
              {assignedPhoto ? "visibility" : "hourglass_top"}
            </span>
          </div>

          {/* Photo Frame or Waiting State */}
          {assignedPhoto ? (
            <div className="space-y-6">
              <div className="relative border-2 border-gameBorder bg-gameBorder p-2 shadow-[4px_4px_0px_var(--chalk-shadow)]">
                <div className="absolute top-4 left-4 z-10 bg-gameCoral text-gameText px-2 py-1 font-['Space_Mono',_monospace] text-[10px] uppercase font-bold border border-gameBorder">
                  CLASSIFIED
                </div>
                <img
                  src={assignedPhoto}
                  alt="Assigned Subject"
                  className="w-full h-auto max-h-[420px] object-contain mx-auto border border-gameBorder bg-gameSurface"
                />
              </div>

              {/* Photo Metadata Box */}
              {photoMeta && (photoMeta.name || photoMeta.hint) && (
                <div className="bg-gameBg border-2 border-gameBorder p-4 space-y-2 shadow-[2px_2px_0px_var(--chalk-shadow)]">
                  {photoMeta.name && (
                    <div>
                      <span className="font-['Space_Mono',_monospace] text-[10px] uppercase text-gameMuted font-bold block">
                        SUBJECT NAME
                      </span>
                      <p className="font-['Space_Mono'] text-base text-gameText font-bold">
                        {photoMeta.name}
                      </p>
                    </div>
                  )}
                  {photoMeta.hint && (
                    <div>
                      <span className="font-['Space_Mono',_monospace] text-[10px] uppercase text-gameMuted font-bold block">
                        HINT / BRIEF
                      </span>
                      <p className="font-['Space_Mono',_monospace] text-xs text-gameText">
                        {photoMeta.hint}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* Waiting State */
            <div className="border-2 border-dashed border-gameBorder bg-gameBg p-8 sm:p-12 text-center space-y-4">
              <div className="w-12 h-12 bg-gameBorder text-white mx-auto flex items-center justify-center border-2 border-gameBorder shadow-[2px_2px_0px_var(--chalk-shadow)]">
                <span className="material-symbols-outlined text-[24px] animate-spin">
                  sync
                </span>
              </div>
              <div>
                <h4 className="font-['Space_Mono'] text-lg text-gameText uppercase font-bold">
                  Awaiting Photo Broadcast
                </h4>
                <p className="font-['Space_Mono',_monospace] text-xs text-gameMuted max-w-sm mx-auto mt-1">
                  The host is currently setting up the game pool. Your image
                  will appear here automatically when assigned.
                </p>
              </div>
              <div className="inline-block bg-gameSuccess border border-gameBorder px-3 py-1">
                <span className="font-['Space_Mono',_monospace] text-[10px] font-bold text-gameText uppercase">
                  STATUS: CONNECTED &amp; LISTENING
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Exit Confirmation Modal */}
        {showExitConfirmModal && (
          <div className="fixed inset-0 z-50 bg-gameBorder/80 flex items-center justify-center p-4">
            <div className="bg-gameSurface border-2 border-gameBorder shadow-[8px_8px_0px_var(--chalk-shadow)] w-full max-w-md p-6 space-y-4">
              <div className="border-b-2 border-gameBorder pb-3">
                <span className="font-['Space_Mono',_monospace] text-[10px] uppercase tracking-widest text-gameMuted font-bold block">
                  SYSTEM CONFIRMATION
                </span>
                <h3 className="font-['Space_Mono'] text-lg font-bold text-gameText uppercase">
                  Exit Lobby?
                </h3>
              </div>
              <p className="font-['Space_Mono',_monospace] text-xs text-gameText">
                Are you sure you want to leave the game lobby? You will lose
                access to your assigned photo card.
              </p>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowExitConfirmModal(false)}
                  className="bg-gameSurface text-gameText font-['Space_Mono'] text-xs uppercase px-4 py-2 border-2 border-gameBorder shadow-[2px_2px_0px_var(--chalk-shadow)] hover:bg-gameGold cursor-pointer font-bold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmAndLeaveSession}
                  className="bg-gameDanger text-gameText font-['Space_Mono'] text-xs uppercase px-4 py-2 border-2 border-gameBorder shadow-[2px_2px_0px_var(--chalk-shadow)] hover:brightness-95 cursor-pointer font-bold"
                >
                  Confirm Exit
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Session Ended Prompt Modal */}
        {isSessionEnded && (
          <div className="fixed inset-0 z-50 bg-gameBorder/80 flex items-center justify-center p-4">
            <div className="bg-gameSurface border-2 border-gameBorder shadow-[8px_8px_0px_var(--chalk-shadow)] w-full max-w-md p-6 space-y-4">
              <div className="border-b-2 border-gameBorder pb-3">
                <span className="font-['Space_Mono',_monospace] text-[10px] uppercase tracking-widest text-gameMuted font-bold block">
                  NOTICE // SESSION CLOSED
                </span>
                <h3 className="font-['Space_Mono'] text-lg font-bold text-gameText uppercase mt-1">
                  Game Ended By Host
                </h3>
              </div>
              <p className="font-['Space_Mono',_monospace] text-xs text-gameText">
                The host has terminated this game session. Click below to return
                to the home screen.
              </p>
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleSessionEndedDismiss}
                  className="bg-gameMint text-gameText font-['Space_Mono'] text-xs uppercase px-4 py-2 border-2 border-gameBorder shadow-[2px_2px_0px_var(--chalk-shadow)] hover:brightness-95 cursor-pointer font-bold"
                >
                  Return to Home
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ParticipantView;
