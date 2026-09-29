export class VoiceRecognitionService {
    constructor(onResult, onStatusChange) {
        this.onResult = onResult;
        this.onStatusChange = onStatusChange;
        this.recognition = null;
        this.isActive = false; // Intended state
        this.init();
    }

    init() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.warn("Speech recognition not supported in this browser.");
            return;
        }

        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = false;
        this.recognition.lang = 'en-US';

        this.recognition.onstart = () => {
            this.onStatusChange('listening');
        };

        this.recognition.onresult = (event) => {
            this.onStatusChange('processing');
            const last = event.results.length - 1;
            const transcript = event.results[last][0].transcript;
            
            if (this.onResult) {
                this.onResult(transcript);
            }
        };

        this.recognition.onend = () => {
            // Auto-restart if it was intentionally active
            if (this.isActive) {
                try {
                    this.recognition.start();
                } catch (e) {
                    console.error("Failed to restart recognition", e);
                }
            } else {
                this.onStatusChange('idle');
            }
        };

        this.recognition.onerror = (event) => {
            console.error("Speech recognition error", event.error);
            if (event.error === 'not-allowed') {
                this.isActive = false;
                this.onStatusChange('idle');
            }
        };
    }

    start() {
        if (!this.recognition) return;
        if (this.isActive) return;
        
        this.isActive = true;
        try {
            this.recognition.start();
        } catch (e) {
            console.error(e);
        }
    }

    stop() {
        if (!this.recognition) return;
        this.isActive = false;
        this.recognition.stop();
        this.onStatusChange('idle');
    }
}
