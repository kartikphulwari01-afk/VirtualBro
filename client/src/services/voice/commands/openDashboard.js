export default {
    id: 'openDashboard',
    match: (text) => text.includes('open dashboard'),
    execute: (context) => {
        context.speak("Opening dashboard, bro.");
        if (context.setActiveSection) {
            context.setActiveSection('dashboard');
        }
        return { action: 'OPEN_DASHBOARD' };
    }
};
