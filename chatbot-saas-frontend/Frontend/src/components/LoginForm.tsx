import { useState } from 'react';
import { User } from '../App';
import { supabase } from '../lib/supabase'; 

type LoginFormProps = {
  onLogin: (user: User) => void;
  onSignupClick: () => void;
};

export const LoginForm = ({ onLogin, onSignupClick }: LoginFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) {
        throw authError;
      }

      if (!data.user) {
        throw new Error('Login failed');
      }

      // Obtener información adicional del perfil
      const { data: profileData } = await supabase
        .from('profiles')
        .select('username')
        .eq('user_id', data.user.id)
        .single();

      onLogin({
        id: data.user.id,
        username: profileData?.username || email.split('@')[0],
        email
      });

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="bg-gray-900/70 backdrop-blur-sm border border-gray-800 rounded-xl p-8"
      style={{
        boxShadow: '0 0 30px rgba(0, 255, 255, 0.15)'
      }}
    >
      <h2 className="text-2xl font-bold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
        Sign In
      </h2>
      {error && (
        <div className="bg-red-900/50 border border-red-800 text-red-200 px-4 py-2 rounded-lg mb-4">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-cyan-300 mb-1">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            placeholder="you@email.com"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-cyan-300 mb-1">
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            placeholder="••••••••"
          />
        </div>
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-md font-medium ${
              loading ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-lg hover:shadow-cyan-500/25'
            }`}
          >
            {loading ? 'Signing in...' : 'Enter Dashboard'}
          </button>
        </div>
      </form>
      <div className="mt-6 text-center text-gray-400">
        <p>
          Don't have an account?{' '}
          <button 
            onClick={onSignupClick} 
            className="text-cyan-400 hover:text-cyan-300"
            disabled={loading}
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
};