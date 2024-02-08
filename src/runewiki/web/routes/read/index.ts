/* eslint-disable @typescript-eslint/no-explicit-any */

import JagBuffer from '#jagex3/io/JagBuffer.js';
import JagFile from '#jagex3/io/JagFile.js';
import Js5 from '#jagex3/js5/Js5.js';
import { OpenRS2 } from '#runewiki/util/OpenRS2.js';

export default function (f: any, opts: any, next: any): void {
    f.get('/:archive/:group/:file?', async (req: any, res: any): Promise<any> => {
        const { archive, group, file = null } = req.params;

        const openrs2: OpenRS2 = await OpenRS2.find(req.query);
        const js5: Js5 = await Js5.create(archive, openrs2);

        if (file != null) {
            const data: Int8Array | null = await js5.readFile(group, file);
            if (data == null) {
                throw new Error('File not found');
            }

            res.header('Content-Disposition', `attachment; filename=${archive}.${group}-${file}.dat`);
            return data;
        } else {
            if (archive == OpenRS2.ARCHIVE_MAPS) {
                const keys: any = await openrs2.getKeys();
                let groupId: number = -1;
                if (/^[0-9]+$/.test(group)) {
                    groupId = parseInt(group);
                } else {
                    groupId = js5.getGroupId(group);
                }
                const map: any = keys.find((x: any): boolean => x.group == groupId);

                const data: Int8Array | null = await js5.readGroup(groupId, map && map.key.length == 4 ? map.key : null);
                if (data == null) {
                    throw new Error('Error fetching map (missing data or bad key)');
                }

                res.header('Content-Disposition', `attachment; filename=${group}.dat`);
                return data;
            } else if (archive == OpenRS2.ARCHIVE_TEXTURES_DXT) {
                const data: Int8Array | null = await js5.readGroup(group);
                if (data == null) {
                    throw new Error('DXT texture not found');
                }

                res.type('image/vnd.ms-dds');
                res.header('Content-Disposition', `attachment; filename=${group}.dds`);
                return data.subarray(5);
            } else if (archive == OpenRS2.ARCHIVE_TEXTURES_PNG) {
                const data: Int8Array | null = await js5.readGroup(group);
                if (data == null) {
                    throw new Error('PNG texture not found');
                }

                res.type('image/png');
                return data.subarray(5);
            } else if (archive == OpenRS2.ARCHIVE_TEXTURES_PNG_MIPPED) {
                const data: Int8Array | null = await js5.readGroup(group);
                if (data == null) {
                    throw new Error('Mipmapped PNG texture not found');
                }

                res.type('image/png');
                return data.subarray(6);
            } else if (archive == OpenRS2.ARCHIVE_TEXTURES_ETC) {
                const data: Int8Array | null = await js5.readGroup(group);
                if (data == null) {
                    throw new Error('Texture not found');
                }

                res.type('image/ktx');
                return data.subarray(5);
            } else if (archive == OpenRS2.ARCHIVE_TYPEFONTS) {
                const data: Int8Array | null = await js5.readGroup(group);
                if (data == null) {
                    throw new Error('Typefont not found');
                }

                res.type('application/x-font-opentype');
                res.header('Content-Disposition', `attachment; filename=${group}.otf`);
                return data;
            } else {
                const data: Int8Array | null = await js5.readGroup(group);
                if (data == null) {
                    throw new Error('Group not found');
                }

                res.header('Content-Disposition', `attachment; filename=${archive}.${group}.dat`);
                return data;
            }
        }
    });

    f.get('/jag/:archive/:file?', async (req: any, res: any): Promise<any> => {
        const openrs2: OpenRS2 = await OpenRS2.find(req.query);

        const data: Int8Array | null = await openrs2.getGroup(0, req.params.archive);
        if (data == null || data.length == 0) {
            throw new Error('Archive not found');
        }

        const jag: JagFile = new JagFile(new JagBuffer(data));
        if (typeof req.params.file === 'undefined') {
            jag.data = new Int8Array();
            return jag;
        } else {
            const file: Int8Array | null = jag.read(req.params.file);
            if (file == null) {
                throw new Error('File not found');
            }

            res.header('Content-Disposition', `attachment; filename=${req.params.file.toLowerCase()}`);
            return file;
        }
    });

    next();
}
