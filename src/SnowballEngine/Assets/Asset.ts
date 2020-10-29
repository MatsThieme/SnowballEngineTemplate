import { Canvas } from '../Canvas.js';
import { D } from '../Debug.js';
import { Vector2 } from '../Vector2.js';
import { AssetType } from './AssetType.js';

export class Asset {
    public readonly url: string;
    public readonly type: AssetType;
    public readonly data: CanvasImageSource | HTMLAudioElement | HTMLVideoElement | string | Blob | object;
    private readonly _imagePXSize?: Vector2;
    public cloneAlways: boolean; // should Assets.get return the asset or a clone
    public constructor(url: string, type: AssetType, data: CanvasImageSource | HTMLAudioElement | HTMLVideoElement | string | Blob | object, clone: boolean = false) {
        this.url = url;
        this.type = type;
        this.data = data;
        this.cloneAlways = clone;

        if (type === AssetType.Image) {
            this._imagePXSize = new Vector2((<HTMLImageElement>this.data).width, (<HTMLImageElement>this.data).height);
        }
    }

    public get imagePXSize(): Vector2 | undefined {
        return this._imagePXSize?.clone;
    }

    /**
     * 
     * Mirror the canvasImageSource horizontally.
     * 
     */
    public mirrorImageX(): Asset {
        if (this.type !== AssetType.Image) {
            D.warn('cant mirror asset');
            return this;
        }

        const c = Canvas((<HTMLImageElement>this.data).width, (<HTMLImageElement>this.data).height);
        const ctx = c.getContext('2d')!;
        ctx.translate(c.width, 0);
        ctx.scale(-1, 1);
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(<HTMLImageElement>this.data, 0, 0);
        (<any>this).data = c;

        return this;
    }

    /**
     *
     * Mirror the canvasImageSource vertically.
     *
     */
    public mirrorImageY(): Asset {
        if (this.type !== AssetType.Image) {
            D.warn('cant mirror asset');
            return this;
        }

        const c = Canvas((<HTMLImageElement>this.data).width, (<HTMLImageElement>this.data).height);
        const ctx = c.getContext('2d')!;
        ctx.translate(0, c.height);
        ctx.scale(1, -1);
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage((<HTMLImageElement>this.data), 0, 0);
        (<any>this).data = c;

        return this;
    }

    public toCanvas(): Asset {
        const c = Canvas((<HTMLImageElement>this.data).width, (<HTMLImageElement>this.data).height);
        const ctx = c.getContext('2d');
        ctx!.imageSmoothingEnabled = false;
        ctx!.drawImage((<HTMLImageElement>this.data), 0, 0);
        (<any>this).data = c;

        return this;
    }

    public clone(): Asset {
        if (this.type === AssetType.Text || this.type === AssetType.Font) return new Asset(this.url, this.type, this.data);
        if (this.type === AssetType.Blob) return new Asset(this.url, this.type, (<Blob>this.data).slice());
        if (this.type === AssetType.JSON) return new Asset(this.url, this.type, JSON.parse(JSON.stringify(this.data)));
        if (this.type === AssetType.Audio) return new Asset(this.url, this.type, new Audio(this.url));
        if (this.type === AssetType.Image) {
            const img = new Image();
            img.src = this.url;
            return new Asset(this.url, this.type, img);
        }
        if (this.type === AssetType.Video) {
            const video = document.createElement('video');
            video.src = this.url;
            return new Asset(this.url, this.type, video);
        }

        return new Asset(this.url, this.type, this.data);
    }
}