import { Asset } from "Assets/Asset";
import { AssetType } from "Assets/AssetType";
import { ComponentType } from "GameObject/ComponentType";
import { GameObject } from "GameObject/GameObject";
import { RenderableSprite, RenderableSpriteEventTypes } from "./RenderableSprite";

export type TextureEventTypes = {} & RenderableSpriteEventTypes;

/** @category Component */
export class Texture extends RenderableSprite<TextureEventTypes> {
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
            this.setSprite(val.getPIXISprite());
        } else {
            this.setSprite((this._asset = undefined));
        }
    }
}
