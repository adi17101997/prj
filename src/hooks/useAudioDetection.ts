import { useRef, useCallback, useEffect, useState } from 'react';

interface AudioAnalysis {
  volume: number;
  backgroundNoise: boolean;
  speechDetected: boolean;
}

export const useAudioDetection = (
  stream: MediaStream | null,
  onAudioAnalysis: (analysis: AudioAnalysis) => void
) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const startAudioAnalysis = useCallback(async () => {
    if (!stream || isAnalyzing) return;

    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      
      analyser.fftSize = 2048;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      source.connect(analyser);
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      dataArrayRef.current = dataArray;
      
      setIsAnalyzing(true);
      
      const analyze = () => {
        if (!analyserRef.current || !dataArrayRef.current) return;
        
        analyserRef.current.getByteFrequencyData(dataArrayRef.current);
        
        // Calculate volume (RMS)
        let sum = 0;
        for (let i = 0; i < dataArrayRef.current.length; i++) {
          sum += dataArrayRef.current[i] * dataArrayRef.current[i];
        }
        const rms = Math.sqrt(sum / dataArrayRef.current.length);
        const volume = Math.round((rms / 255) * 100);
        
        // Detect background noise (consistent low-level audio)
        const backgroundNoise = volume > 5 && volume < 20;
        
        // Detect speech (higher frequency content)
        const speechFrequencyRange = dataArrayRef.current.slice(10, 100);
        const speechEnergy = speechFrequencyRange.reduce((sum, val) => sum + val, 0) / speechFrequencyRange.length;
        const speechDetected = speechEnergy > 30 && volume > 15;
        
        onAudioAnalysis({
          volume,
          backgroundNoise,
          speechDetected
        });
        
        animationFrameRef.current = requestAnimationFrame(analyze);
      };
      
      analyze();
    } catch (error) {
      console.error('Failed to start audio analysis:', error);
      setIsAnalyzing(false);
    }
  }, [stream, isAnalyzing, onAudioAnalysis]);

  const stopAudioAnalysis = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    analyserRef.current = null;
    dataArrayRef.current = null;
    setIsAnalyzing(false);
  }, []);

  useEffect(() => {
    return stopAudioAnalysis;
  }, [stopAudioAnalysis]);

  return {
    isAnalyzing,
    startAudioAnalysis,
    stopAudioAnalysis
  };
};