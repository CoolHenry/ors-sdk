export default function isKeyOfObject<T extends Record<string, any>>(
  key: string | number | symbol,
  obj: T,
): key is keyof T {
  return key in obj;
}
