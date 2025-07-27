import React from 'react';
import { ArrowLeftIcon } from 'lucide-react';
import { TuBotLogo } from './TuBotLogo';
type AuthLayoutProps = {
  children: React.ReactNode;
  onBack: () => void;
};
export const AuthLayout = ({
  children,
  onBack
}: AuthLayoutProps) => {
  return <div className="w-full min-h-screen bg-black text-white flex flex-col items-center justify-center relative">
      {/* Background elements */}
      <div className="absolute inset-0 bg-[radial-gradient(rgba(50,50,100,0.3)_1px,transparent_1px)] bg-[length:30px_30px]"></div>
      {/* Back button */}
      <button onClick={onBack} className="absolute top-4 left-4 p-2 flex items-center text-cyan-300 hover:text-white">
        <ArrowLeftIcon className="w-5 h-5 mr-1" />
        <span>Volver</span>
      </button>
      <div className="w-full max-w-md p-8 relative">
        <div className="absolute -top-32 left-1/2 transform -translate-x-1/2 w-24 h-24">
          <TuBotLogo />
        </div>
        {children}
      </div>
      {/* Decorative elements */}
      <div className="absolute bottom-10 right-10 w-3 h-3 bg-cyan-400 rounded-full animate-pulse" style={{
      boxShadow: '0 0 10px rgba(0, 255, 255, 0.8)'
    }}></div>
      <div className="absolute top-20 left-20 w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{
      boxShadow: '0 0 10px rgba(255, 0, 255, 0.8)',
      animationDelay: '1s'
    }}></div>
    </div>;
};