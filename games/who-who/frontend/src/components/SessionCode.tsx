import React, { useState } from "react";
import Card from "./Card";
import Button from "./Button";
import { Copy, Check } from "lucide-react";

interface SessionCodeProps {
  code: string;
}

const SessionCode: React.FC<SessionCodeProps> = ({ code }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    // Create a temporary input element
    const tempInput = document.createElement("input");
    tempInput.value = code;
    tempInput.style.position = "fixed";
    tempInput.style.opacity = "0";
    document.body.appendChild(tempInput);

    // Select and copy the text
    tempInput.select();
    tempInput.setSelectionRange(0, 99999); // For mobile devices
    document.execCommand("copy");

    // Clean up
    document.body.removeChild(tempInput);

    // Show feedback
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <Card className="bg-indigo-50 border border-indigo-100">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-medium text-indigo-800">Session Code</h3>
          <p className="text-2xl font-bold tracking-wide text-indigo-700 mt-1">
            {code}
          </p>
          <p className="text-xs text-indigo-600 mt-1">
            Share this code with participants to join
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={copyToClipboard}
          icon={copied ? <Check size={16} /> : <Copy size={16} />}
        >
          {copied ? "Copied!" : "Copy Code"}
        </Button>
      </div>
    </Card>
  );
};

export default SessionCode;
