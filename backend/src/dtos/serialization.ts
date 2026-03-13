export function toStringValue(value: { toString(): string } | string | number | bigint | null) {
  if (value === null) {
    return null;
  }

  return value.toString();
}

export function toIsoDate(value: Date) {
  return value.toISOString();
}
