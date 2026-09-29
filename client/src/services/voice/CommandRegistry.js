import openYoutube from './commands/openYoutube';
import openSpotify from './commands/openSpotify';
import openGithub from './commands/openGithub';
import openGmail from './commands/openGmail';
import openCalculator from './commands/openCalculator';
import openDashboard from './commands/openDashboard';
import openDevlab from './commands/openDevlab';
import showTime from './commands/showTime';
import showDate from './commands/showDate';
import mute from './commands/mute';
import stopListening from './commands/stopListening';
import startListening from './commands/startListening';

export const commands = [
    startListening, // High priority, can run even if paused
    stopListening,
    openYoutube,
    openSpotify,
    openGithub,
    openGmail,
    openCalculator,
    openDashboard,
    openDevlab,
    showTime,
    showDate,
    mute
];
