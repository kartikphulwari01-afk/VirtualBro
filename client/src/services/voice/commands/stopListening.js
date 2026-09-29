export default {
    id: 'stopListening',
    match: (text) => text.includes('stop listening'),
    execute: (context) => {
        context.speak("Standing by.");
        if (context.setIsPaused) {
            context.setIsPaused(true);
        }
        return { action: 'STOP_LISTENING' };
    }
};
