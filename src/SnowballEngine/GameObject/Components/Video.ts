import { Asset } from '../../Assets/Asset';
import { AssetType } from '../../Assets/AssetType';
import { ComponentType } from '../ComponentType';
import { GameObject } from '../GameObject';
import { Renderable } from './Renderable';

/**
 * 
 * Playback is controlled by asset.datas HTMLVideoElement.
 * 
 */
export class Video extends Renderable {
    private _asset?: Asset;

    public constructor(gameObject: GameObject) {
        super(gameObject, ComponentType.Video);
    }

    public get asset(): Asset | undefined {
        return this._asset;
    }
    public set asset(val: Asset | undefined) {
        if (val?.type === AssetType.Video) {
            this._asset = val;
            this.sprite = val.getPIXISprite();
        } else this.sprite = this._asset = undefined;
    }
}