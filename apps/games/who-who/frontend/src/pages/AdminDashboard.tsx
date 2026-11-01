import React, { useState } from "react";
import Layout from "../components/Layout";
import { useSession } from "../context/SessionContext";
import ManualAssignmentModal from "../components/ManualAssignmentModal";

const copyTextFallback = (text: string) => {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.setAttribute("readonly", "");
  textArea.style.position = "fixed";
  textArea.style.opacity = "0";
  document.body.appendChild(textArea);

  try {
    textArea.select();
    return document.execCommand("copy");
  } finally {
    document.body.removeChild(textArea);
  }
};

const AdminDashboard: React.FC = () => {
  const {
    currentSession,
    participants,
    photos,
    createSession,
    joinSession,
    uploadPhotos,
    assignPhotos,
    assignPhotoManually,
    endSession,
    clearSession,
  } = useSession();

  // Local state
  const [sessionName, setSessionName] = useState("");
  const [recoverCode, setRecoverCode] = useState("");
  const [showRecover, setShowRecover] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isRecovering, setIsRecovering] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);
  const [recoverError, setRecoverError] = useState("");

  // Confirmation modal state
  const [showEndConfirmModal, setShowEndConfirmModal] = useState(false);

  // Photo assignment & modal state
  const [isAutoAssign, setIsAutoAssign] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Handle new session creation
  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionName.trim()) return;
    setIsCreating(true);
    try {
      await createSession(sessionName.trim());
    } catch (err) {
      console.error("Error creating session:", err);
    } finally {
      setIsCreating(false);
    }
  };

  // Handle recovering an existing session code as admin
  const handleRecoverSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoverCode.trim()) return;
    setIsRecovering(true);
    setRecoverError("");
    try {
      const res = await joinSession(
        recoverCode.trim().toUpperCase(),
        "Admin",
        true,
      );
      if (res && !res.success) {
        setRecoverError(res.error || "Failed to recover session code.");
      }
    } catch (err: any) {
      setRecoverError(err.message || "Failed to recover session.");
    } finally {
      setIsRecovering(false);
    }
  };

  // Copy session code
  const handleCopyCode = async () => {
    const code = currentSession?.code;
    if (!code) return;

    setCopied(false);
    setCopyFailed(false);

    try {
      if (navigator.clipboard?.writeText) {
        try {
          await navigator.clipboard.writeText(code);
        } catch {
          if (!copyTextFallback(code)) {
            throw new Error("Clipboard copy command was rejected");
          }
        }
      } else if (!copyTextFallback(code)) {
        throw new Error("Clipboard copy command was rejected");
      }

      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy session code:", error);
      setCopyFailed(true);
      setTimeout(() => setCopyFailed(false), 3000);
    }
  };

  // Compress image client-side
  const compressImage = (
    file: File,
  ): Promise<{ url: string; title: string }> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.onerror = (err) => reject(err);

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 1000;
        const MAX_HEIGHT = 1000;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          return resolve({ url: img.src, title: file.name });
        }

        ctx.drawImage(img, 0, 0, width, height);
        const compressedBase64 = canvas.toDataURL("image/jpeg", 0.75);
        resolve({ url: compressedBase64, title: file.name });
      };

      reader.readAsDataURL(file);
    });
  };

  const processFiles = async (files: FileList | File[]) => {
    const fileList = Array.from(files).filter((file) =>
      file.type.startsWith("image/"),
    );
    if (fileList.length === 0) return;

    setIsUploading(true);
    try {
      const compressPromises = fileList.map((file) => compressImage(file));
      const newUploadedPhotos = await Promise.all(compressPromises);

      if (newUploadedPhotos.length > 0) {
        // Upload photos to photo pool without auto-triggering photo assignment
        await uploadPhotos(newUploadedPhotos);
      }
    } catch (err) {
      console.error("Failed to process image uploads:", err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files);
      e.target.value = "";
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleStartAssignment = () => {
    assignPhotos();
  };

  const confirmAndEndSession = () => {
    endSession();
    clearSession();
    setShowEndConfirmModal(false);
  };

  return (
    <Layout title="Admin Control Center">
      <div className="w-full max-w-5xl mx-auto space-y-8">
        {!currentSession ? (
          /* =========================================================
             STATE 1: CREATE / RECOVER SESSION
             ========================================================= */
          <div className="max-w-xl mx-auto bg-gameSurface border-2 border-gameBorder shadow-[6px_6px_0px_var(--chalk-shadow)] p-6 sm:p-8 space-y-6">
            <div className="border-b-2 border-gameBorder pb-4 flex items-center justify-between">
              <div>
                <span className="font-['Space_Mono',_monospace] text-[10px] uppercase tracking-widest text-gameText bg-gameCoral px-2 py-0.5 border border-gameBorder font-bold">
                  HOST SETUP // 01
                </span>
                <h1 className="font-['Space_Mono'] text-2xl sm:text-3xl text-gameText tracking-tight uppercase font-bold mt-1">
                  {showRecover ? "Recover Session" : "Create New Game"}
                </h1>
              </div>
              <span className="material-symbols-outlined text-gameText text-[28px]">
                admin_panel_settings
              </span>
            </div>

            {!showRecover ? (
              /* Create Form */
              <form onSubmit={handleCreateSession} className="space-y-6">
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="sessionName"
                    className="font-['Silkscreen',_monospace] text-xs uppercase tracking-wider text-gameText flex items-center justify-between font-bold"
                  >
                    <span>Game / Event Name</span>
                    <span className="text-gameMuted font-['Silkscreen',_monospace] text-[10px]">
                      [{sessionName.length}/30]
                    </span>
                  </label>
                  <input
                    id="sessionName"
                    type="text"
                    maxLength={30}
                    required
                    value={sessionName}
                    onChange={(e) => setSessionName(e.target.value)}
                    placeholder="e.g. Friday Team Game Night"
                    className="w-full bg-gameSurface text-gameText font-['Space_Mono',_monospace] text-base px-4 py-3 border-2 border-gameBorder shadow-[2px_2px_0px_var(--chalk-shadow)] focus:outline-none focus:shadow-[4px_4px_0px_var(--chalk-shadow)] transition-shadow placeholder:text-gameMuted"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!sessionName.trim() || isCreating}
                  className="w-full bg-gameMint text-gameText font-['Space_Mono'] text-base uppercase tracking-wider py-4 border-2 border-gameBorder shadow-[4px_4px_0px_var(--chalk-shadow)] hover:brightness-95 active:translate-x-1 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer font-bold disabled:opacity-50"
                >
                  {isCreating ? (
                    <>
                      <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent animate-spin" />
                      <span>[ GENERATING ROOM... ]</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[20px]">
                        add_circle
                      </span>
                      <span>[ Launch Host Deck ]</span>
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* Recover Form */
              <form onSubmit={handleRecoverSession} className="space-y-6">
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="recoverCode"
                    className="font-['Silkscreen',_monospace] text-xs uppercase tracking-wider text-gameText flex items-center justify-between font-bold"
                  >
                    <span>Existing Session Code</span>
                    <span className="text-gameMuted font-['Silkscreen',_monospace] text-[10px]">
                      [6 CHARS]
                    </span>
                  </label>
                  <input
                    id="recoverCode"
                    type="text"
                    maxLength={6}
                    required
                    value={recoverCode}
                    onChange={(e) =>
                      setRecoverCode(e.target.value.toUpperCase())
                    }
                    placeholder="e.g. W40X9A"
                    className="w-full bg-gameSurface font-['Space_Mono'] text-lg text-gameText tracking-widest px-4 py-3 border-2 border-gameBorder shadow-[2px_2px_0px_var(--chalk-shadow)] focus:outline-none focus:shadow-[4px_4px_0px_var(--chalk-shadow)] transition-shadow uppercase placeholder:text-gameMuted placeholder:font-['Space_Mono',_monospace] placeholder:text-sm placeholder:tracking-normal"
                  />
                </div>
                {recoverError && (
                  <div className="bg-gameCoral border-2 border-gameDanger p-3 text-gameText font-['Space_Mono',_monospace] text-xs font-bold">
                    {recoverError}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={!recoverCode.trim() || isRecovering}
                  className="w-full bg-gameMint text-gameText font-['Space_Mono'] text-base uppercase tracking-wider py-4 border-2 border-gameBorder shadow-[4px_4px_0px_var(--chalk-shadow)] hover:brightness-95 active:translate-x-1 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer font-bold disabled:opacity-50"
                >
                  {isRecovering ? (
                    <>
                      <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent animate-spin" />
                      <span>[ RECOVERING... ]</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[20px]">
                        sync
                      </span>
                      <span>[ Reconnect as Host ]</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Recover / Toggle Footer Banner */}
            <div className="pt-4 border-t-2 border-gameBorder text-center">
              <p className="font-['Space_Mono',_monospace] text-sm text-gameMuted">
                {showRecover ? (
                  <>
                    Need to start fresh?{" "}
                    <button
                      type="button"
                      onClick={() => setShowRecover(false)}
                      className="text-gameText font-bold hover:underline cursor-pointer uppercase"
                    >
                      Create a New Game
                    </button>
                  </>
                ) : (
                  <>
                    Already have a session?{" "}
                    <button
                      type="button"
                      onClick={() => setShowRecover(true)}
                      className="text-gameText font-bold hover:underline cursor-pointer uppercase"
                    >
                      Recover Session
                    </button>
                  </>
                )}
              </p>
            </div>
          </div>
        ) : (
          /* =========================================================
             STATE 2: LIVE HOST DASHBOARD
             ========================================================= */
          <div className="space-y-8">
            {/* Top Control Banner */}
            <div className="bg-gameSurface border-2 border-gameBorder p-6 shadow-[6px_6px_0px_var(--chalk-shadow)] flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2.5 h-2.5 bg-gameMint animate-ping" />
                  <span className="font-['Space_Mono',_monospace] text-[10px] uppercase tracking-widest text-gameText bg-gameSuccess px-2 py-0.5 border border-gameBorder font-bold">
                    LIVE HOST DECK
                  </span>
                </div>
                <h1 className="font-['Space_Mono'] text-2xl sm:text-3xl text-gameText uppercase font-bold tracking-tight">
                  {currentSession.name || "Game Session"}
                </h1>
              </div>

              {/* Session Code Display & Share Box */}
              <div className="flex items-center gap-3 bg-gameBg border-2 border-gameBorder p-3 shadow-[2px_2px_0px_var(--chalk-shadow)]">
                <div>
                  <span className="font-['Space_Mono',_monospace] text-[10px] uppercase text-gameMuted font-bold block">
                    SESSION CODE
                  </span>
                  <span className="font-['Space_Mono'] text-2xl text-gameText font-bold tracking-wider">
                    {currentSession.code}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="bg-gameBorder text-white px-3 py-2 border border-gameBorder font-['Space_Mono',_monospace] text-xs uppercase hover:brightness-95 active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer font-bold flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {copied ? "check" : copyFailed ? "error" : "content_copy"}
                  </span>
                  <span>{copied ? "COPIED" : copyFailed ? "FAILED" : "COPY"}</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setShowEndConfirmModal(true)}
                className="self-start md:self-center bg-gameDanger text-gameText font-['Space_Mono'] text-xs uppercase px-4 py-2.5 border-2 border-gameBorder shadow-[2px_2px_0px_var(--chalk-shadow)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none hover:brightness-95 cursor-pointer font-bold"
              >
                [ END SESSION ]
              </button>
            </div>

            {/* Main Operational Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: Roster & Controls */}
              <div className="space-y-6">
                {/* Mode Settings & Trigger Action */}
                <div className="bg-gameSurface border-2 border-gameBorder p-6 shadow-[4px_4px_0px_var(--chalk-shadow)] space-y-4">
                  <span className="font-['Space_Mono',_monospace] text-[10px] uppercase tracking-widest text-gameMuted font-bold block">
                    GAME MODE SETTINGS
                  </span>

                  {/* Toggle Mode Control */}
                  <div className="flex items-center justify-between border-2 border-gameBorder p-3 bg-gameBg">
                    <div>
                      <span className="font-['Space_Mono'] text-sm font-bold uppercase text-gameText block">
                        {isAutoAssign
                          ? "Auto-Assign Mode"
                          : "Manual Assign Mode"}
                      </span>
                      <span className="font-['Space_Mono',_monospace] text-[10px] text-gameMuted">
                        {isAutoAssign
                          ? "Distribute photos automatically"
                          : "Manually match photos to players"}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsAutoAssign(!isAutoAssign)}
                      className={`w-12 h-6 border-2 border-gameBorder flex items-center p-0.5 cursor-pointer transition-colors ${
                        isAutoAssign ? "bg-gameMint" : "bg-gameSurface"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 bg-gameSurface border border-gameBorder transition-transform ${
                          isAutoAssign
                            ? "translate-x-6 bg-gameSurface"
                            : "translate-x-0 bg-gameBorder"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Trigger Action Buttons */}
                  {isAutoAssign ? (
                    <button
                      type="button"
                      onClick={handleStartAssignment}
                      disabled={
                        photos.length === 0 || participants.length === 0
                      }
                      className="w-full whitespace-nowrap bg-gameMint text-gameText font-['Space_Mono'] text-[10px] sm:text-xs uppercase tracking-wider px-3 py-3 border-2 border-gameBorder shadow-[2px_2px_0px_var(--chalk-shadow)] hover:brightness-95 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-1 sm:gap-2 cursor-pointer font-bold disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined shrink-0 text-[18px]">
                        shuffle
                      </span>
                      <span>[ Start Auto Assignment ]</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(true)}
                      disabled={
                        photos.length === 0 || participants.length === 0
                      }
                      className="w-full whitespace-nowrap bg-gameMint text-gameText font-['Space_Mono'] text-[10px] sm:text-xs uppercase tracking-wider px-3 py-3 border-2 border-gameBorder shadow-[2px_2px_0px_var(--chalk-shadow)] hover:brightness-95 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-1 sm:gap-2 cursor-pointer font-bold disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined shrink-0 text-[18px]">
                        edit_square
                      </span>
                      <span>[ Open Assignment Deck ]</span>
                    </button>
                  )}
                </div>

                {/* Participant Roster */}
                <div className="bg-gameSurface border-2 border-gameBorder p-6 shadow-[4px_4px_0px_var(--chalk-shadow)] space-y-4">
                  <div className="flex items-center justify-between border-b-2 border-gameBorder pb-3">
                    <span className="font-['Space_Mono'] text-base uppercase font-bold text-gameText">
                      Lobby Roster
                    </span>
                    <span className="font-['Space_Mono',_monospace] text-xs font-bold bg-gameGold px-2 py-0.5 border border-gameBorder">
                      {participants.length} CONNECTED
                    </span>
                  </div>

                  {participants.length === 0 ? (
                    <div className="text-center py-6 border-2 border-dashed border-gameBorder bg-gameBg">
                      <span className="material-symbols-outlined text-[24px] text-gameMuted">
                        group_off
                      </span>
                      <p className="font-['Space_Mono',_monospace] text-xs text-gameMuted mt-1">
                        Waiting for players to join...
                      </p>
                    </div>
                  ) : (
                    <ul className="space-y-2">
                      {participants.map((p: any, idx: number) => {
                        const assignedPhoto = photos.find(
                          (photo) => photo.id === p.photo_assigned,
                        );

                        return (
                          <li
                            key={p.id || idx}
                            className="flex items-center justify-between bg-gameBg border-2 border-gameBorder p-2.5"
                          >
                            <div className="flex items-center gap-3">
                              {/* Thumbnail of assigned photo or placeholder */}
                              <div className="w-8 h-8 border border-gameBorder bg-gameSurface overflow-hidden flex items-center justify-center shrink-0">
                                {assignedPhoto ? (
                                  <img
                                    src={assignedPhoto.url}
                                    alt={p.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <span className="w-2 h-2 bg-gameBorder" />
                                )}
                              </div>
                              <span className="font-['Space_Mono',_monospace] text-xs font-bold text-gameText">
                                {p.name}
                              </span>
                            </div>
                            <span className={`font-['Space_Mono',_monospace] text-[10px] uppercase border border-gameBorder px-2 py-0.5 text-gameText ${p.photo_assigned ? "bg-gameSuccess" : "bg-gameGold"}`}>
                              {p.photo_assigned ? "ASSIGNED" : "WAITING"}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </div>

              {/* Right Column: Device Photo Uploader & Gallery */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-gameSurface border-2 border-gameBorder p-6 shadow-[6px_6px_0px_var(--chalk-shadow)] space-y-6">
                  <div className="border-b-2 border-gameBorder pb-4 flex items-center justify-between">
                    <div>
                      <span className="font-['Space_Mono',_monospace] text-[10px] uppercase tracking-widest text-gameMuted bg-gameGold px-2 py-0.5 border border-gameBorder font-bold">
                        MEDIA MANAGER // 02
                      </span>
                      <h3 className="font-['Space_Mono'] text-xl text-gameText uppercase font-bold mt-1">
                        Active Photo Pool
                      </h3>
                    </div>
                    <span className="font-['Space_Mono',_monospace] text-xs font-bold bg-gameGold border border-gameBorder px-3 py-1">
                      {photos.length} ITEMS
                    </span>
                  </div>

                  {/* Device File Drop Zone & Input */}
                  <label
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed border-gameBorder p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
                      isDragging
                        ? "bg-gameGold"
                        : "bg-gameBg hover:bg-gameGold"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[32px] text-gameText">
                      {isUploading ? "sync" : "file_upload"}
                    </span>
                    <span className="font-['Space_Mono'] text-xs uppercase font-bold text-gameText">
                      {isUploading
                        ? "[ COMPRESSING & UPLOADING... ]"
                        : "[ Select / Drop Device Photos ]"}
                    </span>
                    <span className="font-['Space_Mono',_monospace] text-[10px] text-gameMuted">
                      Supports JPG, PNG, GIF (Select multiple files)
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      disabled={isUploading}
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>

                  {/* Photo Preview Grid */}
                  {photos.length === 0 ? (
                    <div className="border-2 border-dashed border-gameBorder bg-gameBg p-12 text-center space-y-2">
                      <span className="material-symbols-outlined text-[32px] text-gameText">
                        add_photo_alternate
                      </span>
                      <p className="font-['Space_Mono'] text-sm text-gameText uppercase font-bold">
                        No Photos Uploaded
                      </p>
                      <p className="font-['Space_Mono',_monospace] text-xs text-gameMuted">
                        Upload images from your device above to assemble the
                        party photo deck.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {photos.map((item, i) => (
                        <div
                          key={item.id || i}
                          className="relative border-2 border-gameBorder bg-gameBorder p-1.5 shadow-[3px_3px_0px_var(--chalk-shadow)] group"
                        >
                          <img
                            src={item.url}
                            alt={`Pool photo ${i + 1}`}
                            className="w-full h-32 object-cover border border-gameBorder bg-gameSurface"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Manual Assignment Modal */}
        <ManualAssignmentModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          participants={participants}
          photos={photos}
          onAssignPhoto={assignPhotoManually}
        />

        {/* End Session Confirmation Modal */}
        {showEndConfirmModal && (
          <div className="fixed inset-0 z-50 bg-gameBorder/80 flex items-center justify-center p-4">
            <div className="bg-gameSurface border-2 border-gameBorder shadow-[8px_8px_0px_var(--chalk-shadow)] w-full max-w-md p-6 space-y-4">
              <div className="border-b-2 border-gameBorder pb-3">
                <span className="font-['Space_Mono',_monospace] text-[10px] uppercase tracking-widest text-gameMuted font-bold block">
                  SYSTEM CONFIRMATION
                </span>
                <h3 className="font-['Space_Mono'] text-lg font-bold text-gameText uppercase">
                  End Game Session?
                </h3>
              </div>
              <p className="font-['Space_Mono',_monospace] text-xs text-gameText">
                Are you sure you want to terminate this room? All connected
                players will be notified that the session has ended and returned
                to the main menu.
              </p>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEndConfirmModal(false)}
                  className="bg-gameSurface text-gameText font-['Space_Mono'] text-xs uppercase px-4 py-2 border-2 border-gameBorder shadow-[2px_2px_0px_var(--chalk-shadow)] hover:bg-gameGold cursor-pointer font-bold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmAndEndSession}
                  className="bg-gameDanger text-gameText font-['Space_Mono'] text-xs uppercase px-4 py-2 border-2 border-gameBorder shadow-[2px_2px_0px_var(--chalk-shadow)] hover:brightness-95 cursor-pointer font-bold"
                >
                  End Session
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AdminDashboard;
