import { useState, useEffect, useCallback } from 'react';
import { speechService } from '@/lib/speech';

export type SpeechStatus = 'idle' | 'listening' | 'processing' | 'unsupported';

export function useSpeech() {
  const [status, setStatus] = useState<SpeechStatus>('idle');
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    setIsSupported(speechService.isSupported());
    if (!speechService.isSupported()) {
      setStatus('unsupported');
    }
  }, []);

  const startListening = useCallback((onResult: (result: string) => void) => {
    if (!isSupported) return false;

    return speechService.startListening(
      onResult,
      (newStatus) => setStatus(newStatus)
    );
  }, [isSupported]);

  const stopListening = useCallback(() => {
    speechService.stopListening();
    setStatus('idle');
  }, []);

  const speak = useCallback((text: string, options?: { rate?: number; pitch?: number; volume?: number }) => {
    if (!isSupported) return;
    speechService.speak(text, options);
  }, [isSupported]);

  return {
    status,
    isSupported,
    startListening,
    stopListening,
    speak
  };
}
