export class VoiceResponseService {
    constructor(onStart, onEnd) {
        this.synth = window.speechSynthesis;
        this.onStart = onStart;
        this.onEnd = onEnd;
    }

    speak(text) {
        if (!this.synth) return;

        // Cancel any ongoing speech
        if (this.synth.speaking) {
            this.synth.cancel();
        }

        const utterance = new SpeechSynthesisUtterance(text);
        
        // Find a good voice (preferably male/English)
        const voices = this.synth.getVoices();
        const preferredVoice = voices.find(v => v.name.includes('Google UK English Male') || v.name.includes('Male')) || voices[0];
        if (preferredVoice) {
            utterance.voice = preferredVoice;
        }

        utterance.rate = 1.0;
        utterance.pitch = 0.9;

        utterance.onstart = () => {
            if (this.onStart) this.onStart();
        };

        utterance.onend = () => {
            if (this.onEnd) this.onEnd();
        };

        utterance.onerror = (e) => {
            console.error('Speech synthesis error', e);
            if (this.onEnd) this.onEnd();
        };

        this.synth.speak(utterance);
    }
}
