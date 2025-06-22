export class SpeechService {
  private recognition: SpeechRecognition | null = null;
  private synthesis: SpeechSynthesis;
  private isListening = false;
  private onResultCallback?: (result: string) => void;
  private onStatusChangeCallback?: (status: 'listening' | 'idle' | 'processing') => void;

  constructor() {
    this.synthesis = window.speechSynthesis;
    this.initializeRecognition();
  }

  private initializeRecognition() {
    if ('webkitSpeechRecognition' in window) {
      this.recognition = new (window as any).webkitSpeechRecognition();
    } else if ('SpeechRecognition' in window) {
      this.recognition = new (window as any).SpeechRecognition();
    }

    if (this.recognition) {
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = 'en-US';

      this.recognition.onstart = () => {
        this.isListening = true;
        this.onStatusChangeCallback?.('listening');
      };

      this.recognition.onresult = (event) => {
        const result = event.results[0][0].transcript;
        this.onResultCallback?.(result);
        this.onStatusChangeCallback?.('processing');
      };

      this.recognition.onend = () => {
        this.isListening = false;
        this.onStatusChangeCallback?.('idle');
      };

      this.recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        this.isListening = false;
        this.onStatusChangeCallback?.('idle');
      };
    }
  }

  startListening(onResult: (result: string) => void, onStatusChange?: (status: 'listening' | 'idle' | 'processing') => void) {
    if (!this.recognition) {
      console.error('Speech recognition not supported');
      return false;
    }

    if (this.isListening) {
      return false;
    }

    this.onResultCallback = onResult;
    this.onStatusChangeCallback = onStatusChange;
    
    try {
      this.recognition.start();
      return true;
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      return false;
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
    }
  }

  speak(text: string, options?: { rate?: number; pitch?: number; volume?: number }) {
    if (!this.synthesis) {
      console.error('Speech synthesis not supported');
      return;
    }

    // Cancel any ongoing speech
    this.synthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = options?.rate || 1;
    utterance.pitch = options?.pitch || 1;
    utterance.volume = options?.volume || 1;

    this.synthesis.speak(utterance);
  }

  getStatus() {
    return this.isListening ? 'listening' : 'idle';
  }

  isSupported() {
    return !!(this.recognition && this.synthesis);
  }
}

export const speechService = new SpeechService();
