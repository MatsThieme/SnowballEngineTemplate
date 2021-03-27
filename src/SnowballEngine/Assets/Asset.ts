import { BaseTexture, Texture } from '@pixi/core';
import { Rectangle } from '@pixi/math';
import { Sprite } from '@pixi/sprite';
import { Vector2 } from 'SnowballEngine/Utilities/Vector2';
import { Canvas } from '../Utilities/Canvas';
import { clearObject } from '../Utilities/Helpers';
import { AssetType } from './AssetType';

export class Asset {
    /**
     * 
     * relative url to the asset, starting with ./Assets/
     * 
     */
    public readonly path: string;
    public readonly type: AssetType;
    public readonly data: HTMLCanvasElement | HTMLImageElement | HTMLVideoElement | AudioBuffer | string | Blob | Record<string, unknown>;

    public readonly image?: {
        readonly size: ImmutableObject<Vector2>,
        readonly baseTexture: BaseTexture,
        mirrorX: boolean,
        mirrorY: boolean,
        x?: number,
        y?: number,
        width?: number,
        height?: number
    };

    private readonly _image?: {
        mirroredX: boolean,
        mirroredY: boolean
    }

    public readonly video?: {
        readonly size: ImmutableObject<Vector2>,
        readonly baseTexture: BaseTexture
        x?: number,
        y?: number,
        width?: number,
        height?: number
    };

    public constructor(path: string, type: AssetType, data: HTMLCanvasElement | HTMLImageElement | HTMLVideoElement | AudioBuffer | string | Blob | Record<string, unknown>) {
        this.path = path;
        this.type = type;
        this.data = data;

        if (this.type === AssetType.Image) {
            this.image = {
                size: new Vector2((<HTMLImageElement>this.data).width, (<HTMLImageElement>this.data).height),
                baseTexture: new BaseTexture(<HTMLImageElement>this.data),
                mirrorX: false,
                mirrorY: false
            };

            this._image = {
                mirroredX: false,
                mirroredY: false
            };
        } else if (this.type === AssetType.Video) {
            this.video = {
                size: new Vector2((<HTMLVideoElement>this.data).videoWidth, (<HTMLVideoElement>this.data).videoHeight),
                baseTexture: new BaseTexture(<HTMLVideoElement>this.data, { resourceOptions: { autoPlay: false } })
            };
        }
    }

    public mirrorImage(x?: boolean, y?: boolean): Asset {
        if (this.type !== AssetType.Image) {
            throw new Error('type !== AssetType.Image');
        }

        if (!x && !y) return this;

        const c = new Canvas((<HTMLImageElement>this.data).width, (<HTMLImageElement>this.data).height);
        const ctx = c.context2D();
        ctx.translate(0, c.height);
        ctx.scale(x ? -1 : 1, y ? -1 : 1);
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage((<HTMLImageElement>this.data), 0, 0);
        (<Mutable<Asset>>this).data = c;

        if (x) this._image!.mirroredX = !this._image!.mirroredX;
        if (y) this._image!.mirroredY = !this._image!.mirroredY;

        this.image!.baseTexture.destroy();

        (<Mutable<BaseTexture>>this.image!.baseTexture) = new BaseTexture(<HTMLImageElement>this.data);

        return this;
    }

    /**
     * 
     * Create PIXI.Sprite from the asset and optionally slice it.
     * If asset is an image, a PIXI.Sprite object will be returned, otherwise undefined.
     * 
     */
    public getPIXISprite(x?: number, y?: number, width?: number, height?: number): Sprite | undefined {
        if (this.type !== AssetType.Image && this.type !== AssetType.Video) {
            throw new Error('type !== AssetType.Image && this.type !== AssetType.Video');
        }

        if (this.type === AssetType.Image) this.mirrorImage(this.image!.mirrorX && !this._image!.mirroredX, this.image!.mirrorY && !this._image!.mirroredY);


        const sprite = new Sprite(this.getPIXITexture(x, y, width, height)!);

        sprite.name = this.path;

        return sprite;
    }

    public getPIXITexture(x?: number, y?: number, width?: number, height?: number): Texture | undefined {
        if (this.type !== AssetType.Image && this.type !== AssetType.Video) {
            throw new Error('type !== AssetType.Image && this.type !== AssetType.Video');
        }

        if (!x && !y && !width && !height && !(this.image || this.video)!.x && !(this.image || this.video)!.y && !(this.image || this.video)!.width && !(this.image || this.video)!.height) return new Texture(<BaseTexture>(this.image || this.video)!.baseTexture);
        else return new Texture(<BaseTexture>(this.image || this.video)!.baseTexture, new Rectangle(x || (this.image || this.video)!.x, y || (this.image || this.video)!.y, width === undefined ? (this.image || this.video)!.width || (this.image || this.video)!.size.x : width, height === undefined ? this.image!.height || (this.image || this.video)!.size.y : height));
    }

    public clone(): Asset {
        if (this.type === AssetType.Text || this.type === AssetType.Font) return new Asset(this.path, this.type, this.data);

        if (this.type === AssetType.Audio) {
            const ab = new AudioBuffer(<AudioBuffer>this.data);
            const arr = new Float32Array((<AudioBuffer>this.data).length);

            for (let i = 0; i < ab.numberOfChannels; i++) {
                ab.copyFromChannel(arr, i);
                ab.copyToChannel(arr, i);
            }

            return new Asset(this.path, this.type, (<AudioBuffer>this.data));
        }

        if (this.type === AssetType.Blob) return new Asset(this.path, this.type, (<Blob>this.data).slice());

        if (this.type === AssetType.JSON) return new Asset(this.path, this.type, JSON.parse(JSON.stringify(this.data)));

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

    public getCSSFontName(): string {
        if (this.type !== AssetType.Font) throw new Error('this.type !== AssetType.Font');

        return <string>this.data;
    }

    public destroy(): void {
        this.image?.baseTexture.destroy();

        clearObject(this);
    }
}