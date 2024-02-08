/* eslint-disable @typescript-eslint/no-explicit-any */

import { OpenRS2 } from '#runewiki/util/OpenRS2.js';

export default function(f: any, opts: any, next: any): void {
    f.get('/', async (req: any, res: any): Promise<any> => {
        return {};
    });

    f.get('/caches', async (req: any, res: any): Promise<any> => {
        return OpenRS2.getLatest();
    });

    f.get('/find', async (req: any, res: any): Promise<any> => {
        return OpenRS2.find(req.query);
    });

    f.get('/keys', async (req: any, res: any): Promise<any> => {
        const openrs2: OpenRS2 = await OpenRS2.find(req.query);
        return openrs2.getKeys();
    });

    next();
}
