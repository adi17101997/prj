import { useRef, useCallback } from 'react';

interface EyeTrackingResult {
  eyesClosed: boolean;
  drowsinessDetected: boolean;
  blinkRate: number;
  gazeDirection: { x: number; y: number };
}

export const useEyeTracking = (
  onEyeTracking: (result: EyeTrackingResult) => void
) => {
  const blinkCountRef = useRef(0);
  const lastBlinkTimeRef = useRef(Date.now());
  const eyesClosedDurationRef = useRef(0);
  const lastEyeStateRef = useRef(false);

  const analyzeEyeLandmarks = useCallback((landmarks: any[]) => {
    if (!landmarks || landmarks.length === 0) return;

    const faceLandmarks = landmarks[0];
    
    // Eye landmarks indices for MediaPipe
    const leftEyeIndices = [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246];
    const rightEyeIndices = [362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398];
    
    // Calculate eye aspect ratio (EAR) for blink detection
    const calculateEAR = (eyeIndices: number[]) => {
      const eyePoints = eyeIndices.map(i => faceLandmarks[i]);
      
      // Vertical distances
      const v1 = Math.sqrt(
        Math.pow(eyePoints[1].x - eyePoints[5].x, 2) + 
        Math.pow(eyePoints[1].y - eyePoints[5].y, 2)
      );
      const v2 = Math.sqrt(
        Math.pow(eyePoints[2].x - eyePoints[4].x, 2) + 
        Math.pow(eyePoints[2].y - eyePoints[4].y, 2)
      );
      
      // Horizontal distance
      const h = Math.sqrt(
        Math.pow(eyePoints[0].x - eyePoints[3].x, 2) + 
        Math.pow(eyePoints[0].y - eyePoints[3].y, 2)
      );
      
      return (v1 + v2) / (2 * h);
    };

    const leftEAR = calculateEAR(leftEyeIndices);
    const rightEAR = calculateEAR(rightEyeIndices);
    const avgEAR = (leftEAR + rightEAR) / 2;
    
    // Eye closure detection (EAR threshold)
    const EAR_THRESHOLD = 0.25;
    const eyesClosed = avgEAR < EAR_THRESHOLD;
    
    const now = Date.now();
    
    // Blink detection
    if (eyesClosed && !lastEyeStateRef.current) {
      blinkCountRef.current++;
      lastBlinkTimeRef.current = now;
    }
    
    // Calculate blink rate (blinks per minute)
    const timeSinceLastBlink = now - lastBlinkTimeRef.current;
    const blinkRate = timeSinceLastBlink > 60000 ? 0 : (blinkCountRef.current / (timeSinceLastBlink / 60000));
    
    // Drowsiness detection (eyes closed for extended period)
    if (eyesClosed) {
      eyesClosedDurationRef.current += 100; // Assuming 100ms intervals
    } else {
      eyesClosedDurationRef.current = 0;
    }
    
    const drowsinessDetected = eyesClosedDurationRef.current > 2000; // 2 seconds
    
    // Gaze direction estimation (simplified)
    const noseTip = faceLandmarks[1];
    const leftEyeCenter = faceLandmarks[33];
    const rightEyeCenter = faceLandmarks[263];
    
    const eyeCenterX = (leftEyeCenter.x + rightEyeCenter.x) / 2;
    const eyeCenterY = (leftEyeCenter.y + rightEyeCenter.y) / 2;
    
    const gazeDirection = {
      x: noseTip.x - eyeCenterX,
      y: noseTip.y - eyeCenterY
    };
    
    lastEyeStateRef.current = eyesClosed;
    
    onEyeTracking({
      eyesClosed,
      drowsinessDetected,
      blinkRate: Math.round(blinkRate),
      gazeDirection
    });
  }, [onEyeTracking]);

  const resetTracking = useCallback(() => {
    blinkCountRef.current = 0;
    lastBlinkTimeRef.current = Date.now();
    eyesClosedDurationRef.current = 0;
    lastEyeStateRef.current = false;
  }, []);

  return {
    analyzeEyeLandmarks,
    resetTracking
  };
};