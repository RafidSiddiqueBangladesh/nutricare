import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { supabase } from '@/src/services/supabase';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = React.useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the hash fragments from the URL (Supabase auth callback)
        const hash = window.location.hash;
        
        if (hash) {
          // Supabase will handle the OAuth redirect automatically
          // Just wait a moment for the session to be established
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

        // Check if we have a session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          setError(sessionError.message);
          setTimeout(() => navigate('/auth/signin'), 2000);
          return;
        }

        if (session) {
          // Redirect to app
          navigate('/nutrition');
        } else {
          // No session, redirect to signin
          navigate('/auth/signin');
        }
      } catch (err: any) {
        console.error('Callback error:', err);
        setError(err.message || 'Authentication failed');
        setTimeout(() => navigate('/auth/signin'), 2000);
      }
    };

    handleCallback();
  }, [navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <AlertCircle size={48} className="mx-auto text-red-400 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Authentication Failed</h2>
          <p className="text-white/60 mb-4">{error}</p>
          <p className="text-white/40 text-sm">Redirecting to sign in...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <Loader size={48} className="mx-auto animate-spin primary-text mb-4" />
        <h2 className="text-2xl font-bold mb-2">Completing Sign In...</h2>
        <p className="text-white/60">Please wait while we set up your account</p>
      </motion.div>
    </div>
  );
}
