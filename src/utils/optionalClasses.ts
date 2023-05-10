export type Optional<T> = Partial<T>;
export function autoImplement<T>(): new () => T {
  return class {} as any;
}
