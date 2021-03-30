import { Asset } from 'Assets/Asset';
import { AssetType } from 'Assets/AssetType';
import { ComponentType } from 'GameObject/ComponentType';
import { GameObject } from 'GameObject/GameObject';
import { VideoEventTypes } from 'Utility/Events/EventTypes';
import { Renderable } from './Renderable';

/**
 * 
 * Playback is controlled by asset.datas HTMLVideoElement.
 * @category Component
 * 
 */
export class Video extends Renderable<VideoEventTypes> {
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

            (<HTMLVideoElement>val.data).onended = () => this.dispatchEvent('end');
        } else {
            if (this._asset) (<HTMLVideoElement>this._asset.data).onended = null;
            this.sprite = this._asset = undefined;
        }
    }
}