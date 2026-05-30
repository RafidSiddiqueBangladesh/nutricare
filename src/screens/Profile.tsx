import React, { useEffect, useState } from 'react';
import { User, Mail, Award, Ruler, Weight, HeartPulse, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/src/contexts/AuthContext';
import { API_BASE_URL } from '@/src/services/api';

interface ProfileData {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: string;
  points?: number;
  bmi?: number | null;
  heightCm?: number | null;
  weightKg?: number | null;
}

export default function Profile() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('sb_access_token') || '';
        const response = await fetch(`${API_BASE_URL}/profile/me`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }

        const payload = await response.json();
        setProfile(payload?.data || null);
      } catch (error) {
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const display = profile || {
    id: user?.id || '',
    name: user?.name || 'User',
    email: user?.email || '',
    avatar: user?.avatar,
    role: 'patient',
    points: 0,
    bmi: null,
    heightCm: null,
    weightKg: null,
  };

  return (
    <div className="flex flex-col gap-6 pb-28">
      <div className="flex justify-center">
        <div className="bg-teal-500/10 border border-teal-500/20 rounded-full px-4 py-1 flex items-center gap-2 text-teal-400">
          <User size={14} />
          <span className="text-xs font-bold uppercase tracking-wider">Profile</span>
          <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
        </div>
      </div>

      <section className="glass-card !p-5 flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center overflow-hidden">
          {display.avatar ? (
            <img src={display.avatar} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <span className="text-2xl font-black text-teal-300">{display.name?.[0]?.toUpperCase() || 'U'}</span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-black truncate">{display.name}</h2>
          <p className="text-sm text-white/60 truncate flex items-center gap-2">
            <Mail size={14} />
            {display.email}
          </p>
          <p className="text-xs text-white/50 uppercase mt-1">Role: {String(display.role || 'patient')}</p>
        </div>
      </section>

      <section className="glass-card !p-4">
        <h3 className="text-sm font-bold text-white/60 uppercase mb-3">Health Snapshot</h3>
        {loading ? (
          <p className="text-sm text-white/50">Loading profile data...</p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/5 rounded-xl p-3">
              <p className="text-xs text-white/60 flex items-center gap-1"><HeartPulse size={12} /> BMI</p>
              <p className="text-lg font-bold text-teal-300">{display.bmi ?? '--'}</p>
            </div>
            <div className="bg-white/5 rounded-xl p-3">
              <p className="text-xs text-white/60 flex items-center gap-1"><Award size={12} /> Points</p>
              <p className="text-lg font-bold text-teal-300">{display.points ?? 0}</p>
            </div>
            <div className="bg-white/5 rounded-xl p-3">
              <p className="text-xs text-white/60 flex items-center gap-1"><Ruler size={12} /> Height</p>
              <p className="text-lg font-bold text-teal-300">{display.heightCm ?? '--'} cm</p>
            </div>
            <div className="bg-white/5 rounded-xl p-3">
              <p className="text-xs text-white/60 flex items-center gap-1"><Weight size={12} /> Weight</p>
              <p className="text-lg font-bold text-teal-300">{display.weightKg ?? '--'} kg</p>
            </div>
          </div>
        )}
      </section>

      <section className="glass-card !p-4 flex flex-col gap-2">
        <button
          onClick={() => navigate('/health/bmi')}
          className="w-full text-left bg-white/5 hover:bg-white/10 rounded-xl p-3 flex items-center justify-between transition-all"
        >
          <span className="font-bold text-sm">Open BMI Calculator</span>
          <ChevronRight size={16} className="text-white/40" />
        </button>
        <button
          onClick={() => navigate('/health/history')}
          className="w-full text-left bg-white/5 hover:bg-white/10 rounded-xl p-3 flex items-center justify-between transition-all"
        >
          <span className="font-bold text-sm">Open Health Results History</span>
          <ChevronRight size={16} className="text-white/40" />
        </button>
      </section>
    </div>
  );
}
