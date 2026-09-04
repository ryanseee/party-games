import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import Button from "../components/Button";
import Input from "../components/Input";
import Card from "../components/Card";
import SessionCode from "../components/SessionCode";
import { PhotoUploader } from "../components/PhotoUploader";
import ParticipantList from "../components/ParticipantList";
import PhotoGrid from "../components/PhotoGrid";
import ConfirmationModal from "../components/ConfirmationModal";
import ManualAssignmentModal from "../components/ManualAssignmentModal";
import { useSession } from "../context/SessionContext";
import { Share2, LogOut, Wand2 } from "lucide-react";
import { validateSessionName } from "../utils/validation";
import { Photo } from "../types";

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const {
    currentSession,
    participants,
    photos,
    createSession,
    endSession,
    isAdmin,
    socket,
    joinSession,
    setIsAdmin,
  } = useSession();

  const [sessionName, setSessionName] = useState("");
  const [creatingSession, setCreatingSession] = useState(!currentSession);
  const [createError, setCreateError] = useState<string | undefined>(undefined);
  const [recoverError, setRecoverError] = useState<string | undefined>(
    undefined
  );
  const [isLoading, setIsLoading] = useState(false);
  const [showEndConfirmation, setShowEndConfirmation] = useState(false);
  const [assignmentMode, setAssignmentMode] = useState<"auto" | "manual">(
    "auto"
  );
  const [isManualAssignmentOpen, setIsManualAssignmentOpen] = useState(false);
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryCode, setRecoveryCode] = useState("");

  useEffect(() => {
    // If not admin and we have a session, redirect to participant view
    if (currentSession && !isAdmin) {
      navigate(`/participant/${currentSession.code}`);
      return;
    }

    // If we have a session but we're in creating mode, exit creating mode
    if (currentSession && creatingSession) {
      setCreatingSession(false);
    }
  }, [currentSession, isAdmin, navigate, creatingSession]);

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(undefined);

    // Validate session name
    const validation = validateSessionName(sessionName);
    if (!validation.isValid) {
      setCreateError(validation.error);
      return;
    }

    setIsLoading(true);
    try {
      const result = await createSession(sessionName.trim());
      if (!result) {
        throw new Error("Failed to create session");
      }
      setCreatingSession(false);
    } catch (error) {
      setCreateError(
        error instanceof Error ? error.message : "Failed to create session"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignPhotos = () => {
    if (!currentSession) return;

    if (assignmentMode === "auto") {
      socket.emit("assign_photos", { code: currentSession.code });
    } else {
      setIsManualAssignmentOpen(true);
    }
  };

  const handleEndSession = async () => {
    if (!currentSession) return;

    try {
      await endSession();
      navigate("/");
    } catch (error) {
      setCreateError("Failed to end session");
    }
  };

  const handleShareLink = async () => {
    if (!currentSession) return;

    const url = `${window.location.origin}/join?code=${currentSession.code}`;
    try {
      await navigator.clipboard.writeText(url);
      alert("Join link copied to clipboard!");
    } catch (error) {
      setCreateError("Failed to copy link to clipboard");
    }
  };

  const handleUploadComplete = async () => {
    // The socket event listener will update the photos state automatically
    console.log("Upload complete, waiting for photos_updated event");

    // Log the current photos state after a short delay
    setTimeout(() => {
      console.log("Current photos count:", photos.length);
    }, 1000);
  };

  const handleRemovePhoto = async (photo: Photo) => {
    if (!currentSession || !socket) return;
    try {
      socket.emit("remove_photo", {
        code: currentSession.code,
        photoId: photo.id,
      });
    } catch (error) {
      console.error("Error removing photo:", error);
    }
  };

  const handleManualAssign = (
    participantId: string,
    photoId: string | null
  ) => {
    if (!currentSession) return;

    if (photoId === null) {
      // Use unassign_photo event for unassignment
      socket.emit("unassign_photo", {
        sessionId: currentSession.id,
        participantId,
      });
    } else {
      // Use assign_photo_manually event for assignment
      socket.emit("assign_photo_manually", {
        sessionId: currentSession.id,
        participantId,
        photoId,
      });
    }
  };

  const handleManualUnassign = (participantId: string) => {
    if (!currentSession) return;

    socket.emit("unassign_photo", {
      sessionId: currentSession.id,
      participantId,
    });
  };

  const handleRecoverSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecoverError(undefined);

    if (!recoveryCode || recoveryCode.length !== 6) {
      setRecoverError("Please enter a valid 6-digit session code");
      return;
    }

    setIsLoading(true);
    try {
      // Set isAdmin to true before joining
      setIsAdmin(true);

      // Try to join the session as admin
      const result = await joinSession(recoveryCode, "Admin", true);
      if (!result.success) {
        throw new Error(result.error || "Failed to recover session");
      }
      // If successful, the socket event will handle the navigation
    } catch (error) {
      setRecoverError(
        error instanceof Error ? error.message : "Failed to recover session"
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (creatingSession) {
    return (
      <Layout title="Create New Session" showBack={true}>
        <div className="max-w-md mx-auto px-4">
          <Card className="my-12 p-8 glass-card">
            <form onSubmit={handleCreateSession} className="space-y-6">
              <h2 className="text-2xl font-light text-gray-800">
                Create a New Session
              </h2>

              <Input
                label="Session Name"
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
                placeholder="e.g., Team Building Game"
                required
                autoFocus
                error={createError}
                disabled={isLoading}
                className="bg-white/50"
              />

              <Button
                type="submit"
                fullWidth
                disabled={!sessionName.trim() || isLoading}
                className="bg-indigo-500 hover:bg-indigo-600 text-white"
              >
                {isLoading ? "Creating..." : "Create Session"}
              </Button>

              <div className="mt-6 pt-6 border-t">
                <p className="text-gray-600 text-center">
                  Already have a session?{" "}
                  <button
                    type="button"
                    onClick={() => setShowRecovery(true)}
                    className="text-indigo-600 hover:text-indigo-800"
                  >
                    Click here to recover
                  </button>
                </p>
              </div>
            </form>
          </Card>

          {showRecovery && (
            <Card className="my-12 p-8 glass-card">
              <form onSubmit={handleRecoverSession} className="space-y-6">
                <h2 className="text-2xl font-light text-gray-800">
                  Recover Admin Session
                </h2>

                <Input
                  label="Session Code"
                  value={recoveryCode}
                  onChange={(e) =>
                    setRecoveryCode(e.target.value.toUpperCase())
                  }
                  placeholder="Enter 6-digit code"
                  error={recoverError}
                  disabled={isLoading}
                  className="bg-white/50"
                />

                <Button
                  type="submit"
                  fullWidth
                  disabled={
                    !recoveryCode || recoveryCode.length !== 6 || isLoading
                  }
                  className="bg-indigo-500 hover:bg-indigo-600 text-white"
                >
                  {isLoading ? "Recovering..." : "Recover Session"}
                </Button>

                <div className="mt-6 pt-6 border-t">
                  <p className="text-gray-600 text-center">
                    <button
                      type="button"
                      onClick={() => setShowRecovery(false)}
                      className="text-indigo-600 hover:text-indigo-800"
                    >
                      Back to Create Session
                    </button>
                  </p>
                </div>
              </form>
            </Card>
          )}
        </div>
      </Layout>
    );
  }

  if (!currentSession) {
    return null; // Return null to prevent any flash of content
  }

  return (
    <Layout showNav={true} title="Admin Dashboard">
      <div className="max-w-7xl mx-auto">
        {/* Session Code Section */}
        <div className="mb-8">
          <SessionCode code={currentSession?.code || ""} />
        </div>

        {/* Assignment Mode Toggle and Assign Button */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={assignmentMode === "manual"}
                onChange={(e) =>
                  setAssignmentMode(e.target.checked ? "manual" : "auto")
                }
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              <span className="ml-3 text-sm font-medium text-gray-700">
                {assignmentMode === "manual"
                  ? "Manual Assignment"
                  : "Auto Assignment"}
              </span>
            </label>
          </div>

          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={handleShareLink}
              icon={<Share2 size={18} />}
            >
              Share Link
            </Button>
            <Button onClick={handleAssignPhotos} icon={<Wand2 size={18} />}>
              Assign Photos
            </Button>
          </div>
        </div>

        {/* Photo Upload Section */}
        <Card className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Upload Photos</h2>
          <PhotoUploader onUploadComplete={handleUploadComplete} />
        </Card>

        {/* Participants Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <ParticipantList participants={participants} photos={photos} />
          </Card>

          <Card>
            <PhotoGrid photos={photos} onRemovePhoto={handleRemovePhoto} />
          </Card>
        </div>

        {/* Exit Session Button */}
        <div className="mt-8 flex justify-end">
          <Button
            variant="outline"
            onClick={() => setShowEndConfirmation(true)}
            icon={<LogOut size={18} />}
            className="border-red-200 text-red-600 hover:bg-red-50"
          >
            End Session
          </Button>
        </div>

        {/* Exit Confirmation Modal */}
        <ConfirmationModal
          isOpen={showEndConfirmation}
          onClose={() => setShowEndConfirmation(false)}
          onConfirm={handleEndSession}
          title="End Session"
          message="Are you sure you want to end this session? This action cannot be undone."
        />

        {/* Manual Assignment Modal */}
        <ManualAssignmentModal
          isOpen={isManualAssignmentOpen}
          onClose={() => setIsManualAssignmentOpen(false)}
          participants={participants}
          photos={photos}
          onAssign={handleManualAssign}
        />
      </div>
    </Layout>
  );
};

export default AdminDashboard;
