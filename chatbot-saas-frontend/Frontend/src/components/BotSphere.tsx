import React from 'react';
import { Bot } from '../App';
type BotSphereProps = {
  bot: Bot;
  index: number;
  total: number;
  onClick: () => void;
};
export const BotSphere = ({
  bot,
  index,
  total,
  onClick
}: BotSphereProps) => {
  // Calculate position in a symmetrical pattern
  // For 8 positions maximum in a perfect circle
  const maxPositions = 8;
  const angleStep = 2 * Math.PI / maxPositions;
  const angle = index * angleStep;
  // Fixed radius for consistent spacing
  const radius = 180;
  const x = Math.cos(angle) * radius;
  const y = Math.sin(angle) * radius;
  // Calculate animation delay based on position
  const animDelay = index / maxPositions * 4;
  return <div className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform hover:scale-110" style={{
    left: `calc(50% + ${x}px)`,
    top: `calc(50% + ${y}px)`,
    animation: `float 4s infinite ease-in-out`,
    animationDelay: `${animDelay}s`
  }} onClick={onClick}>
      <div className="w-20 h-20 rounded-full flex items-center justify-center text-center" style={{
      backgroundColor: 'rgba(10, 20, 40, 0.7)',
      boxShadow: `0 0 15px ${bot.color}, inset 0 0 8px ${bot.color}`,
      border: `2px solid ${bot.color}`
    }}>
        <span className="text-sm font-medium">{bot.name}</span>
      </div>
    </div>;
};