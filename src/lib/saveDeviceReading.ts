import { supabase } from '@/src/services/supabase';
import { API_BASE_URL } from '@/src/services/api';
import { appendHealthResult } from '@/src/lib/healthResults';

export interface SaveDeviceReadingInput {
  label: string;
  score?: number;
  details?: Record<string, unknown>;
  type?: string;
}

async function getAccessToken() {
  const storedToken = localStorage.getItem('sb_access_token');
  if (storedToken) return storedToken;

  try {
    const { data, error } = await supabase.auth.getSession();
    if (!error && data.session?.access_token) {
      return data.session.access_token;
    }
  } catch {
    // Fall back to backend auth cookies.
  }

  return null;
}

function toLocalResult(input: SaveDeviceReadingInput, resultType = 'device') {
  return {
    id: (typeof crypto !== 'undefined' && 'randomUUID' in crypto) ? crypto.randomUUID() : `device-${Date.now()}`,
    type: resultType as any,
    timestamp: new Date().toISOString(),
    data: {
      label: input.label,
      score: input.score,
      kind: input.type || 'device_watch',
      details: input.details || {},
    },
  };
}

export async function saveDeviceReading(input: SaveDeviceReadingInput) {
  const token = await getAccessToken();

  try {
    const response = await fetch(`${API_BASE_URL.replace(/\/$/, '')}/profile/health-tracking-logs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      credentials: 'include',
      body: JSON.stringify({
        type: input.type || 'device_watch',
        label: input.label,
        score: input.score,
        details: input.details || {},
      }),
    });

    const responseData = await response.json().catch(() => null);
    if (!response.ok) {
      const error = new Error(responseData?.message || `HTTP ${response.status}`);
      return { data: responseData, error };
    }

    const localResult = toLocalResult(input);
    if (responseData?.data?.id) {
      localResult.id = responseData.data.id;
    }
    if (responseData?.data?.createdAt) {
      localResult.timestamp = responseData.data.createdAt;
    }
    appendHealthResult(localResult as any);

    return { data: responseData, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}
