import { useState, useRef, useCallback, useEffect } from 'react';

interface CameraPermissions {
  camera: boolean;
  microphone: boolean;
}

export const useCamera = () => {
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<CameraPermissions>({ camera: false, microphone: false });
  const [isRecording, setIsRecording] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  const checkPermissions = useCallback(async () => {
    try {
      const cameraPermission = await navigator.permissions.query({ name: 'camera' as PermissionName });
      const microphonePermission = await navigator.permissions.query({ name: 'microphone' as PermissionName });

      setPermissions({
        camera: cameraPermission.state === 'granted',
        microphone: microphonePermission.state === 'granted'
      });

      return cameraPermission.state === 'granted' && microphonePermission.state === 'granted';
    } catch (err) {
      console.warn('Permission API not supported');
      return false;
    }
  }, []);

  const startCamera = useCallback(async () => {
    try {
      // Check if we're in a secure context
      if (!window.isSecureContext && window.location.hostname !== 'localhost') {
        setError('Camera requires HTTPS connection. Please use HTTPS or localhost.');
        setIsActive(false);
        return;
      }

      // Check if getUserMedia is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError('Camera not supported in this browser. Please use Chrome, Firefox, or Safari.');
        setIsActive(false);
        return;
      }

      // Check permissions first
      await checkPermissions();

      setError(null); // Clear any previous errors

      const constraints = {
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 },
          facingMode: 'user'
        },
        audio: true
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      streamRef.current = stream;
      setIsActive(true);
      setError(null);
      setPermissions({ camera: true, microphone: true });
    } catch (err) {
      let errorMessage = 'Failed to access camera';
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          errorMessage = 'Camera and microphone access denied. Please allow permissions and refresh the page.';
        } else if (err.name === 'NotFoundError') {
          errorMessage = 'No camera or microphone found. Please connect a camera and try again.';
        } else if (err.name === 'NotReadableError') {
          errorMessage = 'Camera is already in use by another application.';
        } else {
          errorMessage = err.message;
        }
      }
      setError(errorMessage);
      setIsActive(false);
      setPermissions({ camera: false, microphone: false });
    }
  }, [checkPermissions]);

  const startRecording = useCallback(() => {
    if (!streamRef.current || isRecording) return;

    try {
      const mediaRecorder = new MediaRecorder(streamRef.current, {
        mimeType: 'video/webm;codecs=vp9'
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);

        // Create download link
        const a = document.createElement('a');
        a.href = url;
        a.download = `interview_recording_${new Date().toISOString().slice(0, 19)}.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        recordedChunksRef.current = [];
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(1000); // Record in 1-second chunks
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start recording:', err);
      setError('Failed to start recording. Recording may not be supported in this browser.');
    }
  }, [isRecording]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);
  const stopCamera = useCallback(() => {
    stopRecording();

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsActive(false);
    setPermissions({ camera: false, microphone: false });
  }, []);

  useEffect(() => {
    checkPermissions();
    return () => {
      stopCamera();
    };
  }, [stopCamera, checkPermissions]);

  return {
    videoRef,
    isActive,
    error,
    permissions,
    isRecording,
    startCamera,
    stopCamera,
    startRecording,
    stopRecording,
    checkPermissions
  };
};