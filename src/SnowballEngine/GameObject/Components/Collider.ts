import { ComponentType } from 'GameObject/ComponentType';
import { GameObject } from 'GameObject/GameObject';
import { Body, Bounds, Composite, IChamfer, IChamferableBodyDefinition } from 'matter-js';
import { Debug } from 'SnowballEngine/Debug';
import { EventHandler } from 'Utility/Events/EventHandler';
import { ColliderEventTypes, GameObjectEventTypes, TransformEventTypes } from 'Utility/Events/EventTypes';
import { Vector2 } from 'Utility/Vector2';
import { Component } from './Component';
import { Rigidbody } from './Rigidbody';
import { Transform } from './Transform/Transform';

export abstract class Collider extends Component<ColliderEventTypes> {
    public body?: Body;
    public parts?: Body[];

    protected _currentScale: Vector2;

    protected readonly _onTransformChange: EventHandler<TransformEventTypes['modified']>;
    protected readonly _onTransformParentChange: EventHandler<TransformEventTypes['parentmodified']>;
    protected readonly _onGameObjectParentComponentChange: EventHandler<any>;

    protected _rigidBody?: Rigidbody;

    private static _colliders: Collider[] = [];

    protected _positionNeedUpdate: boolean;
    protected _rotationNeedUpdate: boolean;
    protected _scaleNeedUpdate: boolean;


    protected _bodyOptions: IChamferableBodyDefinition;

    protected _isConnected: boolean;

    public constructor(gameObject: GameObject, type: ComponentType.CircleCollider | ComponentType.PolygonCollider | ComponentType.TilemapCollider | ComponentType.TerrainCollider | ComponentType.RectangleCollider) {
        super(gameObject, type);

        Collider._colliders.push(this);

        this._bodyOptions = { collisionFilter: { category: 1, mask: 1 } };

        this._currentScale = new Vector2(1, 1);
        this._positionNeedUpdate = true;
        this._rotationNeedUpdate = true;
        this._scaleNeedUpdate = true;
        this._isConnected = false;

        this._onTransformChange = new EventHandler((t, p, r, s) => {
            if (p) this._positionNeedUpdate = true;
            if (r) this._rotationNeedUpdate = true;
            if (s) this._scaleNeedUpdate = true;
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
        }, this);

        this._onGameObjectParentComponentChange = new EventHandler(() => this.findRigidBody(), this);
    }

    /**
     * 
     * Only available if not part of a rigidbody.
     * 
     */
    public get isTrigger(): boolean {
        return this.body?.isSensor! ?? this._bodyOptions.isSensor;
    }
    public set isTrigger(val: boolean) {
        if (this.body) if (!this._rigidBody) this.body.isSensor = val;
        this._bodyOptions.isSensor = val
    }

    public get friction(): number {
        return this.body?.friction! ?? this._bodyOptions.friction;
    }
    public set friction(val: number) {
        if (this.body) this.body.friction = val;
        this._bodyOptions.friction = val
    }

    public get restitution(): number {
        return this.body?.restitution! ?? this._bodyOptions.restitution;
    }
    public set restitution(val: number) {
        if (this.body) this.body.restitution = val;
        this._bodyOptions.restitution = val
    }

    public get frictionAir(): number {
        return this.body?.frictionAir! ?? this._bodyOptions.frictionAir;
    }
    public set frictionAir(val: number) {
        if (this.body) this.body.frictionAir = val;
        this._bodyOptions.frictionAir = val
    }

    public get density(): number {
        return this.body?.density! ?? this._bodyOptions.density;
    }
    public set density(val: number) {
        if (this.body) Body.setDensity(this.body, val);
        this._bodyOptions.density = val
    }

    public get inertia(): number {
        return this.body?.inertia! ?? this._bodyOptions.inertia;
    }
    public set inertia(val: number) {
        if (this.body) Body.setInertia(this.body, val);
        this._bodyOptions.inertia = val
    }

    public get mass(): number {
        return this.body?.mass! ?? this._bodyOptions.mass;
    }
    public set mass(val: number) {
        if (this.body) Body.setMass(this.body, val);
        this._bodyOptions.mass = val
    }

    public get slop(): number {
        return this.body?.slop! ?? this._bodyOptions.slop;
    }
    public set slop(val: number) {
        if (this.body) this.body.slop = val
        this._bodyOptions.slop = val;
    }

    /**
     * 
     * a change will rebuild the body
     * 
     */
    public get chamfer(): IChamfer | undefined {
        return this._bodyOptions.chamfer;
    }
    public set chamfer(val: IChamfer | undefined) {
        this._bodyOptions.chamfer = val;
        this.rebuild();
    }

    /**
     * 
     * bounds in world coordinates.
     * 
     */
    public get bounds(): Readonly<Bounds> | undefined {
        return this.body?.bounds;
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


    /**
     * 
     * create a new body with bodyoptions.
     * set slop: 0.05 * this.gameObject.scene.physics.worldScale
     * 
     */
    protected abstract buildBody(options: IChamferableBodyDefinition): Body;

    protected override awake(): void {
        this.body = this.buildBody(this._bodyOptions);

        this.addListeners();

        this.findRigidBody();

        this.connect();
    }

    protected override start(): void {
        this.findRigidBody();

        this.rebuild();
    }

    protected override onEnable(): void {
        if (this.body) this.body.isSleeping = false;
        this._bodyOptions.isSleeping = false;
    }

    protected override onDisable(): void {
        if (this.body) this.body.isSleeping = true;
        this._bodyOptions.isSleeping = true;
    }

    protected addListeners(): void {
        this.gameObject.transform.addListener('modified', this._onTransformChange);
        this.gameObject.transform.addListener('parentmodified', this._onTransformParentChange);
        this.gameObject.addListener('parentchanged', this._onGameObjectParentComponentChange);
        this.gameObject.addListener('componentadd', this._onGameObjectParentComponentChange);
    }

    protected removeListeners(): void {
        this.gameObject.transform.removeListener('modified', this._onTransformChange);
        this.gameObject.transform.removeListener('parentmodified', this._onTransformParentChange);
        this.gameObject.removeListener('parentchanged', this._onGameObjectParentComponentChange);
        this.gameObject.removeListener('componentadd', this._onGameObjectParentComponentChange);
    }

    public applyTransformToBody(): void {
        if (this._rigidBody) {
            const rbOnSameGO = this.gameObject.id === this._rigidBody.gameObject.id;

            const positionNeedUpdate = !rbOnSameGO && this._positionNeedUpdate;
            const rotationNeedUpdate = !rbOnSameGO && this._rotationNeedUpdate;
            const scaleNeedUpdate = this._scaleNeedUpdate;

            if (this.body && (positionNeedUpdate || rotationNeedUpdate || scaleNeedUpdate)) {
                const globalTransform = Transform.toGlobal(this.gameObject.transform);
                const globalRB = Transform.toGlobal(this._rigidBody.gameObject.transform);

                const connected = this._isConnected;
                if (connected) this.disconnect();

                this.toBody();

                if (positionNeedUpdate) Body.setPosition(this.body, globalTransform.position);

                if (rotationNeedUpdate) Body.setAngle(this.body, -(globalTransform.rotation.radian - globalRB.rotation.radian));

                if (scaleNeedUpdate) {
                    this.transformBody(() => {
                        Body.scale(this.body!, globalTransform.scale.x / this._currentScale.x, globalTransform.scale.y / this._currentScale.y);
                        this._currentScale.copy(globalTransform.scale);
                    });
                }

                this.toParts();

                if (connected) this.connect();
            }
        } else {
            if (this.body && (this._positionNeedUpdate || this._rotationNeedUpdate || this._scaleNeedUpdate)) {
                const globalTransform = Transform.toGlobal(this.gameObject.transform);

                const connected = this._isConnected;
                if (connected) this.disconnect();


                if (this._positionNeedUpdate) Body.setPosition(this.body, globalTransform.position);

                if (this._rotationNeedUpdate) Body.setAngle(this.body, -globalTransform.rotation.radian);

                if (this._scaleNeedUpdate) {
                    this.transformBody(() => {
                        Body.scale(this.body!, globalTransform.scale.x / this._currentScale.x, globalTransform.scale.y / this._currentScale.y);
                        this._currentScale.copy(globalTransform.scale);
                    });
                }


                if (connected) this.connect();
            }
        }

        this._positionNeedUpdate = this._rotationNeedUpdate = this._scaleNeedUpdate = false;
    }

    private transformBody(f: () => any): void {
        if (!this.body) return Debug.warn('this.body === undefined');

        const connected = this._isConnected;

        if (connected) this.disconnect();

        const angle = this.body.angle;
        Body.setAngle(this.body, 0);

        f();

        Body.setAngle(this.body, angle);

        if (connected) this.connect();
    }

    /**
     * 
     * Must be called by derived classes in buildBody
     *  
     */
    protected addPropertiesToBody(body: Body): Body {
        (<any>body).gameObject = this.gameObject;
        (<any>body).collider = this;
        return body;
    }

    public connect(): void {
        if (this._isConnected) return;

        if (this._rigidBody) {
            this._rigidBody.addCollider(this);
        } else if (this.body) {
            Body.setStatic(this.body, true);
            Composite.add(this.gameObject.scene.physics.engine.world, this.body);
        } else Debug.warn('not connected: no body');

        this._isConnected = true;
    }

    public disconnect(): void {
        if (!this._isConnected) return;

        if (this._rigidBody) {
            this._rigidBody.removeCollider(this);
        } else if (this.body) {
            Composite.remove(this.gameObject.scene.physics.engine.world, this.body);
            Body.setStatic(this.body, false);
        } else Debug.warn('not disconnected: no body');

        this._isConnected = false;
    }

    /**
     * 
     * Look for new Rigidbody component, reconnect if necessary.
     * 
     */
    private findRigidBody(): boolean {
        const rbID = this._rigidBody?.componentID || -1;

        const rb = this.gameObject.getComponent<Rigidbody>(ComponentType.Rigidbody) || GameObject.componentInParents<Rigidbody>(this.gameObject, ComponentType.Rigidbody);

        if (rb && rb.componentID !== rbID) {
            const connected = this._isConnected;
            if (connected) this.disconnect();
            this._rigidBody = rb;
            this.toParts();
            if (connected) this.connect();
            this._positionNeedUpdate = this._rotationNeedUpdate = this._scaleNeedUpdate = true;
        } else if (!rb) {
            this._rigidBody = undefined;
            this.toBody();
        }


        if (this._rigidBody) {
            const handlerComponentRemove = new EventHandler<GameObjectEventTypes['componentremove']>(c => {
                if (c.type === ComponentType.Rigidbody) {
                    c.gameObject.removeListener('componentremove', handlerComponentRemove);
                    if (this.findRigidBody) this.findRigidBody();
                }
            });

            this._rigidBody.gameObject.addListener('componentremove', handlerComponentRemove);
        }

        return !!this._rigidBody;
    }

    public static updateBody(): void {
        const cs: Collider[] = [];

        for (const c of Collider._colliders) {
            if (!c._rigidBody && (c._positionNeedUpdate || c._rotationNeedUpdate || c._scaleNeedUpdate) && c.__destroyInFrames__ === undefined) c.applyTransformToBody();
            else if (c._rigidBody && !GameObject.componentInParents(c.gameObject, ComponentType.Collider)) cs.push(c);
        }

        updateChildCollider(cs);

        function updateChildCollider(cs: Collider[]): void {
            for (const c of cs) {
                if ((c._positionNeedUpdate || c._rotationNeedUpdate || c._scaleNeedUpdate) && c.__destroyInFrames__ === undefined) c.applyTransformToBody();
                updateChildCollider(c.gameObject.getComponentsInChildren<Collider>(ComponentType.Collider));
            }
        }
    }

    public rebuild(): void {
        const connected = this._isConnected;
        if (connected) this.disconnect();

        this.body = this.buildBody(this._bodyOptions);

        if (!this._currentScale.equal(new Vector2(1, 1))) {
            this._currentScale.set(1);
            this._scaleNeedUpdate = true;
        }

        this._positionNeedUpdate = this._rotationNeedUpdate = true;


        if (this._rigidBody) {
            this.toParts();
        }

        this.applyTransformToBody();

        if (connected) this.connect();

        if (this._rigidBody) {
            this._rigidBody.updateBody();
        }
    }

    private toBody(): void {
        if (!this.body || !this.parts || this._isConnected) return;

        if (this.parts.length === 1 && this.body.id === this.parts[0].id) {
            this.body.parts = [this.body];
        } else {
            this.body.parts = [this.body, ...this.parts];

            for (const part of this.body.parts) {
                part.parent = this.body;
            }
        }

        this.parts = undefined;

        this.addPropertiesToBody(this.body);
    }

    private toParts(): void {
        if (!this.body || this._isConnected) return;

        if (this.body.parts.length === 1) {
            this.parts = [this.body];
        } else {
            this.parts = this.body.parts.slice(1);
        }

        for (const part of this.parts) {
            part.parent = part;
            this.addPropertiesToBody(part);
            part.collisionFilter = { ...this._bodyOptions.collisionFilter };
        }
    }

    public override prepareDestroy(): void {
        this.__destroyInFrames__ = 2;

        this.removeListeners();

        this.disconnect();

        super.prepareDestroy();
    }
}