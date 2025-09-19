import { InterviewSession, DetectionEvent, CandidateInfo } from '../types';
import { generateId } from './helpers';

/**
 * Generate sample interview data for demonstration purposes
 */
export const generateSampleReport = (): InterviewSession => {
  const candidate: CandidateInfo = {
    name: "John Doe",
    email: "john.doe@example.com",
    position: "Senior Software Developer",
    interviewId: "interview_demo_001"
  };

  const startTime = new Date(Date.now() - 45 * 60 * 1000); // 45 minutes ago
  const endTime = new Date();

  const sampleEvents: DetectionEvent[] = [
    {
      id: generateId(),
      type: 'focus_lost',
      timestamp: new Date(startTime.getTime() + 5 * 60 * 1000),
      duration: 8000,
      confidence: 0.95,
      description: 'Focus lost for 8 seconds'
    },
    {
      id: generateId(),
      type: 'phone_detected',
      timestamp: new Date(startTime.getTime() + 12 * 60 * 1000),
      confidence: 0.87,
      description: 'Mobile phone detected in frame'
    },
    {
      id: generateId(),
      type: 'multiple_faces',
      timestamp: new Date(startTime.getTime() + 18 * 60 * 1000),
      confidence: 0.92,
      description: '2 faces detected'
    },
    {
      id: generateId(),
      type: 'focus_lost',
      timestamp: new Date(startTime.getTime() + 25 * 60 * 1000),
      duration: 12000,
      confidence: 0.89,
      description: 'Focus lost for 12 seconds'
    },
    {
      id: generateId(),
      type: 'book_detected',
      timestamp: new Date(startTime.getTime() + 30 * 60 * 1000),
      confidence: 0.78,
      description: 'Book or notes detected'
    },
    {
      id: generateId(),
      type: 'drowsiness_detected',
      timestamp: new Date(startTime.getTime() + 35 * 60 * 1000),
      confidence: 0.84,
      description: 'Candidate appears drowsy or eyes closed for extended period'
    },
    {
      id: generateId(),
      type: 'background_noise',
      timestamp: new Date(startTime.getTime() + 38 * 60 * 1000),
      confidence: 0.71,
      description: 'Background noise detected'
    },
    {
      id: generateId(),
      type: 'unauthorized_voice',
      timestamp: new Date(startTime.getTime() + 40 * 60 * 1000),
      confidence: 0.88,
      description: 'Unauthorized voice or conversation detected'
    }
  ];

  // Calculate integrity score based on events
  let integrityScore = 100;
  sampleEvents.forEach(event => {
    switch (event.type) {
      case 'focus_lost':
        integrityScore -= Math.min(15, (event.duration || 5000) / 1000 * 2);
        break;
      case 'phone_detected':
        integrityScore -= 25;
        break;
      case 'book_detected':
        integrityScore -= 15;
        break;
      case 'multiple_faces':
        integrityScore -= 10;
        break;
      case 'drowsiness_detected':
        integrityScore -= 12;
        break;
      case 'background_noise':
        integrityScore -= 5;
        break;
      case 'unauthorized_voice':
        integrityScore -= 20;
        break;
    }
  });

  return {
    id: 'sample_interview_' + Date.now(),
    candidate,
    startTime,
    endTime,
    events: sampleEvents,
    integrityScore: Math.max(0, Math.round(integrityScore)),
    status: 'completed'
  };
};

/**
 * Generate sample CSV report for assignment submission
 */
export const generateSampleCSV = (): string => {
  const session = generateSampleReport();
  const duration = session.endTime!.getTime() - session.startTime.getTime();

  let csv = 'Interview Report - CSV Format\n\n';
  csv += 'Candidate Information:\n';
  csv += `Name,${session.candidate.name}\n`;
  csv += `Email,${session.candidate.email}\n`;
  csv += `Position,${session.candidate.position}\n`;
  csv += `Interview ID,${session.candidate.interviewId}\n\n`;

  csv += 'Session Summary:\n';
  csv += `Start Time,${session.startTime.toISOString()}\n`;
  csv += `End Time,${session.endTime!.toISOString()}\n`;
  csv += `Duration (minutes),${Math.round(duration / 60000)}\n`;
  csv += `Total Events,${session.events.length}\n`;
  csv += `Integrity Score,${session.integrityScore}%\n\n`;

  csv += 'Event Details:\n';
  csv += 'Timestamp,Event Type,Description,Duration (seconds),Confidence\n';

  session.events.forEach(event => {
    csv += `${event.timestamp.toISOString()},`;
    csv += `${event.type.replace('_', ' ')},`;
    csv += `"${event.description}",`;
    csv += `${event.duration ? Math.round(event.duration / 1000) : 'N/A'},`;
    csv += `${Math.round(event.confidence * 100)}%\n`;
  });

  csv += '\nViolation Summary:\n';
  const eventCounts = session.events.reduce((acc, event) => {
    acc[event.type] = (acc[event.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  csv += 'Violation Type,Count\n';
  Object.entries(eventCounts).forEach(([type, count]) => {
    csv += `${type.replace('_', ' ')},${count}\n`;
  });

  return csv;
};

/**
 * Download sample CSV report
 */
export const downloadSampleCSV = (): void => {
  const csvContent = generateSampleCSV();
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `Sample_Proctoring_Report_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Generate sample JSON report for API integration
 */
export const generateSampleJSON = (): string => {
  const session = generateSampleReport();
  return JSON.stringify(session, null, 2);
};