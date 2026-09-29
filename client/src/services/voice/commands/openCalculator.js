export default {
    id: 'openCalculator',
    match: (text) => text.includes('open calculator'),
    execute: (context) => {
        context.speak("Opening calculator bro.");
        window.open('https://www.desmos.com/scientific', '_blank');
        return { action: 'OPEN_CALCULATOR' };
    }
};
