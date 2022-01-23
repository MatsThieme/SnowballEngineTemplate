import { ComponentType } from "GameObject/ComponentType";
import { GameObject } from "GameObject/GameObject";
import { Bodies, Body, IChamferableBodyDefinition } from "matter-js";
import { Collider } from "./Collider";

/** @category Component */
export class TerrainCollider extends Collider {
    public constructor(gameObject: GameObject) {
        super(gameObject, ComponentType.TerrainCollider);

        throw new Error("not implemented");
    }

    protected buildBody(options: IChamferableBodyDefinition): Body {
        return Bodies.rectangle(0, 0, 1, 1, options);
    }
}
