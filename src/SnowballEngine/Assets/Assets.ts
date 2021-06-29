import { AudioListener } from 'GameObject/Components/AudioListener';
import { Interval } from 'Utility/Interval/Interval';
import { Timeout } from 'Utility/Timeout/Timeout';
import AssetDB from '../../../Assets/AssetDB.json';
import { Asset } from './Asset';
import { AssetType } from './AssetType';

type ADB = typeof AssetDB;

declare global {
    type AssetID = keyof ADB | AssetName | Exclude<{ [K in keyof ADB]: keyof ADB[K] }[keyof ADB], ''>;
}

/** @category Asset Management */
export class Assets {
    private static readonly _assets: Partial<Record<string, Asset>> = {};

    public static get(id: AssetID): Asset | undefined {
        return Assets._assets[id];
    }

    /**
     * 
     * Removes the Asset from the DB.
     * Does not destroy the Asset. 
     * 
     */
    public static delete(id: AssetID): void {
        delete Assets._assets[id];
    }

    public static set(name: AssetID, asset: Asset): Asset {
        Assets._assets[name] = asset;
        return asset;
    }

    public static async load(path: string, type: AssetType, name?: AssetID): Promise<Asset> {
        if (name && Assets._assets[name] || !name && Assets.get(<AssetID>path)) {
            throw new Error('Asset not loaded: Asset with name/path exists');
        }

        try {
            const asset = await Assets.urlToAsset(`./Assets/${path}`, type, name);
            Assets._assets[path] = asset;
            if (name) Assets._assets[name] = asset;

            return asset;
        } catch (error) {
            throw new Error(`Could not load Asset: ${path}; ${JSON.stringify(error)}`);
        }
    }

    private static urlToAsset(url: string, type: AssetType, name?: string): Promise<Asset> {
        return new Promise(async (resolve, reject) => {
            if (type === AssetType.Image) {
                const img = new Image();
                img.addEventListener('load', () => resolve(new Asset(url, type, img)));
                img.addEventListener('error', reject);
                img.src = url;
            } else if (type === AssetType.Audio) {
                const response = <ArrayBuffer>await Assets.req(url, type);

                AudioListener.context.decodeAudioData(response, buffer => resolve(new Asset(url, type, buffer)), e => { throw new Error(`Error with decoding audio data: ${e.message}`); });
            } else if (type === AssetType.Video) {
                const video = document.createElement('video');
                video.addEventListener('canplaythrough', () => resolve(new Asset(url, type, video)));
                video.addEventListener('error', reject);
                video.src = url;
            } else if (type === AssetType.Font) {
                const fontfamilyname = name || 'f' + Date.now() + ~~(Math.random() * 1000000);
                await Assets.loadFont(url, fontfamilyname);
                resolve(new Asset(url, type, fontfamilyname));
            } else if (type === AssetType.Text || type === AssetType.Blob || type === AssetType.JSON) {
                const response = await Assets.req(url, type);
                resolve(new Asset(url, type, <string | Blob | Record<string, unknown>>response));
            }
        });
    }

    private static req(url: string, type: AssetType.Text | AssetType.Blob | AssetType.JSON | AssetType.Audio): Promise<string | Blob | Record<string, unknown> | ArrayBuffer> {
        return new Promise((resolve, reject) => {
            const req = new XMLHttpRequest();
            req.addEventListener('load', () => resolve(req.response));
            req.addEventListener('error', () => reject('Assets.req, failed to load asset'));

            if (type === AssetType.Text) {
                req.responseType = 'text';
            } else if (type === AssetType.Blob) {
                req.responseType = 'blob';
            } else if (type === AssetType.JSON) {
                req.responseType = 'json';
            } else if (type === AssetType.Audio) {
                req.responseType = 'arraybuffer';
            }

            req.open('GET', url);
            req.send();
        });
    }

    private static loadFont(url: string, name: string): Promise<void> {
        if (Assets.canCheckFont()) return Assets.fontLoadPromise(name);

        const e = document.head.querySelector('style') || document.head.appendChild(document.createElement('style'));
        e.innerHTML += `@font-face { font-family: ${name}; src: url('${url}'); }`;

        const p = document.createElement('span');
        p.textContent = 'IWML'.repeat(100);
        p.style.fontFamily = 'serif';
        p.style.visibility = 'hidden';
        p.style.fontSize = '10000px';
        document.body.appendChild(p);

        const initialSize = p.offsetWidth * p.offsetHeight;

        p.style.fontFamily = name;

        return new Interval(i => {
            if (p.offsetWidth * p.offsetHeight !== initialSize) {
                i.clear();
                p.remove();
            }
        }, 10);
    }

    private static checkFont(name: string): boolean {
        return (<any>document).fonts.check(`10px ${name}`);
    }

    private static canCheckFont(): boolean {
        return !!(<any>document).fonts?.check;
    }

    private static fontLoadPromise(name: string): Promise<void> {
        return new Interval(i => {
            if (Assets.checkFont(name)) {
                i.clear();
            }
        }, 10);
    }

    public static async loadFromAssetDB(): Promise<void> {
        const p: Promise<Asset>[] = [];

        for (const path in AssetDB) {
            const name = Object.keys(<AssetID>(<any>AssetDB)[path])[0];
            p.push(Assets.load(path, (<any>AssetDB)[path][name], <AssetID>name || undefined));
        }

        for (const ap of p) {
            await ap;
            await new Timeout(1); // allow execution of other tasks
        }
    }
}