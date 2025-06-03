import { createClient, SupabaseClient } from '@supabase/supabase-js';
import logger from './logger';
import { cfg } from './config';

interface BotState {
  last_block_number: number;
  last_tx_hash: string;
}

const supabase: SupabaseClient = createClient(cfg.supabaseUrl, cfg.supabaseKey);

/**
 * getState():
 *   Reads the single row with id = 1 from the "bot_state" table.
 *   Returns { last_block_number, last_tx_hash }. If anything fails, returns {0, ''}.
 */
export async function getState(): Promise<BotState> {
  const { data, error } = await supabase
    .from<BotState>('bot_state')
    .select('last_block_number, last_tx_hash')
    .eq('id', 1)
    .single();

  if (error) {
    logger.error({ err: error }, 'Supabase getState error');
    return { last_block_number: 0, last_tx_hash: '' };
  }
  return data!;
}

/**
 * saveState(block, tx):
 *   Updates the row with id = 1 in the "bot_state" table.
 *   If an error occurs, logs it.
 */
export async function saveState(block: number, tx: string): Promise<void> {
  const { error } = await supabase
    .from('bot_state')
    .update({ last_block_number: block, last_tx_hash: tx })
    .eq('id', 1);

  if (error) {
    logger.error({ err: error, block, tx }, 'Supabase saveState error');
  }
}
