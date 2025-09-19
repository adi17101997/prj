export interface DetectionEvent {
  id: string;
  type: 'focus_lost' | 'no_face' | 'multiple_faces' | 'phone_detected' | 'book_detected' | 'device_detected' | 'drowsiness_detected' | 'background_noise' | 'unauthorized_voice';
  timestamp: Date;
  duration?: number;
  confidence: number;
  description: string;
}

export interface CandidateInfo {
  name: string;
  email: string;
  position: string;
  interviewId: string;
}

export interface InterviewSession {
  id: string;
  candidate: CandidateInfo;
  startTime: Date;
  endTime?: Date;
  events: DetectionEvent[];
  integrityScore: number;
  status: 'active' | 'completed' | 'paused';
}

export interface DetectionState {
  isFocused: boolean;
  faceDetected: boolean;
  faceCount: number;
  lastFocusLoss: Date | null;
  lastFaceDetection: Date | null;
  objectsDetected: string[];
  eyesClosed: boolean;
  drowsinessDetected: boolean;
  audioLevel: number;
  backgroundNoise: boolean;
  speechDetected: boolean;
}

export interface ReportData {
  candidate: CandidateInfo;
  duration: number;
  focusLostCount: number;
  suspiciousEvents: DetectionEvent[];
  integrityScore: number;
  summary: {
    totalViolations: number;
    severityBreakdown: { [key: string]: number };
    recommendations: string[];
  };
}

export interface CameraPermissions {
  camera: boolean;
  microphone: boolean;
}

export interface AudioAnalysis {
  volume: number;
  backgroundNoise: boolean;
  speechDetected: boolean;
}

export interface EyeTrackingData {
  eyesClosed: boolean;
  drowsinessDetected: boolean;
  blinkRate: number;
  gazeDirection: { x: number; y: number };
}