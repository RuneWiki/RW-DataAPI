import fs from 'fs';
import fsp from 'fs/promises';
import path from 'path';

export async function download(url: string, local: string, redownload: boolean = false): Promise<Int8Array | null> {
    try {
        if (!redownload && fs.existsSync(local)) {
            return new Int8Array(await fsp.readFile(local));
        }

        if (!fs.existsSync(path.dirname(local))) {
            await fsp.mkdir(path.dirname(local), { recursive: true });
        }

        const res: Response = await fetch(url);
        const data: Int8Array = new Int8Array(await res.arrayBuffer());
        await fsp.writeFile(local, data);
        return data;
    } catch (err) {
        console.error('Failed to download', url);
        return null;
    }
}

export async function downloadJson(url: string, local: string, redownload: boolean = false): Promise<unknown> {
    try {
        if (!redownload && fs.existsSync(local)) {
            return JSON.parse(await fsp.readFile(local, 'utf8'));
        }

        if (!fs.existsSync(path.dirname(local))) {
            await fsp.mkdir(path.dirname(local), { recursive: true });
        }

        const res: Response = await fetch(url);
        const data: unknown = await res.json();
        await fsp.writeFile(local, JSON.stringify(data));
        return data;
    } catch (err) {
        return null;
    }
}
