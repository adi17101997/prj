import React, { useEffect, useRef } from 'react';
import { Camera, CameraOff, Wifi, WifiOff, Mic, MicOff, Video, VideoOff } from 'lucide-react';
import { CameraPermissions } from '../types';

interface VideoFeedProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  isActive: boolean;
  error: string | null;
  permissions: CameraPermissions;
  isRecording: boolean;
  onVideoReady: () => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
}

export const VideoFeed: React.FC<VideoFeedProps> = ({
  videoRef,
  isActive,
  error,
  permissions,
  isRecording,
  onVideoReady,
  onStartRecording,
  onStopRecording
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (isActive && videoRef.current && videoRef.current.readyState >= 2) {
      onVideoReady();
    }
  }, [isActive, onVideoReady]);

  return (
    <div className="relative bg-gray-900 rounded-xl overflow-hidden shadow-2xl">
      <div className="relative aspect-video">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover"
        />
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full opacity-30"
        />
        
        {/* Status Overlay */}
        <div className="absolute top-4 left-4 flex items-center space-x-2">
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium ${
            isActive ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
          }`}>
            {isActive ? (
              <>
                <Wifi className="w-3 h-3" />
                <span>LIVE</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3" />
                <span>OFFLINE</span>
              </>
            )}
          </div>
          
          {/* Permission Status */}
          <div className="flex items-center space-x-1">
            <div className={`p-1 rounded ${permissions.camera ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
              {permissions.camera ? (
                <Video className="w-3 h-3 text-green-300" />
              ) : (
                <VideoOff className="w-3 h-3 text-red-300" />
              )}
            </div>
            <div className={`p-1 rounded ${permissions.microphone ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
              {permissions.microphone ? (
                <Mic className="w-3 h-3 text-green-300" />
              ) : (
                <MicOff className="w-3 h-3 text-red-300" />
              )}
            </div>
          </div>
        </div>

        {/* Recording Indicator */}
        {isRecording && (
          <div className="absolute top-4 right-4 flex items-center space-x-2 px-3 py-1 bg-red-500/20 text-red-300 rounded-full text-xs font-medium">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span>REC</span>
          </div>
        )}

        {/* Recording Controls */}
        {isActive && (
          <div className="absolute bottom-4 right-4 flex items-center space-x-2">
            {!isRecording ? (
              <button
                onClick={onStartRecording}
                className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-full transition-colors"
                title="Start Recording"
              >
                <Video className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={onStopRecording}
                className="bg-gray-600 hover:bg-gray-700 text-white p-2 rounded-full transition-colors"
                title="Stop Recording"
              >
                <VideoOff className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
        {/* Error State */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80">
            <div className="text-center p-6">
              <CameraOff className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Camera Access Required</h3>
              <p className="text-gray-300 text-sm">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
              >
                Refresh Page
              </button>
            </div>
          </div>
        )}

        {/* Not Active State */}
        {!isActive && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80">
            <div className="text-center p-6">
              <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Camera Inactive</h3>
              <p className="text-gray-300 text-sm">Please start the camera to begin monitoring</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};