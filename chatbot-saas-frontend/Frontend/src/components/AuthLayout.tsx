import React from "react";
import { ArrowLeftIcon } from "lucide-react";

type AuthLayoutProps = {
  children: React.ReactNode;
  onBack: () => void;
  /** Optional background decorations (disabled by default) */
  showDecor?: boolean;
  /** Optional top logo (hidden by default) */
  showLogo?: boolean;
};

export const AuthLayout = ({
  children,
  onBack,
  showDecor = false,
  showLogo = false,
}: AuthLayoutProps) => {
  return (
    <div className="w-full min-h-screen bg-black text-white flex flex-col items-center justify-center relative overflow-hidden">
      {/* Optional background (disabled by default) */}
      {showDecor && (
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "radial-gradient(rgba(50,50,100,0.3) 1px, transparent 1px)",
            backgroundSize: "30px 30px",
          }}
        />
      )}

      {/* Back button */}
      <button onClick={onBack} className="absolute top-4 left-4 p-2 flex items-center text-cyan-300 hover:text-white z-10">
        <ArrowLeftIcon className="w-5 h-5 mr-1" />
        <span>Back</span>
      </button>

      {/* Card */}
      <div className="w-full max-w-md p-8 relative z-10">
        {/* Top logo (hidden by default) */}
        {showLogo && (
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-24 h-24">{/* <TuBotLogo /> */}</div>
        )}
        {children}
      </div>

      {/* Decorative lights (hidden by default) */}
      {showDecor && (
        <>
          <div
            className="absolute bottom-10 right-10 w-3 h-3 bg-cyan-400 rounded-full animate-pulse"
            style={{ boxShadow: "0 0 10px rgba(0, 255, 255, 0.8)" }}
          />
          <div
            className="absolute top-20 left-20 w-2 h-2 bg-purple-500 rounded-full animate-pulse"
            style={{ boxShadow: "0 0 10px rgba(255, 0, 255, 0.8)", animationDelay: "1s" }}
          />
        </>
      )}
    </div>
  );
};

