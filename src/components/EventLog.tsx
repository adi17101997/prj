import React from 'react';
import { AlertTriangle, Clock, Eye, Users, Smartphone, Book, Monitor } from 'lucide-react';
import { DetectionEvent } from '../types';
import { formatTimestamp, getEventSeverity } from '../utils/helpers';

interface EventLogProps {
  events: DetectionEvent[];
}

export const EventLog: React.FC<EventLogProps> = ({ events }) => {
  const getEventIcon = (type: DetectionEvent['type']) => {
    switch (type) {
      case 'focus_lost':
        return Eye;
      case 'no_face':
        return Users;
      case 'multiple_faces':
        return Users;
      case 'phone_detected':
        return Smartphone;
      case 'book_detected':
        return Book;
      case 'device_detected':
        return Monitor;
      default:
        return AlertTriangle;
    }
  };

  const getEventColor = (type: DetectionEvent['type']) => {
    const severity = getEventSeverity(type);
    switch (severity) {
      case 'high':
        return 'text-red-400 bg-red-900/20 border-red-500/30';
      case 'medium':
        return 'text-yellow-400 bg-yellow-900/20 border-yellow-500/30';
      case 'low':
        return 'text-blue-400 bg-blue-900/20 border-blue-500/30';
      default:
        return 'text-gray-400 bg-gray-900/20 border-gray-500/30';
    }
  };

  const recentEvents = events.slice(-10).reverse();

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
      <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
        <Clock className="w-5 h-5 mr-2 text-green-400" />
        Event Log
        <span className="ml-2 px-2 py-1 bg-gray-700 text-gray-300 rounded-full text-xs">
          {events.length} events
        </span>
      </h3>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {recentEvents.length > 0 ? (
          recentEvents.map((event) => {
            const Icon = getEventIcon(event.type);
            const colorClass = getEventColor(event.type);
            
            return (
              <div
                key={event.id}
                className={`flex items-start space-x-3 p-3 rounded-lg border ${colorClass}`}
              >
                <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">
                    {event.description}
                  </p>
                  <div className="flex items-center space-x-4 mt-1">
                    <p className="text-xs text-gray-400">
                      {formatTimestamp(event.timestamp)}
                    </p>
                    {event.duration && (
                      <p className="text-xs text-gray-400">
                        Duration: {Math.round(event.duration / 1000)}s
                      </p>
                    )}
                    <p className="text-xs text-gray-400">
                      Confidence: {Math.round(event.confidence * 100)}%
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8">
            <AlertTriangle className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400">No events detected yet</p>
          </div>
        )}
      </div>

      {events.length > 10 && (
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            Showing latest 10 of {events.length} events
          </p>
        </div>
      )}
    </div>
  );
};