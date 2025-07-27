import React, { useEffect, useState } from 'react';
import { TuBotLogo } from './components/TuBotLogo';
import { BotSphere } from './components/BotSphere';
import { CreateBotButton } from './components/CreateBotButton';
import { BotCreationModal } from './components/BotCreationModal';
import { ChatWindow } from './components/ChatWindow';
import { LandingPage } from './components/LandingPage';
import { LoginForm } from './components/LoginForm';
import { SignupForm } from './components/SignupForm';
import { AuthLayout } from './components/AuthLayout';
export type Bot = {
  id: string;
  name: string;
  personality: string;
  documents: string[];
  color: string;
};
export type User = {
  id: string;
  username: string;
  email: string;
};
export function App() {
  const [bots, setBots] = useState<Bot[]>([]);
  const [isCreatingBot, setIsCreatingBot] = useState(false);
  const [selectedBot, setSelectedBot] = useState<Bot | null>(null);
  const [authState, setAuthState] = useState<'landing' | 'login' | 'signup' | 'dashboard'>('landing');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [maxBotsReached, setMaxBotsReached] = useState(false);
  const MAX_BOTS = 8;
  // Simulate checking if user is logged in
  useEffect(() => {
    const savedUser = localStorage.getItem('tubot_user');
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
        setAuthState('dashboard');
      } catch (e) {
        // Invalid stored data
        localStorage.removeItem('tubot_user');
      }
    }
  }, []);
  // Check if max bots limit is reached
  useEffect(() => {
    setMaxBotsReached(bots.length >= MAX_BOTS);
  }, [bots]);
  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('tubot_user', JSON.stringify(user));
    setAuthState('dashboard');
  };
  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('tubot_user');
    setAuthState('landing');
  };
  const createBot = (bot: Omit<Bot, 'id' | 'color'>) => {
    // Check if we've reached the maximum number of bots
    if (bots.length >= MAX_BOTS) {
      return;
    }
    const newBot: Bot = {
      ...bot,
      id: Date.now().toString(),
      color: getRandomNeonColor()
    };
    setBots([...bots, newBot]);
    setIsCreatingBot(false);
  };
  const deleteBot = (id: string) => {
    setBots(bots.filter(bot => bot.id !== id));
    if (selectedBot?.id === id) {
      setSelectedBot(null);
    }
  };
  const updateBot = (updatedBot: Bot) => {
    setBots(bots.map(bot => bot.id === updatedBot.id ? updatedBot : bot));
    if (selectedBot?.id === updatedBot.id) {
      setSelectedBot(updatedBot);
    }
  };
  const getRandomNeonColor = () => {
    const neonColors = ['#00ffff', '#ff00ff', '#ff3300', '#00ff00', '#ffff00', '#ff00aa' // pink
    ];
    return neonColors[Math.floor(Math.random() * neonColors.length)];
  };
  // Render different screens based on auth state
  if (authState === 'landing') {
    return <LandingPage onLogin={() => setAuthState('login')} onSignup={() => setAuthState('signup')} />;
  }
  if (authState === 'login') {
    return <AuthLayout onBack={() => setAuthState('landing')}>
        <LoginForm onLogin={handleLogin} onSignupClick={() => setAuthState('signup')} />
      </AuthLayout>;
  }
  if (authState === 'signup') {
    return <AuthLayout onBack={() => setAuthState('landing')}>
        <SignupForm onSignup={handleLogin} onLoginClick={() => setAuthState('login')} />
      </AuthLayout>;
  }
  // Dashboard view (original app content)
  return <div className="w-full min-h-screen bg-black bg-opacity-95 text-white overflow-hidden flex flex-col items-center justify-center relative">
      {/* Background grid effect */}
      <div className="absolute inset-0 bg-[radial-gradient(rgba(50,50,100,0.3)_1px,transparent_1px)] bg-[length:30px_30px]"></div>
      {/* Header with logout */}
      <div className="absolute top-0 w-full flex justify-between items-center p-4 z-20">
        <div className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500">
          TuBot
        </div>
        {currentUser && <div className="flex items-center space-x-4">
            <span className="text-cyan-300">Hola, {currentUser.username}</span>
            <button onClick={handleLogout} className="px-4 py-1 bg-gray-800 hover:bg-gray-700 rounded-full text-sm">
              Cerrar sesión
            </button>
          </div>}
      </div>
      {/* Main content */}
      <div className="z-10 w-full h-full flex flex-col items-center justify-center p-4 pt-16">
        {selectedBot ? <ChatWindow bot={selectedBot} onClose={() => setSelectedBot(null)} onDelete={deleteBot} onUpdate={updateBot} /> : <>
            <TuBotLogo />
            <div className="relative w-full max-w-4xl h-[400px] my-8">
              {bots.length > 0 ? <div className="absolute inset-0 flex items-center justify-center">
                  {bots.map((bot, index) => <BotSphere key={bot.id} bot={bot} index={index} total={Math.min(bots.length, MAX_BOTS)} onClick={() => setSelectedBot(bot)} />)}
                </div> : <div className="absolute inset-0 flex items-center justify-center flex-col space-y-6">
                  <p className="text-cyan-300 text-xl">
                    No tienes bots creados aún
                  </p>
                  <CreateBotButton onClick={() => setIsCreatingBot(true)} />
                </div>}
            </div>
            {bots.length > 0 && <div className="mt-4">
                {maxBotsReached ? <p className="text-amber-400 text-center mb-2">
                    Has alcanzado el límite máximo de 8 bots
                  </p> : <CreateBotButton onClick={() => setIsCreatingBot(true)} />}
              </div>}
          </>}
      </div>
      {isCreatingBot && !maxBotsReached && <BotCreationModal onClose={() => setIsCreatingBot(false)} onSave={createBot} />}
    </div>;
}