// API service for backend integration (Firebase/Supabase)
import { createClient } from '@supabase/supabase-js';
import { InterviewSession, DetectionEvent } from '../types';

// Configure these with your Supabase project details
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Function to check if URL is valid
const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return url.startsWith('http://') || url.startsWith('https://');
  } catch {
    return false;
  }
};

// Initialize Supabase client only if valid configuration is provided
const supabase = (supabaseUrl && supabaseKey && isValidUrl(supabaseUrl))
  ? createClient(supabaseUrl, supabaseKey)
  : null;

export class ApiService {
  private static isConfigured(): boolean {
    return supabase !== null && isValidUrl(supabaseUrl) && supabaseKey.length > 0;
  }

  /**
   * Store interview session data in the backend
   */
  static async saveInterviewSession(session: InterviewSession): Promise<void> {
    if (!this.isConfigured() || !supabase) {
      console.warn('Backend not configured. Session data stored locally only.');
      this.saveToLocalStorage(session);
      return;
    }

    try {
      const { error } = await supabase
        .from('interview_sessions')
        .insert([{
          id: session.id,
          candidate_name: session.candidate.name,
          candidate_email: session.candidate.email,
          candidate_position: session.candidate.position,
          interview_id: session.candidate.interviewId,
          start_time: session.startTime.toISOString(),
          end_time: session.endTime?.toISOString(),
          integrity_score: session.integrityScore,
          status: session.status,
          events: session.events,
          created_at: new Date().toISOString()
        }]);

      if (error) throw error;
      console.log('Session saved to backend successfully');
    } catch (error) {
      console.error('Failed to save session to backend:', error);
      this.saveToLocalStorage(session);
    }
  }

  /**
   * Retrieve interview sessions from backend
   */
  static async getInterviewSessions(): Promise<InterviewSession[]> {
    if (!this.isConfigured()) {
      return this.getFromLocalStorage();
    }

    try {
      const { data, error } = await supabase
        .from('interview_sessions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map(item => ({
        id: item.id,
        candidate: {
          name: item.candidate_name,
          email: item.candidate_email,
          position: item.candidate_position,
          interviewId: item.interview_id
        },
        startTime: new Date(item.start_time),
        endTime: item.end_time ? new Date(item.end_time) : undefined,
        events: item.events || [],
        integrityScore: item.integrity_score,
        status: item.status
      }));
    } catch (error) {
      console.error('Failed to fetch sessions from backend:', error);
      return this.getFromLocalStorage();
    }
  }

  /**
   * Store focus and detection events in real-time
   */
  static async logDetectionEvent(sessionId: string, event: DetectionEvent): Promise<void> {
    if (!this.isConfigured()) {
      console.log('Event logged locally:', event);
      return;
    }

    try {
      const { error } = await supabase
        .from('detection_events')
        .insert([{
          id: event.id,
          session_id: sessionId,
          event_type: event.type,
          description: event.description,
          timestamp: event.timestamp.toISOString(),
          duration: event.duration,
          confidence: event.confidence,
          created_at: new Date().toISOString()
        }]);

      if (error) throw error;
    } catch (error) {
      console.error('Failed to log event to backend:', error);
    }
  }

  /**
   * Get integrity and focus reports for a specific session
   */
  static async getSessionReport(sessionId: string): Promise<InterviewSession | null> {
    if (!this.isConfigured()) {
      const sessions = this.getFromLocalStorage();
      return sessions.find(s => s.id === sessionId) || null;
    }

    try {
      const { data, error } = await supabase
        .from('interview_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (error) throw error;

      return {
        id: data.id,
        candidate: {
          name: data.candidate_name,
          email: data.candidate_email,
          position: data.candidate_position,
          interviewId: data.interview_id
        },
        startTime: new Date(data.start_time),
        endTime: data.end_time ? new Date(data.end_time) : undefined,
        events: data.events || [],
        integrityScore: data.integrity_score,
        status: data.status
      };
    } catch (error) {
      console.error('Failed to fetch session report:', error);
      return null;
    }
  }

  /**
   * Fallback: Save to localStorage when backend is not available
   */
  private static saveToLocalStorage(session: InterviewSession): void {
    try {
      const existingSessions = this.getFromLocalStorage();
      const updatedSessions = [...existingSessions.filter(s => s.id !== session.id), session];
      localStorage.setItem('interview_sessions', JSON.stringify(updatedSessions));
      console.log('Session saved to localStorage');
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  }

  /**
   * Fallback: Get from localStorage when backend is not available
   */
  private static getFromLocalStorage(): InterviewSession[] {
    try {
      const stored = localStorage.getItem('interview_sessions');
      if (!stored) return [];

      const sessions = JSON.parse(stored) as InterviewSession[];
      return sessions.map((session) => ({
        ...session,
        startTime: new Date(session.startTime),
        endTime: session.endTime ? new Date(session.endTime) : undefined,
        events: session.events.map((event) => ({
          ...event,
          timestamp: new Date(event.timestamp)
        }))
      }));
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
      return [];
    }
  }
}

// Database schema for backend setup (SQL for PostgreSQL/Supabase)
export const DATABASE_SCHEMA = `
-- Interview Sessions Table
CREATE TABLE interview_sessions (
  id VARCHAR(255) PRIMARY KEY,
  candidate_name VARCHAR(255) NOT NULL,
  candidate_email VARCHAR(255) NOT NULL,
  candidate_position VARCHAR(255) NOT NULL,
  interview_id VARCHAR(255) NOT NULL,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP,
  integrity_score INTEGER NOT NULL DEFAULT 100,
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  events JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Detection Events Table
CREATE TABLE detection_events (
  id VARCHAR(255) PRIMARY KEY,
  session_id VARCHAR(255) REFERENCES interview_sessions(id),
  event_type VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  timestamp TIMESTAMP NOT NULL,
  duration INTEGER,
  confidence DECIMAL(3,2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX idx_sessions_created_at ON interview_sessions(created_at);
CREATE INDEX idx_events_session_id ON detection_events(session_id);
CREATE INDEX idx_events_timestamp ON detection_events(timestamp);
CREATE INDEX idx_sessions_candidate_email ON interview_sessions(candidate_email);
`;