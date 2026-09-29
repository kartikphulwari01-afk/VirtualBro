export default {
    id: 'openDevlab',
    match: (text) => text.includes('open devlab'),
    execute: (context) => {
        context.speak("Got it. Launching DevLab.");
        if (context.setActiveSection) {
            context.setActiveSection('commands');
        }
        return { action: 'OPEN_DEVLAB' };
    }
};
