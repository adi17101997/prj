import React, { useState, useRef } from 'react';
import { Camera, AlertCircle, CheckCircle, XCircle, Wifi } from 'lucide-react';

export const CameraTroubleshoot: React.FC = () => {
    const [status, setStatus] = useState<string>('Click to test camera');
    const [isTestingCamera, setIsTestingCamera] = useState(false);
    const [cameraWorking, setCameraWorking] = useState<boolean | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const testCamera = async () => {
        setIsTestingCamera(true);
        setStatus('Testing camera access...');

        try {
            // Check if we're on HTTPS or localhost
            const isSecure = window.location.protocol === 'https:' ||
                window.location.hostname === 'localhost' ||
                window.location.hostname === '127.0.0.1';

            if (!isSecure) {
                setStatus('❌ Error: Camera requires HTTPS or localhost');
                setCameraWorking(false);
                setIsTestingCamera(false);
                return;
            }

            // Check if getUserMedia is available
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                setStatus('❌ Error: getUserMedia not supported in this browser');
                setCameraWorking(false);
                setIsTestingCamera(false);
                return;
            }

            setStatus('Requesting camera permission...');

            // Simple camera test
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                    facingMode: 'user'
                },
                audio: true
            });

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
            }

            streamRef.current = stream;
            setStatus('✅ Camera working successfully!');
            setCameraWorking(true);

        } catch (error: unknown) {
            console.error('Camera test failed:', error);

            let errorMessage = '❌ Camera test failed: ';

            if (error instanceof DOMException) {
                if (error.name === 'NotAllowedError') {
                    errorMessage += 'Permission denied. Please allow camera access and try again.';
                } else if (error.name === 'NotFoundError') {
                    errorMessage += 'No camera found. Please connect a camera and try again.';
                } else if (error.name === 'NotReadableError') {
                    errorMessage += 'Camera is being used by another application.';
                } else if (error.name === 'OverconstrainedError') {
                    errorMessage += 'Camera constraints not supported.';
                } else {
                    errorMessage += error.message || 'Unknown error occurred.';
                }
            } else {
                errorMessage += 'Unknown error occurred.';
            }

            setStatus(errorMessage);
            setCameraWorking(false);
        }

        setIsTestingCamera(false);
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }

        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }

        setCameraWorking(null);
        setStatus('Camera stopped. Click to test again.');
    };

    const getStatusIcon = () => {
        if (isTestingCamera) return <Wifi className="w-5 h-5 text-blue-400 animate-spin" />;
        if (cameraWorking === true) return <CheckCircle className="w-5 h-5 text-green-400" />;
        if (cameraWorking === false) return <XCircle className="w-5 h-5 text-red-400" />;
        return <AlertCircle className="w-5 h-5 text-yellow-400" />;
    };

    return (
        <div className="p-6 bg-gray-800 rounded-xl border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Camera className="w-5 h-5 mr-2" />
                Camera Troubleshooting
            </h3>

            <div className="space-y-4">
                {/* Status Display */}
                <div className="flex items-center space-x-3 p-3 bg-gray-900 rounded-lg">
                    {getStatusIcon()}
                    <span className="text-white text-sm">{status}</span>
                </div>

                {/* Camera Test Video */}
                <div className="relative bg-black rounded-lg overflow-hidden" style={{ aspectRatio: '4/3' }}>
                    <video
                        ref={videoRef}
                        autoPlay
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                    />
                    {cameraWorking === null && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80">
                            <Camera className="w-12 h-12 text-gray-400" />
                        </div>
                    )}
                </div>

                {/* Controls */}
                <div className="flex space-x-3">
                    <button
                        onClick={testCamera}
                        disabled={isTestingCamera}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                    >
                        {isTestingCamera ? 'Testing...' : 'Test Camera'}
                    </button>

                    {cameraWorking && (
                        <button
                            onClick={stopCamera}
                            className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                        >
                            Stop Camera
                        </button>
                    )}
                </div>

                {/* Environment Info */}
                <div className="bg-gray-900 rounded-lg p-3 text-xs text-gray-400">
                    <div className="grid grid-cols-2 gap-2">
                        <div>Protocol: {window.location.protocol}</div>
                        <div>Host: {window.location.hostname}</div>
                        <div>getUserMedia: {navigator.mediaDevices ? '✅' : '❌'}</div>
                        <div>Secure Context: {window.isSecureContext ? '✅' : '❌'}</div>
                    </div>
                </div>

                {/* Help Text */}
                <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3 text-sm text-blue-300">
                    <strong>Camera Requirements:</strong>
                    <ul className="mt-1 ml-4 list-disc space-y-1">
                        <li>HTTPS connection or localhost</li>
                        <li>Camera permissions granted</li>
                        <li>Camera not in use by other apps</li>
                        <li>Modern browser (Chrome 90+, Firefox 88+, Safari 14+)</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};