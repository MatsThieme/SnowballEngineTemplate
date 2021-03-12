import AssetDB from '../../../Assets/AssetDB.json';
import { AudioListener } from '../GameObject/Components/AudioListener';
import { asyncTimeout, interval } from '../Utilities/Helpers';
import { Asset } from './Asset';
import { AssetType } from './AssetType';

export class Assets {
    private static readonly assets: Map<string, Asset> = new Map();

    public static get(id: string): Asset | undefined {
        return Assets.assets.get(id);
    }

    public static delete(id: string): void {
        const asset = Assets.get(id);

        if (asset) {
            asset.destroy();
            Assets.assets.delete(id);
        }
    }

    public static set(asset: Asset, name: string): Asset {
        Assets.assets.set(name, asset);
        return asset;
    }

    public static async load(path: string, type: AssetType, name?: string): Promise<Asset> {
        if (name && Assets.assets.get(name) || !name && Assets.get(path)) {
            throw new Error('Asset not loaded: Asset with name/path exists');
        }

        let asset: Asset;

        try {
            asset = await Assets.urlToAsset('./Assets/' + path, type);
        } catch (error) {
            throw new Error(`Could not load asset: ${path}; ${JSON.stringify(error)}`);
        }

        Assets.assets.set(name || path, asset);

        return asset;
    }

    private static urlToAsset(url: string, type: AssetType): Promise<Asset> {
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
                const fontfamilyname = 'f' + Date.now() + ~~(Math.random() * 1000000);
                await Assets.loadFont(url, fontfamilyname);
                resolve(new Asset(url, type, fontfamilyname));
            } else if (type === AssetType.Text || type === AssetType.Blob || type === AssetType.JSON) {
                const response = await Assets.req(url, type);
                resolve(new Asset(url, type, response));
            }
        });
    }

    private static req(url: string, type: AssetType.Text | AssetType.Blob | AssetType.JSON | AssetType.Audio): Promise<string | Blob | Record<string, any> | ArrayBuffer> {
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
        return new Promise((resolve, reject) => {
            const e = document.head.querySelector('style') || document.head.appendChild(document.createElement('style'));
            e.innerHTML += `@font-face { font-family: ${name}; src: url('${url}'); }`;

            const p = document.createElement('span');
            p.textContent = 'IWML'.repeat(100);
            p.style.fontFamily = 'serif';
            p.style.visibility = 'hidden';
            p.style.fontSize = '10000px';
            document.body.appendChild(p);

            const initialSize = p.offsetWidth << 16 + p.offsetHeight;

            p.style.fontFamily = name;

            interval(clear => {
                if (p.offsetWidth << 16 + p.offsetHeight !== initialSize) {
                    clear();
                    resolve();
                    p.remove();
                }
            }, 1);
        });
    }

    public static async loadFromAssetDB(): Promise<void> {
        const db = <{ [key: string]: { type: AssetType, mimeType: string, name?: string } }>AssetDB;

        const p: Promise<Asset>[] = [];

        for (const path in db) {
            p.push(Assets.load(path, db[path].type, db[path].name));
        }

        for (const ap of p) {
            await ap;
            await asyncTimeout(1); // allow execution of other tasks
        }
    }
}