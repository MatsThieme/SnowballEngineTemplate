import { Behaviour } from "GameObject/Components/Behaviour";
import { ComponentType } from "GameObject/ComponentType";
import { Destroyable } from "GameObject/Destroy";
import { GameTime } from "GameTime";
import { Composite, Engine, Events, IEventCollision } from "matter-js";
import { Vector2 } from "Utility/Vector2";

export class Physics implements Destroyable {
    /**
     * Matterjs Engine instance
     */
    public readonly engine: Engine;
    public drawDebug: boolean;
    public readonly gravity: Vector2;

    private _worldScale: number;

    public timeScale = 1;

    public constructor() {
        this.drawDebug = false;
        this._worldScale = 0.001;

        this.gravity = new Vector2(0, -0.01 * this._worldScale);

        this.engine = Engine.create();
        this.engine.gravity.y = 0;
        this.engine.enableSleeping = false;
        this.engine.timing.lastDelta = 1;

        Events.on(this.engine, "collisionStart", this.collisionEventHandler);
        Events.on(this.engine, "collisionActive", this.collisionEventHandler);
        Events.on(this.engine, "collisionEnd", this.collisionEventHandler);
    }

    /**
     * Used to scale matterjs' size dependent options like gravity and body.slop
     * default = 0.001
     */
    public get worldScale(): number {
        return this._worldScale;
    }
    public set worldScale(val: number) {
        this.gravity.scale(val / this._worldScale);

        for (const body of Composite.allBodies(this.engine.world)) {
            body.slop = (body.slop / this._worldScale) * val;
        }

        this._worldScale = val;
    }

    public get positionIterations(): number {
        return this.engine.positionIterations;
    }
    public set positionIterations(val: number) {
        this.engine.positionIterations = val;
    }

    public get velocityIterations(): number {
        return this.engine.velocityIterations;
    }
    public set velocityIterations(val: number) {
        this.engine.velocityIterations = val;
    }

    public get constraintIterations(): number {
        return this.engine.constraintIterations;
    }
    public set constraintIterations(val: number) {
        this.engine.constraintIterations = val;
    }

    private collisionEventHandler(event: IEventCollision<Engine>) {
        const collisionEventName =
            event.name === "collisionStart"
                ? "collisionenter"
                : event.name === "collisionActive"
                ? "collisionactive"
                : "collisionexit";
        const triggerEventName =
            event.name === "collisionStart"
                ? "triggerenter"
                : event.name === "collisionActive"
                ? "triggeractive"
                : "triggerexit";

        for (const pair of event.pairs) {
            const behaviorsA = pair.bodyA.gameObject.getComponents<Behaviour>(ComponentType.Behaviour);
            const behaviorsB = pair.bodyB.gameObject.getComponents<Behaviour>(ComponentType.Behaviour);

            if (!behaviorsA && !behaviorsB) continue;

            let event: CollisionEvent = {
                collider: pair.bodyA.collider,
                otherCollider: pair.bodyB.collider,
                contacts: pair.activeContacts.map((c: Contact) => ({ ...c, vertex: { ...c.vertex } })),
                friction: pair.friction,
                frictionStatic: pair.frictionStatic,
                matterPairID: <string>(<unknown>pair.id),
                inverseMass: pair.inverseMass,
                restitution: pair.restitution,
                separation: pair.separation,
                slop: pair.slop
            };

            for (const behavior of behaviorsA) {
                if (event.collider.isTrigger) behavior.dispatchEvent(triggerEventName, event);
                else behavior.dispatchEvent(collisionEventName, event);
            }

            if (!behaviorsB) continue;

            event = {
                collider: pair.bodyB.collider,
                otherCollider: pair.bodyA.collider,
                contacts: event.contacts,
                friction: pair.friction,
                frictionStatic: pair.frictionStatic,
                matterPairID: pair.id.toString(),
                inverseMass: pair.inverseMass,
                restitution: pair.restitution,
                separation: pair.separation,
                slop: pair.slop
            };

            for (const behavior of behaviorsB) {
                if (event.collider.isTrigger) behavior.dispatchEvent(triggerEventName, event);
                else behavior.dispatchEvent(collisionEventName, event);
            }
        }
    }

    public update(): void {
        Engine.update(
            this.engine,
            GameTime.deltaTime * this.timeScale,
            (GameTime.deltaTime * this.timeScale) / this.engine.timing.lastDelta
        );
    }

    public destroy(): void {
        Engine.clear(this.engine);
    }
}
