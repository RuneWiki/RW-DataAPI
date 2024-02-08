import zlib from 'zlib';

import JagBuffer from '#jagex3/io/JagBuffer.js';

export default class GzipDecompressor {
    static gunzip(src: JagBuffer, dst: Int8Array): void {
        if ((src.data[src.pos] & 0xFF) != 0x1F || (src.data[src.pos + 1] & 0xFF) != 0x8B) {
            throw new Error('Invalid GZIP header!');
        }

        try {
            dst.set(zlib.inflateRawSync(src.data.subarray(src.pos + 10, src.length - 8)));
        } catch (err) {
            throw new Error('Invalid GZIP compressed data!');
        }
    }
}
