import React from 'react';

type LandingPageProps = {
  onLogin: () => void;
  onSignup: () => void;
};

export const LandingPage = ({ onLogin, onSignup }: LandingPageProps) => {
  return (
    <div className="w-full min-h-screen bg-black text-white overflow-hidden flex flex-col">
      {/* Background elements */}
      <div className="absolute inset-0 bg-[radial-gradient(rgba(50,50,100,0.3)_1px,transparent_1px)] bg-[length:30px_30px]"></div>
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "url('https://uploadthingy.s3.us-west-1.amazonaws.com/x6oytuEoJemHChd9GBpdXt/7c31c03b3706341751888a0bb7d5b6b1.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          mixBlendMode: 'overlay'
        }}
      ></div>

      {/* Header */}
      <header className="relative z-10 p-4 flex justify-between items-center">
        <div className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500">
          TuBot
        </div>
        <div className="flex space-x-4">
          <button
            onClick={onLogin}
            className="px-4 py-2 text-cyan-300 hover:text-white transition-colors"
          >
            Sign In
          </button>
          <button
            onClick={onSignup}
            className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full hover:shadow-lg hover:shadow-cyan-500/25 transition-all"
          >
            Sign Up
          </button>
        </div>
      </header>

      {/* Hero section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 relative z-10">
        <div className="text-center max-w-4xl mx-auto mb-8">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500">
              Create your own personalized AI assistant
            </span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            With TuBot you can create, customize, and talk to your own artificial intelligence bots tailored to your specific needs.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={onSignup}
              className="px-8 py-4 text-lg bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full hover:shadow-lg hover:shadow-cyan-500/25 transition-all transform hover:scale-105"
              style={{
                boxShadow: '0 0 15px rgba(0, 255, 255, 0.5)'
              }}
            >
              Start Today
            </button>
            <button
              onClick={onLogin}
              className="px-8 py-4 text-lg border border-cyan-500 rounded-full hover:bg-cyan-900/20 transition-all"
            >
              Already a member?
            </button>
          </div>
        </div>

        {/* Features */}
        <div className="w-full max-w-5xl mx-auto grid md:grid-cols-3 gap-8 mt-16">
          <FeatureCard
            title="Total Customization"
            description="Define your bot's personality, knowledge, and behavior according to your needs."
          />
          <FeatureCard
            title="Easy Training"
            description="Upload documents and content so your bot learns exactly what you need."
          />
          <FeatureCard
            title="Natural Conversations"
            description="Enjoy smooth dialogues and accurate responses adapted to your context."
          />
        </div>

        {/* Floating TuBot Logo */}
        <div className="absolute bottom-10 right-10 opacity-50 hidden md:block">
          <div className="w-40 h-40">
            {/* Empty on purpose */}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 p-6 text-center text-gray-500 border-t border-gray-800">
        <p>© {new Date().getFullYear()} TuBot - Your personal assistant</p>
      </footer>
    </div>
  );
};

type FeatureCardProps = {
  title: string;
  description: string;
};

const FeatureCard = ({ title, description }: FeatureCardProps) => {
  return (
    <div
      className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6 hover:border-cyan-500/50 transition-all"
      style={{
        boxShadow: '0 0 20px rgba(0, 255, 255, 0.1)'
      }}
    >
      <h3 className="text-xl font-bold mb-3 text-cyan-300">{title}</h3>
      <p className="text-gray-300">{description}</p>
    </div>
  );
};
