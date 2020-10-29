import { interval } from '../Helpers.js';
import { Asset } from './Asset.js';
import { AssetType } from './AssetType.js';

export class Assets {
    private static readonly assets: Map<string, Asset> = new Map();
    public static get(id: string): Asset | undefined {
        const asset = Assets.assets.get(id);
        return asset?.cloneAlways ? asset.clone() : asset;
    }
    public static delete(id: string): void {
        Assets.assets.delete(id);
    }
    public static set(asset: Asset, name: string): Asset {
        Assets.assets.set(name, asset);
        return asset;
    }
    public static load(path: string, type: AssetType, name?: string, clone: boolean = false): Promise<Asset> {
        return new Promise(async (resolve, reject) => {
            if (name && Assets.assets.get(name) || !name && Assets.get(path)) console.warn(path + ' overwriting ' + name);

            let asset!: Asset;

            try {
                asset = await Assets.urlToAsset('./Assets/' + path, type, clone);
            } catch (error) {
                alert('Assets.load error: ' + path);

                reject(error);
            }


            if (asset) {
                Assets.assets.set(name || path, asset);
                return resolve(asset);
            }

            reject(`asset not found ${path}`);
        });
    }
    private static urlToAsset(url: string, type: AssetType, clone: boolean): Promise<Asset> {
        return new Promise(async (resolve, reject) => {
            if (type === AssetType.Image) {
                const img = new Image();
                img.addEventListener('load', () => resolve(new Asset(url, type, img, clone)));
                img.addEventListener('error', reject);
                img.src = url;
            } else if (type === AssetType.Audio) {
                const audio = new Audio();
                audio.addEventListener('canplaythrough', () => resolve(new Asset(url, type, audio, clone)));
                audio.addEventListener('error', reject);
                audio.src = url;
            } else if (type === AssetType.Video) {
                const video = document.createElement('video');
                video.addEventListener('canplaythrough', () => resolve(new Asset(url, type, video, clone)));
                video.addEventListener('error', reject);
                video.src = url;
            } else if (type === AssetType.Font) {
                const fontfamilyname = 'f' + Date.now() + ~~(Math.random() * 1000000);
                await Assets.loadFont(url, fontfamilyname);
                resolve(new Asset(url, type, fontfamilyname, clone));
            } else if (type === AssetType.Text || type === AssetType.Blob || type === AssetType.JSON) {
                const response = await Assets.req(url, type);
                resolve(new Asset(url, type, response, clone));
            }
        });
    }
    private static req(url: string, type: AssetType): Promise<string | Blob | object> {
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
    public static async loadFromAssetList(): Promise<void> {
        const list = <Array<{ path: string, type: AssetType, name?: string, clone?: boolean }>>(await Assets.load('AssetList.json', AssetType.JSON)).data;

        await Promise.all(list.map(obj => Assets.load(obj.path, obj.type, obj.name || obj.path, obj.clone)));
    }
}