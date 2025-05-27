import { PotPoolListener } from "../generated/templates";
import { createUserBalance } from './types/UserBalance';
import { isPool } from "./utils/PotPoolUtils";
import { loadOrCreatePotPool } from "./types/PotPool";
import { createTvl } from "./types/Tvl";
import { Transfer } from '../generated/Controller/VaultContract';
import { NULL_ADDRESS, PORTAL_MULTI_CALL } from './utils/Constant';

export function handleTransfer(event: Transfer): void {
  const to = event.params.to
  if (isPool(to)) {
    loadOrCreatePotPool(to, event.block.timestamp, event.block.number)
  }
  createTvl(event.address, event.block.timestamp, event.block.number)
  // TODO check logic
  // const isTotalWithdraw = event.params.to.toHexString() == NULL_ADDRESS.toHexString() || event.params.to.toHexString() == PORTAL_MULTI_CALL.toHexString();
  // const isTotalDeposit = event.params.from.toHexString() == NULL_ADDRESS.toHexString() || event.params.from.toHexString() == PORTAL_MULTI_CALL.toHexString();
  createUserBalance(event.address, event.params.value, event.params.from, false, event.transaction.hash.toHex(), event.block.timestamp, event.block.number, true)
  createUserBalance(event.address, event.params.value, event.params.to, true, event.transaction.hash.toHex(), event.block.timestamp, event.block.number, true)
}