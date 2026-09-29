export default {
    id: 'showTime',
    match: (text) => text.includes('show time') || text.includes('what time'),
    execute: (context) => {
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        context.speak(`The current time is ${time}`);
        return { action: 'SHOW_TIME', time };
    }
};
