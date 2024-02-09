/* eslint-disable @typescript-eslint/no-explicit-any */

import JagBuffer from '#jagex3/io/JagBuffer.js';
import JagFile from '#jagex3/io/JagFile.js';
import Js5 from '#jagex3/js5/Js5.js';
import LocType from '#jagex3/type/LocType.js';
import { OpenRS2 } from '#runewiki/util/OpenRS2.js';
import { Readable, Stream } from 'stream';

export default function (f: any, opts: any, next: any): void {
    f.get('/loc', async (req: any, res: any): Promise<any> => {
        const openrs2: OpenRS2 = await OpenRS2.find(req.query);

        if (openrs2.isOldEngine()) {
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
                try {
                    const type: LocType = new LocType(id, dat, openrs2);
                    type.exportDef(def);
                } catch (err) {
                    console.error(err);
                    break;
                }
            }

            return def.join('\n') + '\n';
        } else {
            const stream: Readable = new Readable();
            stream._read = (): void => {};
    
            if ((openrs2.game === 'runescape' && openrs2.rev < 488) || openrs2.game === 'oldschool') {
                const js5: Js5 = await Js5.create(2, openrs2);
                const count: number = js5.getGroupCapacity(6);

                res.send(stream);
                for (let id: number = 0; id < count; id++) {
                    const file: Int8Array | null = await js5.readFile(id, 6);
                    if (!file) {
                        break;
                    }

                    try {
                        const dat: JagBuffer = new JagBuffer(file);
                        const type: LocType = new LocType(id, dat, openrs2);
                        const def: string[] = [];
                        type.exportDef(def);
                        stream.push(def.join('\n') + '\n');
                    } catch (err) {
                        console.error(err);
                        break;
                    }
                }
            } else {
                const js5: Js5 = await Js5.create(16, openrs2);
                const typesPerGroup: number = js5.getGroupCapacity(16);
                const totalTypes: number = js5.capacity() * typesPerGroup;

                res.send(stream);
                for (let id: number = 0; id < totalTypes; id++) {
                    const groupId: number = Math.floor(id / typesPerGroup);
                    const fileId: number = id % typesPerGroup;

                    const file: Int8Array | null = await js5.readFile(fileId, groupId);
                    if (!file) {
                        break;
                    }

                    try {
                        const dat: JagBuffer = new JagBuffer(file);
                        const type: LocType = new LocType(id, dat, openrs2);
                        const def: string[] = [];
                        type.exportDef(def);
                        stream.push(def.join('\n') + '\n');
                    } catch (err) {
                        console.error(err);
                        break;
                    }
                }
            }

            stream.push(null);
        }
    });

    next();
}
