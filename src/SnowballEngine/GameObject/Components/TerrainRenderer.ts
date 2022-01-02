import { ComponentType } from "GameObject/ComponentType";
import { GameObject } from "GameObject/GameObject";
import { TerrainRendererEventTypes } from "Utility/Events/EventTypes";
import { Renderable } from "./Renderable";

/** @category Component */
export class TerrainRenderer extends Renderable<TerrainRendererEventTypes> {
    public constructor(gameObject: GameObject) {
        super(gameObject, ComponentType.TerrainRenderer);

        throw new Error("not implemented");
    }
}
