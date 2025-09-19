export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
};

export const formatDuration = (milliseconds: number): string => {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}:${(minutes % 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
  }
  return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;
};

export const formatTimestamp = (date: Date): string => {
  return date.toLocaleString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
};

export const getEventSeverity = (type: string): 'low' | 'medium' | 'high' => {
  switch (type) {
    case 'phone_detected':
    case 'unauthorized_voice':
      return 'high';
    case 'no_face':
    case 'book_detected':
    case 'drowsiness_detected':
      return 'medium';
    case 'focus_lost':
    case 'multiple_faces':
    case 'device_detected':
    case 'background_noise':
      return 'low';
    default:
      return 'low';
  }
};

export const getIntegrityScoreColor = (score: number): string => {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-yellow-600';
  return 'text-red-600';
};

export const getIntegrityScoreBg = (score: number): string => {
  if (score >= 80) return 'bg-green-100 border-green-300';
  if (score >= 60) return 'bg-yellow-100 border-yellow-300';
  return 'bg-red-100 border-red-300';
};