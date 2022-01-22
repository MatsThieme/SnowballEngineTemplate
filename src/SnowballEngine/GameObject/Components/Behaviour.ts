import { Scene } from "SnowballEngine/Scene";
import { EventHandler } from "Utility/Events/EventHandler";
import { ComponentType } from "../ComponentType";
import { GameObject } from "../GameObject";
import { Component, ComponentEventTypes } from "./Component";

export type BehaviourEventTypes = {
    collisionenter: [collision: CollisionEvent];
    collisionactive: [collision: CollisionEvent];
    collisionexit: [collision: CollisionEvent];
    triggerenter: [collision: CollisionEvent];
    triggeractive: [collision: CollisionEvent];
    triggerexit: [collision: CollisionEvent];
} & ComponentEventTypes;

/** @category Component */
export class Behaviour extends Component<BehaviourEventTypes> {
    private static readonly _behaviours: Behaviour[] = [];

    protected readonly scene: Scene;

    public constructor(gameObject: GameObject) {
        super(gameObject, ComponentType.Behaviour);
        this.scene = this.gameObject.scene;

        if (this.onCollisionEnter)
            this.addListener("collisionenter", new EventHandler(this.onCollisionEnter, this));
        if (this.onCollisionActive)
            this.addListener("collisionactive", new EventHandler(this.onCollisionActive, this));
        if (this.onCollisionExit)
            this.addListener("collisionexit", new EventHandler(this.onCollisionExit, this));
        if (this.onTriggerEnter)
            this.addListener("triggerenter", new EventHandler(this.onTriggerEnter, this));
        if (this.onTriggerActive)
            this.addListener("triggeractive", new EventHandler(this.onTriggerActive, this));
        if (this.onTriggerExit) this.addListener("triggerexit", new EventHandler(this.onTriggerExit, this));

        Behaviour._behaviours.push(this);

        this.addListener(
            "destroy",
            new EventHandler(() => {
                const i = Behaviour._behaviours.findIndex((b) => b.componentID === this.componentID);
                if (i === -1)
                    throw new Error("destroyed behaviour not found, componentId: " + this.componentID);
                Behaviour._behaviours.splice(i, 1);
            })
        );
    }

    /**
     *
     * Called once every frame. May return a Promise.
     *
     */
    protected override update?(): void;

    /**
     *
     * Called whenever a collider on this.gameObject enters a collision.
     *
     */
    protected onCollisionEnter?(matterCollisionEvent: CollisionEvent): void;

    /**
     *
     * Called after a collider entered a collision as long as the collision is active.
     *
     */
    protected onCollisionActive?(matterCollisionEvent: CollisionEvent): void;

    /**
     *
     * Called whenever a collider on this.gameObject exits a collision.
     *
     */
    protected onCollisionExit?(matterCollisionEvent: CollisionEvent): void;

    /**
     *
     * Called if an other gameObjects collider intersects this.gameObject.collider.
     *
     */
    protected onTriggerEnter?(matterCollisionEvent: CollisionEvent): void;

    /**
     *
     * Called if an other gameObjects collider intersects this.gameObject.collider.
     *
     */
    protected onTriggerActive?(matterCollisionEvent: CollisionEvent): void;

    /**
     *
     * Called if an other gameObjects collider intersects this.gameObject.collider.
     *
     */
    protected onTriggerExit?(matterCollisionEvent: CollisionEvent): void;

    public static earlyupdate(): void {
        for (const behavior of Behaviour._behaviours) {
            if (behavior.gameObject.active && behavior.active && behavior.__destroyInFrames__ === undefined)
                behavior.dispatchEvent("earlyupdate");
        }
    }

    public static update(): void {
        for (const behavior of Behaviour._behaviours) {
            if (behavior.gameObject.active && behavior.active && behavior.__destroyInFrames__ === undefined)
                behavior.dispatchEvent("update");
        }
    }

    public static lateupdate(): void {
        for (const behavior of Behaviour._behaviours) {
            if (behavior.gameObject.active && behavior.active && behavior.__destroyInFrames__ === undefined)
                behavior.dispatchEvent("lateupdate");
        }
    }
}
