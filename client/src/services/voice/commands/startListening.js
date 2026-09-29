export default {
    id: 'startListening',
    match: (text) => text.includes('start listening') || text.includes('wake up'),
    execute: (context) => {
        if (context.setIsPaused) {
            context.setIsPaused(false);
        }
        context.speak("I'm back, bro.");
        return { action: 'START_LISTENING' };
    }
};
