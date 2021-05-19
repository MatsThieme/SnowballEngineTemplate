import { ComponentType } from 'GameObject/ComponentType';
import { GameObject } from 'GameObject/GameObject';
import { Bodies, Body, IChamfer } from 'matter-js';
import { Collider } from './Collider';

export class RectangleCollider extends Collider {
    public readonly body: Body;

    private _chamfer?: IChamfer;

    public constructor(gameObject: GameObject) {
        super(gameObject, ComponentType.RectangleCollider);

        this.body = Bodies.rectangle(0, 0, 1, 1, this._bodyOptions);
    }

    public get chamfer(): IChamfer | undefined {
        return this._chamfer;
    }
    public set chamfer(val: IChamfer | undefined) {
        this._chamfer = val;
        this.updateShape();
    }

    private updateShape(): void {
        this.disconnect();
        (<Mutable<RectangleCollider>>this).body = Bodies.rectangle(this.body.position.x, this.body.position.y, 1, 1, { ...this._bodyOptions, chamfer: this._chamfer });
        this._currentScale.set(1);
        this._positionNeedUpdate = this._rotationNeedUpdate = this._scaleNeedUpdate = true;
        this.connect();
    }
}