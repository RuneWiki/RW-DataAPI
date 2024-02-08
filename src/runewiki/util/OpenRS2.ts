import fs from 'fs';

import { download, downloadJson } from '#runewiki/util/DownloadUtils.js';

const OPENRS2_DOMAIN: string = 'https://archive.openrs2.org';

export type CacheInfo = {
    id: number;
    scope: string;
    game: string;
    environment: string;
    language: string;
    builds: [{
        major: number;
        minor: number | null;
    }];
    timestamps: string
    sources: string[];
    valid_indexes: number;
    indexes: number;
    valid_groups: number;
    groups: number;
    valid_keys: number;
    keys: number;
    size: number;
    blocks: number;
    disk_store_valid: boolean;
}

export class OpenRS2 {
    info: CacheInfo;
    url: string;

    static async getLatest(): Promise<CacheInfo[]> {
        return await downloadJson(`${OPENRS2_DOMAIN}/caches.json`, 'data/openrs2/caches.json') as CacheInfo[];
    }

    constructor(info: CacheInfo) {
        this.info = info;
        this.url = `${OPENRS2_DOMAIN}/caches/${this.scope}/${this.id}`;
    }

    get id(): number {
        return this.info.id;
    }

    get scope(): string {
        return this.info.scope;
    }

    async getKeys(): Promise<unknown | null> {
        return downloadJson(`${this.url}/keys.json`, `data/openrs2/${this.id}/keys.json`);
    }

    async getGroup(archive: number, group: number): Promise<Int8Array | null> {
        return download(`${this.url}/archives/${archive}/groups/${group}.dat`, `data/openrs2/${this.id}/${archive}/${group}.dat`);
    }
}
