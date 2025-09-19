import React from 'react';
import { Eye, Users, Smartphone, Book, Monitor, AlertTriangle, CheckCircle, Volume2, Headphones, EyeOff } from 'lucide-react';
import { DetectionState } from '../types';
import { getIntegrityScoreColor, getIntegrityScoreBg } from '../utils/helpers';

interface DetectionPanelProps {
  detectionState: DetectionState;
  integrityScore: number;
}

export const DetectionPanel: React.FC<DetectionPanelProps> = ({
  detectionState,
  integrityScore
}) => {
  const indicators = [
    {
      icon: Eye,
      label: 'Focus Status',
      value: detectionState.isFocused ? 'Focused' : 'Not Focused',
      status: detectionState.isFocused ? 'good' : 'warning',
      color: detectionState.isFocused ? 'text-green-400' : 'text-yellow-400'
    },
    {
      icon: Users,
      label: 'Face Detection',
      value: detectionState.faceDetected 
        ? `${detectionState.faceCount} face${detectionState.faceCount !== 1 ? 's' : ''}` 
        : 'No face detected',
      status: detectionState.faceDetected && detectionState.faceCount === 1 ? 'good' : 'warning',
      color: detectionState.faceDetected && detectionState.faceCount === 1 ? 'text-green-400' : 'text-red-400'
    },
    {
      icon: EyeOff,
      label: 'Eye Status',
      value: detectionState.drowsinessDetected ? 'Drowsy' : detectionState.eyesClosed ? 'Eyes Closed' : 'Alert',
      status: detectionState.drowsinessDetected ? 'danger' : detectionState.eyesClosed ? 'warning' : 'good',
      color: detectionState.drowsinessDetected ? 'text-red-400' : detectionState.eyesClosed ? 'text-yellow-400' : 'text-green-400'
    },
    {
      icon: Smartphone,
      label: 'Phone Detection',
      value: detectionState.objectsDetected.some(obj => obj.toLowerCase().includes('phone')) ? 'Detected' : 'Clear',
      status: detectionState.objectsDetected.some(obj => obj.toLowerCase().includes('phone')) ? 'danger' : 'good',
      color: detectionState.objectsDetected.some(obj => obj.toLowerCase().includes('phone')) ? 'text-red-400' : 'text-green-400'
    },
    {
      icon: Book,
      label: 'Books/Notes',
      value: detectionState.objectsDetected.some(obj => obj.toLowerCase().includes('book')) ? 'Detected' : 'Clear',
      status: detectionState.objectsDetected.some(obj => obj.toLowerCase().includes('book')) ? 'danger' : 'good',
      color: detectionState.objectsDetected.some(obj => obj.toLowerCase().includes('book')) ? 'text-red-400' : 'text-green-400'
    },
    {
      icon: Volume2,
      label: 'Audio Level',
      value: `${detectionState.audioLevel}%`,
      status: detectionState.audioLevel > 50 ? 'warning' : 'good',
      color: detectionState.audioLevel > 50 ? 'text-yellow-400' : 'text-green-400'
    },
    {
      icon: Headphones,
      label: 'Background Audio',
      value: detectionState.backgroundNoise ? 'Noise Detected' : detectionState.speechDetected ? 'Speech Detected' : 'Clear',
      status: detectionState.speechDetected ? 'danger' : detectionState.backgroundNoise ? 'warning' : 'good',
      color: detectionState.speechDetected ? 'text-red-400' : detectionState.backgroundNoise ? 'text-yellow-400' : 'text-green-400'
    }
  ];

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
      <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
        <Monitor className="w-5 h-5 mr-2 text-blue-400" />
        Detection Status
      </h3>

      {/* Integrity Score */}
      <div className={`rounded-lg p-4 mb-6 border-2 ${getIntegrityScoreBg(integrityScore)}`}>
        <div className="flex items-center justify-between">
          <span className="font-medium text-gray-800">Integrity Score</span>
          <span className={`text-2xl font-bold ${getIntegrityScoreColor(integrityScore)}`}>
            {integrityScore}%
          </span>
        </div>
        <div className="mt-2 bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              integrityScore >= 80 ? 'bg-green-500' :
              integrityScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${integrityScore}%` }}
          />
        </div>
      </div>

      {/* Detection Indicators */}
      <div className="space-y-4">
        {indicators.map((indicator, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-gray-900/30 rounded-lg">
            <div className="flex items-center space-x-3">
              <indicator.icon className={`w-5 h-5 ${indicator.color}`} />
              <span className="text-gray-300 font-medium">{indicator.label}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`text-sm font-medium ${indicator.color}`}>
                {indicator.value}
              </span>
              {indicator.status === 'good' ? (
                <CheckCircle className="w-4 h-4 text-green-400" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-yellow-400" />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Current Objects */}
      {detectionState.objectsDetected.length > 0 && (
        <div className="mt-6 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
          <h4 className="text-red-400 font-medium mb-2 flex items-center">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Detected Objects
          </h4>
          <div className="flex flex-wrap gap-2">
            {detectionState.objectsDetected.map((object, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-red-500/20 text-red-300 rounded text-xs font-medium"
              >
                {object}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}