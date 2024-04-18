import { Address, BigDecimal, BigInt, ethereum } from "@graphprotocol/graph-ts";
import { UserBalance, UserBalanceHistory, UserTransaction, Vault } from "../../generated/schema";
import { VaultContract } from "../../generated/templates/VaultListener/VaultContract";
import { ERC20 } from "../../generated/Controller/ERC20";
import { pow } from "../utils/MathUtils";
import { BD_TEN } from "../utils/Constant";

export function createUserBalance(vaultAddress: Address, amount: BigInt, beneficary: Address, tx: ethereum.Transaction, block: ethereum.Block, isDeposit: boolean): void {
  const vault = Vault.load(vaultAddress.toHex())
  if (vault != null) {
    const vaultContract = VaultContract.bind(vaultAddress)
    const sharePrice = vaultContract.getPricePerFullShare().divDecimal(pow(BD_TEN, vault.decimal.toI32()))
    let poolBalance = BigDecimal.zero()
    if (vault.pool != null) {
      const poolContract = ERC20.bind(Address.fromString(vault.pool!))
      poolBalance = poolContract.balanceOf(beneficary).divDecimal(pow(BD_TEN, vault.decimal.toI32()))
    }
    const vaultBalance = vaultContract.balanceOf(beneficary).divDecimal(pow(BD_TEN, vault.decimal.toI32()))
    const value = vaultBalance.plus(poolBalance)

    const userBalanceId = `${vault.id}-${beneficary.toHex()}`
    let userBalance = UserBalance.load(userBalanceId)
    if (userBalance == null) {
      userBalance = new UserBalance(userBalanceId)
      userBalance.createAtBlock = block.number
      userBalance.timestamp = block.timestamp
      userBalance.vault = vault.id
      userBalance.value = BigDecimal.zero()
      userBalance.userAddress = beneficary.toHex()
    }

    userBalance.poolBalance = poolBalance
    userBalance.vaultBalance = vaultBalance
    userBalance.value = value

    userBalance.save()
    const userBalanceHistory = new UserBalanceHistory(`${tx.hash.toHex()}-${beneficary.toHex()}-${vault.id}-${isDeposit.toString()}`)
    userBalanceHistory.createAtBlock = block.number
    userBalanceHistory.timestamp = block.timestamp
    userBalanceHistory.userAddress = beneficary.toHex()
    userBalanceHistory.vault = vault.id
    userBalanceHistory.transactionType = isDeposit
      ? 'Deposit'
      : 'Withdraw'
    userBalanceHistory.value = userBalance.value
    userBalanceHistory.poolBalance = userBalance.poolBalance
    userBalanceHistory.vaultBalance = userBalance.vaultBalance
    userBalanceHistory.priceUnderlying = vault.priceUnderlying

    updateVaultUsers(vault, value, beneficary.toHex());

    userBalanceHistory.sharePrice = vaultContract.getPricePerFullShare()
    userBalanceHistory.save()

    const userTransaction = new UserTransaction(`${tx.hash.toHex()}-${vault.id}-${isDeposit.toString()}`)
    userTransaction.createAtBlock = block.number
    userTransaction.timestamp = block.timestamp
    userTransaction.userAddress = beneficary.toHex()
    userTransaction.vault = vault.id
    userTransaction.transactionType = isDeposit
      ? 'Deposit'
      : 'Withdraw'
    userTransaction.sharePrice = vaultContract.getPricePerFullShare()
    userTransaction.value = amount
    userTransaction.save()
  }
}

function updateVaultUsers(vault: Vault, value: BigDecimal, userAddress: string): void {
  let users = vault.users;
  if (value.equals(BigDecimal.zero())) {
    let newUsers: string[] = [];
    for (let i = 0; i < users.length; i++) {
      if (users[i].toLowerCase() != userAddress.toLowerCase()) {
        newUsers.push(users[i])
      }
    }
    users = newUsers;
  } else {
    let hasUser = false;
    for (let i = 0; i < users.length; i++) {
      if (userAddress.toLowerCase() == users[i].toLowerCase()) {
        hasUser = true;
        break;
      }
    }

    if (!hasUser) {
      users.push(userAddress)
    }
  }
  vault.users = users;
  vault.save()
}