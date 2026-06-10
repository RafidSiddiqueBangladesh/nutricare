import React, { useEffect, useMemo, useState } from 'react';
import {
  User, Mail, Award, Ruler, Weight, HeartPulse, ChevronRight,
  Users, UserPlus, MessageCircle, Check, X, Send, Activity,
  Zap, TrendingUp, Heart,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/src/contexts/AuthContext';
import { API_BASE_URL } from '@/src/services/api';
import { useLocalStorage } from '@/src/hooks/useLocalStorage';
import { useTheme } from '@/src/contexts/ThemeContext';

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

interface BasicUser {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  friendshipStatus?: 'none' | 'pending' | 'accepted' | 'rejected';
}

interface FriendRequest {
  id: string;
  status: string;
  createdAt: string;
  requester: BasicUser;
}

interface MessageItem {
  id: string;
  text: string;
  createdAt: string;
  isRead: boolean;
  sender: BasicUser;
  recipient: BasicUser;
}

interface HealthResult {
  id: string;
  type: string;
  timestamp: string;
  data: {
    heartRate?: number;
    respiratoryRate?: number;
    hrv?: number;
    emotion?: string;
    repCount?: number;
    formScore?: number;
    bmi?: number;
    category?: string;
    vitals?: any;
    confidence?: number;
  };
}

export default function Profile() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { config } = useTheme();
  const [healthResults] = useLocalStorage<HealthResult[]>('health-results', []);

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [friends, setFriends] = useState<BasicUser[]>([]);
  const [discoverUsers, setDiscoverUsers] = useState<BasicUser[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<BasicUser | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [messageText, setMessageText] = useState('');
  const [socialLoading, setSocialLoading] = useState(false);

  // ── Derive latest vitals from local health results ──────────────────────────
  const latestVitals = useMemo(() => {
    const vitalsResults = healthResults
      .filter(r => r.type === 'vitals')
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    if (!vitalsResults.length) return null;
    const r = vitalsResults[0];
    return {
      heartRate:        r.data.heartRate ?? r.data.vitals?.heart_rate?.value ?? null,
      respiratoryRate:  r.data.respiratoryRate ?? r.data.vitals?.respiratory_rate?.value ?? null,
      hrv:              r.data.hrv ?? r.data.vitals?.hrv?.value ?? null,
      timestamp:        r.timestamp,
    };
  }, [healthResults]);

  const latestBmi = useMemo(() => {
    const bmiResults = healthResults
      .filter(r => r.type === 'bmi' && r.data.bmi)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return bmiResults[0]?.data ?? null;
  }, [healthResults]);

  const latestEmotion = useMemo(() => {
    const faceResults = healthResults
      .filter(r => r.type === 'face' && r.data.emotion)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return faceResults[0]?.data.emotion || null;
  }, [healthResults]);

  const totalWorkouts = healthResults.filter(r => r.type === 'pose').length;
  const totalReps     = healthResults.filter(r => r.type === 'pose').reduce((s, r) => s + (r.data.repCount || 0), 0);

  // ── Auth helpers ─────────────────────────────────────────────────────────────
  const authHeaders = useMemo(() => {
    const token = localStorage.getItem('sb_access_token') || '';
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, [user?.id]);

  const apiFetch = async (path: string, options: RequestInit = {}) => {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...authHeaders, ...(options.headers || {}) },
      ...options,
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData?.message || `Request failed (${response.status})`);
    }
    return response.json();
  };

  const loadSocialData = async () => {
    setSocialLoading(true);
    try {
      const [friendsRes, requestsRes, discoverRes] = await Promise.all([
        apiFetch('/profile/friends'),
        apiFetch('/profile/friend-requests'),
        apiFetch('/profile/discover-users?limit=25'),
      ]);
      setFriends(friendsRes?.data || []);
      setFriendRequests(requestsRes?.data || []);
      setDiscoverUsers(discoverRes?.data || []);
    } catch (error) {
      console.error('Failed to load social profile data:', error);
    } finally {
      setSocialLoading(false);
    }
  };

  const loadMessages = async (friendId: string) => {
    try {
      const response = await apiFetch(`/profile/messages/${friendId}?limit=40`);
      setMessages(response?.data || []);
    } catch { setMessages([]); }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/profile/me`, { headers: authHeaders, credentials: 'include' });
        if (!response.ok) throw new Error();
        const payload = await response.json();
        setProfile(payload?.data || null);
      } catch { setProfile(null); }
      finally { setLoading(false); }
    };
    fetchProfile();
    loadSocialData();
  }, [authHeaders]);

  const sendFriendRequest = async (recipientId: string) => {
    try { await apiFetch('/profile/friend-request', { method: 'POST', body: JSON.stringify({ recipientId }) }); await loadSocialData(); }
    catch (e) { alert(e instanceof Error ? e.message : 'Failed'); }
  };

  const acceptFriendRequest = async (requestId: string) => {
    try { await apiFetch(`/profile/friend-request/${requestId}/accept`, { method: 'PUT' }); await loadSocialData(); }
    catch (e) { alert(e instanceof Error ? e.message : 'Failed'); }
  };

  const rejectFriendRequest = async (requestId: string) => {
    try { await apiFetch(`/profile/friend-request/${requestId}`, { method: 'DELETE' }); await loadSocialData(); }
    catch (e) { alert(e instanceof Error ? e.message : 'Failed'); }
  };

  const sendMessage = async () => {
    const text = messageText.trim();
    if (!selectedFriend || !text) return;
    try {
      await apiFetch('/profile/messages', { method: 'POST', body: JSON.stringify({ recipientId: selectedFriend.id, text }) });
      setMessageText('');
      await loadMessages(selectedFriend.id);
    } catch (e) { alert(e instanceof Error ? e.message : 'Failed'); }
  };

  const display = profile || {
    id: user?.id || '', name: user?.name || 'User', email: user?.email || '',
    avatar: user?.avatar, role: 'patient', points: 0, bmi: null, heightCm: null, weightKg: null,
  };

  // ── Theme-derived accent colors ───────────────────────────────────────────────
  const ph = config.primaryHue;
  const accentCss = `hsl(${ph},80%,65%)`;

  const emotionEmoji: Record<string, string> = {
    happy: '😊', sad: '😢', neutral: '😐', astonished: '😲'
  };

  return (
    <div className="flex flex-col gap-5 pb-28">
      {/* Top badge */}
      <div className="flex justify-center">
        <div
          className="border rounded-full px-4 py-1.5 flex items-center gap-2 shadow-lg"
          style={{ background: `hsl(${ph},60%,15%,0.2)`, borderColor: `hsl(${ph},60%,50%,0.25)`, color: accentCss }}
        >
          <User size={14} />
          <span className="text-xs font-bold uppercase tracking-wider">Profile</span>
          <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: accentCss }} />
        </div>
      </div>

      {/* Avatar + name card */}
      <section
        className="glass-card p-5 flex items-center gap-4"
        style={{ background: `linear-gradient(135deg, hsl(${ph},50%,20%,0.15), hsl(${ph+60},50%,15%,0.1))`, borderColor: `hsl(${ph},40%,50%,0.15)` }}
      >
        <div
          className="w-18 h-18 rounded-2xl flex items-center justify-center overflow-hidden shadow-xl"
          style={{ background: `linear-gradient(135deg, hsl(${ph},60%,25%,0.4), hsl(${ph+40},60%,20%,0.3))`, border: `1px solid hsl(${ph},50%,55%,0.3)`, width: 72, height: 72 }}
        >
          {display.avatar ? (
            <img src={display.avatar} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <span className="text-2xl font-black" style={{ color: accentCss }}>
              {display.name?.[0]?.toUpperCase() || 'U'}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-black truncate">{display.name}</h2>
          <p className="text-sm text-white/60 truncate flex items-center gap-2">
            <Mail size={13} /> {display.email}
          </p>
          <div className="flex items-center gap-2 mt-1.5">
            <span
              className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full"
              style={{ background: `hsl(${ph},60%,25%,0.4)`, color: accentCss }}
            >
              {String(display.role || 'patient')}
            </span>
            {latestEmotion && (
              <span className="text-[10px] text-white/50">
                Mood: {emotionEmoji[latestEmotion] || '😐'} {latestEmotion}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Activity stats bar */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: <Zap size={16} />, label: 'Points', value: display.points ?? 0, color: `hsl(${ph},80%,65%)` },
          { icon: <Activity size={16} />, label: 'Workouts', value: totalWorkouts, color: 'hsl(160,80%,60%)' },
          { icon: <TrendingUp size={16} />, label: 'Total Reps', value: totalReps, color: 'hsl(280,70%,70%)' },
        ].map(stat => (
          <div
            key={stat.label}
            className="glass-card !p-3 text-center"
            style={{ borderColor: `${stat.color}30` }}
          >
            <div className="flex justify-center mb-1" style={{ color: stat.color }}>{stat.icon}</div>
            <p className="text-lg font-black" style={{ color: stat.color }}>{stat.value}</p>
            <p className="text-[10px] text-white/50 font-bold uppercase">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Health snapshot */}
      <section
        className="glass-card p-4"
        style={{ background: `linear-gradient(135deg, hsl(${ph},40%,15%,0.12), hsl(${ph+80},40%,15%,0.08))` }}
      >
        <h3 className="text-sm font-bold uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: accentCss }}>
          <HeartPulse size={14} /> Health Snapshot
        </h3>
        {loading ? (
          <p className="text-sm text-white/50">Loading…</p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: <HeartPulse size={12} />, label: 'BMI', value: latestBmi?.bmi ? Number(latestBmi.bmi).toFixed(1) : (display.bmi ?? '--'), sub: latestBmi?.category, color: `hsl(${ph},70%,65%)` },
              { icon: <Award size={12} />, label: 'Height', value: display.heightCm ? `${display.heightCm} cm` : '--', color: 'hsl(160,70%,60%)' },
              { icon: <Weight size={12} />, label: 'Weight', value: display.weightKg ? `${display.weightKg} kg` : '--', color: 'hsl(20,70%,65%)' },
              { icon: <Ruler size={12} />, label: 'BMI Cat.', value: latestBmi?.category || '--', color: 'hsl(280,70%,70%)' },
            ].map(card => (
              <div
                key={card.label}
                className="rounded-xl p-3"
                style={{ background: `${card.color}18`, border: `1px solid ${card.color}25` }}
              >
                <p className="text-[11px] text-white/55 flex items-center gap-1 mb-1">{card.icon} {card.label}</p>
                <p className="text-base font-black" style={{ color: card.color }}>{card.value}</p>
                {card.sub && <p className="text-[10px] text-white/40 mt-0.5">{card.sub}</p>}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Heart rate & vitals from HealthResultsHistory */}
      <section
        className="glass-card p-4"
        style={{ background: 'linear-gradient(135deg, rgba(239,68,68,0.08), rgba(251,113,133,0.06))' }}
      >
        <h3 className="text-sm font-bold uppercase tracking-wider mb-3 flex items-center gap-2 text-rose-300">
          <Heart size={14} /> Latest Vitals
        </h3>
        {latestVitals ? (
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Heart Rate', value: latestVitals.heartRate ? `${latestVitals.heartRate} bpm` : '--', color: 'text-rose-400' },
              { label: 'Resp. Rate', value: latestVitals.respiratoryRate ? `${latestVitals.respiratoryRate} /min` : '--', color: 'text-pink-400' },
              { label: 'HRV', value: latestVitals.hrv ? `${latestVitals.hrv} ms` : '--', color: 'text-red-300' },
            ].map(v => (
              <div key={v.label} className="bg-white/5 rounded-xl p-3 border border-white/10 text-center">
                <p className="text-[10px] text-white/50 mb-1">{v.label}</p>
                <p className={`font-black text-sm ${v.color}`}>{v.value}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-3">
            <p className="text-sm text-white/40 italic">No vitals recorded yet</p>
            <button
              onClick={() => navigate('/health/vitallens')}
              className="mt-2 text-xs font-bold px-3 py-1.5 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-400/20 hover:bg-rose-500/30 transition-all"
            >
              Start Vitals Scan →
            </button>
          </div>
        )}
        {latestVitals && (
          <p className="text-[10px] text-white/30 mt-2">
            Last recorded: {new Date(latestVitals.timestamp).toLocaleString()}
          </p>
        )}
      </section>

      {/* Quick nav buttons */}
      <section
        className="glass-card p-4 flex flex-col gap-2"
        style={{ borderColor: `hsl(${ph},40%,50%,0.15)` }}
      >
        {[
          { label: 'Open BMI Calculator', path: '/health/bmi', from: ph, to: ph + 40 },
          { label: 'Open Health Results History', path: '/health/history', from: ph + 40, to: ph + 80 },
          { label: 'Face Monitor → Mood', path: '/tracking/face', from: ph + 80, to: ph + 120 },
        ].map(btn => (
          <button
            key={btn.path}
            onClick={() => navigate(btn.path)}
            className="w-full text-left rounded-xl p-3 flex items-center justify-between transition-all hover:brightness-125"
            style={{
              background: `linear-gradient(135deg, hsl(${btn.from},50%,20%,0.15), hsl(${btn.to},50%,15%,0.1))`,
              border: `1px solid hsl(${btn.from},40%,55%,0.15)`,
            }}
          >
            <span className="font-bold text-sm text-white/90">{btn.label}</span>
            <ChevronRight size={16} className="text-white/40" />
          </button>
        ))}
      </section>

      {/* Friend Requests */}
      <section
        className="glass-card p-4"
        style={{ borderColor: 'rgba(52,211,153,0.15)' }}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-white/70 uppercase flex items-center gap-2 tracking-wider">
            <Users size={14} /> Friend Requests
          </h3>
          {socialLoading && <span className="text-[11px] text-white/40">Syncing…</span>}
        </div>

        {friendRequests.length === 0 ? (
          <p className="text-sm text-white/45">No pending friend requests</p>
        ) : (
          <div className="space-y-2">
            {friendRequests.map(request => (
              <div
                key={request.id}
                className="rounded-xl p-3 flex items-center justify-between gap-3"
                style={{ background: `hsl(${ph},30%,15%,0.15)`, border: `1px solid hsl(${ph},40%,50%,0.15)` }}
              >
                <div className="min-w-0">
                  <p className="font-bold text-sm truncate">{request.requester?.name || 'Unknown'}</p>
                  <p className="text-xs text-white/55 truncate">{request.requester?.email || ''}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => acceptFriendRequest(request.id)}
                    className="p-2 rounded-lg bg-teal-500/25 hover:bg-teal-500/40 text-teal-200 border border-teal-400/20"
                  >
                    <Check size={14} />
                  </button>
                  <button
                    onClick={() => rejectFriendRequest(request.id)}
                    className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-200 border border-red-400/20"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Discover Users */}
      <section className="glass-card p-4" style={{ borderColor: `hsl(${ph},40%,50%,0.12)` }}>
        <h3 className="text-sm font-bold text-white/70 uppercase mb-3 flex items-center gap-2 tracking-wider">
          <UserPlus size={14} /> Discover Users
        </h3>
        {discoverUsers.length === 0 ? (
          <p className="text-sm text-white/45">No users available right now</p>
        ) : (
          <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
            {discoverUsers.map(person => (
              <div
                key={person.id}
                className="rounded-xl p-3 flex items-center justify-between gap-3 bg-white/5 border border-white/10"
              >
                <div className="min-w-0">
                  <p className="font-bold text-sm truncate">{person.name}</p>
                  <p className="text-xs text-white/55 truncate">{person.email || 'No email'}</p>
                </div>
                {person.friendshipStatus === 'none' ? (
                  <button
                    onClick={() => sendFriendRequest(person.id)}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold border transition-all"
                    style={{
                      background: `hsl(${ph},50%,25%,0.3)`,
                      color: accentCss,
                      borderColor: `hsl(${ph},50%,55%,0.25)`,
                    }}
                  >
                    Add
                  </button>
                ) : (
                  <span className="text-[11px] text-white/50 uppercase">{person.friendshipStatus}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Friends & Messages */}
      <section className="glass-card p-4 flex flex-col gap-3">
        <h3 className="text-sm font-bold text-white/70 uppercase mb-1 flex items-center gap-2 tracking-wider">
          <MessageCircle size={14} /> Friends &amp; Messages
        </h3>

        {friends.length === 0 ? (
          <p className="text-sm text-white/45">No friends yet. Add users to start messaging.</p>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {friends.map(friend => (
              <button
                key={friend.id}
                onClick={() => { setSelectedFriend(friend); loadMessages(friend.id); }}
                className="text-left rounded-xl p-3 border transition-all"
                style={
                  selectedFriend?.id === friend.id
                    ? { borderColor: accentCss, background: `hsl(${ph},50%,20%,0.2)` }
                    : { borderColor: 'rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)' }
                }
              >
                <p className="font-bold text-sm truncate">{friend.name}</p>
                <p className="text-[11px] text-white/50 truncate">{friend.email || 'No email'}</p>
              </button>
            ))}
          </div>
        )}

        {selectedFriend && (
          <div className="bg-white/5 rounded-xl p-3 mt-1 border border-white/10">
            <p className="text-xs text-white/55 mb-2">
              Chat with <span className="font-bold" style={{ color: accentCss }}>{selectedFriend.name}</span>
            </p>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1 mb-3">
              {messages.length === 0 ? (
                <p className="text-xs text-white/45">No messages yet</p>
              ) : (
                messages.map(msg => {
                  const isMine = (msg.sender?.id || '') === display.id;
                  return (
                    <div
                      key={msg.id}
                      className={`rounded-lg p-2 text-xs ${isMine ? 'ml-6 border' : 'bg-white/10 mr-6 border border-white/10'}`}
                      style={isMine ? {
                        background: `hsl(${ph},50%,20%,0.35)`,
                        borderColor: `hsl(${ph},50%,55%,0.25)`,
                        color: '#e0f7fa'
                      } : {}}
                    >
                      <p>{msg.text}</p>
                      <p className="text-[10px] opacity-50 mt-1">{new Date(msg.createdAt).toLocaleString()}</p>
                    </div>
                  );
                })
              )}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={messageText}
                onChange={e => setMessageText(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); sendMessage(); } }}
                placeholder="Type a message…"
                className="flex-1 px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-sm focus:outline-none"
                style={{ '--tw-ring-color': accentCss } as any}
              />
              <button
                onClick={sendMessage}
                className="px-3 py-2 rounded-lg border transition-all"
                style={{
                  background: `hsl(${ph},50%,25%,0.35)`,
                  borderColor: `hsl(${ph},50%,55%,0.25)`,
                  color: accentCss,
                }}
              >
                <Send size={14} />
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
