import { ComponentType } from 'GameObject/ComponentType';
import { GameObject } from 'GameObject/GameObject';
import { Bodies, Body } from 'matter-js';
import { Collider } from './Collider';

export class CircleCollider extends Collider {
    public readonly body: Body;

    public constructor(gameObject: GameObject) {
        super(gameObject, ComponentType.CircleCollider);

        this._bodyOptions = <any>{ ...this._bodyOptions, circleRadius: 1 };
        this.body = Bodies.polygon(0, 0, 50, 0.5, this._bodyOptions);
    }
}