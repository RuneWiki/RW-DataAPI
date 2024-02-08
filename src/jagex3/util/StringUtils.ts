export default class StringUtils {
    static hashCode(str: string): number {
        let hash: number = 0;
        for (let i: number = 0; i < str.length; i++) {
            hash = ((hash << 5) + str.charCodeAt(i) - hash) | 0;
        }
        return hash;
    }
}
