import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckSquare } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const Splash: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => {
        if (user) {
          navigate('/');
        } else {
          navigate('/login');
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen bg-indigo-600 flex flex-col items-center justify-center text-white">
      <div className="animate-bounce mb-4">
        <CheckSquare size={64} />
      </div>
      <h1 className="text-4xl font-bold tracking-tight mb-2">TaskFlow</h1>
      <p className="text-indigo-200 text-lg">Organize your life, simply.</p>
    </div>
  );
};
