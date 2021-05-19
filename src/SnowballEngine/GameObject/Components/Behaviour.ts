import { Engine, IEventCollision } from 'matter-js';
import { Scene } from 'SnowballEngine/Scene';
import { EventHandler } from 'Utility/Events/EventHandler';
import { BehaviourEventTypes } from 'Utility/Events/EventTypes';
import { ComponentType } from '../ComponentType';
import { GameObject } from '../GameObject';
import { Component } from './Component';

/** @category Component */
export class Behaviour extends Component<BehaviourEventTypes> {
    private static readonly _behaviours: Behaviour[] = [];

    protected readonly scene: Scene;

    public constructor(gameObject: GameObject) {
        super(gameObject, ComponentType.Behaviour);
        this.scene = this.gameObject.scene;

        if (this.onCollisionEnter) this.addListener('collisionenter', new EventHandler(this.onCollisionEnter.bind(this)));
        if (this.onCollisionActive) this.addListener('collisionactive', new EventHandler(this.onCollisionActive.bind(this)));
        if (this.onCollisionExit) this.addListener('collisionexit', new EventHandler(this.onCollisionExit.bind(this)));
        if (this.onTriggerEnter) this.addListener('triggerenter', new EventHandler(this.onTriggerEnter.bind(this)));
        if (this.onTriggerActive) this.addListener('triggeractive', new EventHandler(this.onTriggerActive.bind(this)));
        if (this.onTriggerExit) this.addListener('triggerexit', new EventHandler(this.onTriggerExit.bind(this)));


        Behaviour._behaviours.push(this);

        this.addListener('destroy', new EventHandler(() => {
            const i = Behaviour._behaviours.findIndex(b => b.componentId === this.componentId);
            if (i === -1) throw new Error('destroyed behaviour not found, componentId: ' + this.componentId);
            Behaviour._behaviours.splice(i);
        }));
    }

    /**
     *
     * Called once every frame. May return a Promise.
     *
     */
    protected override update?(): Promise<void> | void;

    /**
     * 
     * Called whenever a collider on this.gameObject enters a collision.
     * 
     */
    protected onCollisionEnter?(matterCollisionEvent: IEventCollision<Engine>): void;

    /**
     * 
     * Called after a collider entered a collision as long as the collision is active.
     * 
     */
    protected onCollisionActive?(matterCollisionEvent: IEventCollision<Engine>): void;

    /**
     * 
     * Called whenever a collider on this.gameObject exits a collision.
     * 
     */
    protected onCollisionExit?(matterCollisionEvent: IEventCollision<Engine>): void;

    /**
     * 
     * Called if an other gameObjects collider intersects this.gameObject.collider.
     * 
     */
    protected onTriggerEnter?(matterCollisionEvent: IEventCollision<Engine>): void;

    /**
     * 
     * Called if an other gameObjects collider intersects this.gameObject.collider.
     * 
     */
    protected onTriggerActive?(matterCollisionEvent: IEventCollision<Engine>): void;

    /**
     * 
     * Called if an other gameObjects collider intersects this.gameObject.collider.
     * 
     */
    protected onTriggerExit?(matterCollisionEvent: IEventCollision<Engine>): void;

    public static async earlyupdate(): Promise<void> {
        for (const behavior of Behaviour._behaviours) {
            if (behavior.gameObject.active && behavior.active) await behavior.dispatchEvent('earlyupdate');
        }
    }

    public static async update(): Promise<void> {
        for (const behavior of Behaviour._behaviours) {
            if (behavior.gameObject.active && behavior.active) await behavior.dispatchEvent('update');
        }
    }

    public static async lateupdate(): Promise<void> {
        for (const behavior of Behaviour._behaviours) {
            if (behavior.gameObject.active && behavior.active) await behavior.dispatchEvent('lateupdate');
        }
    }
}