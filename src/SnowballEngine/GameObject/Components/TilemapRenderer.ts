import { ComponentType } from "GameObject/ComponentType";
import { GameObject } from "GameObject/GameObject";
import { Renderable, RenderableEventTypes } from "./Renderable";

export type TilemapRendererEventTypes = {} & RenderableEventTypes;

/** @category Component */
export class TilemapRenderer extends Renderable<TilemapRendererEventTypes> {
    public constructor(gameObject: GameObject) {
        super(gameObject, ComponentType.TilemapRenderer);

        throw new Error("not implemented");
    }
}
