export default {
    id: 'openYoutube',
    match: (text) => text.includes('open youtube'),
    execute: (context) => {
        context.speak("Opening YouTube, bro.");
        window.open('https://youtube.com', '_blank');
        return { action: 'OPEN_YOUTUBE' };
    }
};
