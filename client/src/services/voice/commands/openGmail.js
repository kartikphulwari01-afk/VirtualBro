export default {
    id: 'openGmail',
    match: (text) => text.includes('open gmail'),
    execute: (context) => {
        context.speak("Opening Gmail, bro.");
        window.open('https://mail.google.com', '_blank');
        return { action: 'OPEN_GMAIL' };
    }
};
