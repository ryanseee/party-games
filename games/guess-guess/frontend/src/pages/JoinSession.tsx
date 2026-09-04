import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Layout from "../components/Layout";
import Card from "../components/Card";
import Input from "../components/Input";
import Button from "../components/Button";
import { useSession } from "../context/SessionContext";
import { LogIn } from "lucide-react";
import {
  validateSessionCode,
  validateParticipantName,
} from "../utils/validation";

const JoinSession: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { joinSession, currentSession, isAdmin } = useSession();

  const [name, setName] = useState("");
  const [sessionCode, setSessionCode] = useState("");
  const [nameError, setNameError] = useState<string | undefined>(undefined);
  const [codeError, setCodeError] = useState<string | undefined>(undefined);
  const [generalError, setGeneralError] = useState<string | undefined>(
    undefined
  );
  const [isLoading, setIsLoading] = useState(false);

  // Extract code from URL if present
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const codeFromUrl = params.get("code");
    if (codeFromUrl) {
      const validation = validateSessionCode(codeFromUrl);
      if (validation.isValid) {
        setSessionCode(codeFromUrl.toUpperCase());
      }
    }
  }, [location]);

  // Redirect if already in a session
  useEffect(() => {
    if (currentSession) {
      if (isAdmin) {
        navigate("/admin");
      } else {
        navigate(`/participant/${currentSession.code}`);
      }
    }
  }, [currentSession, isAdmin, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNameError(undefined);
    setCodeError(undefined);
    setGeneralError(undefined);
    setIsLoading(true);

    // Validate both fields at once
    const nameValidation = validateParticipantName(name);
    const codeValidation = validateSessionCode(sessionCode);

    let hasErrors = false;

    if (!nameValidation.isValid) {
      setNameError(nameValidation.error);
      hasErrors = true;
    }

    if (!codeValidation.isValid) {
      setCodeError(codeValidation.error);
      hasErrors = true;
    }

    if (hasErrors) {
      setIsLoading(false);
      return;
    }

    try {
      console.log("Attempting to join session:", { name, sessionCode });
      const result = await joinSession(sessionCode.trim(), name.trim(), false);
      console.log("Join session result:", result);

      if (!result.success) {
        setGeneralError(result.error || "Failed to join session");
        setIsLoading(false);
      }
      // If successful, the session_joined event will handle navigation
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      setGeneralError(
        error instanceof Error ? error.message : "Failed to join session"
      );
      setIsLoading(false);
    }
  };

  // Add a timeout to reset loading state if navigation doesn't happen
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (isLoading) {
      timeoutId = setTimeout(() => {
        setIsLoading(false);
        setGeneralError("Failed to join session. Please try again.");
      }, 5000); // 5 second timeout
    }
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isLoading]);

  return (
    <Layout title="Join Session" showBack={true}>
      <div className="max-w-md mx-auto">
        <Card className="my-8 glass-card">
          <form onSubmit={handleSubmit} className="space-y-6">
            <h1 className="text-3xl font-light text-gray-800 mb-2">
              Join a CaiCai Game
            </h1>

            <Input
              label="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              required
              autoFocus
              error={nameError}
              className="bg-white/50"
              disabled={isLoading}
            />

            <Input
              label="Session Code"
              value={sessionCode}
              onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
              placeholder="Enter the 6-character code"
              required
              error={codeError}
              className="bg-white/50"
              disabled={isLoading}
            />

            {generalError && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-100">
                {generalError}
              </div>
            )}

            <Button
              type="submit"
              fullWidth
              icon={<LogIn size={18} />}
              disabled={!name.trim() || !sessionCode.trim() || isLoading}
              className="bg-indigo-500 hover:bg-indigo-600 text-white"
            >
              {isLoading ? "Joining..." : "Join Session"}
            </Button>
          </form>
        </Card>

        <div className="text-center mt-4 text-gray-500 text-sm">
          <p>Don't have a code? Ask the session admin for the code.</p>
        </div>
      </div>
    </Layout>
  );
};

export default JoinSession;
