import { Asset } from 'Assets/Asset';
import { AssetType } from 'Assets/AssetType';
import { ComponentType } from 'GameObject/ComponentType';
import { GameObject } from 'GameObject/GameObject';
import { Sprite } from 'pixi.js';
import { Color } from 'Utility/Color';
import { TextureEventTypes } from 'Utility/Events/EventTypes';
import { Renderable } from './Renderable';

/** @category Component */
export class Texture extends Renderable<TextureEventTypes>  {
    private _asset?: Asset;
    private _tint?: Color;

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
            if (this._tint) (<Sprite>this._sprite)!.tint = this._tint.rgb;
        } else this.sprite = this._asset = undefined;
    }

    public get tint(): Color | undefined {
        return this._tint;
    }
    public set tint(val: Color | undefined) {
        this._tint = val;
        if (this._sprite) (<Sprite>this._sprite).tint = val?.rgb || 0xFFFFFF;
    }
}