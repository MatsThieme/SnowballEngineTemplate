import { ComponentType } from 'GameObject/ComponentType';
import { GameObject } from 'GameObject/GameObject';
import { Bodies, Body, IChamferableBodyDefinition } from 'matter-js';
import { Collider } from './Collider';

export class CircleCollider extends Collider {
    public constructor(gameObject: GameObject) {
        super(gameObject, ComponentType.CircleCollider);
    }

    protected buildBody(options: IChamferableBodyDefinition): Body {
        return this.setGameObjectOnBody(Bodies.polygon(0, 0, 50, 0.5, <any>{ ...options, circleRadius: 1, slop: 0.05 * this.gameObject.scene.physics.worldScale }));
    }
}