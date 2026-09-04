import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import Card from "../components/Card";
import Button from "../components/Button";
import ConfirmationModal from "../components/ConfirmationModal";
import { useSession } from "../context/SessionContext";
import { Image, Camera, LogOut } from "lucide-react";

const ParticipantView: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const {
    currentSession,
    participants,
    photos,
    isAdmin,
    clearSession,
    socket,
    isSessionEnded,
    setIsSessionEnded,
  } = useSession();

  const [showPhoto, setShowPhoto] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showExitConfirmation, setShowExitConfirmation] = useState(false);
  const [showSessionEnded, setShowSessionEnded] = useState(false);

  // Find current participant using name
  const participantName = localStorage.getItem("participantName");
  const currentParticipant = participantName
    ? participants.find((p) => p.name === participantName)
    : null;

  // Find assigned photo
  const assignedPhoto = currentParticipant?.photo_assigned
    ? photos.find((photo) => photo.id === currentParticipant.photo_assigned)
    : null;

  // Reset showPhoto when photo assignment changes
  useEffect(() => {
    if (currentParticipant?.photo_assigned) {
      setShowPhoto(true);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  }, [currentParticipant?.photo_assigned]);

  // Effect to handle session ended state
  useEffect(() => {
    if (isSessionEnded) {
      setShowSessionEnded(true);
    }
  }, [isSessionEnded]);

  // Session and participant validation
  useEffect(() => {
    const validateSession = async () => {
      try {
        if (!code) {
          throw new Error("No session code provided");
        }

        if (!currentSession) {
          throw new Error("Session not found");
        }

        if (currentSession.code !== code) {
          throw new Error("Session code mismatch");
        }

        if (isAdmin) {
          navigate("/admin");
          return;
        }

        if (!participantName) {
          throw new Error("No participant name found");
        }

        if (!currentParticipant) {
          throw new Error("Participant not found in session");
        }

        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        clearSession();
        navigate("/join");
      } finally {
        setIsLoading(false);
      }
    };

    validateSession();
  }, [
    code,
    currentSession,
    isAdmin,
    participantName,
    currentParticipant,
    navigate,
    clearSession,
  ]);

  // Loading state
  if (isLoading) {
    return (
      <Layout title="Loading..." showBack={true} backTo="/join">
        <div className="text-center my-12">
          <p>Loading session information...</p>
        </div>
      </Layout>
    );
  }

  // Error state
  if (error || !currentParticipant) {
    return (
      <Layout title="Error" showBack={true} backTo="/join">
        <div className="text-center my-12">
          <p className="text-red-600">
            {error || "Unable to find your participant information"}
          </p>
          <div className="mt-4 p-4 bg-gray-100 rounded">
            <p>Debug Info:</p>
            <p>Name: {participantName || "Not found"}</p>
            <p>Participants: {participants.length}</p>
            <p>Session Code: {code}</p>
          </div>
          <Button onClick={() => navigate("/join")} className="mt-4">
            Return to Join Page
          </Button>
        </div>
      </Layout>
    );
  }

  const handleRevealPhoto = () => {
    setShowPhoto(true);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  };

  const handleEndSession = async () => {
    if (currentParticipant && socket) {
      try {
        console.log("Emitting participant_left event:", {
          code: currentSession?.code,
          participantId: currentParticipant.id,
        });

        // Emit participant_left event before clearing session
        socket.emit("participant_left", {
          code: currentSession?.code,
          participantId: currentParticipant.id,
        });

        // Wait a bit to ensure the event is processed
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error) {
        console.error("Error emitting participant_left event:", error);
      }
    }
    await clearSession();
    navigate("/");
  };

  const handleSessionEnded = async () => {
    await clearSession();
    setIsSessionEnded(false);
    navigate("/");
  };

  return (
    <Layout title={currentSession?.name || "Session"}>
      <div className="max-w-lg mx-auto">
        {/* <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={() => setShowExitConfirmation(true)}
              icon={<LogOut size={18} />}
              className="border-red-200 text-red-600 hover:bg-red-50"
            >
              Exit Session
            </Button>
          </div>
        </div> */}

        <div className="flex justify-end mb-8">
          <Button
            variant="outline"
            onClick={() => setShowExitConfirmation(true)}
            icon={<LogOut size={18} />}
            className="border-red-200 text-red-600 hover:bg-red-50"
          >
            Exit Session
          </Button>
        </div>

        <Card className="my-6 text-center">
          <h2 className="text-xl font-semibold mb-2">
            Welcome, {currentParticipant.name}!
          </h2>
          <p className="text-gray-600 mb-4">
            {currentParticipant.photo_assigned
              ? "You have been assigned a photo!"
              : "Waiting for the admin to assign photos..."}
          </p>

          {currentParticipant.photo_assigned &&
            !showPhoto &&
            /* Commented out for future use
            <Button
              onClick={handleRevealPhoto}
              icon={<Camera size={18} />}
              className="animate-pulse"
            >
              Reveal Your Photo
            </Button>
            */
            null}

          {!currentParticipant.photo_assigned && (
            <div className="flex items-center justify-center h-48 bg-gray-100 rounded-lg mb-4">
              <div className="text-center">
                <Image className="h-12 w-12 mx-auto text-gray-400" />
                <p className="text-gray-500 mt-2">
                  Waiting for photo assignment...
                </p>
              </div>
            </div>
          )}
        </Card>

        {showPhoto && assignedPhoto && (
          <div className="mt-8 transition-all duration-500 ease-in-out transform scale-100">
            <Card className="overflow-hidden">
              <div className="relative">
                <img
                  src={assignedPhoto.url}
                  alt={assignedPhoto.title}
                  className="w-full h-auto rounded-lg"
                />
              </div>
            </Card>
          </div>
        )}

        {showConfetti && (
          <>
            <style>{`
              @keyframes fall {
                0% {
                  transform: translateY(-20px) rotate(0deg);
                  opacity: 1;
                }
                100% {
                  transform: translateY(100vh) rotate(720deg);
                  opacity: 0;
                }
              }
            `}</style>
            <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
              {Array.from({ length: 50 }).map((_, i) => {
                const size = Math.floor(Math.random() * 15) + 5;
                const left = Math.floor(Math.random() * 100);
                const animationDuration = Math.floor(Math.random() * 3) + 2;
                const delay = Math.random() * 1.5;
                const color = [
                  "bg-red-500",
                  "bg-blue-500",
                  "bg-green-500",
                  "bg-yellow-500",
                  "bg-purple-500",
                  "bg-pink-500",
                ][Math.floor(Math.random() * 6)];

                return (
                  <div
                    key={i}
                    className={`absolute ${color} rounded-full`}
                    style={{
                      width: `${size}px`,
                      height: `${size}px`,
                      left: `${left}%`,
                      top: "-20px",
                      animation: `fall ${animationDuration}s ease-in forwards ${delay}s`,
                    }}
                  ></div>
                );
              })}
            </div>
          </>
        )}
      </div>

      <ConfirmationModal
        isOpen={showExitConfirmation}
        onClose={() => setShowExitConfirmation(false)}
        onConfirm={handleEndSession}
        title="Exit Session"
        message="Are you sure you want to exit this session? You will need to rejoin if you want to participate again."
        confirmText="Exit Session"
        cancelText="Stay"
      />

      <ConfirmationModal
        isOpen={showSessionEnded}
        onClose={handleSessionEnded}
        onConfirm={handleSessionEnded}
        title="Session Ended"
        message="The admin has ended this session. You will be redirected to the home page."
        confirmText="OK"
        showCancel={false}
      />
    </Layout>
  );
};

export default ParticipantView;
