import { BigDecimal, BigInt } from '@graphprotocol/graph-ts';
import { assert, beforeEach, clearStore, describe, test } from 'matchstick-as/assembly/index';
import { PlasmaVaultDailySnapshot } from '../generated/schema';
import {
  calculateRealizedApy7d,
  calculateSharePrice,
  loadRealizedApy7d,
} from '../src/utils/PlasmaVaultApyUtils';

const VAULT_ID = '0x0000000000000000000000000000000000000001';

describe('Plasma Vault realized APY', () => {
  beforeEach(() => {
    clearStore();
  });

  test('calculates one-share price using integer arithmetic', () => {
    const sharePrice = calculateSharePrice(
      BigInt.fromString('1100000000'),
      BigInt.fromString('100000000000'),
      BigInt.fromString('100000000')
    );

    assert.bigIntEquals(sharePrice, BigInt.fromString('1100000'));
  });

  test('returns zero share price when total supply is zero', () => {
    const sharePrice = calculateSharePrice(
      BigInt.fromString('1100000000'),
      BigInt.zero(),
      BigInt.fromString('100000000')
    );

    assert.bigIntEquals(sharePrice, BigInt.zero());
  });

  test('annualizes a 0.1 percent seven-day return over 364 days and subtracts fee', () => {
    const apy = calculateRealizedApy7d(
      BigInt.fromString('1001000'),
      BigInt.fromString('1000000'),
      30
    );

    assert.assertTrue(apy.gt(BigDecimal.fromString('5.18')));
    assert.assertTrue(apy.lt(BigDecimal.fromString('5.19')));
  });

  test('subtracts management fee from a flat share price', () => {
    const apy = calculateRealizedApy7d(
      BigInt.fromString('1000000'),
      BigInt.fromString('1000000'),
      30
    );

    assert.stringEquals(apy.toString(), '-0.15');
  });

  test('does not calculate APY without an exact seven-day snapshot', () => {
    const apy = loadRealizedApy7d(
      VAULT_ID,
      BigInt.fromString('1001000'),
      BigInt.fromString('1704672000'),
      30
    );

    assert.booleanEquals(apy ? false : true, true);
  });

  test('loads the exact seven-day snapshot', () => {
    const snapshot = new PlasmaVaultDailySnapshot(`${VAULT_ID}-01-01-2024`);
    snapshot.apy = [];
    snapshot.vault = VAULT_ID;
    snapshot.sharePrice = BigInt.fromString('1000000');
    snapshot.timestamp = BigInt.fromString('1704067200');
    snapshot.save();

    const apy = loadRealizedApy7d(
      VAULT_ID,
      BigInt.fromString('1001000'),
      BigInt.fromString('1704672000'),
      30
    );

    assert.booleanEquals(apy ? true : false, true);
    if (apy) {
      assert.assertTrue(apy.gt(BigDecimal.fromString('5.18')));
      assert.assertTrue(apy.lt(BigDecimal.fromString('5.19')));
    }
  });
});
