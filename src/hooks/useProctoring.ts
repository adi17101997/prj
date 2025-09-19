import { useState, useCallback, useRef } from 'react';
import { DetectionEvent, DetectionState, InterviewSession, CandidateInfo, AudioAnalysis, EyeTrackingData } from '../types';
import { generateId } from '../utils/helpers';
import { ApiService } from '../services/api';

const FOCUS_LOSS_THRESHOLD = 5000; // 5 seconds
const NO_FACE_THRESHOLD = 10000; // 10 seconds
const DROWSINESS_THRESHOLD = 3000; // 3 seconds
const BACKGROUND_NOISE_THRESHOLD = 10000; // 10 seconds

export const useProctoring = (candidate: CandidateInfo) => {
  const [session, setSession] = useState<InterviewSession>({
    id: generateId(),
    candidate,
    startTime: new Date(),
    events: [],
    integrityScore: 100,
    status: 'active'
  });

  const [detectionState, setDetectionState] = useState<DetectionState>({
    isFocused: true,
    faceDetected: true,
    faceCount: 1,
    lastFocusLoss: null,
    lastFaceDetection: new Date(),
    objectsDetected: [],
    eyesClosed: false,
    drowsinessDetected: false,
    audioLevel: 0,
    backgroundNoise: false,
    speechDetected: false
  });

  const lastEventRef = useRef<{ [key: string]: Date }>({});

  const addEvent = useCallback((
    type: DetectionEvent['type'],
    description: string,
    confidence: number = 1.0,
    duration?: number
  ) => {
    const now = new Date();
    const eventKey = `${type}_${Math.floor(now.getTime() / 1000)}`;

    // Prevent duplicate events within same second
    if (lastEventRef.current[eventKey]) return;
    lastEventRef.current[eventKey] = now;

    const event: DetectionEvent = {
      id: generateId(),
      type,
      timestamp: now,
      duration,
      confidence,
      description
    };

    setSession(prev => {
      const newScore = calculateIntegrityScore(prev.events, event);
      const updatedSession = {
        ...prev,
        events: [...prev.events, event],
        integrityScore: newScore
      };

      // Save to backend/localStorage
      ApiService.logDetectionEvent(prev.id, event);

      return updatedSession;
    });
  }, []);

  const updateDetectionState = useCallback((updates: Partial<DetectionState>) => {
    const now = new Date();

    setDetectionState(prev => {
      const newState = { ...prev, ...updates };

      // Check for focus loss
      if (prev.isFocused && !newState.isFocused) {
        newState.lastFocusLoss = now;
      } else if (!prev.isFocused && newState.isFocused && prev.lastFocusLoss) {
        const duration = now.getTime() - prev.lastFocusLoss.getTime();
        if (duration > FOCUS_LOSS_THRESHOLD) {
          addEvent('focus_lost', `Focus lost for ${Math.round(duration / 1000)} seconds`, 1.0, duration);
        }
        newState.lastFocusLoss = null;
      }

      // Check for no face detection
      if (newState.faceDetected) {
        newState.lastFaceDetection = now;
      } else if (prev.faceDetected && !newState.faceDetected) {
        setTimeout(() => {
          setDetectionState(current => {
            if (!current.faceDetected) {
              const noFaceDuration = now.getTime() - (current.lastFaceDetection?.getTime() || now.getTime());
              if (noFaceDuration > NO_FACE_THRESHOLD) {
                addEvent('no_face', `No face detected for ${Math.round(noFaceDuration / 1000)} seconds`, 1.0, noFaceDuration);
              }
            }
            return current;
          });
        }, NO_FACE_THRESHOLD);
      }

      // Check for multiple faces
      if (newState.faceCount > 1 && prev.faceCount <= 1) {
        addEvent('multiple_faces', `${newState.faceCount} faces detected`, 0.9);
      }

      // Check for suspicious objects
      newState.objectsDetected.forEach(object => {
        if (!prev.objectsDetected.includes(object)) {
          const eventType = object.toLowerCase().includes('phone') ? 'phone_detected' :
                          object.toLowerCase().includes('book') ? 'book_detected' : 'device_detected';
          addEvent(eventType, `${object} detected in frame`, 0.8);
        }
      });

      // Check for drowsiness
      if (newState.drowsinessDetected && !prev.drowsinessDetected) {
        addEvent('drowsiness_detected', 'Candidate appears drowsy or eyes closed for extended period', 0.9);
      }

      // Check for background noise
      if (newState.backgroundNoise && !prev.backgroundNoise) {
        addEvent('background_noise', 'Background noise detected', 0.7);
      }

      // Check for unauthorized speech
      if (newState.speechDetected && !prev.speechDetected) {
        addEvent('unauthorized_voice', 'Unauthorized voice or conversation detected', 0.8);
      }
      return newState;
    });
  }, [addEvent]);

  const updateAudioAnalysis = useCallback((analysis: AudioAnalysis) => {
    updateDetectionState({
      audioLevel: analysis.volume,
      backgroundNoise: analysis.backgroundNoise,
      speechDetected: analysis.speechDetected
    });
  }, [updateDetectionState]);

  const updateEyeTracking = useCallback((eyeData: EyeTrackingData) => {
    updateDetectionState({
      eyesClosed: eyeData.eyesClosed,
      drowsinessDetected: eyeData.drowsinessDetected
    });
  }, [updateDetectionState]);
  const endSession = useCallback(() => {
    setSession(prev => {
      const completedSession = {
        ...prev,
        endTime: new Date(),
        status: 'completed' as const
      };

      // Save final session to backend/localStorage
      ApiService.saveInterviewSession(completedSession);

      return completedSession;
    });
  }, []);

  return {
    session,
    detectionState,
    updateDetectionState,
    updateAudioAnalysis,
    updateEyeTracking,
    addEvent,
    endSession
  };
};

function calculateIntegrityScore(events: DetectionEvent[], newEvent: DetectionEvent): number {
  const allEvents = [...events, newEvent];
  let score = 100;

  allEvents.forEach(event => {
    switch (event.type) {
      case 'focus_lost':
        score -= Math.min(15, (event.duration || 5000) / 1000 * 2);
        break;
      case 'no_face':
        score -= 20;
        break;
      case 'multiple_faces':
        score -= 10;
        break;
      case 'phone_detected':
        score -= 25;
        break;
      case 'book_detected':
        score -= 15;
        break;
      case 'device_detected':
        score -= 10;
        break;
      case 'drowsiness_detected':
        score -= 12;
        break;
      case 'background_noise':
        score -= 5;
        break;
      case 'unauthorized_voice':
        score -= 20;
        break;
    }
  });

  return Math.max(0, Math.round(score));
}