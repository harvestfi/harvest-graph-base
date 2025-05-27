import { Address, BigDecimal, BigInt, dataSource } from "@graphprotocol/graph-ts";
import { pow } from "./MathUtils";

export const UNKNOWN = 'unknown';

export const TWO_WEEKS_IN_SECONDS = BigInt.fromString('1209600');

export const UNISWAP_V3_VALUE = pow(pow(BigDecimal.fromString('2'), 96), 2)
export const SECONDS_OF_YEAR = BigDecimal.fromString('31557600');
export const DEFAULT_DECIMAL = 18;
export const DEFAULT_PRICE = BigInt.fromI32(0);
export const YEAR_PERIOD = BigDecimal.fromString('365')
export const BI_TEN = BigInt.fromI64(10)
export const BI_18 = BigInt.fromI64(10 ** 18)
export const BD_18 = BigDecimal.fromString('1000000000000000000')
export const BD_ZERO = BigDecimal.fromString('0')
export const BD_ONE = BigDecimal.fromString('1')
export const BD_TEN = BigDecimal.fromString('10')
export const BD_ONE_HUNDRED = BigDecimal.fromString('100')
export const USDC_DECIMAL = 6;
export const WETH_DECIMAL = 8;

export const DEFAULT_IFARM_PRICE = BigInt.fromString('40000000000000000000')

export const BI_12_HOURS = BigInt.fromI32(43200);
export const BI_4_HOURS = BigInt.fromI32(14400);
export const EVERY_24_HOURS = 86400;
export const BI_EVERY_24_HOURS = BigInt.fromString('86400');
export const EVERY_7_DAYS = 604800;
export const BI_EVERY_7_DAYS = BigInt.fromString('604800');
export const MODULE_RESULT = 75600;
export const MODULE_RESULT_V2 = 518400;
export const CONST_ID = '1';

export const WETH_BASE = Address.fromString('0x4200000000000000000000000000000000000006');
export const USDC_BASE = Address.fromString('0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA');
export const EURC_BASE = Address.fromString('0x60a3E35Cc302bFA44Cb288Bc5a4F316Fdb1adb42');
export const AXL_WBTC_BASE = Address.fromString('0x1a35EE4640b0A3B87705B0A4B45D227Ba60Ca2ad');
export const USDC_CIRCLE_BASE =Address.fromString('0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913');
export const WA_WETH = Address.fromString('0x18C100415988bEF4354EfFAd1188d1c22041B046');
export const ST_ETH_A_ETH = Address.fromString('0x5a7f39435fd9c381e4932fa2047c9a5136a5e3e7');
export const R_ETH_A_ETH = Address.fromString('0xcba9ff45cfb9ce238afde32b0148eb82cbe63562');
export const SPOT_BASE = Address.fromString('0x8f2E6758C4D6570344bd5007DEc6301cd57590A0');
export const SPOT_USDC_POOL_BASE = Address.fromString('0xa43455d99Eb63473cFA186b388c1BC2EA1B63924')
export const FARM_BASE = Address.fromString('0xD08a2917653d4E460893203471f0000826fb4034');
export const FARM_WETH_PRICE = Address.fromString('0xD08a2917653d4E460893203471f0000826fb4034');

export const CB_ETH_ETH_POOL = '0x4c8d67201dced0a8e44f59d419cb74665b4cde55'.toLowerCase();
export const XBSX = '0xE4750593d1fC8E74b31549212899A72162f315Fa'.toLowerCase();
export const BSX = Address.fromString('0xd5046b976188eb40f6de40fb527f89c05b323385');

export const OVN_USD_PLUS_BASE_POOL = '0x61366A4e6b1DB1b85DD701f2f4BFa275EF271197'.toLowerCase();
export const CRV_CRV_USD_POOL = '0x6DfE79cecE4f64c1a34F48cF5802492aB595257E'.toLowerCase();
export const WE_WETH_BASE = '0x04C0599Ae5A44757c0af6F9eC3b93da8976c150A'.toLowerCase();

export const WETH_LIST_BASE = [
  WE_WETH_BASE,
  '0x4200000000000000000000000000000000000006'.toLowerCase(),
  '0xb8866732424acddd729c6fcf7146b19bfe4a2e36'.toLowerCase(),
  '0x497139e8435e01555ac1e3740fccab7aff149e02'.toLowerCase(),
  '0xde4fb30ccc2f1210fce2c8ad66410c586c8d1f9a'.toLowerCase(),
  '0x91f0f34916ca4e2cce120116774b0e4fa0cdcaa8'.toLowerCase(),
  '0xa24382874a6fd59de45bbccfa160488647514c28'.toLowerCase(),
  '0xedfa23602d0ec14714057867a78d01e94176bea0'.toLowerCase(),

  // plasma weth vault
  '0x31A36d3eAB4A8e0d365eB72EE9079603aF6C421c'.toLowerCase(),

  // plasma weth vault 2
  '0x168826EA6576c93cFca473A16bA14f245a188346'.toLowerCase(),
  // plasma weth vault 3
  '0x7872893e528Fe2c0829e405960db5B742112aa97'.toLowerCase(),
]

export const STABLE_COIN_ARRAY_BASE = [
  '0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA'.toLowerCase(),
  '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb'.toLowerCase(),
  '0xEB466342C4d449BC9f53A865D5Cb90586f405215'.toLowerCase(),
  // crvUSD
  '0x417Ac0e078398C154EdFadD9Ef675d30Be60Af93'.toLowerCase(),
  // USDC, USDBc, axlUSDC, crvUSD stable pool
  '0x492A07E2f2BD6a85597052f6497aC830DA0a5f63'.toLowerCase(),
  '0x9483ab65847a447e36d21af1cab8c87e9712ff93'.toLowerCase(),
  // DOLA
  '0x4621b7a9c75199271f773ebd9a499dbd165c3191'.toLowerCase(),
  '0xB79DD08EA68A908A97220C76d19A6aA9cBDE4376'.toLowerCase(),
  '0xC19669A405067927865B40Ea045a2baabbbe57f5'.toLowerCase(),
  '0x65a2508C429a6078a7BC2f7dF81aB575BD9D9275'.toLowerCase(),
  '0xb5e331615fdba7df49e05cdeaceb14acdd5091c3'.toLowerCase(),
  '0xfdf5139b38525627b47538536042a7c8d2686bd9'.toLowerCase(),
  '0x79ef3ecda775860a2351ae2a7b80c4d80ba47f72'.toLowerCase(),
  '0x6d0b9c9e92a3de30081563c3657b5258b3ffa38b'.toLowerCase(),
  '0xe96c788e66a97cf455f46c5b27786191fd3bc50b'.toLowerCase(),
  '0xcefc8b799a8ee5d9b312aeca73262645d664aaf7'.toLowerCase(),
  '0x7a034374c89c463dd65d8c9bcfe63bcbced41f4f'.toLowerCase(),
  '0xf213f2d02837012dc0236cc105061e121bb03e37'.toLowerCase(),
  '0x04d5ddf5f3a8939889f11e97f8c4bb48317f1938'.toLowerCase(),
  '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'.toLowerCase(),
  '0x0000206329b97DB379d5E1Bf586BbDB969C63274'.toLowerCase(),

  // usdc plasma vault
  '0xD00E821C550Ce92EbD4A70bEcb02657dA7A5c562'.toLowerCase(),
  // usdc plasma vault 2
  '0x71f856a030B1f5e75a85779a770d8CF96Fb4a1Cb'.toLowerCase(),
  // usdc plasma vault 3
  '0x0d877Dc7C8Fa3aD980DfDb18B48eC9F8768359C4'.toLowerCase(),

  // usds
  '0x820c137fa70c8691f0e44dc420a5e53c168921dc'.toLowerCase(),
]

export const EURO_ARRAY_BASE = [
  '0xA61BeB4A3d02decb01039e378237032B351125B4'.toLowerCase(),
  '0xE111178A87A3BFf0c8d18DECBa5798827539Ae99'.toLowerCase(),
  '0x4154550f4Db74Dc38d1FE98e1F3F28ed6daD627d'.toLowerCase()
]

export const PS_ADDRESSES_MAINNET = [
  '0xd3093e3efbe00f010e8f5efe3f1cb5d9b7fe0eb1'.toLowerCase(),
  '0x8f5adC58b32D4e5Ca02EAC0E293D35855999436C'.toLowerCase(),
  '0xa0246c9032bc3a600820415ae600c6388619a14d'.toLowerCase(),
  '0x25550Cccbd68533Fa04bFD3e3AC4D09f9e00Fc50'.toLowerCase(),
  '0x59258F4e15A5fC74A7284055A8094F58108dbD4f'.toLowerCase(),
]

export const PS_ADDRESSES_MATIC = [
  '0xab0b2ddb9c7e440fac8e140a89c0dbcbf2d7bbff'.toLowerCase(),
]

export const BTC_ARRAY_BASE = [
  '0x542f16da0efb162d20bf4358efa095b70a100f9e'.toLowerCase(),
  '0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf'.toLowerCase(),

  // btc plasma vault
  '0x370A3D2800b1ea990634835a5709fB31082de6d9'.toLowerCase(),
  // btc plasma vault 2
  '0xc4CCeFe822b78898C81AEF6826D2c589bC50cD61'.toLowerCase(),
  // btc plasma vault 3
  '0x31A421271414641cb5063B71594b642D2666dB6B'.toLowerCase(),
  // lBTC
  '0xecac9c5f704e954931349da37f60e39f515c11c1'.toLowerCase()
]

export const LP_UNI_PAIR_CONTRACT_NAME = [
  '1inch'.toLowerCase(),
  'SushiSwap'.toLowerCase(),
  // only uniswap v2
  'Uniswap'.toLowerCase(),
  'Pancake'.toLowerCase(),
  'Kyber'.toLowerCase(),
  'ApeSwapFinance'.toLowerCase(),
  'Volatile AMM'.toLowerCase(),
  'Stable AMM'.toLowerCase(),
  'BaseSwap'.toLowerCase()
]
export const BALANCER_CONTRACT_NAME = [
  'Balancer'.toLowerCase(),
  '50wstETH-BPT-50bbaUSD'.toLowerCase(),
  'RDNT-WETH'.toLowerCase(),
  '50tBTC-50WETH'.toLowerCase(),
  '80PAL-20OHM'.toLowerCase(),
  'AuraBal'.toLowerCase(),
  '50WETH-50GOLD'.toLowerCase()
]
export const CURVE_CONTRACT_NAME = [
  'Curve.fi'.toLowerCase(),
  'tricrypto'.toLowerCase()
]

export const F_UNI_V3_CONTRACT_NAME = 'fUniV3'.toLowerCase()
export const MESH_SWAP_CONTRACT = 'Meshswap'.toLowerCase()
export const POISON_FINANCE_CONTRACT = 'Poison.Finance Poison Ivy'.toLowerCase();
export const CAMELOT_CONTRACT = 'Camelot'.toLowerCase();


export const UNISWAP_V3_FEES = [
  '3000',
  '5000',
  '8000',
  '10000'
]


export const BASE_SWAP_FACTORY = Address.fromString('0xFDa619b6d20975be80A10332cD39b9a4b0FAa8BB');
export const AERODROME_SWAP_FACTORY = Address.fromString('0x420dd381b31aef6683db6b902084cb0ffece40da');

export const FARM_TOKEN_MAINNET = Address.fromString('0xa0246c9032bc3a600820415ae600c6388619a14d')
export const FARM_TOKEN_MATIC = Address.fromString('0xab0b2ddb9c7e440fac8e140a89c0dbcbf2d7bbff')

export const SUSHI_SWAP_FACTORY = Address.fromString('0xc35dadb65012ec5796536bd9864ed8773abc74c4');

export const UNISWAP_V3_POISON_FINANCE_POOL = Address.fromString('0xa74eceae9c7670b019e0890881598b4c398d1c01');

export const NULL_ADDRESS = Address.fromString('0x0000000000000000000000000000000000000000');
export const PORTAL_MULTI_CALL = Address.fromString('0xea49d02c248b357b99670d9e9741f54f72df9cb3');

export const MAX_APY_REWARD = BigDecimal.fromString('1000');
export const MAX_TVL = BigDecimal.fromString('100000000');
export const TAKE_FROM_TOTAL_ASSETS = [
  '0xfC2640ca71B1724B89dc2714E661B0089f8c0EED'.toLowerCase(),
]
export function isStableCoin(address: string): boolean {
  return STABLE_COIN_ARRAY_BASE.join(' ').includes(address) == true;
}

export function isEuro(address: string): boolean {
  return EURO_ARRAY_BASE.join(' ').includes(address) == true;
}

export function isPsAddress(address: string): boolean {
  if (dataSource.network() == 'mainnet') {
    return PS_ADDRESSES_MAINNET.join(' ').includes(address) == true
  } else if (dataSource.network() == 'matic') {
    return PS_ADDRESSES_MATIC.join(' ').includes(address) == true
  }
  return false
}

export function getFarmToken(): Address {
  if (dataSource.network() == 'mainnet') {
    return FARM_TOKEN_MAINNET
  }
  if (dataSource.network() == 'matic') {
    return FARM_TOKEN_MATIC
  }
  return NULL_ADDRESS
}

export function getFromTotalAssets(address: string): boolean {
  return TAKE_FROM_TOTAL_ASSETS.join(' ').includes(address.toLowerCase()) == true
}

