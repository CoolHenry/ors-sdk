export default function timeTranslate(
  num: number | boolean | null | undefined,
) {
  if (typeof num == "number") {
    if (num === 0 || num < 0) return 0;
    const time = num * 1000;
    return Math.round(time);
  } else {
    return null;
  }
}
