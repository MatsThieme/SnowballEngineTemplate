import { ComponentType } from "GameObject/ComponentType";
import { GameObject } from "GameObject/GameObject";
import { RenderableContainer, RenderableContainerEventTypes } from "./RenderableContainer";

export type TerrainRendererEventTypes = {} & RenderableContainerEventTypes;

/** @category Component */
export class TerrainRenderer extends RenderableContainer<TerrainRendererEventTypes> {
    public constructor(gameObject: GameObject) {
        super(gameObject, ComponentType.TerrainRenderer);

        throw new Error("not implemented");
    }
}
