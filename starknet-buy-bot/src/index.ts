import { pollForever } from './gecko';
import logger from './logger';

process.on('unhandledRejection', (err) => {
  logger.error({ err }, 'Unhandled Rejection');
});

(async () => {
  logger.info('Bot starting up…');
  try {
    await pollForever();
  } catch (err) {
    logger.fatal({ err }, 'Fatal error, shutting down');
    process.exit(1);
  }
})();
