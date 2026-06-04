import { BigInt, Bytes } from '@graphprotocol/graph-ts';

export function ensureEvenLength(hexString: string): string {
  return hexString.length % 2 === 0 ? hexString : '0' + hexString;
}

export function stringIdToBytes(value: string): Bytes {
  return Bytes.fromHexString(ensureEvenLength(value));
}

export function formatTimestamp(timestamp: BigInt): string {
  let ms = timestamp.toI64() * 1000;
  let date = new Date(ms);

  let dd = date.getUTCDate().toString().padStart(2, "0");
  let mm = (date.getUTCMonth() + 1).toString().padStart(2, "0");
  let yyyy = date.getUTCFullYear().toString();

  return `${dd}-${mm}-${yyyy}`;
}