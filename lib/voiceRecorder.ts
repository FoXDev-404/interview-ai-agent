"use client";

interface ISpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: ((this: ISpeechRecognition, ev: Event) => void) | null;
  onend: ((this: ISpeechRecognition, ev: Event) => void) | null;
  onresult: ((this: ISpeechRecognition, ev: SpeechRecognitionEvent) => void) | null;
  onerror: ((this: ISpeechRecognition, ev: SpeechRecognitionErrorEvent) => void) | null;
  start(): void;
  stop(): void;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: {
      isFinal: boolean;
      [index: number]: {
        transcript: string;
      };
    };
  };
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

declare global {
  interface Window {
    SpeechRecognition: {
      new (): ISpeechRecognition;
    };
    webkitSpeechRecognition: {
      new (): ISpeechRecognition;
    };
  }
}

export class VoiceRecorder {
  private recognition: ISpeechRecognition | null = null;
  private isRecording = false;
  private isStarting = false;
  private onTranscript: (text: string) => void;
  private onRecordingChange: (recording: boolean) => void;
  private onError?: (message: string) => void;
  private accumulatedTranscript = '';
  private supported = false;
  private networkRetryCount = 0;
  private readonly maxNetworkRetries = 2;
  private shouldRemainRecording = false;
  private lastErrorCode: string | null = null;

  constructor(
    onTranscript: (text: string) => void,
    onRecordingChange: (recording: boolean) => void,
    onError?: (message: string) => void
  ) {
    this.onTranscript = onTranscript;
    this.onRecordingChange = onRecordingChange;
    this.onError = onError;
    this.setupSpeechRecognition();
  }

  private setupSpeechRecognition() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        this.supported = true;
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';

        this.recognition.onstart = () => {
          console.log('Speech recognition started');
          this.isRecording = true;
          this.isStarting = false;
          this.networkRetryCount = 0;
          this.lastErrorCode = null;
          this.onRecordingChange(true);
        };

        this.recognition.onend = () => {
          console.log('Speech recognition ended');
          this.isRecording = false;
          this.isStarting = false;

          // Some browsers stop recognition after silence even with continuous mode.
          if (this.shouldRemainRecording && this.recognition && !this.lastErrorCode) {
            setTimeout(() => {
              if (!this.shouldRemainRecording || this.isRecording || this.isStarting || !this.recognition) return;
              const restarted = this.safeStart('auto-restart');
              if (!restarted) {
                this.shouldRemainRecording = false;
                this.onRecordingChange(false);
              }
            }, 250);
            return;
          }

          this.onRecordingChange(false);
        };

        this.recognition.onresult = (event: SpeechRecognitionEvent) => {
          let finalTranscript = '';
          let interimTranscript = '';
          
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
            } else {
              interimTranscript += transcript;
            }
          }
          
          // Add final results to accumulated transcript
          if (finalTranscript) {
            this.accumulatedTranscript += finalTranscript + ' ';
            this.onTranscript(this.accumulatedTranscript.trim());
          } else if (interimTranscript) {
            // Show interim results combined with accumulated
            const fullTranscript = this.accumulatedTranscript + interimTranscript;
            this.onTranscript(fullTranscript.trim());
          }
        };

        this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
          const code = event.error;
          this.isStarting = false;
          this.lastErrorCode = code;

          // "aborted" is usually expected when user stops recording manually.
          if (code === 'aborted') {
            this.shouldRemainRecording = false;
            this.isRecording = false;
            this.onRecordingChange(false);
            return;
          }

          let message = 'Speech recognition failed. Please try again or type your answer.';

          if (code === 'network') {
            if (this.networkRetryCount < this.maxNetworkRetries) {
              this.networkRetryCount += 1;

              // Retry once/twice for transient browser speech-service failures.
              setTimeout(() => {
                if (!this.recognition || this.isRecording || this.isStarting || !this.shouldRemainRecording) return;
                this.lastErrorCode = null;
                const restarted = this.safeStart('network-retry');
                if (!restarted) {
                  this.shouldRemainRecording = false;
                  this.isRecording = false;
                  this.onRecordingChange(false);
                }
              }, 700);

              return;
            }

            message = 'Speech recognition network issue. Check internet and browser microphone permissions, then retry.';
          } else if (code === 'not-allowed' || code === 'service-not-allowed') {
            message = 'Microphone access denied. Enable microphone permission in your browser and retry.';
          } else if (code === 'no-speech') {
            message = 'No speech detected. Speak clearly and try recording again.';
          } else if (code === 'audio-capture') {
            message = 'No microphone detected. Connect/select a microphone and retry.';
          }

          // Non-retryable failure: end recording cleanly to avoid repeated toggle loops.
          this.shouldRemainRecording = false;
          this.isRecording = false;
          this.onRecordingChange(false);

          console.error('Speech recognition error:', code);
          this.onError?.(message);
        };
      } else {
        console.warn('Speech recognition not supported');
        this.supported = false;
        this.onError?.('Speech recognition is not supported in this browser. Please type your answer.');
      }
    }
  }

  private safeStart(source: 'manual' | 'auto-restart' | 'network-retry'): boolean {
    if (!this.recognition || this.isRecording || this.isStarting) {
      return false;
    }

    try {
      this.isStarting = true;
      this.recognition.start();
      return true;
    } catch (error) {
      this.isStarting = false;
      const message = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();

      // Browser can throw during race windows while recognition is already booting.
      if (message.includes('already started') || message.includes('invalidstateerror')) {
        console.warn(`Speech recognition start skipped (${source}): already in progress`);
        return true;
      }

      console.error(`Speech recognition start failed (${source}):`, error);
      return false;
    }
  }

  start() {
    if (this.recognition && !this.isRecording && !this.isStarting) {
      try {
        this.shouldRemainRecording = true;
        this.lastErrorCode = null;
        this.accumulatedTranscript = ''; // Reset accumulated transcript
        const started = this.safeStart('manual');
        if (!started) {
          this.shouldRemainRecording = false;
          this.lastErrorCode = 'start-failed';
          this.onError?.('Could not start recording. Please allow microphone access and retry.');
          this.onRecordingChange(false);
        }
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        this.isStarting = false;
        this.shouldRemainRecording = false;
        this.lastErrorCode = 'start-failed';
        this.onError?.('Could not start recording. Please allow microphone access and retry.');
        this.onRecordingChange(false);
      }
    }
  }

  stop() {
    this.shouldRemainRecording = false;
    this.isStarting = false;
    this.lastErrorCode = null;
    if (this.recognition && (this.isRecording || this.isStarting)) {
      try {
        this.recognition.stop();
      } catch (error) {
        console.warn('Speech recognition stop skipped:', error);
      }
    }
  }

  toggle() {
    if (this.isRecording) {
      this.stop();
    } else {
      this.start();
    }
  }

  isActive() {
    return this.isRecording;
  }

  isSupported() {
    return this.supported;
  }
}

export default VoiceRecorder;
