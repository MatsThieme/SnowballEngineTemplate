import { Asset } from '../../Assets/Asset';
import { AssetType } from '../../Assets/AssetType';
import { ComponentType } from '../ComponentType';
import { GameObject } from '../GameObject';
import { Renderable } from './Renderable';

export class Texture extends Renderable {
    private _asset?: Asset;

    public constructor(gameObject: GameObject) {
        super(gameObject, ComponentType.Texture);
    }

    public get asset(): Asset | undefined {
        return this._asset;
    }
    public set asset(val: Asset | undefined) {
        if (val?.type === AssetType.Image) {
            this._asset = val;
            this.sprite = val.getPIXISprite();
        } else this.sprite = this._asset = undefined;
    }
}