import React from 'react';
import styled from 'styled-components';

export const TuBotLogo = () => {
  return (
    <StyledWrapper>
      <div className="loader-container">
        <div className="sphere-core" />
        <div className="ring ring-1" />
        <div className="ring ring-2" />
        <div className="ring ring-3" />
      </div>
      <div className="static-text">TuBot</div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;

  .loader-container {
    position: relative;
    width: 240px;
    height: 240px;
    perspective: 800px;
    transform-style: preserve-3d;
  }

  .sphere-core {
    position: absolute;
    width: 100px;
    height: 100px;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: radial-gradient(circle at 40% 40%, #00eaff, #6600ff);
    border-radius: 50%;
    box-shadow: 0 0 25px rgba(0, 234, 255, 0.5);
    animation: pulse 2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
  }

  .ring {
    position: absolute;
    width: 100%;
    height: 100%;
    border: 2px solid rgba(0, 234, 255, 0.7);
    border-radius: 50%;
    box-shadow: 0 0 15px rgba(0, 234, 255, 0.3);
    transform-style: preserve-3d;
  }

  .ring-1 {
    animation: rotateX 2.5s ease-in-out infinite;
  }

  .ring-2 {
    animation: rotateY 2s ease-in-out infinite;
    width: 180px;
    height: 180px;
    top: 30px;
    left: 30px;
    border-color: rgba(0, 234, 255, 0.5);
  }

  .ring-3 {
    animation: rotateXY 3s ease-in-out infinite;
    width: 140px;
    height: 140px;
    top: 50px;
    left: 50px;
    border-color: rgba(0, 234, 255, 0.3);
  }

  .static-text {
    margin-top: 1.5rem;
    font-size: 2.3rem;
    font-weight: bold;
    color: white;
    text-shadow: 0 0 15px #00eaff;
  }

  @keyframes rotateX {
    0% { transform: rotateX(0deg); }
    50% { transform: rotateX(180deg); }
    100% { transform: rotateX(360deg); }
  }

  @keyframes rotateY {
    0% { transform: rotateY(0deg); }
    50% { transform: rotateY(180deg); }
    100% { transform: rotateY(360deg); }
  }

  @keyframes rotateXY {
    0% { transform: rotateX(0deg) rotateY(0deg); }
    50% { transform: rotateX(90deg) rotateY(180deg); }
    100% { transform: rotateX(360deg) rotateY(360deg); }
  }

  @keyframes pulse {
    0%, 100% {
      transform: translate(-50%, -50%) scale(1);
      box-shadow: 0 0 25px rgba(0, 234, 255, 0.5);
    }
    50% {
      transform: translate(-50%, -50%) scale(1.1);
      box-shadow: 0 0 35px rgba(0, 234, 255, 0.7);
    }
  }
`;