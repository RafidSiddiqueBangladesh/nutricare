import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/src/contexts/AuthContext';
import { Loader } from 'lucide-react';
import { motion } from 'motion/react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <Loader size={32} className="animate-spin mx-auto primary-text mb-4" />
          <p className="text-white/60">Loading...</p>
        </motion.div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/signin" replace />;
  }

  return <>{children}</>;
};
