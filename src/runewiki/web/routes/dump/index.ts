/* eslint-disable @typescript-eslint/no-explicit-any */

import JagBuffer from '#jagex3/io/JagBuffer.js';
import JagFile from '#jagex3/io/JagFile.js';
import LocType from '#jagex3/type/LocType.js';
import { OpenRS2 } from '#runewiki/util/OpenRS2.js';

export default function (f: any, opts: any, next: any): void {
    f.get('/loc', async (req: any, res: any): Promise<any> => {
        const openrs2: OpenRS2 = await OpenRS2.find(req.query);

        const data: Int8Array | null = await openrs2.getGroup(0, 2);
        if (data == null || data.length == 0) {
            throw new Error('Archive not found');
        }

        const jag: JagFile = new JagFile(new JagBuffer(data));
        const buf: Int8Array | null = jag.read('loc.dat');
        if (buf == null || buf.length == 0) {
            throw new Error('loc.dat not found');
        }

        const dat: JagBuffer = new JagBuffer(buf);
        const count: number = dat.g2();
        const def: string[] = [];

        for (let id: number = 0; id < count; id++) {
            const type: LocType = new LocType(id, dat);
            type.exportDef(def);
        }

        return def.join('\n');
    });

    next();
}
