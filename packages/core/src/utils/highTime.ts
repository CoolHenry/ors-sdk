export default function highTime(time: number): any {
  if (Number.isFinite(time)) {
    return Math.round(time * 1000000);
  } else {
    return Date.now() * 1000000;
  }
}
