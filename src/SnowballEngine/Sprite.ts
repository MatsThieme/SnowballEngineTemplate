import { Vector2 } from './Vector2';
import { Asset } from './Assets/Asset';
import { AssetType } from './Assets/AssetType';
import { D } from './Debug';

export class Sprite {
    /**
     * 
     * Size of the canvas image source in px. 
     * 
     */
    public size: Vector2;

    /**
     * 
     * Relative position on the canvasImageSource in px.
     * 
     */
    public subPosition: Vector2;

    /**
     *
     * Size of the sprite on the canvasImageSource in px.
     *
     */
    public subSize: Vector2;
    private _canvasImageSource!: CanvasImageSource;
    public get canvasImageSource(): CanvasImageSource {
        return this._canvasImageSource;
    }

    /**
     * 
     *  Deprecated, replaced by Asset, used internally for passing image data to the renderer only.
     *  
     *  Previous use:
     *  "Used to load, store or create a canvas image source."
     * 
     */
    public constructor(src: Asset | CanvasImageSource) {
        if ('data' in src) {
            if (src.type !== AssetType.Image) throw 'Sprite, Sprite constructor, expected AssetType.Image';
            this._canvasImageSource = <CanvasImageSource>src.data;
        } else this._canvasImageSource = src;

        this.subPosition = new Vector2();
        this.subSize = new Vector2((<any>this._canvasImageSource).width, (<any>this._canvasImageSource).height);
        this.size = new Vector2((<any>this._canvasImageSource).width, (<any>this._canvasImageSource).height);
    }
}