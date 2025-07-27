import React, { useEffect, useRef } from 'react';
export const TuBotLogo = () => {
  const logoRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const interval = setInterval(() => {
      if (logoRef.current) {
        const currentRotation = parseFloat(logoRef.current.dataset.rotation || '0');
        const newRotation = currentRotation + 0.2;
        logoRef.current.style.transform = `rotate(${newRotation}deg)`;
        logoRef.current.dataset.rotation = newRotation.toString();
      }
    }, 30);
    return () => clearInterval(interval);
  }, []);
  return <div className="relative flex items-center justify-center">
      {/* Outer ring */}
      <div ref={logoRef} className="w-64 h-64 rounded-full border-4 border-cyan-400 flex items-center justify-center" style={{
      boxShadow: '0 0 25px rgba(0, 255, 255, 0.5), inset 0 0 15px rgba(0, 255, 255, 0.3)',
      background: 'radial-gradient(circle, rgba(0,30,60,0.8) 0%, rgba(0,10,20,0.9) 100%)'
    }} data-rotation="0">
        {/* Robot image */}
        <div className="absolute inset-0 flex items-center justify-center">
          <img src="/pasted-image.jpg" alt="Robot assistant" className="w-48 h-48 object-contain rounded-full opacity-90" style={{
          filter: 'drop-shadow(0 0 8px rgba(0, 255, 255, 0.7))'
        }} />
        </div>
        {/* Inner content (text overlay) */}
        <div className="text-center z-10 absolute bottom-4">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500">
            TuBot
          </h1>
          <p className="text-cyan-300 text-sm mt-1">Tu asistente personal</p>
        </div>
      </div>
      {/* Glowing effect */}
      <div className="absolute w-72 h-72 rounded-full animate-pulse" style={{
      background: 'radial-gradient(circle, rgba(0,255,255,0.2) 0%, rgba(0,0,0,0) 70%)',
      animationDuration: '3s'
    }}></div>
      {/* Orbiting particles */}
      <div className="absolute w-3 h-3 bg-cyan-400 rounded-full animate-orbit" style={{
      boxShadow: '0 0 10px rgba(0, 255, 255, 0.8)',
      animationDuration: '8s'
    }}></div>
      <div className="absolute w-2 h-2 bg-blue-500 rounded-full animate-orbit" style={{
      boxShadow: '0 0 8px rgba(59, 130, 246, 0.8)',
      animationDuration: '12s',
      animationDelay: '1s',
      transform: 'rotate(120deg) translateX(140px) rotate(-120deg)'
    }}></div>
    </div>;
};