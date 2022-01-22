import { Asset } from "Assets/Asset";
import { AssetType } from "Assets/AssetType";
import { ComponentType } from "GameObject/ComponentType";
import { GameObject } from "GameObject/GameObject";
import { Renderable, RenderableEventTypes } from "./Renderable";

export type TextureEventTypes = {} & RenderableEventTypes;

/** @category Component */
export class Texture extends Renderable<TextureEventTypes> {
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
