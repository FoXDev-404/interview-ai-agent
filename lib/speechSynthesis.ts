"use client";

export class SpeechSynthesizer {
  private synthesis: SpeechSynthesis | null = null;
  private voice: SpeechSynthesisVoice | null = null;
  private supported = false;

  constructor() {
    this.initializeSpeechSynthesis();
  }

  private initializeSpeechSynthesis() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synthesis = window.speechSynthesis;
      this.supported = true;
      this.loadVoices();
    } else {
      console.warn('Speech synthesis not supported in this browser');
    }
  }

  private loadVoices() {
    if (!this.synthesis) return;

    const loadVoicesCallback = () => {
      const voices = this.synthesis!.getVoices();
      
      // Prefer female voices for a more professional interview experience
      const femaleVoices = voices.filter(voice => 
        voice.name.toLowerCase().includes('female') || 
        voice.name.toLowerCase().includes('woman') ||
        voice.name.toLowerCase().includes('microsoft zira') ||
        voice.name.toLowerCase().includes('google uk english female') ||
        voice.name.toLowerCase().includes('samantha')
      );

      // Fallback to any English voice
      const englishVoices = voices.filter(voice => 
        voice.lang.startsWith('en')
      );

      // Select the best available voice
      this.voice = femaleVoices[0] || englishVoices[0] || voices[0] || null;
      
      if (this.voice) {
        console.log('Selected voice:', this.voice.name);
      }
    };

    // Load voices immediately if available
    loadVoicesCallback();

    // Also listen for voice loading event (some browsers load voices asynchronously)
    this.synthesis.onvoiceschanged = loadVoicesCallback;
  }

  speak(text: string, options: {
    rate?: number;
    pitch?: number;
    volume?: number;
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (error: Event) => void;
  } = {}) {
    if (!this.synthesis || !this.supported) {
      console.warn('Speech synthesis not available');
      options.onEnd?.();
      return;
    }

    // Cancel any ongoing speech
    this.synthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set voice if available
    if (this.voice) {
      utterance.voice = this.voice;
    }

    // Configure speech parameters
    utterance.rate = options.rate || 0.9; // Slightly slower for clarity
    utterance.pitch = options.pitch || 1.0;
    utterance.volume = options.volume || 0.8;

    // Set event handlers
    utterance.onstart = () => {
      console.log('Speech started');
      options.onStart?.();
    };

    utterance.onend = () => {
      console.log('Speech ended');
      options.onEnd?.();
    };

    utterance.onerror = (event: SpeechSynthesisErrorEvent) => {
      // "interrupted" and "canceled" are expected when cancel() is called before new speech
      if (event.error === 'interrupted' || event.error === 'canceled') {
        options.onEnd?.();
        return;
      }
      console.error('Speech error:', event.error);
      options.onError?.(event);
      options.onEnd?.();
    };

    // Speak the text
    this.synthesis.speak(utterance);
  }

  stop() {
    if (this.synthesis) {
      this.synthesis.cancel();
    }
  }

  pause() {
    if (this.synthesis) {
      this.synthesis.pause();
    }
  }

  resume() {
    if (this.synthesis) {
      this.synthesis.resume();
    }
  }

  isSpeaking() {
    return this.synthesis ? this.synthesis.speaking : false;
  }

  isPaused() {
    return this.synthesis ? this.synthesis.paused : false;
  }

  isSupported() {
    return this.supported;
  }

  // Utility method to speak interview questions with appropriate formatting
  speakQuestion(questionText: string, questionNumber: number, totalQuestions: number, onComplete?: () => void) {
    const formattedText = `Question ${questionNumber} of ${totalQuestions}. ${questionText}`;
    
    this.speak(formattedText, {
      rate: 0.85, // Slightly slower for questions
      onEnd: onComplete,
      onError: () => {
        console.error('Error speaking question');
        onComplete?.();
      }
    });
  }
}

// Create a singleton instance
export const speechSynthesizer = new SpeechSynthesizer();
