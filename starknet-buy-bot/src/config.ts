import 'dotenv/config';

function mustGet(key: string): string {
  const val = process.env[key];
  if (!val) {
    throw new Error(`Environment variable ${key} is required but missing`);
  }
  return val;
}

export const cfg = {
  /* ── TELEGRAM ─────────────────────────────────────────────────── */
  telegramToken: mustGet('TELEGRAM_BOT_TOKEN'),
  chatId:        mustGet('TELEGRAM_CHAT_ID'),

  /* ── GECKOTERMINAL / POOL / NETWORK ───────────────────────────── */
  network:      process.env.NETWORK_ID  || 'starknet-alpha',
  pool:         mustGet('POOL_ADDRESS'),
  token:        mustGet('TOKEN_ADDRESS'),
  usdThreshold: Number(process.env.THRESHOLD_USD   ?? '1000'),
  pollMs:       Number(process.env.POLL_INTERVAL_MS ?? '5000'),

  /* ── SUPABASE (SERVICE ROLE) ──────────────────────────────────── */
  supabaseUrl: mustGet('SUPABASE_URL'),
  supabaseKey: mustGet('SUPABASE_SERVICE_ROLE_KEY'),

  /* ── BRANDING / BOT COPY ─────────────────────────────────────── */
  tokenSymbol: process.env.TOKEN_SYMBOL  || 'BROTHER',
  bannerEmoji: process.env.BANNER_EMOJI  || '👊',
  tagLine:     process.env.TAG_LINE      || 'BUY',

  /* ── BUTTON URLS ─────────────────────────────────────────────── */
  swapUrl:      process.env.SWAP_URL      || `https://app.ekubo.org/pool/${mustGet('POOL_ADDRESS')}`,
  chartUrl:     process.env.CHART_URL     || '',
  twitterUrl:   process.env.TWITTER_URL   || '',
  websiteUrl:   process.env.WEBSITE_URL   || '',
  telegramLink: process.env.TELEGRAM_LINK || '',

  /* ── HYPE ASSETS (JSON ARRAYS) ───────────────────────────────── */
  hypeGifs:  JSON.parse(process.env.HYPE_GIFS  || '[]') as string[],
  hypeLines: JSON.parse(process.env.HYPE_LINES || '[]') as string[],
};
