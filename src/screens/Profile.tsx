import React, { useEffect, useMemo, useState } from 'react';
import {
  User,
  Mail,
  Award,
  Ruler,
  Weight,
  HeartPulse,
  ChevronRight,
  Users,
  UserPlus,
  MessageCircle,
  Check,
  X,
  Send,
} from 'lucide-react';
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

export default function Profile() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [friends, setFriends] = useState<BasicUser[]>([]);
  const [discoverUsers, setDiscoverUsers] = useState<BasicUser[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<BasicUser | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [messageText, setMessageText] = useState('');
  const [socialLoading, setSocialLoading] = useState(false);

  const authHeaders = useMemo(() => {
    const token = localStorage.getItem('sb_access_token') || '';
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, [user?.id]);

  const apiFetch = async (path: string, options: RequestInit = {}) => {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
        ...(options.headers || {}),
      },
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
    } catch (error) {
      console.error('Failed to load messages:', error);
      setMessages([]);
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/profile/me`, {
          headers: authHeaders,
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
    loadSocialData();
  }, [authHeaders]);

  const sendFriendRequest = async (recipientId: string) => {
    try {
      await apiFetch('/profile/friend-request', {
        method: 'POST',
        body: JSON.stringify({ recipientId }),
      });
      await loadSocialData();
    } catch (error) {
      console.error('Send friend request failed:', error);
      alert(error instanceof Error ? error.message : 'Failed to send friend request');
    }
  };

  const acceptFriendRequest = async (requestId: string) => {
    try {
      await apiFetch(`/profile/friend-request/${requestId}/accept`, { method: 'PUT' });
      await loadSocialData();
    } catch (error) {
      console.error('Accept request failed:', error);
      alert(error instanceof Error ? error.message : 'Failed to accept request');
    }
  };

  const rejectFriendRequest = async (requestId: string) => {
    try {
      await apiFetch(`/profile/friend-request/${requestId}`, { method: 'DELETE' });
      await loadSocialData();
    } catch (error) {
      console.error('Reject request failed:', error);
      alert(error instanceof Error ? error.message : 'Failed to reject request');
    }
  };

  const sendMessage = async () => {
    const text = messageText.trim();
    if (!selectedFriend || !text) return;

    try {
      await apiFetch('/profile/messages', {
        method: 'POST',
        body: JSON.stringify({ recipientId: selectedFriend.id, text }),
      });
      setMessageText('');
      await loadMessages(selectedFriend.id);
    } catch (error) {
      console.error('Send message failed:', error);
      alert(error instanceof Error ? error.message : 'Failed to send message');
    }
  };

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

      <section className="glass-card !p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-white/60 uppercase flex items-center gap-2">
            <Users size={14} />
            Friend Requests
          </h3>
          {socialLoading && <span className="text-[11px] text-white/40">Syncing...</span>}
        </div>

        {friendRequests.length === 0 ? (
          <p className="text-sm text-white/40">No pending friend requests</p>
        ) : (
          <div className="space-y-2">
            {friendRequests.map((request) => (
              <div key={request.id} className="bg-white/5 rounded-xl p-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-bold text-sm truncate">{request.requester?.name || 'Unknown User'}</p>
                  <p className="text-xs text-white/50 truncate">{request.requester?.email || 'No email'}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => acceptFriendRequest(request.id)}
                    className="p-2 rounded-lg bg-teal-500/20 hover:bg-teal-500/30 text-teal-300"
                    title="Accept"
                  >
                    <Check size={14} />
                  </button>
                  <button
                    onClick={() => rejectFriendRequest(request.id)}
                    className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300"
                    title="Reject"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="glass-card !p-4">
        <h3 className="text-sm font-bold text-white/60 uppercase mb-3 flex items-center gap-2">
          <UserPlus size={14} />
          Discover Users
        </h3>
        {discoverUsers.length === 0 ? (
          <p className="text-sm text-white/40">No users available right now</p>
        ) : (
          <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
            {discoverUsers.map((person) => (
              <div key={person.id} className="bg-white/5 rounded-xl p-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-bold text-sm truncate">{person.name}</p>
                  <p className="text-xs text-white/50 truncate">{person.email || 'No email'}</p>
                </div>
                {person.friendshipStatus === 'none' ? (
                  <button
                    onClick={() => sendFriendRequest(person.id)}
                    className="px-3 py-1.5 rounded-lg bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 text-xs font-bold"
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

      <section className="glass-card !p-4 flex flex-col gap-3">
        <h3 className="text-sm font-bold text-white/60 uppercase mb-1 flex items-center gap-2">
          <MessageCircle size={14} />
          Friends & Messages
        </h3>

        {friends.length === 0 ? (
          <p className="text-sm text-white/40">No friends yet. Add users to start messaging.</p>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {friends.map((friend) => (
              <button
                key={friend.id}
                onClick={() => {
                  setSelectedFriend(friend);
                  loadMessages(friend.id);
                }}
                className={`text-left rounded-xl p-3 border transition-all ${
                  selectedFriend?.id === friend.id
                    ? 'border-teal-400/60 bg-teal-500/15'
                    : 'border-white/10 bg-white/5 hover:bg-white/10'
                }`}
              >
                <p className="font-bold text-sm truncate">{friend.name}</p>
                <p className="text-[11px] text-white/50 truncate">{friend.email || 'No email'}</p>
              </button>
            ))}
          </div>
        )}

        {selectedFriend && (
          <div className="bg-white/5 rounded-xl p-3 mt-1">
            <p className="text-xs text-white/50 mb-2">Chat with <span className="text-white/80 font-bold">{selectedFriend.name}</span></p>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1 mb-3">
              {messages.length === 0 ? (
                <p className="text-xs text-white/40">No messages yet</p>
              ) : (
                messages.map((msg) => {
                  const isMine = (msg.sender?.id || '') === display.id;
                  return (
                    <div
                      key={msg.id}
                      className={`rounded-lg p-2 text-xs ${
                        isMine ? 'bg-teal-500/20 text-teal-100 ml-6' : 'bg-white/10 text-white/85 mr-6'
                      }`}
                    >
                      <p>{msg.text}</p>
                      <p className="text-[10px] opacity-60 mt-1">{new Date(msg.createdAt).toLocaleString()}</p>
                    </div>
                  );
                })
              )}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Type a message..."
                className="flex-1 px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-sm focus:outline-none focus:border-teal-500"
              />
              <button
                onClick={sendMessage}
                className="px-3 py-2 rounded-lg bg-teal-500/30 hover:bg-teal-500/45 text-teal-200"
                title="Send"
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
