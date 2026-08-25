import { BigDecimal, BigInt } from '@graphprotocol/graph-ts';
import { PlasmaVaultDailySnapshot } from '../../generated/schema';
import { BD_ONE, BD_ONE_HUNDRED, EVERY_7_DAYS } from './Constant';
import { formatTimestamp } from './IdUtils';
import { pow } from './MathUtils';

const BD_TWO_HUNDRED = BigDecimal.fromString('200');
const APY_PERIODS_PER_364_DAYS: i32 = 52;

export function calculateSharePrice(
  totalAssets: BigInt,
  totalSupply: BigInt,
  oneShare: BigInt
): BigInt {
  if (totalSupply.isZero()) {
    return BigInt.zero();
  }

  return totalAssets.times(oneShare).div(totalSupply);
}

export function calculateRealizedApy7d(
  currentSharePrice: BigInt,
  oldSharePrice: BigInt,
  feeInPercentage: i32
): BigDecimal {
  if (currentSharePrice.le(BigInt.zero())) {
    return BigDecimal.zero();
  }
  if (oldSharePrice.le(BigInt.zero())) {
    return BigDecimal.zero();
  }

  const growthFactor = currentSharePrice.toBigDecimal().div(oldSharePrice.toBigDecimal());
  const grossApy = pow(growthFactor, APY_PERIODS_PER_364_DAYS)
    .minus(BD_ONE)
    .times(BD_ONE_HUNDRED);
  const managementFee = BigDecimal.fromString(feeInPercentage.toString()).div(BD_TWO_HUNDRED);

  return grossApy.minus(managementFee);
}

export function loadRealizedApy7d(
  vaultId: string,
  currentSharePrice: BigInt,
  currentTimestamp: BigInt,
  feeInPercentage: i32
): BigDecimal | null {
  const oldTimestamp = currentTimestamp.minus(BigInt.fromI32(EVERY_7_DAYS));
  const oldSnapshotId = `${vaultId}-${formatTimestamp(oldTimestamp)}`;
  const oldSnapshot = PlasmaVaultDailySnapshot.load(oldSnapshotId);

  if (oldSnapshot == null) {
    return null;
  }

  if (!oldSnapshot.sharePrice) {
    return null;
  }

  const oldSharePrice = oldSnapshot.sharePrice!;
  if (oldSharePrice.le(BigInt.zero())) {
    return null;
  }

  return calculateRealizedApy7d(currentSharePrice, oldSharePrice, feeInPercentage);
}
