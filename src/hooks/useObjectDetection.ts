import { useRef, useCallback, useEffect } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';

interface DetectedObject {
  class: string;
  score: number;
  bbox: number[];
}

const SUSPICIOUS_OBJECTS = ['cell phone', 'book', 'laptop', 'mouse', 'keyboard'];

export const useObjectDetection = (
  videoElement: HTMLVideoElement | null,
  onObjectsDetected: (objects: string[]) => void
) => {
  const modelRef = useRef<cocoSsd.ObjectDetection | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const loadModel = useCallback(async () => {
    try {
      await tf.ready();
      const model = await cocoSsd.load();
      modelRef.current = model;
      console.log('Object detection model loaded');
    } catch (error) {
      console.error('Failed to load object detection model:', error);
    }
  }, []);

  const startDetection = useCallback(() => {
    if (!modelRef.current || !videoElement) return;

    const detectObjects = async () => {
      try {
        const predictions = await modelRef.current!.detect(videoElement);
        const detectedObjects: string[] = [];

        predictions.forEach((prediction) => {
          if (SUSPICIOUS_OBJECTS.includes(prediction.class.toLowerCase()) && 
              prediction.score > 0.6) {
            detectedObjects.push(prediction.class);
          }
        });

        onObjectsDetected(detectedObjects);
      } catch (error) {
        console.error('Object detection error:', error);
      }
    };

    // Run detection every 2 seconds
    intervalRef.current = setInterval(detectObjects, 2000);
  }, [videoElement, onObjectsDetected]);

  const stopDetection = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    loadModel();
    return stopDetection;
  }, [loadModel, stopDetection]);

  return {
    startDetection,
    stopDetection,
    isModelLoaded: !!modelRef.current
  };
};