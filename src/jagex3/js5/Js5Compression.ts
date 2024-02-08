import Bzip2Decompressor from '#jagex3/io/Bzip2Decompressor.js';
import GzipDecompressor from '#jagex3/io/GzipDecompressor.js';
import JagBuffer from '#jagex3/io/JagBuffer.js';

export default class Js5Compression {
    static uncompress(src: Int8Array): Int8Array {
        const buf: JagBuffer = new JagBuffer(src);
        const type: number = buf.g1();
        const len: number = buf.g4();

        if (len < 0) {
            throw new Error();
        } else if (type === 0) {
            const out: Int8Array = new Int8Array(len);
            out.set(src.subarray(buf.pos, buf.pos + len));
            return out;
        } else {
            const uncompressedLen: number = buf.g4();
            if (uncompressedLen < 0) {
                throw new Error();
            }

            const out: Int8Array = new Int8Array(uncompressedLen);
            if (type === 1) {
                Bzip2Decompressor.bunzip(buf, out);
            } else if (type === 2) {
                GzipDecompressor.gunzip(buf, out);
            } else if (type === 3) {
                console.error('TODO: lzma');
            }

            return out;
        }
    }
}
