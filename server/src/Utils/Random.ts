import crypto from 'crypto';

export default class Random {

    public static int(min: number, max: number): number {
        return crypto.randomInt(min, max);
    }

    public static string(length: number): string {
        // from a to Z and 0 to 9
        const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars[Random.int(0, chars.length)];
        }
        return result;
    }
}