import { setTimeout } from 'node:timers/promises';
import { request } from 'undici';
import pLimit from 'p-limit';

import { cfg } from './config';
import { usd, shortHash } from './utils';
import { randomHypeLine } from './hype';
import { sendBuy } from './telegram';
import { getState, saveState } from './db';
import logger from './logger';

//
// ── 1) TYPES ──────────────────────────────────────────────────────────────────────
//
type Trade = {
  attributes: {
    block_number: number;
    block_timestamp: string;
    tx_hash: string;
    tx_from_address: string;
    from_token_amount: string;
    to_token_amount: string;
    price_from_in_currency_token: string;
    price_to_in_currency_token: string;
    price_from_in_usd: string;
    price_to_in_usd: string;
    kind: 'buy' | 'sell';
    volume_in_usd: string;
    from_token_address: string;
    to_token_address: string;
  };
};

type PoolMeta = {
  priceUsd: number;      // attributes.base_token_price_usd
  liquidityUsd: number;  // attributes.reserve_in_usd
  marketCap: number;     // attributes.market_cap_usd or attributes.fdv_usd
};

let meta: PoolMeta = {
  priceUsd: 0,
  liquidityUsd: 0,
  marketCap: 0,
};

const limit = pLimit(1);

//
// ── 2) FETCH POOL METADATA ───────────────────────────────────────────────────────────
//
async function fetchPoolMeta(): Promise<PoolMeta> {
  const url = `https://api.geckoterminal.com/api/v2/networks/${cfg.network}` +
              `/pools/${cfg.pool}`;

  try {
    const res  = await request(url, { headers: { accept: 'application/json' } });
    const json = (await res.body.json()) as any;
    const at   = json.data.attributes as any;

    const priceUsd     = Number(at.base_token_price_usd    ?? '0');
    const liquidityUsd = Number(at.reserve_in_usd           ?? '0');
    const marketCapUsd = Number(at.market_cap_usd ?? at.fdv_usd ?? '0');

    logger.info(
      { priceUsd, liquidityUsd, marketCapUsd },
      'fetchPoolMeta: fetched pool metadata'
    );
    return { priceUsd, liquidityUsd, marketCap: marketCapUsd };
  } catch (err) {
    logger.warn({ err }, 'fetchPoolMeta failed; reusing last known metadata');
    return meta;
  }
}

//
// ── 3) FETCH TRADES ABOVE USD THRESHOLD ────────────────────────────────────────────────
//
async function fetchTrades(): Promise<Trade[]> {
  const url =
    `https://api.geckoterminal.com/api/v2/networks/${cfg.network}` +
    `/pools/${cfg.pool}/trades?trade_volume_in_usd_greater_than=${cfg.usdThreshold}`;

  try {
    const res  = await limit(() => request(url, { headers: { accept: 'application/json' } }));
    const json = (await res.body.json()) as any;
    const trades: Trade[] = json.data;
    logger.debug({ count: trades.length }, 'fetchTrades: retrieved trades');
    return trades;
  } catch (err) {
    logger.error({ err }, 'fetchTrades failed');
    return [];
  }
}

//
// ── 4) BUILD THE “BUY ALERT” CAPTION ──────────────────────────────────────────────────
//
function buildCaption(
  usdVol: number,
  tokenVol: number,
  wallet: string,
  txUrl: string
): string {
  // (a) Title: “<b>TOKEN_SYMBOL Buy!</b>”
  const title = `<b>${cfg.tokenSymbol} Buy!</b>`;

  // (b) 71 green circles (10 per row, 7 full rows + 1 extra)
  const circleEmoji = '🟢';
  const PER_ROW     = 10;
  let remaining     = 71;
  const circleRows: string[] = [];
  while (remaining > 0) {
    const take = Math.min(remaining, PER_ROW);
    circleRows.push(circleEmoji.repeat(take));
    remaining -= take;
  }
  const circlesBlock = circleRows.join('\n');

  // (c) Blank line after circles:
  const blankLine1 = ' ';

  // (d) “💰 4,928.21 USDT ($4,946.22)” → no bold
  const spentUsdStr = usd(usdVol);
  const estimatedUsd = tokenVol * meta.priceUsd;
  const estimatedStr = usd(estimatedUsd);
  const lineSpent = `💰 ${spentUsdStr} USDT ($${estimatedStr})`;

  // (e) “🪙 613,322 <b>TARA</b>” → only the token symbol in bold
  const tokenVolStr = usd(tokenVol);
  const lineTokenVol = `🪙 ${tokenVolStr} <b>${cfg.tokenSymbol}</b>`;

  // (f) “🏷 Price: <b>$0.008064</b>” → only the numeric price in bold
  const priceStr = usd(meta.priceUsd);
  const linePrice = `🏷 Price: <b>$${priceStr}</b>`;

  // (g) “🔺 Market Cap <b>$42,852,311</b>” → only the number in bold
  const marketCapStr = usd(meta.marketCap);
  const lineMktCap = `🔺 Market Cap <b>$${marketCapStr}</b>`;

  // (h) “💧 Liquidity <b>$472,787.71</b>” → only the number in bold
  const liquidityStr = usd(meta.liquidityUsd);
  const lineLiq = `💧 Liquidity <b>$${liquidityStr}</b>`;

  // (i) “🔍 <a href="…">0x20…fef0</a>” → hyperlink only the short hash text
  const shortH = shortHash(wallet);
  const lineLookup = `🔍 <a href="${txUrl}">${shortH}</a>`;

  // (j) **New blank line after lookup** before the hype line:
  const blankLine2 = ' ';

  // (k) random hype line (e.g. “HODL on!”) – plain text
  const hypeLine = randomHypeLine();

  // (l) Blank line before bottom hyperlinks:
  const blankLine3 = ' ';

  // (m) “TX | Chart | Website | Telegram” with each piece individually hyperlinked
  const txLink      = `<a href="${txUrl}">TX</a>`;
  const chartLink   = cfg.chartUrl   ? `<a href="${cfg.chartUrl}">Chart</a>`   : 'Chart';
  const websiteLink = cfg.websiteUrl ? `<a href="${cfg.websiteUrl}">Website</a>` : 'Website';
  const telegramLink = cfg.telegramLink
                     ? `<a href="${cfg.telegramLink}">Telegram</a>`
                     : 'Telegram';
  const lineLinks   = `${txLink} | ${chartLink} | ${websiteLink} | ${telegramLink}`;

  // Assemble everything, in the exact order you require:
  const lines: string[] = [
    title,
    circlesBlock,
    blankLine1,
    lineSpent,
    lineTokenVol,
    linePrice,
    lineMktCap,
    lineLiq,
    lineLookup,
    blankLine2,
    hypeLine ? hypeLine : '',
    blankLine3,
    lineLinks,
  ];

  // Filter out any empty strings produced by optional hypeLine, then join with '\n'
  return lines.filter(Boolean).join('\n');
}

//
// ── 5) MAIN POLL‐FOREVER LOOP ──────────────────────────────────────────────────────────
//
export async function pollForever(): Promise<void> {
  logger.info('Initializing Gecko poll loop…');

  // 1) Load initial metadata + last‐seen state
  meta = await fetchPoolMeta();
  const state = await getState();
  let lastBlock = state.last_block_number ?? 0;
  let lastTx    = state.last_tx_hash      ?? '';

  logger.info({ lastBlock, lastTx }, 'Loaded last seen state from DB');

  // 2) Enter infinite loop
  while (true) {
    try {
      // (a) Refresh pool metadata every cycle
      meta = await fetchPoolMeta();

      // (b) Fetch trades above threshold
      const trades = await fetchTrades();

      // (c) Process them in chronological order (oldest → newest)
      for (const trade of trades.reverse()) {
        const a = trade.attributes;
        if (a.kind !== 'buy') continue;

        const blockNum = a.block_number;
        const txHash   = a.tx_hash;
        // Skip if we already alerted on this exact (block, tx) pair:
        if (
          blockNum < lastBlock ||
          (blockNum === lastBlock && txHash === lastTx)
        ) {
          continue;
        }

        logger.info(
          { blockNum, txHash, volumeUsd: a.volume_in_usd },
          'New BUY trade detected'
        );

        const usdVol   = Number(a.volume_in_usd);
        const tokenVol = Number(a.to_token_amount || a.from_token_amount);
        const txUrl    = `https://starkscan.co/tx/${txHash}`;

        // Build the caption exactly as specified:
        const caption = buildCaption(usdVol, tokenVol, a.tx_from_address, txUrl);

        // Send the Telegram alert (the hyperlink to the TX hash is already inside 'caption'):
        await sendBuy(caption);

        // Persist the new state so we never alert the same trade again
        await saveState(blockNum, txHash);
        lastBlock = blockNum;
        lastTx    = txHash;

        logger.info(
          { lastBlock, lastTx },
          'State updated after sending buy alert'
        );
      }
    } catch (err) {
      logger.error({ err }, 'Error in poll loop');
    }

    // Wait the configured interval before looping again
    await setTimeout(cfg.pollMs);
  }
}
