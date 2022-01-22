import { ComponentType } from "GameObject/ComponentType";
import { GameObject } from "GameObject/GameObject";
import { Renderable, RenderableEventTypes } from "./Renderable";

export type TerrainRendererEventTypes = {} & RenderableEventTypes;

/** @category Component */
export class TerrainRenderer extends Renderable<TerrainRendererEventTypes> {
    public constructor(gameObject: GameObject) {
        super(gameObject, ComponentType.TerrainRenderer);

        throw new Error("not implemented");
    }
}
