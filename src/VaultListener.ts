import { PotPoolListener } from "../generated/templates";
import { createUserBalance } from './types/UserBalance';
import { isPool } from "./utils/PotPoolUtils";
import { loadOrCreatePotPool } from "./types/PotPool";
import { createTvl } from "./types/Tvl";
import { Transfer } from '../generated/Controller/VaultContract';
import { Rebalanced } from '../generated/Controller/VaultV3Contract'
import { NULL_ADDRESS, PORTAL_MULTI_CALL } from './utils/Constant';
import { VaultRebalance } from "../generated/schema";
import { Bytes } from "@graphprotocol/graph-ts";

export function handleTransfer(event: Transfer): void {
  const to = event.params.to
  if (isPool(to)) {
    loadOrCreatePotPool(to, event.block.timestamp, event.block.number)
  }
  createTvl(event.address, event.block.timestamp, event.block.number)
  // TODO check logic
  // const isTotalWithdraw = event.params.to.toHexString() == NULL_ADDRESS.toHexString() || event.params.to.toHexString() == PORTAL_MULTI_CALL.toHexString();
  // const isTotalDeposit = event.params.from.toHexString() == NULL_ADDRESS.toHexString() || event.params.from.toHexString() == PORTAL_MULTI_CALL.toHexString();
  createUserBalance(event.address, event.params.value, event.params.from, false, event.transaction.hash.toHex(), event.transaction.from.toHexString(), event.block.timestamp, event.block.number, true)
  createUserBalance(event.address, event.params.value, event.params.to, true, event.transaction.hash.toHex(), event.transaction.from.toHexString(), event.block.timestamp, event.block.number, true)
}

export function handleRebalanced(event: Rebalanced): void {
  const id = Bytes.fromHexString(`${event.address.toHexString()}-${event.block.timestamp}-${event.logIndex}`);
  let vaultRebalance = VaultRebalance.load(id);
  if (!vaultRebalance) {
    vaultRebalance = new VaultRebalance(id);
    vaultRebalance.vault = event.address.toHexString();
    vaultRebalance.oldPosId = event.params.oldPosId;
    vaultRebalance.newPosId = event.params.newPosId;
    vaultRebalance.oldLiquidity = event.params.oldLiquidity;
    vaultRebalance.newLiquidity = event.params.newLiquidity;
    vaultRebalance.timestamp = event.params.timestamp;
    vaultRebalance.save();
  }
}