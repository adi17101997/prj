import React from 'react';
import { Download, FileText, AlertTriangle, CheckCircle, Clock, User } from 'lucide-react';
import { InterviewSession } from '../types';
import { formatDuration, formatTimestamp, getEventSeverity, getIntegrityScoreColor } from '../utils/helpers';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface ProctorReportProps {
  session: InterviewSession;
  onClose: () => void;
}

export const ProctorReport: React.FC<ProctorReportProps> = ({ session, onClose }) => {
  const duration = session.endTime 
    ? session.endTime.getTime() - session.startTime.getTime()
    : Date.now() - session.startTime.getTime();

  const eventsByType = session.events.reduce((acc, event) => {
    acc[event.type] = (acc[event.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const severityCount = session.events.reduce((acc, event) => {
    const severity = getEventSeverity(event.type);
    acc[severity] = (acc[severity] || 0) + 1;
    return acc;
  }, { high: 0, medium: 0, low: 0 });

  const recommendations = generateRecommendations(session);

  const downloadPDF = async () => {
    const element = document.getElementById('report-content');
    if (!element) return;

    const canvas = await html2canvas(element, {
      backgroundColor: '#ffffff',
      scale: 2
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    const imgWidth = 210;
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(`${session.candidate.name}_Interview_Report.pdf`);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <FileText className="w-6 h-6 mr-2 text-blue-600" />
            Proctoring Report
          </h2>
          <div className="flex items-center space-x-3">
            <button
              onClick={downloadPDF}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              ×
            </button>
          </div>
        </div>

        <div id="report-content" className="p-6">
          {/* Candidate Information */}
          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2 text-blue-600" />
              Candidate Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium text-gray-900">{session.candidate.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium text-gray-900">{session.candidate.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Position</p>
                <p className="font-medium text-gray-900">{session.candidate.position}</p>
              </div>
            </div>
          </div>

          {/* Interview Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <Clock className="w-8 h-8 text-blue-600" />
                <span className="text-2xl font-bold text-blue-900">{formatDuration(duration)}</span>
              </div>
              <p className="text-blue-700 font-medium mt-2">Duration</p>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <AlertTriangle className="w-8 h-8 text-gray-600" />
                <span className="text-2xl font-bold text-gray-900">{session.events.length}</span>
              </div>
              <p className="text-gray-700 font-medium mt-2">Total Events</p>
            </div>

            <div className={`border-2 rounded-xl p-4 ${
              session.integrityScore >= 80 ? 'bg-green-50 border-green-200' :
              session.integrityScore >= 60 ? 'bg-yellow-50 border-yellow-200' :
              'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center justify-between">
                <CheckCircle className={`w-8 h-8 ${getIntegrityScoreColor(session.integrityScore)}`} />
                <span className={`text-2xl font-bold ${getIntegrityScoreColor(session.integrityScore)}`}>
                  {session.integrityScore}%
                </span>
              </div>
              <p className="font-medium mt-2 text-gray-700">Integrity Score</p>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <AlertTriangle className="w-8 h-8 text-red-600" />
                <span className="text-2xl font-bold text-red-900">{severityCount.high}</span>
              </div>
              <p className="text-red-700 font-medium mt-2">High Priority</p>
            </div>
          </div>

          {/* Event Breakdown */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Breakdown</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(eventsByType).map(([type, count]) => (
                <div key={type} className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-lg font-bold text-gray-900">{count}</div>
                  <div className="text-xs text-gray-600 capitalize">
                    {type.replace('_', ' ')}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed Events */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Timeline</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {session.events.map((event) => {
                const severity = getEventSeverity(event.type);
                const colorClass = severity === 'high' ? 'border-red-200 bg-red-50' :
                                 severity === 'medium' ? 'border-yellow-200 bg-yellow-50' :
                                 'border-blue-200 bg-blue-50';
                
                return (
                  <div key={event.id} className={`border rounded-lg p-3 ${colorClass}`}>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">{event.description}</span>
                      <span className="text-sm text-gray-600">{formatTimestamp(event.timestamp)}</span>
                    </div>
                    {event.duration && (
                      <div className="text-sm text-gray-600 mt-1">
                        Duration: {Math.round(event.duration / 1000)} seconds
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommendations</h3>
            <ul className="space-y-2">
              {recommendations.map((rec, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

function generateRecommendations(session: InterviewSession): string[] {
  const recommendations = [];
  const { events, integrityScore } = session;

  if (integrityScore >= 80) {
    recommendations.push("Candidate demonstrated excellent interview integrity.");
  } else if (integrityScore >= 60) {
    recommendations.push("Candidate showed acceptable behavior with minor infractions.");
  } else {
    recommendations.push("Candidate's behavior raises concerns that should be addressed.");
  }

  const phoneDetections = events.filter(e => e.type === 'phone_detected').length;
  if (phoneDetections > 0) {
    recommendations.push(`Mobile phone was detected ${phoneDetections} time(s). Consider discussing device policies.`);
  }

  const focusLoss = events.filter(e => e.type === 'focus_lost').length;
  if (focusLoss > 3) {
    recommendations.push("Frequent focus loss detected. May indicate distraction or technical issues.");
  }

  const multipleFaces = events.filter(e => e.type === 'multiple_faces').length;
  if (multipleFaces > 0) {
    recommendations.push("Multiple faces detected. Verify candidate was alone during the interview.");
  }

  const noFaceEvents = events.filter(e => e.type === 'no_face').length;
  if (noFaceEvents > 2) {
    recommendations.push("Extended periods without face detection. Check for technical issues or candidate absence.");
  }

  const drowsinessEvents = events.filter(e => e.type === 'drowsiness_detected').length;
  if (drowsinessEvents > 0) {
    recommendations.push("Signs of drowsiness detected. Consider interview timing and candidate alertness.");
  }

  const audioViolations = events.filter(e => e.type === 'unauthorized_voice').length;
  if (audioViolations > 0) {
    recommendations.push("Unauthorized voices detected. Verify candidate was alone and no external assistance was provided.");
  }

  const backgroundNoise = events.filter(e => e.type === 'background_noise').length;
  if (backgroundNoise > 5) {
    recommendations.push("Frequent background noise detected. Consider environment suitability for future interviews.");
  }
  if (events.length === 0) {
    recommendations.push("No violations detected. Candidate maintained proper interview etiquette throughout.");
  }

  return recommendations;
}