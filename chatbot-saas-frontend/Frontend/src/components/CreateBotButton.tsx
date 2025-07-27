import React from 'react';
import { PlusIcon } from 'lucide-react';
type CreateBotButtonProps = {
  onClick: () => void;
};
export const CreateBotButton = ({
  onClick
}: CreateBotButtonProps) => {
  return <button onClick={onClick} className="group bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-6 py-3 rounded-full flex items-center space-x-2 transition-all hover:shadow-lg hover:shadow-cyan-500/25 hover:scale-105 active:scale-95" style={{
    boxShadow: '0 0 15px rgba(0, 255, 255, 0.5)'
  }}>
      <PlusIcon className="w-5 h-5 group-hover:rotate-90 transition-transform" />
      <span className="font-medium">Crear tu Bot</span>
    </button>;
};