import JagBuffer from '#jagex3/io/JagBuffer.js';

enum LocShape {
    wall_straight = 0,
    wall_diagonalcorner = 1,
    wall_l = 2,
    wall_squarecorner = 3,
    wall_diagonal = 9,
    walldecor_straight_nooffset = 4,
    walldecor_straight_offset = 5,
    walldecor_diagonal_nooffset = 6,
    walldecor_diagonal_offset = 7,
    walldecor_diagonal_both = 8,
    centrepiece_straight = 10,
    centrepiece_diagonal = 11,
    grounddecor = 22,
    roof_straight = 12,
    roof_diagonal_with_roofedge = 13,
    roof_diagonal = 14,
    roof_l_concave = 15,
    roof_l_convex = 16,
    roof_flat = 17,
    roofedge_straight = 18,
    roofedge_diagonalcorner = 19,
    roofedge_l = 20,
    roofedge_squarecorner = 21,
}

// hotkeys in jagex's map editor are used as the extension for loc models so they know which shape to inherit
enum LocShapeHotkey {
    _1 = 0, // 'wall_straight',
    _2 = 1, // 'wall_diagonalcorner',
    _3 = 2, // 'wall_l',
    _4 = 3, // 'wall_squarecorner',
    _5 = 9, // 'wall_diagonal',
    //
    _q = 4, // 'walldecor_straight_nooffset',
    _w = 5, // 'walldecor_straight_offset',
    _e = 6, // 'walldecor_diagonal_nooffset',
    _r = 7, // 'walldecor_diagonal_offset',
    _t = 8, // 'walldecor_diagonal_both',
    //
    _8 = 10, // 'centrepiece_straight',
    _9 = 11, // 'centrepiece_diagonal',
    _0 = 22, // 'grounddecor',
    //
    _a = 12, // 'roof_straight',
    _s = 13, // 'roof_diagonal_with_roofedge',
    _d = 14, // 'roof_diagonal',
    _f = 15, // 'roof_l_concave',
    _g = 16, // 'roof_l_convex',
    _h = 17, // 'roof_flat',
    //
    _z = 18, // 'roofedge_straight',
    _x = 19, // 'roofedge_diagonalcorner',
    _c = 20, // 'roofedge_l',
    _v = 21, // 'roofedge_squarecorner',
}

export default class LocType {
    id: number = -1;
    def: string[] = [];

    models: Int32Array | null = null;
    shapes: Int32Array | null = null;
    name: string | null = null;
    ops: string[] | null = null;
    width: number = 1;
    length: number = 1;
    blockwalk: number = 2;
    blockrange: boolean = true;
    active: number = -1;
    hillskew: number = 0;
    sharelight: boolean = false;
    occlude: boolean = false;
    anim: number = -1;
    disposeAlpha: boolean = false;
    walloff: number = 16;
    ambient: number = 0;
    contrast: number = 0;
    desc: string | null = null;
    recol_s: Int32Array | null = null;
    recol_d: Int32Array | null = null;
    retex_s: Int32Array | null = null;
    retex_d: Int32Array | null = null;
    mapfunction: number = -1;
    mirror: boolean = false;
    shadow: boolean = true;
    resizex: number = 128;
    resizey: number = 128;
    resizez: number = 128;
    mapscene: number = -1;
    forceapproach: number = -1;
    xoff: number = 0;
    yoff: number = 0;
    zoff: number = 0;
    forcedecor: boolean = false;
    breakroutefinding: boolean = false;
    supportitems: number = -1;
    multiLocVarbit: number = -1;
    multiLocVarp: number = -1;
    multiLocs: Int32Array | null = null;
    bgsound: number = -1;
    bgsoundrange: number = 0;
    bgsoundmin: number = 0;
    bgsoundmax: number = 0;
    bgsounds: Int32Array | null = null;
    hillskewAmount: number = 0;
    render: boolean = false;
    castshadow: boolean = true;
    allowrandomizedanimation: boolean = true;
    aBoolean211: boolean = true;
    members: boolean = false;
    hasAnimation: boolean = false;
    mapSceneRotated: boolean = false;
    aBoolean214: boolean = false;
    cursor1Op: number = -1;
    cursor1: number = -1;
    cursor2Op: number = -1;
    cursor2: number = -1;
    mapSceneAngleOffset: number = 0;
    params: Map<number, string | number> | null = null;

    constructor(id: number, buf: JagBuffer) {
        this.id = id;
        this.decode(buf);
    }

    decode(buf: JagBuffer): void {
        while (buf.pos < buf.length) {
            const code: number = buf.g1();
            if (code === 0) {
                break;
            }

            if (code === 1) {
                const count: number = buf.g1();
                this.models = new Int32Array(count);
                this.shapes = new Int32Array(count);

                // jagex only needs a single model= property and doesn't have to specify the shape
                // as it gets derived from the available model on the filesystem with specific suffixes
                // since we're representing unorganized data, we have to include it in the full definition
                for (let i: number = 0; i < count; i++) {
                    this.models[i] = buf.g2();
                    this.shapes[i] = buf.g1();
                    this.def.push(`model=model_${this.models[i]}${LocShapeHotkey[this.shapes[i]]}`);
                }
            } else if (code === 2) {
                this.name = buf.gjstrn();
            } else if (code === 3) {
                this.desc = buf.gjstrn();
            } else if (code === 5) {
                const count: number = buf.g1();
                this.models = new Int32Array(count);
                this.shapes = null;

                for (let i: number = 0; i < count; i++) {
                    this.models[i] = buf.g2();
                    this.def.push(`model=model_${this.models[i]}_8`);
                }
            } else if (code === 14) {
                this.width = buf.g1();
                this.def.push(`width=${this.width}`);
            } else if (code === 15) {
                this.length = buf.g1();
                this.def.push(`length=${this.length}`);
            } else if (code === 17) {
                this.blockwalk = 0;
                this.def.push('blockwalk=no');
            } else if (code === 18) {
                this.blockrange = false;
                this.def.push('blockrange=no');
            } else if (code === 19) {
                this.active = buf.g1();
                this.def.push(`active=${this.active ? 'yes' : 'no'}`);
            } else if (code === 21) {
                this.hillskew = 1;
                this.def.push('hillskew=yes');
            } else if (code === 22) {
                this.sharelight = true;
                this.def.push('sharelight=yes');
            } else if (code === 23) {
                this.occlude = true;
                this.def.push('occlude=yes');
            } else if (code === 24) {
                this.anim = buf.g2();
                if (this.anim === 65535) {
                    this.anim = -1;
                } else {
                    this.def.push(`anim=seq_${this.anim}`);
                }
            } else if (code === 25) {
                this.disposeAlpha = true;
                this.def.push('hasalpha=yes');
            } else if (code === 27) {
                this.blockwalk = 1;
                // todo
            } else if (code === 28) {
                this.walloff = buf.g1();
                this.def.push(`walloff=${this.walloff}`);
            } else if (code === 29) {
                this.ambient = buf.g1b();
                this.def.push(`ambient=${this.ambient}`);
            } else if (code === 39) {
                this.contrast = buf.g1b();
                this.def.push(`contrast=${this.contrast}`);
            } else if (code >= 30 && code < 39) {
                if (this.ops === null) {
                    this.ops = new Array(5);
                }

                this.ops[code - 30] = buf.gjstrn();
                this.def.push(`op${code - 29}=${this.ops[code - 30]}`);
            } else if (code === 40) {
                const count: number = buf.g1();

                this.recol_s = new Int32Array(count);
                this.recol_d = new Int32Array(count);

                for (let i: number = 0; i < count; i++) {
                    this.recol_s[i] = buf.g2();
                    this.recol_d[i] = buf.g2();

                    this.def.push(`recol${i + 1}s=${this.recol_s[i]}`);
                    this.def.push(`recol${i + 1}d=${this.recol_d[i]}`);
                }
            } else if (code === 41) {
                const count: number = buf.g1();

                this.retex_s = new Int32Array(count);
                this.retex_d = new Int32Array(count);

                for (let i: number = 0; i < count; i++) {
                    this.retex_s[i] = buf.g2();
                    this.retex_d[i] = buf.g2();

                    this.def.push(`retex${i + 1}s=${this.retex_s[i]}`);
                    this.def.push(`retex${i + 1}d=${this.retex_d[i]}`);
                }
            } else if (code === 60) {
                this.mapfunction = buf.g2();
                this.def.push(`mapfunction=${this.mapfunction}`);
            } else if (code === 62) {
                this.mirror = true;
                this.def.push('mirror=yes');
            } else if (code === 64) {
                this.shadow = false;
                this.def.push('shadow=no');
            } else if (code === 65) {
                this.resizex = buf.g2();
                this.def.push(`resizex=${this.resizex}`);
            } else if (code === 66) {
                this.resizey = buf.g2();
                this.def.push(`resizey=${this.resizey}`);
            } else if (code === 67) {
                this.resizez = buf.g2();
                this.def.push(`resizez=${this.resizez}`);
            } else if (code === 68) {
                this.mapscene = buf.g2();
                this.def.push(`mapscene=${this.mapscene}`);
            } else if (code === 69) {
                this.forceapproach = buf.g1();

                if ((this.forceapproach & 0x1) === 0) {
                    this.def.push('forceapproach=top');
                } else if ((this.forceapproach & 0x2) === 0) {
                    this.def.push('forceapproach=right');
                } else if ((this.forceapproach & 0x4) === 0) {
                    this.def.push('forceapproach=bottom');
                } else if ((this.forceapproach & 0x8) === 0) {
                    this.def.push('forceapproach=left');
                }
            } else if (code === 70) {
                this.xoff = buf.g2s();
                this.def.push(`xoff=${this.xoff}`);
            } else if (code === 71) {
                this.yoff = buf.g2s();
                this.def.push(`yoff=${this.yoff}`);
            } else if (code === 72) {
                this.zoff = buf.g2s();
                this.def.push(`zoff=${this.zoff}`);
            } else if (code === 73) {
                this.forcedecor = true;
                this.def.push('forcedecor=yes');
            } else if (code === 74) {
                this.breakroutefinding = true;
                this.def.push('breakroutefinding=yes');
            } else if (code === 75) {
                this.supportitems = buf.g1();
                this.def.push(`supportitems=${this.supportitems}`);
            } else if (code === 77 || code === 92) {
                let varbit: number = -1;

                this.multiLocVarbit = buf.g2();
                if (this.multiLocVarbit === 65535) {
                    this.multiLocVarbit = -1;
                } else {
                    this.def.push(`multivarbit=varbit_${this.multiLocVarbit}`);
                }

                this.multiLocVarp = buf.g2();
                if (this.multiLocVarp === 65535) {
                    this.multiLocVarp = -1;
                } else {
                    this.def.push(`multivar=varp_${this.multiLocVarp}`);
                }

                if (code === 92) {
                    varbit = buf.g2();

                    if (varbit === 65535) {
                        varbit = -1;
                    }
                }

                const count: number = buf.g1();

                this.multiLocs = new Int32Array(count + 1);
                for (let i: number = 0; i <= count; i++) {
                    this.multiLocs[i] = buf.g2();

                    if (this.multiLocs[i] === 65535) {
                        this.multiLocs[i] = -1;
                    } else {
                        this.def.push(`multiloc=${i},loc_${this.multiLocs[i]}`);
                    }
                }

                this.multiLocs[count + 1] = varbit;
            } else if (code === 78) {
                this.bgsound = buf.g2();
                this.bgsoundrange = buf.g1();
            } else if (code === 79) {
                this.bgsoundmin = buf.g2();
                this.bgsoundmax = buf.g2();
                this.bgsoundrange = buf.g1();

                const count: number = buf.g1();
                this.bgsounds = new Int32Array(count);
                for (let i: number = 0; i < count; i++) {
                    this.bgsounds[i] = buf.g2();
                }
            } else if (code === 81) {
                this.hillskew = 2;
                this.hillskewAmount = buf.g1();
                this.def.push(`sethillskew=${this.hillskewAmount}`);
            } else if (code === 82) {
                this.render = true;
                this.def.push('render=yes');
            } else if (code === 88) {
                this.castshadow = false;
                this.def.push('castshadow=no');
            } else if (code === 89) {
                this.allowrandomizedanimation = false;
                this.def.push('allowrandomizedanimation=no');
            } else if (code === 90) {
                this.aBoolean211 = false;
                this.def.push('aBoolean211=no');
            } else if (code === 91) {
                this.members = true;
                this.def.push('members=yes');
            } else if (code === 93) {
                this.hillskew = 3;
                this.hillskewAmount = buf.g2();
                this.def.push(`sethillskew=${this.hillskewAmount}`);
            } else if (code === 94) {
                this.hillskew = 4;
                this.def.push('hillskew4=yes');
            } else if (code === 95) {
                this.hillskew = 5;
                this.def.push('hillskew5=yes');
            } else if (code === 96) {
                this.hasAnimation = true;
                this.def.push('hasAnimation=yes');
            } else if (code === 97) {
                this.mapSceneRotated = true;
                this.def.push('mapSceneRotated=yes');
            } else if (code === 98) {
                this.aBoolean214 = true;
                this.def.push('aBoolean214=yes');
            } else if (code === 99) {
                this.cursor1Op = buf.g1();
                this.cursor1 = buf.g2();
                this.def.push(`cursor1=${this.cursor1},${this.cursor1Op}`);
            } else if (code === 100) {
                this.cursor2Op = buf.g1();
                this.cursor2 = buf.g2();
                this.def.push(`cursor2=${this.cursor2},${this.cursor2Op}`);
            } else if (code === 101) {
                this.mapSceneAngleOffset = buf.g1();
                this.def.push(`mapSceneAngleOffset=${this.mapSceneAngleOffset}`);
            } else if (code === 102) {
                this.mapscene = buf.g2();
                this.def.push(`mapscene=${this.mapscene}`);
            } else if (code === 249) {
                const count: number = buf.g1();

                if (this.params === null) {
                    this.params = new Map<number, string | number>();
                }

                for (let i: number = 0; i < count; i++) {
                    const isString: boolean = buf.g1() === 1;
                    const key: number = buf.g3();

                    if (isString) {
                        this.params.set(key, buf.gjstrn());
                    } else {
                        this.params.set(key, buf.g4());
                    }

                    this.def.push(`param=${key},${this.params.get(key)}`);
                }
            } else {
                throw new Error(`Error unrecognized config code ${code} while decoding loc ${this.id}`);
            }
        }
    }

    exportDef(out: string[]): void {
        out.push(`[loc_${this.id}]`);

        // these properties won't affect the crc by being moved to the beginning
        if (this.name !== null) {
            out.push(`name=${this.name}`);
        }

        if (this.desc !== null) {
            out.push(`desc=${this.desc}`);
        }

        out.push(...this.def);
        out.push('');
    }
}
