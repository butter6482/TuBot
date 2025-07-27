import React, { useState } from 'react';
import { User } from '../App';
import { supabase } from '../lib/supabase'; // o la ruta correcta

type SignupFormProps = {
  onSignup: (user: User) => void;
  onLoginClick: () => void;
};

export const SignupForm = ({ onSignup, onLoginClick }: SignupFormProps) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');

  if (!username || !email || !password) {
    setError('Please fill in all fields');
    return;
  }

  if (password !== confirmPassword) {
    setError('Passwords do not match');
    return;
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username }
      }
    });

    if (error) throw error;

    const user = data.user;
    if (!user) throw new Error('No user returned');

    // Guardar datos adicionales en tabla 'profiles'
    await supabase.from('profiles').upsert({
      user_id: user.id,
      username,
      email
    });

    onSignup({ id: user.id, username, email });
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Signup failed');
  }
};


  return (
    <div
      className="bg-gray-900/70 backdrop-blur-sm border border-gray-800 rounded-xl p-8"
      style={{ boxShadow: '0 0 30px rgba(0, 255, 255, 0.15)' }}
    >
      <h2 className="text-2xl font-bold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
        Create Account
      </h2>
      {error && (
        <div className="bg-red-900/50 border border-red-800 text-red-200 px-4 py-2 rounded-lg mb-4">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-cyan-300 mb-1">
            Username
          </label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            placeholder="Your username"
          />
        </div>
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
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-cyan-300 mb-1">
            Confirm Password
          </label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            placeholder="••••••••"
          />
        </div>
        <div className="pt-2">
          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-md hover:shadow-lg hover:shadow-cyan-500/25 font-medium"
          >
            Create account and access
          </button>
        </div>
      </form>
      <div className="mt-6 text-center text-gray-400">
        <p>
          Already have an account?{' '}
          <button onClick={onLoginClick} className="text-cyan-400 hover:text-cyan-300">
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
};
