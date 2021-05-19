import { ComponentType } from 'GameObject/ComponentType';
import { GameObject } from 'GameObject/GameObject';
import { Body, Composite, Engine, Events, IChamferableBodyDefinition, IEventCollision } from 'matter-js';
import { EventHandler } from 'Utility/Events/EventHandler';
import { ColliderEventTypes, GameObjectEventTypes, TransformEventTypes } from 'Utility/Events/EventTypes';
import { Vector2 } from 'Utility/Vector2';
import { Behaviour } from './Behaviour';
import { Component } from './Component';
import { RigidBody } from './RigidBody';
import { Transform } from './Transform/Transform';

export abstract class Collider extends Component<ColliderEventTypes> {
    public abstract readonly body: Body;

    protected _currentScale: Vector2;

    protected readonly _onCollisionStart: (event: IEventCollision<Engine>) => void;
    protected readonly _onCollisionActive: (event: IEventCollision<Engine>) => void;
    protected readonly _onCollisionEnd: (event: IEventCollision<Engine>) => void;

    protected readonly _onTransformChange: EventHandler<TransformEventTypes['modified']>;
    protected readonly _onTransformParentChange: EventHandler<TransformEventTypes['parentmodified']>;
    protected readonly _onGameObjectParentChange: EventHandler<GameObjectEventTypes['parentchanged']>;

    protected _rigidBody?: RigidBody;

    private static _colliders: Collider[] = [];

    protected _positionNeedUpdate: boolean;
    protected _rotationNeedUpdate: boolean;
    protected _scaleNeedUpdate: boolean;


    protected _bodyOptions: IChamferableBodyDefinition;

    protected _isConnected: boolean;

    public constructor(gameObject: GameObject, type: ComponentType.CircleCollider | ComponentType.PolygonCollider | ComponentType.TileMap | ComponentType.TerrainCollider | ComponentType.RectangleCollider) {
        super(gameObject, type);

        Collider._colliders.push(this);

        this._bodyOptions = { slop: 0.05 * this.gameObject.scene.physics.worldScale };

        this._currentScale = new Vector2(1, 1);
        this._positionNeedUpdate = true;
        this._rotationNeedUpdate = true;
        this._scaleNeedUpdate = true;
        this._isConnected = false;

        this._onCollisionStart = this.onCollisionStart.bind(this);
        this._onCollisionActive = this.onCollisionActive.bind(this);
        this._onCollisionEnd = this.onCollisionEnd.bind(this);

        this._onTransformChange = new EventHandler((t, p, r, s) => {
            if (p) this._positionNeedUpdate = true;
            if (r) this._rotationNeedUpdate = true;
            if (s) this._scaleNeedUpdate = true;
            this.applyTransformToBody();
        }, this);

        this._onTransformParentChange = new EventHandler((t, p, r, s) => {
            if (this._rigidBody) {
                if (t.gameObject.id === this._rigidBody.gameObject.id) return;

                while (t.parent) {
                    if (t.parent.gameObject.id === this._rigidBody.gameObject.id) return;
                    t = t.parent;
                }
            }

            if (p) this._positionNeedUpdate = true;
            if (r) this._rotationNeedUpdate = true;
            if (s) this._scaleNeedUpdate = true;
            this.applyTransformToBody();
        }, this);

        this._onGameObjectParentChange = new EventHandler(() => this.findRigidBody(), this);
    }

    /**
     * 
     * Only available if not part of a rigidbody.
     * 
     */
    public get isTrigger(): boolean {
        return this.body.isSensor;
    }
    public set isTrigger(val: boolean) {
        if (!this._rigidBody) this.body.isSensor = val;
    }

    public get friction(): number {
        return this.body.friction;
    }
    public set friction(val: number) {
        this.body.friction = val;
    }

    public get restitution(): number {
        return this.body.restitution;
    }
    public set restitution(val: number) {
        this.body.restitution = val;
    }

    public get density(): number {
        return this.body.density;
    }
    public set density(val: number) {
        Body.setDensity(this.body, val);
    }

    public get inertia(): number {
        return this.body.inertia;
    }
    public set inertia(val: number) {
        Body.setInertia(this.body, val);
    }

    public get mass(): number {
        return this.body.mass;
    }
    public set mass(val: number) {
        Body.setMass(this.body, val);
    }

    protected override start(): void {
        this.addListeners();

        this.findRigidBody();
    }

    protected override onEnable(): void {
        this.body.isSleeping = false;
    }

    protected override onDisable(): void {
        this.body.isSleeping = true;
    }

    protected addListeners(): void {
        Events.on(this.body, 'collisionStart', this._onCollisionStart);
        Events.on(this.body, 'collisionActive', this._onCollisionActive);
        Events.on(this.body, 'collisionEnd', this._onCollisionEnd);

        this.gameObject.transform.addListener('modified', this._onTransformChange);
        this.gameObject.transform.addListener('parentmodified', this._onTransformParentChange);
        this.gameObject.addListener('parentchanged', this._onGameObjectParentChange);
    }

    protected removeListeners(): void {
        Events.off(this.body, 'collisionStart', this._onCollisionStart);
        Events.off(this.body, 'collisionActive', this._onCollisionActive);
        Events.off(this.body, 'collisionEnd', this._onCollisionEnd);

        this.gameObject.transform.removeListener('modified', this._onTransformChange);
        this.gameObject.transform.removeListener('parentmodified', this._onTransformParentChange);
        this.gameObject.removeListener('parentchanged', this._onGameObjectParentChange);
    }

    private isPartOfCollision(event: IEventCollision<Engine>): boolean {
        return event.pairs.some(pair => {
            return pair.bodyA.id === this.body.id || pair.bodyB.id === this.body.id;
        });
    }

    private onCollisionStart(event: IEventCollision<Engine>): void {
        if (!this.isPartOfCollision(event)) return;

        let isSensor = event.pairs.some(pair => pair.bodyA.isSensor || pair.bodyB.isSensor);
        let isCollider = event.pairs.some(pair => !pair.bodyA.isSensor || !pair.bodyB.isSensor);

        for (const behaviour of this.gameObject.getComponents<Behaviour>(ComponentType.Behaviour)) {
            if (isSensor) behaviour.dispatchEvent('triggerenter', event);
            else if (isCollider) behaviour.dispatchEvent('collisionenter', event);
        }
    }

    private onCollisionActive(event: IEventCollision<Engine>): void {
        if (!this.isPartOfCollision(event)) return;

        let isSensor = event.pairs.some(pair => pair.bodyA.isSensor || pair.bodyB.isSensor);
        let isCollider = event.pairs.some(pair => !pair.bodyA.isSensor || !pair.bodyB.isSensor);

        for (const behaviour of this.gameObject.getComponents<Behaviour>(ComponentType.Behaviour)) {
            if (isSensor) behaviour.dispatchEvent('triggeractive', event);
            else if (isCollider) behaviour.dispatchEvent('collisionactive', event);
        }
    }

    private onCollisionEnd(event: IEventCollision<Engine>): void {
        if (!this.isPartOfCollision(event)) return;

        let isSensor = event.pairs.some(pair => pair.bodyA.isSensor || pair.bodyB.isSensor);
        let isCollider = event.pairs.some(pair => !pair.bodyA.isSensor || !pair.bodyB.isSensor);

        for (const behaviour of this.gameObject.getComponents<Behaviour>(ComponentType.Behaviour)) {
            if (isSensor) behaviour.dispatchEvent('triggerexit', event);
            else if (isCollider) behaviour.dispatchEvent('collisionexit', event);
        }
    }

    public applyTransformToBody(): void {
        if (this._rigidBody) {
            const globalTransform = Transform.toGlobal(this.gameObject.transform);
            const globalRB = Transform.toGlobal(this._rigidBody.gameObject.transform);


            const rbOnSameGO = this.gameObject.id === this._rigidBody.gameObject.id;


            const positionNeedUpdate = !rbOnSameGO && this._positionNeedUpdate;
            const rotationNeedUpdate = !rbOnSameGO && this._rotationNeedUpdate;
            const scaleNeedUpdate = this._scaleNeedUpdate;


            if (positionNeedUpdate || rotationNeedUpdate || scaleNeedUpdate) {
                this.disconnect();


                if (positionNeedUpdate) Body.setPosition(this.body, globalTransform.position);

                if (rotationNeedUpdate) Body.setAngle(this.body, -(globalTransform.rotation.radian - globalRB.rotation.radian));

                if (scaleNeedUpdate) {
                    this.transformBody(() => {
                        Body.scale(this.body, globalTransform.scale.x / this._currentScale.x, globalTransform.scale.y / this._currentScale.y);
                        this._currentScale.copy(globalTransform.scale);
                    });
                }


                this.connect();
            }
        } else {
            const globalTransform = Transform.toGlobal(this.gameObject.transform);

            if (this._positionNeedUpdate || this._rotationNeedUpdate || this._scaleNeedUpdate) {
                this.disconnect();


                if (this._positionNeedUpdate) Body.setPosition(this.body, globalTransform.position);

                if (this._rotationNeedUpdate) Body.setAngle(this.body, -globalTransform.rotation.radian);

                if (this._scaleNeedUpdate) {
                    this.transformBody(() => {
                        Body.scale(this.body, globalTransform.scale.x / this._currentScale.x, globalTransform.scale.y / this._currentScale.y);
                        this._currentScale.copy(globalTransform.scale);
                    });
                }


                this.connect();
            }
        }

        this._positionNeedUpdate = this._rotationNeedUpdate = this._scaleNeedUpdate = false;
    }

    private transformBody(f: () => any): void {
        const connected = this._isConnected;

        if (connected) this.disconnect();

        const angle = this.body.angle;
        Body.setAngle(this.body, 0);

        f();

        Body.setAngle(this.body, angle);

        if (connected) this.connect();
    }

    public connect(): void {
        if (this._isConnected) this.disconnect();

        if (this._rigidBody) {
            this._rigidBody.addCollider(this);
        } else {
            Body.setStatic(this.body, true);
            Composite.add(this.gameObject.scene.physics.engine.world, this.body);
        }

        this._isConnected = true;
    }

    public disconnect(): void {
        if (!this._rigidBody) {
            Composite.remove(this.gameObject.scene.physics.engine.world, this.body);
            Body.setStatic(this.body, false);
        } else {
            this._rigidBody.removeCollider(this);
        }

        this._isConnected = false;
    }

    /**
     * 
     * Look for new RigidBody component, reconnect if necessary.
     * 
     */
    private findRigidBody(): boolean {
        const rbID = this._rigidBody?.componentId || -1;

        const rb = this.gameObject.getComponent<RigidBody>(ComponentType.RigidBody) || GameObject.componentInParents<RigidBody>(this.gameObject, ComponentType.RigidBody);

        if (rbID !== rb?.componentId) {
            this.disconnect();
            this._rigidBody = rb;
            this.connect();
            this._positionNeedUpdate = this._rotationNeedUpdate = this._scaleNeedUpdate = true;
        } else this._rigidBody = rb;


        if (this._rigidBody) {
            const handlerComponentRemove = new EventHandler<GameObjectEventTypes['componentremove']>(c => {
                if (c.type === ComponentType.RigidBody) {
                    c.gameObject.removeListener('componentremove', handlerComponentRemove);
                    this.findRigidBody();
                }
            });

            this._rigidBody.gameObject.addListener('componentremove', handlerComponentRemove);
        }

        return !!this._rigidBody;
    }

    public override destroy(): void {
        this.removeListeners();

        this.disconnect();

        super.destroy();
    }

    public static updateBody(): void {
        const cs: Collider[] = [];

        for (const c of Collider._colliders) {
            if (!c._rigidBody && (c._positionNeedUpdate || c._rotationNeedUpdate || c._scaleNeedUpdate)) c.applyTransformToBody();
            else if (c._rigidBody && !GameObject.componentInParents(c.gameObject, ComponentType.Collider)) cs.push(c);
        }

        xyz(cs);

        function xyz(cs: Collider[]): void {
            for (const c of cs) {
                if (c._positionNeedUpdate || c._rotationNeedUpdate || c._scaleNeedUpdate) c.applyTransformToBody();
                xyz(c.gameObject.getComponentsInChildren<Collider>(ComponentType.Collider));
            }
        }
    }
}