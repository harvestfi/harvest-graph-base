import { PotPoolListener } from "../generated/templates";
import { createUserBalance, createUserBalanceSimple } from './types/UserBalance';
import { isPool } from "./utils/PotPoolUtils";
import { loadOrCreatePotPool } from "./types/PotPool";
import { createTvl } from "./types/Tvl";
import { Invest, Approval, Transfer, Deposit, Withdraw } from '../generated/Controller/VaultContract';
import { BI_EVERY_24_HOURS, EVERY_24_HOURS, MOON_ETH_VAUTL } from './utils/Constant';
import { loadOrCreateVault } from './types/Vault';

// TODO set to true if you want to use the special subgraph
const SPECIAL_SUBGRAPH = false;

export function handleTransfer(event: Transfer): void {
  if (SPECIAL_SUBGRAPH) {
    if (event.address.equals(MOON_ETH_VAUTL)) {
      const vault = loadOrCreateVault(event.address, event.block);
      if (BI_EVERY_24_HOURS.plus(vault.lastTimestampProcess).lt(event.block.timestamp)) {
        createTvl(event.address, event.block)

        vault.lastTimestampProcess = event.block.timestamp;
        vault.save();
      }
      createUserBalanceSimple(vault, event.params.value, event.params.from, event.params.to, event.block, event.transaction)
    }
  } else {
    if (event.address.equals(MOON_ETH_VAUTL)) {
      return;
    } else {
      const to = event.params.to
      if (isPool(to)) {
        loadOrCreatePotPool(to, event.block)
        PotPoolListener.create(to)
      }
      createTvl(event.address, event.block)
      createUserBalance(event.address, event.params.value, event.params.from, event.transaction, event.block, false)
      createUserBalance(event.address, event.params.value, event.params.to, event.transaction, event.block, true)
    }
  }
}

export function handleInvest(event: Invest): void {
  createTvl(event.address, event.block)
}

export function handleApproval(event: Approval): void {
  createTvl(event.address, event.block)
}

export function handleDeposit(event: Deposit): void {
  // createUserBalance(event.address, event.params.shares, event.params.sender, event.transaction, event.block, true)
}

export function handleWithdraw(event: Withdraw): void {
  // createUserBalance(event.address, event.params.shares, event.params.receiver, event.transaction, event.block, false)
}