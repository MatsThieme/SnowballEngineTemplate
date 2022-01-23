import { ComponentType } from "GameObject/ComponentType";
import { GameObject } from "GameObject/GameObject";
import { RenderableContainer } from "./RenderableContainer";
import { RenderableSpriteEventTypes } from "./RenderableSprite";

export type TilemapRendererEventTypes = {} & RenderableSpriteEventTypes;

/** @category Component */
export class TilemapRenderer extends RenderableContainer<TilemapRendererEventTypes> {
    public constructor(gameObject: GameObject) {
        super(gameObject, ComponentType.TilemapRenderer);

        throw new Error("not implemented");
    }
}
