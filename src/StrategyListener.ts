import { ProfitLogInReward } from '../generated/templates/StrategyListener/StrategyBaseContract';
import { loadOrCreateLastHarvest } from './types/LastHarvest';


export function handleProfitLogInReward(event: ProfitLogInReward): void {
  loadOrCreateLastHarvest(event.address, event.transaction.hash.toHex(), event.block.timestamp, event.block.number);
}