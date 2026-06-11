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
    details?: any;
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

  const latestHeartRate = useMemo(() => {
    const vitalsHR = latestVitals?.heartRate;
    const deviceHRResults = healthResults
      .filter(r => r.type === 'device' && r.data.details?.metric === 'heart_rate')
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    const deviceHR = deviceHRResults.length ? (deviceHRResults[0].data.details?.value ?? null) : null;

    if (vitalsHR && deviceHR) {
      const vitalsTime = new Date(latestVitals!.timestamp).getTime();
      const deviceTime = new Date(deviceHRResults[0].timestamp).getTime();
      return vitalsTime > deviceTime ? vitalsHR : deviceHR;
    }
    return vitalsHR ?? deviceHR ?? null;
  }, [healthResults, latestVitals]);

  const latestGlucose = useMemo(() => {
    const deviceResults = healthResults
      .filter(r => r.type === 'device' && r.data.details?.metric === 'glucose')
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    if (!deviceResults.length) return null;
    return deviceResults[0].data.details?.value ?? null;
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
              { icon: <Heart size={12} />, label: 'Heart Rate', value: latestHeartRate ? `${latestHeartRate} bpm` : '--', color: 'hsl(350,80%,65%)' },
              { icon: <Activity size={12} />, label: 'Glucose', value: latestGlucose ? `${latestGlucose} mmol/L` : '--', color: 'hsl(150,70%,60%)' },
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

      {/* Quick nav buttons */}
      <section
        className="glass-card p-4 flex flex-col gap-2"
        style={{ borderColor: `hsl(${ph},40%,50%,0.15)` }}
      >
        {[
          { label: 'Open BMI Calculator', path: '/health/bmi', from: ph, to: ph + 40 },
          { label: 'Open Health Results History', path: '/health/history', from: ph + 40, to: ph + 80 },
          { label: 'Face Monitor → Mood', path: '/health/monitor/face', from: ph + 80, to: ph + 120 },
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
        className="glass-card p-5 border shadow-xl"
        style={{ borderColor: 'rgba(52,211,153,0.18)', background: `linear-gradient(135deg, hsl(${ph},40%,12%,0.2), rgba(0,0,0,0))` }}
      >
        <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-2">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 tracking-wider uppercase">
            <Users size={16} className="text-emerald-400" /> Friend Requests
          </h3>
          {socialLoading && <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-white/40 animate-pulse">Syncing…</span>}
        </div>

        {friendRequests.length === 0 ? (
          <p className="text-xs text-white/40 italic py-2 text-center">No pending friend requests</p>
        ) : (
          <div className="flex flex-col gap-3">
            {friendRequests.map(request => (
              <div
                key={request.id}
                className="rounded-2xl p-4 flex items-center justify-between gap-3 bg-white/5 border border-white/10 shadow-sm"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold bg-gradient-to-br from-emerald-500/20 to-teal-500/35 border border-emerald-400/20 text-emerald-300">
                    {request.requester?.name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div className="min-w-0">
                    <p className="font-black text-sm truncate text-white">{request.requester?.name || 'Unknown'}</p>
                    <p className="text-xs text-white/50 truncate">{request.requester?.email || ''}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => acceptFriendRequest(request.id)}
                    className="p-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-teal-950 transition-all flex items-center justify-center shadow-lg"
                    title="Accept"
                  >
                    <Check size={14} strokeWidth={3} />
                  </button>
                  <button
                    onClick={() => rejectFriendRequest(request.id)}
                    className="p-2 rounded-xl bg-white/10 hover:bg-red-500/20 text-white/70 hover:text-red-400 transition-all flex items-center justify-center"
                    title="Decline"
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
      <section className="glass-card p-5 border shadow-xl" style={{ borderColor: `hsl(${ph},40%,50%,0.15)`, background: `linear-gradient(135deg, hsl(${ph},40%,12%,0.2), rgba(0,0,0,0))` }}>
        <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-2">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 tracking-wider uppercase">
            <UserPlus size={16} style={{ color: accentCss }} /> Discover New Friends
          </h3>
        </div>
        {discoverUsers.length === 0 ? (
          <p className="text-xs text-white/40 italic py-2 text-center">No users available right now</p>
        ) : (
          <div className="flex flex-col gap-2 max-h-56 overflow-y-auto pr-1">
            {discoverUsers.map(person => (
              <div
                key={person.id}
                className="rounded-2xl p-3.5 flex items-center justify-between gap-3 bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border"
                    style={{ background: `hsl(${ph},40%,25%,0.3)`, borderColor: `hsl(${ph},40%,55%,0.25)`, color: accentCss }}
                  >
                    {person.name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-sm truncate text-white">{person.name}</p>
                    <p className="text-xs text-white/45 truncate">{person.email || 'No email'}</p>
                  </div>
                </div>
                {person.friendshipStatus === 'none' ? (
                  <button
                    onClick={() => sendFriendRequest(person.id)}
                    className="px-3 py-1.5 rounded-xl text-xs font-black border transition-all active:scale-95 shadow-sm"
                    style={{
                      background: `hsl(${ph},50%,25%,0.45)`,
                      color: accentCss,
                      borderColor: `hsl(${ph},50%,55%,0.35)`,
                    }}
                  >
                    Add Friend
                  </button>
                ) : (
                  <span className="text-[10px] font-black tracking-wide bg-white/10 px-2 py-1 rounded-lg text-white/55 uppercase">{person.friendshipStatus}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Friends & Messages */}
      <section className="glass-card p-5 border shadow-xl flex flex-col gap-3" style={{ borderColor: `hsl(${ph},35%,50%,0.15)` }}>
        <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-1">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 tracking-wider uppercase">
            <MessageCircle size={16} style={{ color: accentCss }} /> Conversations
          </h3>
        </div>

        {friends.length === 0 ? (
          <p className="text-xs text-white/40 italic py-4 text-center">No active conversations. Add a friend to start chatting!</p>
        ) : (
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {friends.map(friend => {
              const isSelected = selectedFriend?.id === friend.id;
              return (
                <button
                  key={friend.id}
                  onClick={() => { setSelectedFriend(friend); loadMessages(friend.id); }}
                  className="flex items-center gap-2 rounded-2xl px-4 py-2 border shrink-0 transition-all font-bold text-xs"
                  style={
                    isSelected
                      ? { borderColor: accentCss, background: `hsl(${ph},50%,20%,0.35)`, color: 'white' }
                      : { borderColor: 'rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.7)' }
                  }
                >
                  <div className="w-6 h-6 rounded-full flex items-center justify-center bg-white/10 text-[10px]">
                    {friend.name?.[0]?.toUpperCase()}
                  </div>
                  <span>{friend.name}</span>
                </button>
              );
            })}
          </div>
        )}

        {selectedFriend && (
          <div className="bg-black/20 rounded-2xl p-4 mt-2 border border-white/10 shadow-inner">
            <div className="flex items-center gap-2 border-b border-white/5 pb-2 mb-3">
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ background: `hsl(${ph},40%,25%,0.3)`, color: accentCss }}
              >
                {selectedFriend.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <p className="text-xs font-black text-white">{selectedFriend.name}</p>
                <span className="text-[9px] text-green-400 uppercase tracking-widest font-black">Connected</span>
              </div>
            </div>
            
            <div className="space-y-3 max-h-56 overflow-y-auto pr-1 mb-4">
              {messages.length === 0 ? (
                <p className="text-xs text-white/30 italic text-center py-4">No messages yet. Send a friendly hello!</p>
              ) : (
                messages.map(msg => {
                  const isMine = (msg.sender?.id || '') === display.id;
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col max-w-[80%] ${isMine ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                    >
                      <div
                        className={`rounded-2xl px-3.5 py-2 text-xs shadow-sm border ${
                          isMine 
                            ? 'rounded-tr-none' 
                            : 'rounded-tl-none bg-white/10 border-white/10 text-white'
                        }`}
                        style={isMine ? {
                          background: `hsl(${ph},50%,20%,0.5)`,
                          borderColor: `hsl(${ph},50%,55%,0.35)`,
                          color: '#e0f7fa'
                        } : {}}
                      >
                        <p className="leading-relaxed">{msg.text}</p>
                      </div>
                      <span className="text-[8px] text-white/30 mt-1 px-1">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5">
              <input
                type="text"
                value={messageText}
                onChange={e => setMessageText(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); sendMessage(); } }}
                placeholder="Type a message…"
                className="flex-1 bg-transparent border-none text-xs text-white placeholder-white/40 focus:outline-none py-1"
              />
              <button
                onClick={sendMessage}
                className="p-2 rounded-lg transition-all"
                style={{
                  background: `hsl(${ph},50%,25%,0.45)`,
                  color: accentCss,
                }}
              >
                <Send size={12} />
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
