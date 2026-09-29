export default {
    id: 'openSpotify',
    match: (text) => text.includes('open spotify'),
    execute: (context) => {
        context.speak("Opening Spotify, bro.");
        window.open('https://open.spotify.com', '_blank');
        return { action: 'OPEN_SPOTIFY' };
    }
};
