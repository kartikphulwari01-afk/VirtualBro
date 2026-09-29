export default {
    id: 'openGithub',
    match: (text) => text.includes('open github'),
    execute: (context) => {
        context.speak("Opening GitHub, bro.");
        window.open('https://github.com', '_blank');
        return { action: 'OPEN_GITHUB' };
    }
};
