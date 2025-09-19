import { useRef, useCallback, useEffect } from 'react';
import { FaceMesh } from '@mediapipe/face_mesh';
import { Camera } from '@mediapipe/camera_utils';

interface FaceDetectionResult {
  faceDetected: boolean;
  faceCount: number;
  landmarks: any[];
  isFocused: boolean;
}

export const useFaceDetection = (
  videoElement: HTMLVideoElement | null,
  onResults: (results: FaceDetectionResult) => void
) => {
  const faceMeshRef = useRef<FaceMesh | null>(null);
  const cameraRef = useRef<Camera | null>(null);

  const initializeFaceDetection = useCallback(async () => {
    if (!videoElement) return;

    try {
      const faceMesh = new FaceMesh({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
        }
      });

      faceMesh.setOptions({
        maxNumFaces: 3,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      faceMesh.onResults((results) => {
        const faceCount = results.multiFaceLandmarks?.length || 0;
        const faceDetected = faceCount > 0;
        
        // Calculate focus based on face orientation
        let isFocused = false;
        if (results.multiFaceLandmarks && results.multiFaceLandmarks[0]) {
          const landmarks = results.multiFaceLandmarks[0];
          // Simple focus detection based on nose and eye positions
          const noseTip = landmarks[1];
          const leftEye = landmarks[33];
          const rightEye = landmarks[263];
          
          // Check if face is roughly centered and looking forward
          const centerX = (leftEye.x + rightEye.x) / 2;
          const noseX = noseTip.x;
          const deviation = Math.abs(centerX - noseX);
          
          isFocused = deviation < 0.1 && faceCount === 1;
        }

        onResults({
          faceDetected,
          faceCount,
          landmarks: results.multiFaceLandmarks || [],
          isFocused
        });
      });

      const camera = new Camera(videoElement, {
        onFrame: async () => {
          await faceMesh.send({ image: videoElement });
        },
        width: 1280,
        height: 720
      });

      faceMeshRef.current = faceMesh;
      cameraRef.current = camera;

      await camera.start();
    } catch (error) {
      console.error('Failed to initialize face detection:', error);
    }
  }, [videoElement, onResults]);

  const cleanup = useCallback(() => {
    if (cameraRef.current) {
      cameraRef.current.stop();
      cameraRef.current = null;
    }
    faceMeshRef.current = null;
  }, []);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    initializeFaceDetection,
    cleanup
  };
};