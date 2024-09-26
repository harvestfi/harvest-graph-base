import { Address, BigDecimal, BigInt, ethereum, log } from '@graphprotocol/graph-ts';
import {
  AERODROME_SWAP_FACTORY, AXL_WBTC_BASE,
  BASE_SWAP_FACTORY,
  BD_18,
  BD_ONE,
  BD_TEN, BD_ZERO,
  BI_18,
  BI_TEN, BSX, CB_ETH_ETH_POOL, CRV_CRV_USD_POOL,
  DEFAULT_DECIMAL,
  DEFAULT_PRICE,
  getFarmToken,
  isPsAddress,
  isStableCoin, OVN_USD_PLUS_BASE_POOL, SPOT_BASE, SPOT_USDC_POOL_BASE,
  USDC_BASE, USDC_CIRCLE_BASE,
  USDC_DECIMAL, WE_WETH_BASE, WETH_BASE, WETH_DECIMAL, XBSX,
} from './Constant';
import { Token, Vault } from "../../generated/schema";
import { WeightedPool2TokensContract } from "../../generated/templates/VaultListener/WeightedPool2TokensContract";
import { BalancerVaultContract } from "../../generated/templates/VaultListener/BalancerVaultContract";
import { ERC20 } from "../../generated/Controller/ERC20";
import { fetchContractDecimal } from "./ERC20Utils";
import { pow, powBI } from "./MathUtils";
import {
  checkBalancer,
  isBalancer, isBtc, isCurve,
  isLpUniPair, isWeth,
} from './PlatformUtils';
import { PancakeFactoryContract } from '../../generated/Controller/PancakeFactoryContract';
import { PancakePairContract } from '../../generated/Controller/PancakePairContract';
import { createPriceFeed } from '../types/PriceFeed';
import { AedromeFactoryContract } from '../../generated/Controller/AedromeFactoryContract';
import { AedromePoolContract } from '../../generated/Controller/AedromePoolContract';
import { CurveVaultContract } from '../../generated/Controller/CurveVaultContract';
import { CurveMinterContract } from '../../generated/Controller/CurveMinterContract';

export function getPriceForCoin(address: Address): BigInt {

  let tokenAddress = address;

  if (SPOT_BASE == address) {
    return getPriceForAerodromeFromPool(USDC_CIRCLE_BASE, SPOT_USDC_POOL_BASE);
  }

  if (isBtc(address.toHex())) {
    return getPriceForCoinWithSwap(AXL_WBTC_BASE, USDC_BASE, BASE_SWAP_FACTORY)
  }

  if (isStableCoin(tokenAddress.toHex().toLowerCase())) {
    return BI_18;
  }

  if (WETH_BASE == tokenAddress) {
    return getPriceForCoinWithSwap(WETH_BASE, USDC_BASE, BASE_SWAP_FACTORY)
  }

  let price = getPriceForCoinWithSwap(tokenAddress, USDC_BASE, BASE_SWAP_FACTORY)
  if (price.gt(BigInt.zero())) {
    return price;
  }

  price = getPriceForAerodromeV2(WETH_BASE, tokenAddress, AERODROME_SWAP_FACTORY)
  if (price.equals(BigInt.zero())) {
    return price;
  }

  const wethPrice = getPriceForCoinWithSwap(WETH_BASE, USDC_BASE, BASE_SWAP_FACTORY)

  return price.times(wethPrice).div(BI_18);
}

// old version
function getPriceForAerodromeV1(tokenA: Address, tokenB: Address, factoryAddress: Address): BigInt {
  const factory = AedromeFactoryContract.bind(factoryAddress);
  const tryGetPool = factory.try_getPool1(tokenA, tokenB, false);
  if (tryGetPool.reverted) {
    return BigInt.zero();
  }
  const pool = AedromePoolContract.bind(tryGetPool.value);

  const tryPrices = pool.try_prices(tokenB, BI_18, BigInt.fromString('1'));

  if (tryPrices.reverted) {
    return BigInt.zero();
  }
  return tryPrices.value[0];
}

// new version
function getPriceForAerodromeV2(tokenA: Address, tokenB: Address, factoryAddress: Address): BigInt {
  const factory = AedromeFactoryContract.bind(factoryAddress);
  const tryGetPool = factory.try_getPool1(tokenA, tokenB, false);
  if (tryGetPool.reverted) {
    return BigInt.zero();
  }
  const pool = AedromePoolContract.bind(tryGetPool.value);
  const tryToken0 = pool.try_token0();
  const tryToken1 = pool.try_token1();
  if (tryToken0.reverted || tryToken1.reverted) {
    return BigInt.zero();
  }

  const tryReserves = pool.try_getReserves()

  if (tryReserves.reverted) {
    return BigInt.zero();
  }
  const reserves = tryReserves.value;
  const decimal0 = fetchContractDecimal(tryToken0.value)
  const decimal1 = fetchContractDecimal(tryToken1.value)
  //
  // const delimiter0 = powBI(BI_TEN, DEFAULT_DECIMAL - decimal0.toI32());
  // const delimiter1 = powBI(BI_TEN, DEFAULT_DECIMAL - decimal1.toI32());

  if (tryToken0.value.equals(tokenA)) {
    return reserves.get_reserve0().times(powBI(BI_TEN, DEFAULT_DECIMAL + decimal1.toI32() - decimal0.toI32())).div(reserves.get_reserve1())
  }
  return reserves.get_reserve1().times(powBI(BI_TEN, DEFAULT_DECIMAL + decimal0.toI32() - decimal1.toI32())).div(reserves.get_reserve0())
}

function getPriceForAerodromeFromPool(tokenA: Address, poolAdr: Address): BigInt {
  const pool = AedromePoolContract.bind(poolAdr);
  const tryToken0 = pool.try_token0();
  const tryToken1 = pool.try_token1();
  if (tryToken0.reverted || tryToken1.reverted) {
    return BigInt.zero();
  }

  const tryReserves = pool.try_getReserves()

  if (tryReserves.reverted) {
    return BigInt.zero();
  }
  const reserves = tryReserves.value;
  const decimal0 = fetchContractDecimal(tryToken0.value)
  const decimal1 = fetchContractDecimal(tryToken1.value)

  if (tryToken0.value.equals(tokenA)) {
    return reserves.get_reserve0().times(powBI(BI_TEN, DEFAULT_DECIMAL + decimal1.toI32() - decimal0.toI32())).div(reserves.get_reserve1())
  }
  return reserves.get_reserve1().times(powBI(BI_TEN, DEFAULT_DECIMAL + decimal0.toI32() - decimal1.toI32())).div(reserves.get_reserve0())
}

function getPriceForCoinWithSwap(address: Address, stableCoin: Address, factory: Address): BigInt {
  if (isStableCoin(address.toHex().toLowerCase())) {
    return BI_18
  }
  const uniswapFactoryContract = PancakeFactoryContract.bind(factory)
  const tryGetPair = uniswapFactoryContract.try_getPair(stableCoin, address)
  if (tryGetPair.reverted) {
    return DEFAULT_PRICE
  }

  const poolAddress = tryGetPair.value

  const uniswapPairContract = PancakePairContract.bind(poolAddress);
  const tryGetReserves = uniswapPairContract.try_getReserves()
  if (tryGetReserves.reverted) {
    log.log(log.Level.WARNING, `Can not get reserves for ${poolAddress.toHex()}`)

    return DEFAULT_PRICE
  }
  const reserves = tryGetReserves.value
  const decimal = fetchContractDecimal(address)

  const delimiter = powBI(BI_TEN, decimal.toI32() - USDC_DECIMAL + DEFAULT_DECIMAL)

  return reserves.get_reserve1().times(delimiter).div(reserves.get_reserve0())
}

export function getPriceByVault(vault: Vault, block: ethereum.Block): BigDecimal {

  if (isPsAddress(vault.id)) {
    const tempPrice = getPriceForCoin(getFarmToken()).divDecimal(BD_18);
    createPriceFeed(vault, tempPrice, block);
    return tempPrice;
  }

  const underlyingAddress = vault.underlying

  if (CB_ETH_ETH_POOL == vault.id) {
    const tempPrice = getPriceForCoin(WETH_BASE).times(BI_TEN).divDecimal(BD_18);
    createPriceFeed(vault, tempPrice, block);
    return tempPrice;
  }

  if (isStableCoin(underlyingAddress)) {
    const tempPrice = BD_ONE;
    createPriceFeed(vault, tempPrice, block);
    return tempPrice;
  }

  if (isWeth(underlyingAddress)) {
    const tempPrice = getPriceForCoin(WETH_BASE).divDecimal(BD_18);
    createPriceFeed(vault, tempPrice, block);
    return tempPrice;
  }

  if (XBSX == underlyingAddress) {
    const tempPrice = getPriceForCoin(BSX).divDecimal(BD_18);
    createPriceFeed(vault, tempPrice, block);
    return tempPrice;
  }

  let price = getPriceForCoin(Address.fromString(underlyingAddress))
  if (!price.isZero()) {
    createPriceFeed(vault, price.divDecimal(BD_18), block);
    return price.divDecimal(BD_18)
  }

  const underlying = Token.load(underlyingAddress)
  if (underlying != null) {
    if (isLpUniPair(underlying.name)) {
      let tempInPrice = getPriceLpUniPair(underlying.id);
      createPriceFeed(vault, tempInPrice, block);
      return tempInPrice
    }

    if (isBalancer(underlying.name)) {
      const tempPrice = getPriceForBalancer(underlying.id);
      createPriceFeed(vault, tempPrice, block);
      return tempPrice
    }

    if (isCurve(underlying.name)) {
      let tempPrice = getPriceForCurve(underlying.id)
      if (underlying.id.toLowerCase() == CRV_CRV_USD_POOL) {
        tempPrice = tempPrice.times(BigDecimal.fromString('2'))
      }
      createPriceFeed(vault, tempPrice, block);
      return tempPrice;
    }
  }

  return BigDecimal.zero()
}

export function getPriceLpUniPair(underlyingAddress: string): BigDecimal {
  const uniswapV2Pair = PancakePairContract.bind(Address.fromString(underlyingAddress))
  const tryGetReserves = uniswapV2Pair.try_getReserves()
  if (tryGetReserves.reverted) {
    log.log(log.Level.WARNING, `Can not get reserves for underlyingAddress = ${underlyingAddress}, try get price for coin`)

    return getPriceForCoin(Address.fromString(underlyingAddress)).divDecimal(BD_18)
  }
  const reserves = tryGetReserves.value
  const totalSupply = uniswapV2Pair.totalSupply()
  const positionFraction = BD_ONE.div(totalSupply.toBigDecimal().div(BD_18))

  const token0 = uniswapV2Pair.token0()
  const token1 = uniswapV2Pair.token1()

  const firstCoin = reserves.get_reserve0().toBigDecimal().times(positionFraction)
    .div(pow(BD_TEN, fetchContractDecimal(token0).toI32()))
  const secondCoin = reserves.get_reserve1().toBigDecimal().times(positionFraction)
    .div(pow(BD_TEN, fetchContractDecimal(token1).toI32()))


  const token0Price = getPriceForCoin(token0)
  const token1Price = getPriceForCoin(token1)

  if (token0Price.isZero() || token1Price.isZero()) {
    log.log(log.Level.WARNING, `Some price is zero token0 ${token0.toHex()} = ${token0Price} , token1 ${token1.toHex()} = ${token1Price}`)
    return BigDecimal.zero()
  }

  return token0Price
    .divDecimal(BD_18)
    .times(firstCoin)
    .plus(
      token1Price
        .divDecimal(BD_18)
        .times(secondCoin)
    )
}

export function getPriceForBalancer(underlying: string): BigDecimal {
  const balancer = WeightedPool2TokensContract.bind(Address.fromString(underlying))
  const poolId = balancer.getPoolId()
  const totalSupply = balancer.totalSupply()
  const vault = BalancerVaultContract.bind(balancer.getVault())
  const tokenInfo = vault.getPoolTokens(poolId)

  let price = BigDecimal.zero()
  for (let i=0;i<tokenInfo.getTokens().length;i++) {
    const tokenAddress = tokenInfo.getTokens()[i]
    const tryDecimals = ERC20.bind(tokenAddress).try_decimals()
    let decimal = DEFAULT_DECIMAL
    if (!tryDecimals.reverted) {
      decimal = tryDecimals.value
    }
    const balance = normalizePrecision(tokenInfo.getBalances()[i], BigInt.fromI32(decimal)).toBigDecimal()

    let tokenPrice = BD_ZERO;
    if (tokenAddress == Address.fromString(underlying)) {
      tokenPrice = BD_ONE;
    } else if (checkBalancer(tokenAddress)) {
      tokenPrice = getPriceForBalancer(tokenAddress.toHexString());
    } else {
      tokenPrice = getPriceForCoin(tokenAddress).divDecimal(BD_18)
    }

    price = price.plus(balance.times(tokenPrice))
  }

  if (price.le(BigDecimal.zero())) {
    return price
  }
  return price.div(totalSupply.toBigDecimal())
}

export function toBigInt(value: BigDecimal): BigInt {
  const val = value.toString().split('.');
  if (val.length < 1) {
    return BigInt.zero();
  }
  return BigInt.fromString(val[0])
}


export function getPriceForCurve(underlyingAddress: string): BigDecimal {
  const curveContract = CurveVaultContract.bind(Address.fromString(underlyingAddress))
  const tryMinter = curveContract.try_minter()

  let minter = CurveMinterContract.bind(Address.fromString(underlyingAddress))
  if (!tryMinter.reverted) {
    minter = CurveMinterContract.bind(tryMinter.value)
  }

  let index = 0
  let tryCoins = minter.try_coins(BigInt.fromI32(index))
  while (!tryCoins.reverted) {
    const coin = tryCoins.value
    if (coin.equals(Address.zero())) {
      index = index - 1
      break
    }
    index = index + 1
    tryCoins = minter.try_coins(BigInt.fromI32(index))
  }
  const tryDecimals = curveContract.try_decimals()
  let decimal = DEFAULT_DECIMAL
  if (!tryDecimals.reverted) {
    decimal = tryDecimals.value.toI32()
  } else {
    log.log(log.Level.WARNING, `Can not get decimals for ${underlyingAddress}`)
  }
  const size = index + 1
  if (size < 1) {
    return BigDecimal.zero()
  }

  let value = BigDecimal.zero()

  for (let i=0;i<size;i++) {
    const index = BigInt.fromI32(i)
    const tryCoins1 = minter.try_coins(index)
    if (tryCoins1.reverted) {
      break
    }
    const token = tryCoins1.value
    const tokenPrice = getPriceForCoin(token).divDecimal(BD_18)
    const balance = minter.balances(index)
    const tryDecimalsTemp = ERC20.bind(token).try_decimals()
    let decimalsTemp = DEFAULT_DECIMAL
    if (!tryDecimalsTemp.reverted) {
      decimalsTemp = tryDecimalsTemp.value
    } else {
      log.log(log.Level.WARNING, `Can not get decimals for ${token}`)
    }
    const tempBalance = balance.toBigDecimal().div(pow(BD_TEN, decimalsTemp))

    value = value.plus(tokenPrice.times(tempBalance))
  }
  return value.times(BD_18).div(curveContract.totalSupply().toBigDecimal())
}


function normalizePrecision(amount: BigInt, decimal: BigInt): BigInt {
  return amount.div(BI_18.div(BigInt.fromI64(10 ** decimal.toI64())))
}