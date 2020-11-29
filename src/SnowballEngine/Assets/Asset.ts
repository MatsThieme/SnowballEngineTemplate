import { Canvas } from '../Canvas';
import { D } from '../Debug';
import { Vector2 } from '../Vector2';
import { AssetType } from './AssetType';

export class Asset {
    public readonly path: string;
    public readonly type: AssetType;
    public readonly data: CanvasImageSource | HTMLAudioElement | HTMLVideoElement | string | Blob | object;
    private readonly _imagePxSize?: Vector2;
    public constructor(path: string, type: AssetType, data: CanvasImageSource | HTMLAudioElement | HTMLVideoElement | string | Blob | object) {
        this.path = path;
        this.type = type;
        this.data = data;

        if (this.type === AssetType.Image) {
            this._imagePxSize = new Vector2((<HTMLImageElement>this.data).width, (<HTMLImageElement>this.data).height);
        }
    }

    public get imagePxSize(): Vector2 | undefined {
        return this._imagePxSize?.clone;
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
        if (this.type === AssetType.Text || this.type === AssetType.Font) return new Asset(this.path, this.type, this.data);
        if (this.type === AssetType.Blob) return new Asset(this.path, this.type, (<Blob>this.data).slice());
        if (this.type === AssetType.JSON) return new Asset(this.path, this.type, JSON.parse(JSON.stringify(this.data)));
        if (this.type === AssetType.Audio) return new Asset(this.path, this.type, new Audio(this.path));
        if (this.type === AssetType.Image) {
            const img = new Image();
            img.src = this.path;
            return new Asset(this.path, this.type, img);
        }
        if (this.type === AssetType.Video) {
            const video = document.createElement('video');
            video.src = this.path;
            return new Asset(this.path, this.type, video);
        }

        return new Asset(this.path, this.type, this.data);
    }
}