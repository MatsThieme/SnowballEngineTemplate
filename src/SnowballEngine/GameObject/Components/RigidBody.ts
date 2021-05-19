import { ComponentType } from 'GameObject/ComponentType';
import { GameObject } from 'GameObject/GameObject';
import { Body, Composite, IBodyDefinition } from 'matter-js';
import { Angle } from 'Utility/Angle';
import { EventHandler } from 'Utility/Events/EventHandler';
import { RigidbodyEventTypes } from 'Utility/Events/EventTypes';
import { Vector2 } from 'Utility/Vector2';
import { Collider } from './Collider';
import { Component } from './Component';
import { Transform } from './Transform/Transform';

export class RigidBody extends Component<RigidbodyEventTypes> {
    public body: Body;
    private readonly _bodyOptions: IBodyDefinition;
    private static readonly _rigidBodies: RigidBody[] = [];

    protected _bodyNeedUpdate: boolean;

    public constructor(gameObject: GameObject) {
        super(gameObject, ComponentType.RigidBody);

        RigidBody._rigidBodies.push(this);

        this._bodyOptions = { slop: 0.05 * this.gameObject.scene.physics.worldScale, isStatic: false, angle: 0 };

        this.body = Body.create(this._bodyOptions);
        this.body.vertices.splice(0);

        this._bodyNeedUpdate = true;


        const listener = new EventHandler(((t, p, r, s) => { if (r || p) this._bodyNeedUpdate = true; this.updateBody(); }), this);

        this.gameObject.transform.addListener('modified', listener);
        this.gameObject.transform.addListener('parentmodified', listener);
        this.gameObject.addListener('parentchanged', new EventHandler((() => { this._bodyNeedUpdate = true; this.updateBody(); }), this));
    }

    public get static(): boolean {
        return this._bodyOptions.isStatic!;
    }
    public set static(val: boolean) {
        Body.setStatic(this.body, this._bodyOptions.isStatic = val);
    }

    public get timeScale(): number {
        return this.body.timeScale;
    }
    public set timeScale(val: number) {
        this.body.timeScale = val;
    }

    public get angularVelocity(): number {
        return this.body.angularVelocity;
    }
    public set angularVelocity(val: number) {
        Body.setAngularVelocity(this.body, val);
    }

    public get velocity(): Vector2 {
        return Vector2.from(this.body.velocity);
    }
    public set velocity(val: Vector2) {
        Body.setVelocity(this.body, val);
    }

    protected override onEnable(): void {
        this.body.isSleeping = false;
    }

    protected override onDisable(): void {
        this.body.isSleeping = true;
    }

    /**
     * 
     * @param centre Position in world coordinates.
     * @param relative specifies if centre is relative to the body or not
     * 
     */
    public setCentreOfMass(centre: Vector2, relative?: boolean) {
        Body.setCentre(this.body, centre, relative);
    }

    private connect(): void {
        Composite.add(this.gameObject.scene.physics.engine.world, this.body);
    }

    private disconnect(): void {
        Composite.remove(this.gameObject.scene.physics.engine.world, this.body);
    }

    public addCollider(collider: Collider): void {
        if (this.hasCollider(collider)) return;

        this.disconnect();


        const parts = this.body.parts.slice(1);

        parts.push(collider.body);

        this.transformBody(() => this.body = Body.create({ parts, ...this._bodyOptions }));


        this.connect();
    }

    public hasCollider(collider: Collider): boolean {
        return this.body.parts.findIndex(p => p.id === collider.body.id) !== -1;
    }

    public removeCollider(collider: Collider): void {
        if (this.body.parts.length === 1) return;

        const parts = this.body.parts.slice(1);

        const i = parts.findIndex(p => p.id === collider.body.id);

        if (i === -1) return;


        this.disconnect();


        parts.splice(i, 1);

        this.transformBody(() => this.body = Body.create({ parts, ...this._bodyOptions }));


        if (this.body.parts.length > 1) this.connect();
    }

    private transformBody(f: () => any): void {
        const angle = this.body.angle;
        Body.setAngle(this.body, 0);

        f();

        Body.setAngle(this.body, angle);
    }

    /**
     * 
     * @param force Force vector in world coordinates.
     * @param position Position in world coordinates.
     * 
     */
    public applyForce(force: IVector2, position: IVector2 = this.body.position): void {
        Body.applyForce(this.body, position, force);
    }

    public override destroy(): void {
        Composite.remove(this.gameObject.scene.physics.engine.world, this.body);

        super.destroy();
    }

    private updateTransform(): void {
        if (this.gameObject.parent) {
            const transform: Transformable = Transform.createTransformable(Vector2.from(this.body.position), new Vector2(1, 1), new Angle(-this.body.angle));

            const localTransform = Transform.toLocal(transform, this.gameObject.parent.transform);

            this.gameObject.transform.internalSet(localTransform.position, localTransform.rotation);
        } else {
            this.gameObject.transform.internalSet(this.body.position, new Angle(-this.body.angle));
        }
    }

    private updateBody(): void {
        const globalTransform = Transform.toGlobal(this.gameObject.transform);

        if (!new Angle(this.body.angle).equal(new Angle(-globalTransform.rotation.radian))) Body.setAngle(this.body, -globalTransform.rotation.radian);

        if (!globalTransform.position.equal(this.body.position)) Body.setPosition(this.body, globalTransform.position);


        this._bodyNeedUpdate = false;
    }

    public static updateTransform(): void {
        for (const rb of RigidBody._rigidBodies) {
            if (!rb.static) rb.updateTransform();
        }
    }

    public static updateBody(): void {
        for (const rb of RigidBody._rigidBodies) {
            if (rb._bodyNeedUpdate) rb.updateBody();
        }
    }
}