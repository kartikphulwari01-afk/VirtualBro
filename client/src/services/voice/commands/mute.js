export default {
    id: 'mute',
    match: (text) => text.includes('mute'),
    execute: (context) => {
        if (context.toggleMute) {
            context.toggleMute(true); // force mute
        }
        // Can't speak if mutated unless we force speak before mute, but let's just do it
        return { action: 'MUTE' };
    }
};
