import React from 'react';
import { motion } from 'motion/react';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TrackingShellProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

const TrackingShell = ({ title, icon, children }: TrackingShellProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-6 pb-24">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-white/10 rounded-full transition-all"
        >
          <ChevronLeft size={24} />
        </button>
        <div className="flex-1 flex justify-center">
          <div className="bg-teal-500/10 border border-teal-500/20 rounded-full px-4 py-1 flex items-center gap-2 text-teal-400">
            {icon}
            <span className="text-xs font-bold uppercase tracking-wider">{title}</span>
            <motion.div
              className="w-1.5 h-1.5 rounded-full bg-teal-400"
              animate={{ opacity: [0.35, 1, 0.35] }}
              transition={{ duration: 1.4, repeat: Infinity }}
            />
          </div>
        </div>
      </div>
      {children}
    </div>
  );
};

export default TrackingShell;
