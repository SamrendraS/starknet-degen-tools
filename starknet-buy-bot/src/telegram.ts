import TelegramBot from 'node-telegram-bot-api';
import { cfg } from './config';
import { randomGif } from './hype';
import { URL } from 'node:url';
import logger from './logger';

const bot = new TelegramBot(cfg.telegramToken, { polling: false });

/**
 * safe(rawUrl): returns a valid http(s) URL string or null if invalid.
 */
const safe = (raw: string): string | null => {
  if (!raw) return null;
  try {
    // Expand any "${POOL_ADDRESS}" token if present
    const expanded = raw.replace('${POOL_ADDRESS}', cfg.pool);
    const u = new URL(expanded);
    return (u.protocol === 'http:' || u.protocol === 'https:') ? u.toString() : null;
  } catch (err) {
    logger.warn({ raw, err }, 'Invalid URL provided to safe()');
    return null;
  }
};

/**
 * sendBuy(caption):
 *   1) Builds just one row of inline buttons: [ BUY {TOKEN_SYMBOL} ] → cfg.swapUrl  
 *   2) Sends the 'caption' (HTML mode) which already contains all hyperlinks inside it.  
 *   3) If a hype GIF is configured, uses sendAnimation; otherwise uses sendMessage.
 */
export async function sendBuy(caption: string): Promise<void> {
  // ── Create just one row: “BUY {TOKEN_SYMBOL}”
  const keyboardRows: Array<Array<{ text: string; url: string }>> = [];
  const buyLink = safe(cfg.swapUrl);

  if (buyLink) {
    keyboardRows.push([
      {
        text: `BUY ${cfg.tokenSymbol.replace(/^\$/, '')}`,
        url: buyLink,
      },
    ]);
  } else {
    logger.warn('swapUrl invalid or not provided; skipping BUY button');
  }

  // Send options: HTML parse mode, no web previews, with just that one button row
  const opts = {
    caption,
    parse_mode: 'HTML' as const,
    disable_web_page_preview: true,
    reply_markup: { inline_keyboard: keyboardRows },
  };

  const gifUrl = randomGif();
  try {
    if (gifUrl) {
      logger.info({ gifUrl }, 'sendBuy: sending animation with caption');
      await bot.sendAnimation(cfg.chatId, gifUrl, opts);
    } else {
      logger.info('sendBuy: sending plain HTML message');
      await bot.sendMessage(cfg.chatId, caption, opts);
    }
    logger.info('sendBuy: message dispatched successfully');
  } catch (err) {
    logger.error({ err }, 'sendBuy: failed to send Telegram message');
  }
}
