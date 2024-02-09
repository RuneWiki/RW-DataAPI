export default class JagBuffer {
    static textDecoder = new TextDecoder('utf-8');

    static wrap(src: Int8Array | JagBuffer): JagBuffer {
        if (src instanceof JagBuffer) {
            src = src.data;
        }

        const buf: JagBuffer = new JagBuffer(src);
        buf.pos = src.length;
        return buf;
    }

    static unwrap(src: Int8Array | JagBuffer, copy: boolean): Int8Array {
        if (src instanceof JagBuffer) {
            src = src.data;
        }

        return copy ? JagBuffer.copy(src) : src;
    }

    private static copy(src: Int8Array): Int8Array {
        const len: number = src.length;
        const temp: Int8Array = new Int8Array(len);
        temp.set(src);
        return temp;
    }

    data: Int8Array;
    pos: number;

    constructor(src: ArrayBuffer | JagBuffer) {
        if (src instanceof JagBuffer) {
            this.data = src.data;
        } else {
            this.data = new Int8Array(src);
        }

        this.pos = 0;
    }

    get length(): number {
        return this.data.length;
    }

    // ----

    g1(): number {
        return this.data[this.pos++] & 0xFF;
    }

    g1b(): number {
        return this.data[this.pos++];
    }

    g2(): number {
        return (this.data[this.pos++] & 0xFF) << 8 |
            this.data[this.pos++] & 0xFF;
    }

    g2s(): number {
        let value: number = (this.data[this.pos++] & 0xFF) << 8 |
            this.data[this.pos++] & 0xFF;
        if (value > 0x7FFF) {
            value -= 0x10000;
        }
        return value;
    }

    g3(): number {
        return (this.data[this.pos++] & 0xFF) << 16 |
            (this.data[this.pos++] & 0xFF) << 8 |
            this.data[this.pos++] & 0xFF;
    }

    g4(): number {
        return ((this.data[this.pos++] & 0xFF) << 24 |
            (this.data[this.pos++] & 0xFF) << 16 |
            (this.data[this.pos++] & 0xFF) << 8 |
            this.data[this.pos++] & 0xFF) | 0;
    }

    g5(): bigint {
        const high: number = this.g1();
        const low: number = this.g4();

        return (BigInt(high) << 32n) + BigInt(low);
    }

    g8(): bigint {
        const high: number = this.g4();
        const low: number = this.g4();

        return (BigInt(high) << 32n) + BigInt(low);
    }

    gjstr(): string {
        const start: number = this.pos;
        while (this.data[this.pos++] !== 0 && this.pos < this.length) {
            /* empty */
        }
        const length: number = this.pos - start - 1;
        return length === 0 ? '' : JagBuffer.textDecoder.decode(this.data.subarray(start, start + length));
    }

    // gjstr + newline (10)
    gjstrn(): string {
        const start: number = this.pos;
        while (this.data[this.pos++] !== 10 && this.pos < this.length) {
            /* empty */
        }
        const length: number = this.pos - start - 1;
        return length === 0 ? '' : JagBuffer.textDecoder.decode(this.data.subarray(start, start + length));
    }

    fastgstr(): string | null {
        if (this.data[this.pos] === 0) {
            this.pos++;
            return null;
        } else {
            return this.gjstr();
        }
    }

    gjstr2(): string {
        const version: number = this.data[this.pos++];
        if (version !== 0) {
            throw new Error();
        }

        return this.gjstr();
    }

    gSmart1or2(): number {
        const value: number = this.data[this.pos] & 0xFF;
        return value < 128 ? this.g1() : this.g2() - 32768;
    }

    gSmart1or2s(): number {
        const value: number = this.data[this.pos] & 0xFF;
        return value < 128 ? this.g1() - 64 : this.g2s() - 49152;
    }

    // todo
    gExtended1or2(): number {
        let local5: number = 0;
        let local9: number = this.gSmart1or2();
        while (local9 === 32767) {
            local5 += 32767;
            local9 = this.gSmart1or2();
        }
        return local5 + local9;
    }

    gSmart2or4(): number {
        if (this.data[this.pos] < 0) {
            return this.g4() & 0x7FFFFFFF;
        }

        const value: number = this.g2();
        return value === 32767 ? -1 : value;
    }

    g2or4(): number {
        return this.data[this.pos] >= 0 ? this.g2() : this.g4();
    }

    gVarInt(): number {
        let value: number = this.data[this.pos++];
        let remainder: number = 0;

        while (value < 0) {
            remainder = ((remainder | value & 0x7F) << 7) | 0;
            value = this.data[this.pos++];
        }

        return value | remainder;
    }

    gVarLong(bytes: number): bigint {
        const read: number = bytes - 1;
        if (read < 0 || read > 7) {
            throw new Error();
        }

        let bits: number = read * 8;
        let result: bigint = 0n;
        while (bits >= 0) {
            result |= BigInt(this.data[this.pos++] & 0xFF) << BigInt(bits);
            bits -= 8;
        }

        return result;
    }

    // ----

    p1(value: number): void {
        this.data[this.pos++] = value;
    }

    p2(value: number): void {
        this.data[this.pos++] = value >> 8;
        this.data[this.pos++] = value;
    }

    p3(value: number): void {
        this.data[this.pos++] = value >> 16;
        this.data[this.pos++] = value >> 8;
        this.data[this.pos++] = value;
    }

    p4(value: number): void {
        this.data[this.pos++] = value >> 24;
        this.data[this.pos++] = value >> 16;
        this.data[this.pos++] = value >> 8;
        this.data[this.pos++] = value;
    }

    p8(value: number): void {
        this.data[this.pos++] = value >> 56;
        this.data[this.pos++] = value >> 48;
        this.data[this.pos++] = value >> 40;
        this.data[this.pos++] = value >> 32;
        this.data[this.pos++] = value >> 24;
        this.data[this.pos++] = value >> 16;
        this.data[this.pos++] = value >> 8;
        this.data[this.pos++] = value;
    }

    // ----

    psize1(length: number): void {
        this.data[this.pos - length - 1] = length;
    }

    psize2(length: number): void {
        this.data[this.pos - length - 2] = length >> 8;
        this.data[this.pos - length - 1] = length;
    }

    psize4(length: number): void {
        this.data[this.pos - length - 4] = length >> 24;
        this.data[this.pos - length - 3] = length >> 16;
        this.data[this.pos - length - 2] = length >> 8;
        this.data[this.pos - length - 1] = length;
    }

    tinyenc(key: number[], offset: number, length: number): void {
        const start: number = this.pos;
        this.pos = offset;

        const blocks: number = Math.floor((length - offset) / 8);
        for (let i: number = 0; i < blocks; i++) {
            let v0: number = this.g4();
            let v1: number = this.g4();
            let sum: number = 0;

            let num_rounds: number = 32;
            while (num_rounds-- > 0) {
                v0 += (v1 + (v1 << 4 ^ v1 >>> 5) ^ sum + key[sum & 0x3]) | 0;
                sum = (sum + 0x9E3779B9) | 0;
                v1 += ((v0 >>> 5 ^ v0 << 4) + v0 ^ sum + key[sum >>> 11 & 0xE8C00003]) | 0;
            }

            this.pos -= 8;
            this.p4(v0);
            this.p4(v1);
        }

        this.pos = start;
    }

    tinydec(key: number[], offset: number, length: number): void {
        const start: number = this.pos;

        const blocks: number = Math.trunc((length - offset) / 8);
        this.pos = offset;

        const delta: number = 0x9E3779B9;
        for (let i: number = 0; i < blocks; i++) {
            let v0: number = this.g4();
            let v1: number = this.g4();
            let num_rounds: number = 32;
            let sum: number = delta * num_rounds;

            while (num_rounds-- > 0) {
                v1 -= (((v0 << 4) ^ (v0 >>> 5)) + v0) ^ (sum + key[(sum >>> 11) & 0x3]);
                v1 = v1 >>> 0; // js

                sum -= delta;
                sum = sum >>> 0; // js

                v0 -= (((v1 << 4) ^ (v1 >>> 5)) + v1) ^ (sum + key[sum & 0x3]);
                v0 = v0 >>> 0; // js
            }

            this.pos -= 8;
            this.p4(v0);
            this.p4(v1);
        }

        this.pos = start;
    }
}
