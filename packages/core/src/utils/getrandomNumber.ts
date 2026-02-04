import { logReport } from '@/config';
export default function getRandomNumber(length = 32): string {
  try {
    const chars = 'abcdef0123456789';
    // ghijklmnopqrstuvwxyz
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  } catch (error) {
    logReport('getRandomNumber', error);
    return '';
  }
}
