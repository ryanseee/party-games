import React, { useState } from "react";
import Layout from "../components/Layout";
import { useSession } from "../context/SessionContext";
import ManualAssignmentModal from "../components/ManualAssignmentModal";

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
  const handleCopyCode = () => {
    if (currentSession?.code) {
      navigator.clipboard.writeText(currentSession.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
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
          <div className="max-w-xl mx-auto bg-white border-2 border-[#06080c] shadow-[6px_6px_0px_#06080c] p-6 sm:p-8 space-y-6">
            <div className="border-b-2 border-[#06080c] pb-4 flex items-center justify-between">
              <div>
                <span className="font-['Space_Mono',_monospace] text-[10px] uppercase tracking-widest text-[#45474b] bg-[#edeef0] px-2 py-0.5 border border-[#06080c] font-bold">
                  HOST SETUP // 01
                </span>
                <h1 className="font-['Space_Mono'] text-2xl sm:text-3xl text-[#06080c] tracking-tight uppercase font-bold mt-1">
                  {showRecover ? "Recover Session" : "Create New Game"}
                </h1>
              </div>
              <span className="material-symbols-outlined text-[#06080c] text-[28px]">
                admin_panel_settings
              </span>
            </div>

            {!showRecover ? (
              /* Create Form */
              <form onSubmit={handleCreateSession} className="space-y-6">
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="sessionName"
                    className="font-['Silkscreen',_monospace] text-xs uppercase tracking-wider text-[#06080c] flex items-center justify-between font-bold"
                  >
                    <span>Game / Event Name</span>
                    <span className="text-[#45474b] font-['Silkscreen',_monospace] text-[10px]">
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
                    className="w-full bg-white text-[#06080c] font-['Space_Mono',_monospace] text-base px-4 py-3 border-2 border-[#06080c] shadow-[2px_2px_0px_#06080c] focus:outline-none focus:shadow-[4px_4px_0px_#06080c] transition-shadow placeholder:text-[#76777b]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!sessionName.trim() || isCreating}
                  className="w-full bg-[#06080c] text-white font-['Space_Mono'] text-base uppercase tracking-wider py-4 border-2 border-[#06080c] shadow-[4px_4px_0px_#76777b] hover:bg-[#1e2024] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer font-bold disabled:opacity-50"
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
                    className="font-['Silkscreen',_monospace] text-xs uppercase tracking-wider text-[#06080c] flex items-center justify-between font-bold"
                  >
                    <span>Existing Session Code</span>
                    <span className="text-[#45474b] font-['Silkscreen',_monospace] text-[10px]">
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
                    className="w-full bg-white font-['Space_Mono'] text-lg text-[#06080c] tracking-widest px-4 py-3 border-2 border-[#06080c] shadow-[2px_2px_0px_#06080c] focus:outline-none focus:shadow-[4px_4px_0px_#06080c] transition-shadow uppercase placeholder:text-[#76777b] placeholder:font-['Space_Mono',_monospace] placeholder:text-sm placeholder:tracking-normal"
                  />
                </div>
                {recoverError && (
                  <div className="bg-[#ffdad6] border-2 border-[#ba1a1a] p-3 text-[#93000a] font-['Space_Mono',_monospace] text-xs font-bold">
                    {recoverError}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={!recoverCode.trim() || isRecovering}
                  className="w-full bg-[#06080c] text-white font-['Space_Mono'] text-base uppercase tracking-wider py-4 border-2 border-[#06080c] shadow-[4px_4px_0px_#76777b] hover:bg-[#1e2024] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer font-bold disabled:opacity-50"
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
            <div className="pt-4 border-t-2 border-[#06080c] text-center">
              <p className="font-['Space_Mono',_monospace] text-sm text-[#45474b]">
                {showRecover ? (
                  <>
                    Need to start fresh?{" "}
                    <button
                      type="button"
                      onClick={() => setShowRecover(false)}
                      className="text-[#06080c] font-bold hover:underline cursor-pointer uppercase"
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
                      className="text-[#06080c] font-bold hover:underline cursor-pointer uppercase"
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
            <div className="bg-white border-2 border-[#06080c] p-6 shadow-[6px_6px_0px_#06080c] flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2.5 h-2.5 bg-[#06080c] animate-ping" />
                  <span className="font-['Space_Mono',_monospace] text-[10px] uppercase tracking-widest text-[#06080c] bg-[#edeef0] px-2 py-0.5 border border-[#06080c] font-bold">
                    LIVE HOST DECK
                  </span>
                </div>
                <h1 className="font-['Space_Mono'] text-2xl sm:text-3xl text-[#06080c] uppercase font-bold tracking-tight">
                  {currentSession.name || "Game Session"}
                </h1>
              </div>

              {/* Session Code Display & Share Box */}
              <div className="flex items-center gap-3 bg-[#f8f9fb] border-2 border-[#06080c] p-3 shadow-[2px_2px_0px_#06080c]">
                <div>
                  <span className="font-['Space_Mono',_monospace] text-[10px] uppercase text-[#45474b] font-bold block">
                    SESSION CODE
                  </span>
                  <span className="font-['Space_Mono'] text-2xl text-[#06080c] font-bold tracking-wider">
                    {currentSession.code}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="bg-[#06080c] text-white px-3 py-2 border border-[#06080c] font-['Space_Mono',_monospace] text-xs uppercase hover:bg-[#1e2024] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer font-bold flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {copied ? "check" : "content_copy"}
                  </span>
                  <span>{copied ? "COPIED" : "COPY"}</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setShowEndConfirmModal(true)}
                className="self-start md:self-center bg-[#06080c] text-white font-['Space_Mono'] text-xs uppercase px-4 py-2.5 border-2 border-[#06080c] shadow-[2px_2px_0px_#76777b] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none hover:bg-[#1e2024] cursor-pointer font-bold"
              >
                [ END SESSION ]
              </button>
            </div>

            {/* Main Operational Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: Roster & Controls */}
              <div className="space-y-6">
                {/* Mode Settings & Trigger Action */}
                <div className="bg-white border-2 border-[#06080c] p-6 shadow-[4px_4px_0px_#06080c] space-y-4">
                  <span className="font-['Space_Mono',_monospace] text-[10px] uppercase tracking-widest text-[#45474b] font-bold block">
                    GAME MODE SETTINGS
                  </span>

                  {/* Toggle Mode Control */}
                  <div className="flex items-center justify-between border-2 border-[#06080c] p-3 bg-[#f8f9fb]">
                    <div>
                      <span className="font-['Space_Mono'] text-sm font-bold uppercase text-[#06080c] block">
                        {isAutoAssign
                          ? "Auto-Assign Mode"
                          : "Manual Assign Mode"}
                      </span>
                      <span className="font-['Space_Mono',_monospace] text-[10px] text-[#45474b]">
                        {isAutoAssign
                          ? "Distribute photos automatically"
                          : "Manually match photos to players"}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsAutoAssign(!isAutoAssign)}
                      className={`w-12 h-6 border-2 border-[#06080c] flex items-center p-0.5 cursor-pointer transition-colors ${
                        isAutoAssign ? "bg-[#06080c]" : "bg-white"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 bg-white border border-[#06080c] transition-transform ${
                          isAutoAssign
                            ? "translate-x-6 bg-white"
                            : "translate-x-0 bg-[#06080c]"
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
                      className="w-full whitespace-nowrap bg-[#06080c] text-white font-['Space_Mono'] text-[10px] sm:text-xs uppercase tracking-wider px-3 py-3 border-2 border-[#06080c] shadow-[2px_2px_0px_#76777b] hover:bg-[#1e2024] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-1 sm:gap-2 cursor-pointer font-bold disabled:opacity-50"
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
                      className="w-full whitespace-nowrap bg-[#06080c] text-white font-['Space_Mono'] text-[10px] sm:text-xs uppercase tracking-wider px-3 py-3 border-2 border-[#06080c] shadow-[2px_2px_0px_#76777b] hover:bg-[#1e2024] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-1 sm:gap-2 cursor-pointer font-bold disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined shrink-0 text-[18px]">
                        edit_square
                      </span>
                      <span>[ Open Assignment Deck ]</span>
                    </button>
                  )}
                </div>

                {/* Participant Roster */}
                <div className="bg-white border-2 border-[#06080c] p-6 shadow-[4px_4px_0px_#06080c] space-y-4">
                  <div className="flex items-center justify-between border-b-2 border-[#06080c] pb-3">
                    <span className="font-['Space_Mono'] text-base uppercase font-bold text-[#06080c]">
                      Lobby Roster
                    </span>
                    <span className="font-['Space_Mono',_monospace] text-xs font-bold bg-[#edeef0] px-2 py-0.5 border border-[#06080c]">
                      {participants.length} CONNECTED
                    </span>
                  </div>

                  {participants.length === 0 ? (
                    <div className="text-center py-6 border-2 border-dashed border-[#06080c] bg-[#f8f9fb]">
                      <span className="material-symbols-outlined text-[24px] text-[#76777b]">
                        group_off
                      </span>
                      <p className="font-['Space_Mono',_monospace] text-xs text-[#45474b] mt-1">
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
                            className="flex items-center justify-between bg-[#f8f9fb] border-2 border-[#06080c] p-2.5"
                          >
                            <div className="flex items-center gap-3">
                              {/* Thumbnail of assigned photo or placeholder */}
                              <div className="w-8 h-8 border border-[#06080c] bg-white overflow-hidden flex items-center justify-center shrink-0">
                                {assignedPhoto ? (
                                  <img
                                    src={assignedPhoto.url}
                                    alt={p.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <span className="w-2 h-2 bg-[#06080c]" />
                                )}
                              </div>
                              <span className="font-['Space_Mono',_monospace] text-xs font-bold text-[#06080c]">
                                {p.name}
                              </span>
                            </div>
                            <span className="font-['Space_Mono',_monospace] text-[10px] uppercase bg-white border border-[#06080c] px-2 py-0.5 text-[#06080c]">
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
                <div className="bg-white border-2 border-[#06080c] p-6 shadow-[6px_6px_0px_#06080c] space-y-6">
                  <div className="border-b-2 border-[#06080c] pb-4 flex items-center justify-between">
                    <div>
                      <span className="font-['Space_Mono',_monospace] text-[10px] uppercase tracking-widest text-[#45474b] bg-[#edeef0] px-2 py-0.5 border border-[#06080c] font-bold">
                        MEDIA MANAGER // 02
                      </span>
                      <h3 className="font-['Space_Mono'] text-xl text-[#06080c] uppercase font-bold mt-1">
                        Active Photo Pool
                      </h3>
                    </div>
                    <span className="font-['Space_Mono',_monospace] text-xs font-bold bg-[#edeef0] border border-[#06080c] px-3 py-1">
                      {photos.length} ITEMS
                    </span>
                  </div>

                  {/* Device File Drop Zone & Input */}
                  <label
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed border-[#06080c] p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
                      isDragging
                        ? "bg-[#edeef0]"
                        : "bg-[#f8f9fb] hover:bg-[#edeef0]"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[32px] text-[#06080c]">
                      {isUploading ? "sync" : "file_upload"}
                    </span>
                    <span className="font-['Space_Mono'] text-xs uppercase font-bold text-[#06080c]">
                      {isUploading
                        ? "[ COMPRESSING & UPLOADING... ]"
                        : "[ Select / Drop Device Photos ]"}
                    </span>
                    <span className="font-['Space_Mono',_monospace] text-[10px] text-[#45474b]">
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
                    <div className="border-2 border-dashed border-[#06080c] bg-[#f8f9fb] p-12 text-center space-y-2">
                      <span className="material-symbols-outlined text-[32px] text-[#06080c]">
                        add_photo_alternate
                      </span>
                      <p className="font-['Space_Mono'] text-sm text-[#06080c] uppercase font-bold">
                        No Photos Uploaded
                      </p>
                      <p className="font-['Space_Mono',_monospace] text-xs text-[#45474b]">
                        Upload images from your device above to assemble the
                        party photo deck.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {photos.map((item, i) => (
                        <div
                          key={item.id || i}
                          className="relative border-2 border-[#06080c] bg-[#06080c] p-1.5 shadow-[3px_3px_0px_#06080c] group"
                        >
                          <img
                            src={item.url}
                            alt={`Pool photo ${i + 1}`}
                            className="w-full h-32 object-cover border border-[#06080c] bg-white"
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
          <div className="fixed inset-0 z-50 bg-[#06080c]/80 flex items-center justify-center p-4">
            <div className="bg-white border-2 border-[#06080c] shadow-[8px_8px_0px_#06080c] w-full max-w-md p-6 space-y-4">
              <div className="border-b-2 border-[#06080c] pb-3">
                <span className="font-['Space_Mono',_monospace] text-[10px] uppercase tracking-widest text-[#45474b] font-bold block">
                  SYSTEM CONFIRMATION
                </span>
                <h3 className="font-['Space_Mono'] text-lg font-bold text-[#06080c] uppercase">
                  End Game Session?
                </h3>
              </div>
              <p className="font-['Space_Mono',_monospace] text-xs text-[#06080c]">
                Are you sure you want to terminate this room? All connected
                players will be notified that the session has ended and returned
                to the main menu.
              </p>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEndConfirmModal(false)}
                  className="bg-white text-[#06080c] font-['Space_Mono'] text-xs uppercase px-4 py-2 border-2 border-[#06080c] shadow-[2px_2px_0px_#06080c] hover:bg-[#edeef0] cursor-pointer font-bold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmAndEndSession}
                  className="bg-[#06080c] text-white font-['Space_Mono'] text-xs uppercase px-4 py-2 border-2 border-[#06080c] shadow-[2px_2px_0px_#76777b] hover:bg-[#1e2024] cursor-pointer font-bold"
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
