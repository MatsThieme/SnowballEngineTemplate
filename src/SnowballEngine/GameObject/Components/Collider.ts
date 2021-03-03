import { AABB } from '../../Physics/AABB';
import { Collision } from '../../Physics/Collision';
import { PhysicsMaterial } from '../../Physics/PhysicsMaterial';
import { Vector2 } from '../../Utilities/Vector2';
import { AlignH, AlignV } from '../Align';
import { ComponentType } from '../ComponentType';
import { GameObject } from '../GameObject';
import { Behaviour } from './Behaviour';
import { Component } from './Component';

export abstract class Collider extends Component {
    private static _nextID: number = 0;
    public readonly id: number;

    public position: Vector2;

    public alignH: AlignH;
    public alignV: AlignV;

    public material: PhysicsMaterial;
    private _autoMass: number;
    public density: number;
    public isTrigger: boolean;

    protected abstract _area: number;
    protected abstract _aabb: AABB;

    public constructor(gameObject: GameObject, type: ComponentType = ComponentType.Collider, relativePosition: Vector2 = new Vector2(), material: PhysicsMaterial = new PhysicsMaterial(), density: number = 1, alignH: AlignH = AlignH.Center, alignV: AlignV = AlignV.Center, isTrigger: boolean = false) {
        super(gameObject, type);
        this.position = relativePosition;
        this.alignH = alignH;
        this.alignV = alignV;
        this.material = material;
        this._autoMass = 0;
        this.density = density;
        this.isTrigger = isTrigger;
        this.id = Collider._nextID++;
    }

    public getAbsolutePosition(): Vector2 {
        return Vector2.add(this.position, this.gameObject.transform.toGlobal().position, this.align);
    }

    /**
     * 
     * Calculate mass of this collider.
     * 
     */
    public get autoMass(): number {
        if (this._autoMass === 0) this._autoMass = this.area * this.density;
        return this._autoMass;
    }

    /**
     * 
     * Returns the area of this shape.
     * 
     */
    public get area(): number {
        return this._area;
    }

    public get AABB(): AABB {
        return this._aabb;
    }

    public get align(): Vector2 {
        const size = this.type === ComponentType.CircleCollider ? new Vector2((<any>this).scaledRadius * 2, (<any>this).scaledRadius * 2) : this.type === ComponentType.PolygonCollider ? (<any>this).scaledSize : new Vector2();
        const align = new Vector2(this.alignH === AlignH.Left ? size.x / 2 : this.alignH === AlignH.Right ? -size.x / 2 : 0, this.alignV === AlignV.Top ? -size.y / 2 : this.alignV === AlignV.Bottom ? size.y / 2 : 0);
        return align;
    }

    public abstract update(): Promise<void>;

    /**
     * 
     * Execute the onTrigger function in all behaiours on this.gameObject.
     * 
     */
    public onTrigger(collision: Collision): void {
        this.gameObject.getComponents<Behaviour>(ComponentType.Behaviour).forEach(b => b.onTrigger ? b.onTrigger(collision) : 0);
    }

    /**
     *
     * Execute the onCollision function in all behaiours on this.gameObject.
     *
     */
    public onCollision(collision: Collision): void {
        this.gameObject.getComponents<Behaviour>(ComponentType.Behaviour).forEach(b => b.onColliding ? b.onColliding(collision) : 0);
    }
}