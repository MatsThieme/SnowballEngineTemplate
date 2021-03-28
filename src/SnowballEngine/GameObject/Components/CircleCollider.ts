import { AlignH, AlignV } from 'GameObject/Align';
import { ComponentType } from 'GameObject/ComponentType';
import { GameObject } from 'GameObject/GameObject';
import { AABB } from 'SnowballEngine/Physics/AABB';
import { PhysicsMaterial } from 'SnowballEngine/Physics/PhysicsMaterial';
import { Vector2 } from 'Utility/Vector2';
import { Collider } from './Collider';

/**@category Component */
export class CircleCollider extends Collider {
    protected _aabb: AABB;
    protected _area: number;
    private _radius: number;

    public constructor(gameObject: GameObject, relativePosition: Vector2 = new Vector2(), material: PhysicsMaterial = new PhysicsMaterial(), density = 1, radius = 1, alignH: AlignH = AlignH.Center, alignV: AlignV = AlignV.Center, isTrigger = false) {
        super(gameObject, ComponentType.CircleCollider, relativePosition, material, density, alignH, alignV, isTrigger);
        this._radius = radius;
        this._area = Math.PI * this.radius ** 2;
        this._aabb = new AABB(new Vector2(this.radius * 2, this.radius * 2), this.position);
        this.gameObject.rigidbody.updateInertia();
    }

    public get radius(): number {
        return this._radius * this.gameObject.transform.toGlobal().scale.sum / 2;
    }
    public set radius(val: number) {
        this._radius = val;
        this._area = Math.PI * this.radius ** 2;
        this._aabb = new AABB(new Vector2(this.radius * 2, this.radius * 2), this.position);
        this.gameObject.rigidbody.updateInertia();
    }

    /**
     * 
     * Update aabb.
     * 
     */
    public async update(): Promise<void> {
        if (!this.active) return;

        this._aabb = new AABB(new Vector2(this.radius * 2, this.radius * 2), this.position.add(new Vector2(-this.radius, this.radius)));
    }

    /**
     * 
     * Returns true if this intersects other.
     * 
     */
    public intersects(other: CircleCollider): boolean {
        return other.position.sub(this.position).magnitudeSquared < (this.radius + other.radius) ** 2;
    }
}