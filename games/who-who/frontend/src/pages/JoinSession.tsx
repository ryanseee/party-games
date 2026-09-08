import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import Layout from "../components/Layout";
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
    undefined,
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

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Strip out dashes and non-alphanumeric characters, then convert to uppercase
    const rawValue = e.target.value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();

    // Enforce maximum 6 characters length
    if (rawValue.length <= 6) {
      setSessionCode(rawValue);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNameError(undefined);
    setCodeError(undefined);
    setGeneralError(undefined);
    setIsLoading(true);

    // Validate both fields
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
      // If successful, socket session_joined event handles navigation
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      setGeneralError(
        error instanceof Error ? error.message : "Failed to join session",
      );
      setIsLoading(false);
    }
  };

  // Timeout fallback for loading state
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (isLoading) {
      timeoutId = setTimeout(() => {
        setIsLoading(false);
        setGeneralError("Failed to join session. Please try again.");
      }, 5000);
    }
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isLoading]);

  return (
    <Layout title="Join Session">
      <div className="w-full max-w-xl mx-auto py-4 sm:py-8">
        {/* Back navigation */}
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 font-['JetBrains_Mono'] text-xs text-[#06080c] uppercase tracking-wider hover:bg-[#edeef0] px-3 py-1.5 border-2 border-[#06080c] bg-white shadow-[3px_3px_0px_#06080c] transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-none font-bold"
          >
            <span className="material-symbols-outlined text-[16px]">
              arrow_back
            </span>
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Main Join Form Card */}
        <div className="bg-white border-2 border-[#06080c] shadow-[6px_6px_0px_#06080c] p-6 sm:p-8">
          {/* Card Header Strip */}
          <div className="border-b-2 border-[#06080c] pb-4 mb-6">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="font-['JetBrains_Mono'] text-[10px] uppercase tracking-widest text-[#45474b] bg-[#edeef0] px-2 py-0.5 border border-[#06080c] font-bold">
                SESSION AUTH // 01
              </span>
              <span className="inline-block w-2.5 h-2.5 bg-[#06080c]" />
            </div>
            <h1 className="font-['Space_Mono'] text-2xl sm:text-3xl text-[#06080c] tracking-tight uppercase font-bold">
              Join a Who Who Game
            </h1>
            <p className="font-['JetBrains_Mono'] text-sm text-[#585f69] mt-1">
              Enter your details to join the party session
            </p>
          </div>

          {/* Form */}
          <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
            {/* Field 1: Your Name */}
            <div className="flex flex-col gap-1.5">
              <label
                className="font-['JetBrains_Mono'] text-xs uppercase tracking-wider text-[#06080c] flex items-center justify-between font-bold"
                htmlFor="playerName"
              >
                <span>Your Name</span>
                <span className="text-[#45474b] font-['JetBrains_Mono'] text-[10px]">
                  [REQUIRED]
                </span>
              </label>
              <input
                id="playerName"
                type="text"
                maxLength={20}
                required
                autoFocus
                disabled={isLoading}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex"
                className={`w-full bg-white text-[#06080c] font-['JetBrains_Mono'] text-base px-4 py-3 border-2 border-[#06080c] shadow-[2px_2px_0px_#06080c] focus:outline-none focus:shadow-[4px_4px_0px_#06080c] transition-shadow placeholder:text-[#76777b] ${
                  nameError ? "border-[#ba1a1a]" : ""
                }`}
              />
              {nameError && (
                <span className="font-['JetBrains_Mono'] text-xs text-[#ba1a1a] font-bold mt-1">
                  {nameError}
                </span>
              )}
            </div>

            {/* Field 2: Session Code */}
            <div className="flex flex-col gap-1.5">
              <label
                className="font-['JetBrains_Mono'] text-xs uppercase tracking-wider text-[#06080c] flex items-center justify-between font-bold"
                htmlFor="sessionCode"
              >
                <span>Session Code</span>
                <span className="text-[#45474b] font-['JetBrains_Mono'] text-[10px]">
                  [6 CHARACTERS]
                </span>
              </label>
              <input
                id="sessionCode"
                type="text"
                maxLength={7}
                required
                spellCheck={false}
                autoComplete="off"
                disabled={isLoading}
                value={sessionCode}
                onChange={handleCodeChange}
                placeholder="6-CHAR CODE"
                className={`w-full uppercase tracking-widest font-['Space_Mono'] text-lg text-[#06080c] bg-white px-4 py-3 border-2 border-[#06080c] shadow-[2px_2px_0px_#06080c] focus:outline-none focus:shadow-[4px_4px_0px_#06080c] transition-shadow placeholder:text-[#76777b] placeholder:font-['JetBrains_Mono'] placeholder:text-sm placeholder:tracking-normal font-bold ${
                  codeError ? "border-[#ba1a1a]" : ""
                }`}
              />
              {codeError && (
                <span className="font-['JetBrains_Mono'] text-xs text-[#ba1a1a] font-bold mt-1">
                  {codeError}
                </span>
              )}
            </div>

            {/* General Error Banner */}
            {generalError && (
              <div className="bg-[#ffdad6] border-2 border-[#ba1a1a] p-3 text-[#93000a] font-['JetBrains_Mono'] text-xs font-bold shadow-[2px_2px_0px_#ba1a1a]">
                {generalError}
              </div>
            )}

            {/* Helper Note Box */}
            <div className="bg-[#f3f4f6] border-2 border-[#06080c] p-3 flex items-start gap-2">
              <div className="mt-0.5 text-[#06080c] flex-shrink-0">
                <span className="material-symbols-outlined text-[18px]">
                  info
                </span>
              </div>
              <div className="flex-1">
                <p className="font-['JetBrains_Mono'] text-xs text-[#06080c] leading-tight">
                  <span className="font-bold uppercase text-[10px]">Note:</span>{" "}
                  Session code is case-insensitive.
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!name.trim() || !sessionCode.trim() || isLoading}
              className="w-full mt-1 bg-[#06080c] text-white font-['Space_Mono'] text-base uppercase tracking-wider py-4 border-2 border-[#06080c] shadow-[4px_4px_0px_#76777b] hover:bg-[#1e2024] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent animate-spin" />
                  <span>[ CONNECTING... ]</span>
                </>
              ) : (
                <>
                  <LogIn size={18} />
                  <span>[ Join Session ]</span>
                </>
              )}
            </button>
          </form>

          {/* Footer Info */}
          <div className="mt-8 pt-4 border-t-2 border-[#06080c] text-center">
            <p className="font-['JetBrains_Mono'] text-sm text-[#45474b]">
              Don&apos;t have a code?{" "}
              <span className="text-[#06080c] font-bold">
                Ask the session admin for the code.
              </span>
            </p>
          </div>
        </div>

        {/* Status Bar */}
        <div className="mt-4 flex items-center justify-between text-[#45474b] font-['JetBrains_Mono'] text-[10px] uppercase px-1 font-bold">
          <span>SERVER: SYNCED</span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 bg-[#06080c] inline-block" />
            GATEWAY READY
          </span>
        </div>
      </div>
    </Layout>
  );
};

export default JoinSession;
