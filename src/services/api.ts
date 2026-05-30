// API Service for backend communication
import { supabase } from '@/src/services/supabase';

export const API_BASE_URL =
  import.meta.env.VITE_API_URL?.trim() ||
  'https://nutricarebackend-2zfq.onrender.com/api';

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean>;
}

export interface AIResponse {
  success: boolean;
  data?: {
    text: string;
  };
  message?: string;
}

export interface HealthAnalysisRequest {
  symptoms: string[];
  vitals?: {
    heartRate?: number;
    bloodPressure?: string;
    temperature?: number;
  };
  detectedConditions?: string[];
  imageData?: string; // base64 encoded image for analysis
}

export interface ExerciseDetectionRequest {
  frameData: string; // base64 encoded video frame
  exerciseType: string;
}

export interface DetectionResult {
  success: boolean;
  data?: {
    detected: boolean;
    confidence: number;
    landmarks?: Array<{ x: number; y: number; z?: number }>;
    repCount?: number;
    formScore?: number;
  };
  message?: string;
}

class APIService {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async getAccessToken(): Promise<string | null> {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (!error && data.session?.access_token) {
        return data.session.access_token;
      }
    } catch {
      // Fall back to localStorage for older auth flows.
    }

    return localStorage.getItem('sb_access_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const { params, ...fetchOptions } = options;
    const accessToken = await this.getAccessToken();

    let url = `${this.baseURL}${endpoint}`;

    // Add query parameters
    if (params) {
      const queryString = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        queryString.append(key, String(value));
      });
      url += `?${queryString.toString()}`;
    }

    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          ...fetchOptions.headers,
        },
        credentials: 'include',
        ...fetchOptions,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({
          message: `HTTP ${response.status}`,
        }));
        throw new Error(error.message || 'API request failed');
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // AI Chat
  async chat(
    prompt: string,
    messages?: Array<{ role: string; content: string }>,
    model?: string,
    temperature?: number,
    maxTokens?: number
  ): Promise<AIResponse> {
    return this.request('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({
        prompt,
        messages,
        model,
        temperature,
        maxTokens,
      }),
    });
  }

  // AI Diagnosis
  async analyzeDiagnosis(data: HealthAnalysisRequest): Promise<AIResponse> {
    const systemPrompt = `You are a medical AI assistant. Analyze the following health information and provide insights:
- Symptoms: ${data.symptoms.join(', ')}
- Vitals: ${JSON.stringify(data.vitals || {})}
- Detected Conditions: ${data.detectedConditions?.join(', ') || 'None'}

Provide a comprehensive health analysis with recommendations. Be clear that this is not a medical diagnosis and the user should consult a real doctor.`;

    return this.chat(systemPrompt);
  }

  // Exercise Detection (via AI)
  async detectExercise(
    frameData: string,
    exerciseType: string
  ): Promise<DetectionResult> {
    const prompt = `Analyze this image for ${exerciseType} exercise form. 
Evaluate:
1. If the exercise is being performed
2. Confidence level (0-100)
3. Form quality score
4. Any corrections needed

Respond with JSON: { detected: boolean, confidence: number, formScore: number, suggestions: string[] }`;

    const response = await this.chat(prompt);
    if (response.success && response.data?.text) {
      try {
        const json = JSON.parse(response.data.text);
        return {
          success: true,
          data: {
            detected: json.detected,
            confidence: json.confidence / 100,
            formScore: json.formScore,
          },
        };
      } catch (e) {
        return {
          success: false,
          message: 'Failed to parse exercise detection response',
        };
      }
    }
    return { success: false, message: 'Exercise detection failed' };
  }

  // Nutrition - Parse Voice Transcription
  async parseVoiceTranscription(transcription: string) {
    return this.request('/nutrition/parse-voice', {
      method: 'POST',
      body: JSON.stringify({ transcription }),
    });
  }

  // Nutrition - Parse Text Input
  async parseNutritionText(text: string) {
    return this.request('/nutrition/parse-text', {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
  }

  // Nutrition - Process Image with OCR
  async processNutritionImage(imageFile: File) {
    const formData = new FormData();
    formData.append('image', imageFile);
    const accessToken = await this.getAccessToken();

    try {
      const response = await fetch(`${this.baseURL}/nutrition/ocr`, {
        method: 'POST',
        body: formData,
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({
          message: `HTTP ${response.status}`,
        }));
        throw new Error(error.message || 'OCR request failed');
      }

      return await response.json();
    } catch (error) {
      console.error('OCR Error:', error);
      throw error;
    }
  }

  // Authentication
  async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async signup(
    email: string,
    password: string,
    fullName: string
  ) {
    return this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, fullName }),
    });
  }

  async logout() {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  // Profile
  async getProfile() {
    return this.request('/profile');
  }

  async updateProfile(data: Record<string, any>) {
    return this.request('/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
}

export const apiService = new APIService();
export default apiService;
