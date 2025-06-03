import { cfg } from './config';
import logger from './logger';

export function randomHypeLine(): string {
  if (!cfg.hypeLines.length) return '';
  const idx = Math.floor(Math.random() * cfg.hypeLines.length);
  const line = cfg.hypeLines[idx];
  logger.debug({ idx, line }, 'Selected random hype line');
  return line;
}

export function randomGif(): string | null {
  if (!cfg.hypeGifs.length) return null;
  const idx = Math.floor(Math.random() * cfg.hypeGifs.length);
  const gif = cfg.hypeGifs[idx];
  logger.debug({ idx, gif }, 'Selected random hype GIF');
  return gif;
}
