import 'dotenv/config';

import fs from 'fs';
import path from 'path';

import Fastify from 'fastify';

// eslint-disable-next-line @typescript-eslint/typedef
const fastify = Fastify({
    // logger: true
});

const loaded: Set<string> = new Set();
const ignored: Set<string> = new Set();

// replaces @fastify/autoload which had some TS issues as the time of writing
async function registerAll(searchDir: string, importDir: string, prefix: string = ''): Promise<void> {
    const entries: string[] = fs.readdirSync(searchDir);

    for (const entry of entries) {
        const entryPath: string = path.join(searchDir, entry);
        const stat: fs.Stats = fs.statSync(entryPath);

        if (stat.isDirectory()) {
            await registerAll(entryPath, importDir, prefix + '/' + entry);
        } else if (stat.isFile() && (entry.endsWith('.js') || entry.endsWith('.ts'))) {
            const full: string = importDir + prefix + '/' + entry;
            if (loaded.has(full) || ignored.has(full)) {
                continue;
            }

            fastify.register(await import(importDir + prefix + '/' + entry), {
                prefix
            });
            loaded.add(full);
        }
    }
}

await registerAll('src/runewiki/web/routes', '#runewiki/web/routes');

try {
    await fastify.listen({
        port: (process.env.WEB_PORT ?? 3000) as number,
        host: '0.0.0.0'
    });
} catch (err) {
    fastify.log.error(err);
    process.exit(1);
}
