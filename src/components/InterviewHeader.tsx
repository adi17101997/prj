import React from 'react';
import { Play, Pause, Square, FileText, User, Download } from 'lucide-react';
import { CandidateInfo } from '../types';
import { formatDuration } from '../utils/helpers';
import { downloadSampleCSV } from '../utils/sampleReport';

interface InterviewHeaderProps {
  candidate: CandidateInfo;
  isActive: boolean;
  duration: number;
  onStart: () => void;
  onPause: () => void;
  onStop: () => void;
  onGenerateReport: () => void;
}

export const InterviewHeader: React.FC<InterviewHeaderProps> = ({
  candidate,
  isActive,
  duration,
  onStart,
  onPause,
  onStop,
  onGenerateReport
}) => {
  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 w-12 h-12 rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{candidate.name}</h2>
            <p className="text-gray-300">{candidate.position}</p>
            <p className="text-sm text-gray-400">{candidate.email}</p>
          </div>
        </div>

        <div className="text-right">
          <div className="text-2xl font-mono text-white font-bold">
            {formatDuration(duration)}
          </div>
          <div className="text-sm text-gray-400">Interview Duration</div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-6">
        <div className="flex items-center space-x-3">
          {!isActive ? (
            <button
              onClick={onStart}
              className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <Play className="w-4 h-4" />
              <span>Start Monitoring</span>
            </button>
          ) : (
            <div className="flex items-center space-x-3">
              <button
                onClick={onPause}
                className="flex items-center space-x-2 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <Pause className="w-4 h-4" />
                <span>Pause</span>
              </button>
              <button
                onClick={onStop}
                className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <Square className="w-4 h-4" />
                <span>Stop</span>
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onGenerateReport}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <FileText className="w-4 h-4" />
            <span>Generate Report</span>
          </button>

          <button
            onClick={downloadSampleCSV}
            className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            title="Download Sample Report for Assignment Submission"
          >
            <Download className="w-4 h-4" />
            <span>Sample CSV</span>
          </button>
        </div>
      </div>
    </div>
  );
};