import { ComponentType } from "GameObject/ComponentType";
import { GameObject } from "GameObject/GameObject";
import { Bodies, Body, IChamferableBodyDefinition } from "matter-js";
import { Collider } from "./Collider";

export class RectangleCollider extends Collider {
    public constructor(gameObject: GameObject) {
        super(gameObject, ComponentType.RectangleCollider);
    }

    protected buildBody(options: IChamferableBodyDefinition): Body {
        return this.addPropertiesToBody(
            Bodies.rectangle(0, 0, 1, 1, {
                ...options,
                slop: 0.05 * this.gameObject.scene.physics.worldScale,
            })
        );
    }
}
