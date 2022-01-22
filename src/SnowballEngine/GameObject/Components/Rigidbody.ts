import { ComponentType } from "GameObject/ComponentType";
import { GameObject } from "GameObject/GameObject";
import { Body, Composite, Events, IBodyDefinition } from "matter-js";
import { Angle } from "Utility/Angle";
import { EventHandler } from "Utility/Events/EventHandler";
import { Vector2 } from "Utility/Vector2";
import { Collider } from "./Collider";
import { Component, ComponentEventTypes } from "./Component";
import { Transform, TransformEventTypes } from "./Transform/Transform";

export type RigidbodyEventTypes = {} & ComponentEventTypes;

export class Rigidbody extends Component<RigidbodyEventTypes> {
    public body: Body;
    private readonly _bodyOptions: IBodyDefinition;
    private static readonly _rigidBodies: Rigidbody[] = [];

    protected _bodyNeedUpdate: boolean;

    private _gravityUpdateListener: () => void;
    public ignoreGravity: boolean;
    public constructor(gameObject: GameObject) {
        super(gameObject, ComponentType.Rigidbody);

        Rigidbody._rigidBodies.push(this);

        this._bodyOptions = {};

        this.body = Body.create(this._bodyOptions);
        this.body.vertices.splice(0);

        this._bodyNeedUpdate = true;

        const listener = new EventHandler<TransformEventTypes["modified"]>((t, p, r, s) => {
            if (r || p) this._bodyNeedUpdate = true;
        }, this);

        this.gameObject.transform.addListener("modified", listener);
        this.gameObject.transform.addListener("parentmodified", listener);
        this.gameObject.addListener(
            "parentchanged",
            new EventHandler(() => {
                this._bodyNeedUpdate = true;
            }, this)
        );

        this.ignoreGravity = false;

        this._gravityUpdateListener = (() => {
            if (!this.ignoreGravity) this.applyGravity();
        }).bind(this);

        this.addListeners();
    }

    public get static(): boolean {
        return this._bodyOptions.isStatic!;
    }
    public set static(val: boolean) {
        Body.setStatic(this.body, val);
        this._bodyOptions.isStatic = val;
    }

    public get timeScale(): number {
        return this.body.timeScale;
    }
    public set timeScale(val: number) {
        this.body.timeScale = val;
        this._bodyOptions.timeScale = val;
    }

    public get angularVelocity(): number {
        return this.body.angularVelocity;
    }
    public set angularVelocity(val: number) {
        Body.setAngularVelocity(this.body, val);
    }

    public get velocity(): Readonly<Vector2> {
        return Vector2.from(this.body.velocity);
    }
    public set velocity(val: IVector2) {
        Body.setVelocity(this.body, val);
    }

    public get force(): Readonly<Vector2> {
        return Vector2.from(this.body.force);
    }
    public set force(val: IVector2) {
        this.body.force = val;
    }

    public get inertia(): number {
        return this.body.inertia;
    }
    public set inertia(val: number) {
        Body.setInertia(this.body, val);
        this._bodyOptions.inertia = val;
    }

    public get mass(): number {
        return this.body.mass;
    }
    public set mass(val: number) {
        Body.setMass(this.body, val);
        this._bodyOptions.mass = val;
    }

    public get friction(): number {
        return this.body.friction;
    }
    public set friction(val: number) {
        this.body.friction = val;
        this._bodyOptions.friction = val;
    }

    public get restitution(): number {
        return this.body.restitution;
    }
    public set restitution(val: number) {
        this.body.restitution = val;
        this._bodyOptions.restitution = val;
    }

    public get frictionAir(): number {
        return this.body.frictionAir;
    }
    public set frictionAir(val: number) {
        this.body.frictionAir = val;
        this._bodyOptions.frictionAir = val;
    }

    public get collisionFilterCategory(): number {
        return this.body?.collisionFilter.category || 0;
    }
    public set collisionFilterCategory(val: number) {
        if (this.body) this.body.collisionFilter.category = val;
        this._bodyOptions.collisionFilter = { ...this._bodyOptions.collisionFilter, category: val };
    }

    public get collisionFilterMask(): number {
        return this.body?.collisionFilter.mask || 0;
    }
    public set collisionFilterMask(val: number) {
        if (this.body) this.body.collisionFilter.mask = val;
        this._bodyOptions.collisionFilter = { ...this._bodyOptions.collisionFilter, mask: val };
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
        if (!collider.body || !collider.parts || this.hasCollider(collider)) return;

        this.disconnect();

        const parts = this.body.parts.slice(1);

        parts.push(...collider.parts);

        this.transformBody(() => (this.body = Body.create({ parts, ...this._bodyOptions })));
        this.body.slop *= this.gameObject.scene.physics.worldScale;

        this.connect();
    }

    public hasCollider(collider: Collider): boolean {
        return Boolean(collider.body) && this.body.parts.findIndex((p) => p.id === collider.body!.id) !== -1;
    }

    public removeCollider(collider: Collider): void {
        if (!collider.body || !collider.parts || this.body.parts.length === 1) return;

        const parts = this.body.parts.slice(1);

        let i = -1;

        for (const part of collider.parts) {
            i = parts.findIndex((p) => p.id === part.id);

            if (i === -1) return;
        }

        this.disconnect();

        parts.splice(i - collider.parts.length + 1, collider.parts.length);

        this.transformBody(() => (this.body = Body.create({ parts, ...this._bodyOptions })));
        this.body.slop *= this.gameObject.scene.physics.worldScale;

        if (this.body.parts.length > 1) this.connect();
    }

    private transformBody(f: () => void): void {
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

    private applyGravity(): void {
        this.applyForce({
            x: this.body.mass * this.gameObject.scene.physics.gravity.x,
            y: this.body.mass * this.gameObject.scene.physics.gravity.y,
        });
    }

    private addListeners(): void {
        Events.on(this.gameObject.scene.physics.engine, "beforeUpdate", this._gravityUpdateListener);
    }

    private removeListeners(): void {
        Events.off(this.gameObject.scene.physics.engine, "beforeUpdate", this._gravityUpdateListener);
    }

    public override prepareDestroy(): void {
        this.disconnect();
        this.removeListeners();

        super.prepareDestroy();
    }

    public override destroy(): void {
        Rigidbody._rigidBodies.splice(
            Rigidbody._rigidBodies.findIndex((rb) => rb.componentID === this.componentID),
            1
        );

        super.destroy();
    }

    private updateTransform(): void {
        if (this.gameObject.parent) {
            const transform: Transformable = Transform.createTransformable(
                Vector2.from(this.body.position),
                new Vector2(1, 1),
                new Angle(-this.body.angle)
            );

            const localTransform = Transform.toLocal(transform, this.gameObject.parent.transform);

            this.gameObject.transform.internalSet(localTransform.position, localTransform.rotation);
        } else {
            this.gameObject.transform.internalSet(this.body.position, new Angle(-this.body.angle));
        }
    }

    public updateBody(): void {
        const globalTransform = Transform.toGlobal(this.gameObject.transform);

        if (!new Angle(this.body.angle).equal(new Angle(-globalTransform.rotation.radian)))
            Body.setAngle(this.body, -globalTransform.rotation.radian);

        if (!globalTransform.position.equal(this.body.position))
            Body.setPosition(this.body, globalTransform.position);

        this._bodyNeedUpdate = false;
    }

    public static updateTransform(): void {
        for (const rb of Rigidbody._rigidBodies) {
            if (!rb.static && rb.__destroyInFrames__ === undefined) rb.updateTransform();
        }
    }

    public static updateBody(): void {
        for (const rb of Rigidbody._rigidBodies) {
            if (rb._bodyNeedUpdate && rb.__destroyInFrames__ === undefined) rb.updateBody();
        }
    }
}
