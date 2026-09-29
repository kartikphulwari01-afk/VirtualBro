export default {
    id: 'showDate',
    match: (text) => text.includes('show date') || text.includes('what date'),
    execute: (context) => {
        const date = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
        context.speak(`Today is ${date}, bro.`);
        return { action: 'SHOW_DATE', date };
    }
};
