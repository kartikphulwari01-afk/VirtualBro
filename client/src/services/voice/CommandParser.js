import { commands } from './CommandRegistry';

export class CommandParser {
    constructor(context) {
        // context includes: speak(), setActiveSection(), toggleMute(), setIsPaused(), isPaused
        this.context = context;
    }

    parse(transcript) {
        const text = transcript.toLowerCase().trim();
        
        // Wake word check
        if (!text.startsWith('zoro') && !text.startsWith('hey zoro')) {
            return null; // Ignore ambient speech
        }

        const commandText = text.replace(/^hey zoro\s*|^zoro\s*/, '').trim();

        // If paused, only allow 'start listening'
        if (this.context.isPaused) {
            const startCmd = commands.find(c => c.id === 'startListening');
            if (startCmd && startCmd.match(commandText)) {
                return startCmd.execute(this.context);
            }
            return null;
        }

        // Find matching command
        for (const cmd of commands) {
            if (cmd.match(commandText)) {
                return cmd.execute(this.context);
            }
        }

        // Fallback: Gemini Placeholder
        return this.handleGeminiFallback(commandText);
    }

    handleGeminiFallback(commandText) {
        this.context.speak("Didn't catch that, bro. Gemini integration coming soon.");
        return { action: 'UNKNOWN', text: commandText };
    }
}
