import React, { useEffect, useState, useCallback } from 'react';
import { CandidateInfo } from '../types';
import { useCamera } from '../hooks/useCamera';
import { useFaceDetection } from '../hooks/useFaceDetection';
import { useObjectDetection } from '../hooks/useObjectDetection';
import { useAudioDetection } from '../hooks/useAudioDetection';
import { useEyeTracking } from '../hooks/useEyeTracking';
import { useProctoring } from '../hooks/useProctoring';
import { VideoFeed } from './VideoFeed';
import { DetectionPanel } from './DetectionPanel';
import { EventLog } from './EventLog';
import { InterviewHeader } from './InterviewHeader';
import { ProctorReport } from './ProctorReport';
import { CameraTroubleshoot } from './CameraTroubleshoot';

interface InterviewInterfaceProps {
  candidate: CandidateInfo;
  onBack: () => void;
}

export const InterviewInterface: React.FC<InterviewInterfaceProps> = ({
  candidate,
  onBack
}) => {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [duration, setDuration] = useState(0);

  const {
    videoRef,
    isActive,
    error,
    permissions,
    isRecording,
    startCamera,
    stopCamera,
    startRecording,
    stopRecording
  } = useCamera();

  const {
    session,
    detectionState,
    updateDetectionState,
    updateAudioAnalysis,
    updateEyeTracking,
    endSession
  } = useProctoring(candidate);

  // Face detection
  const onFaceResults = useCallback((results: any) => {
    updateDetectionState({
      faceDetected: results.faceDetected,
      faceCount: results.faceCount,
      isFocused: results.isFocused
    });

    // Pass landmarks to eye tracking
    if (results.landmarks && results.landmarks.length > 0) {
      analyzeEyeLandmarks(results.landmarks);
    }
  }, [updateDetectionState]);

  const { initializeFaceDetection, cleanup: cleanupFaceDetection } = useFaceDetection(
    videoRef.current,
    onFaceResults
  );

  // Object detection
  const onObjectsDetected = useCallback((objects: string[]) => {
    updateDetectionState({
      objectsDetected: objects
    });
  }, [updateDetectionState]);

  const { startDetection: startObjectDetection, stopDetection: stopObjectDetection } = useObjectDetection(
    videoRef.current,
    onObjectsDetected
  );

  // Audio detection
  const onAudioAnalysis = useCallback((analysis: any) => {
    updateAudioAnalysis(analysis);
  }, [updateAudioAnalysis]);

  const { startAudioAnalysis, stopAudioAnalysis } = useAudioDetection(
    videoRef.current?.srcObject as MediaStream,
    onAudioAnalysis
  );

  // Eye tracking
  const onEyeTracking = useCallback((eyeData: any) => {
    updateEyeTracking(eyeData);
  }, [updateEyeTracking]);

  const { analyzeEyeLandmarks } = useEyeTracking(onEyeTracking);
  // Duration timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isMonitoring) {
      interval = setInterval(() => {
        setDuration(Date.now() - session.startTime.getTime());
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isMonitoring, session.startTime]);

  const handleStart = async () => {
    try {
      await startCamera();
      setIsMonitoring(true);
    } catch (err) {
      console.error('Failed to start monitoring:', err);
    }
  };

  const handlePause = () => {
    setIsMonitoring(false);
    stopObjectDetection();
    cleanupFaceDetection();
    stopAudioAnalysis();
  };

  const handleStop = () => {
    setIsMonitoring(false);
    stopCamera();
    stopObjectDetection();
    cleanupFaceDetection();
    stopAudioAnalysis();
    stopRecording();
    endSession();
  };

  const handleVideoReady = () => {
    if (isMonitoring) {
      initializeFaceDetection();
      startObjectDetection();
      startAudioAnalysis();
      startRecording();
    }
  };

  const handleGenerateReport = () => {
    setShowReport(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <InterviewHeader
          candidate={candidate}
          isActive={isMonitoring}
          duration={duration}
          onStart={handleStart}
          onPause={handlePause}
          onStop={handleStop}
          onGenerateReport={handleGenerateReport}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Video Feed */}
          <div className="lg:col-span-2">
            <VideoFeed
              videoRef={videoRef}
              isActive={isActive}
              error={error}
              permissions={permissions}
              isRecording={isRecording}
              onVideoReady={handleVideoReady}
              onStartRecording={startRecording}
              onStopRecording={stopRecording}
            />
          </div>

          {/* Detection Panel */}
          <div>
            <DetectionPanel
              detectionState={detectionState}
              integrityScore={session.integrityScore}
            />
          </div>
        </div>

        {/* Event Log */}
        <div className="mt-6">
          <EventLog events={session.events} />
        </div>

        {/* Camera Troubleshooting - Temporary Debug Component */}
        {error && (
          <div className="mt-6">
            <CameraTroubleshoot />
          </div>
        )}

        {/* Report Modal */}
        {showReport && (
          <ProctorReport
            session={session}
            onClose={() => setShowReport(false)}
          />
        )}
      </div>
    </div>
  );
};