import { Scene } from 'SnowballEngine/Scene';
import { EventHandler } from 'Utility/Events/EventHandler';
import { BehaviourEventTypes } from 'Utility/Events/EventTypes';
import { ComponentType } from '../ComponentType';
import { GameObject } from '../GameObject';
import { Component } from './Component';

/** @category Component */
export class Behaviour extends Component<BehaviourEventTypes> {
    protected readonly scene: Scene;
    public readonly __initialized__: boolean;

    public constructor(gameObject: GameObject) {
        super(gameObject, ComponentType.Behaviour);
        this.scene = this.gameObject.scene;
        this.__initialized__ = false;

        if (this.awake) this.addListener('awake', new EventHandler(this.awake.bind(this)));
        if (this.start) this.addListener('start', new EventHandler(this.start.bind(this)));
        if (this.onColliding) this.addListener('collide', new EventHandler(this.onColliding.bind(this)));
        if (this.onTrigger) this.addListener('trigger', new EventHandler(this.onTrigger.bind(this)));
    }

    /**
     *
     * Called after the behavior has been added to the game object.
     *
     */
    protected awake?(): Promise<void> | void;

    /**
    * 
    * Called on scene start, if scene is running it's called by the constructor.
    * 
    */
    protected start?(): Promise<void> | void;

    /**
    *
    * Called once every frame. May return a Promise.
    *
    */
    protected update?(): Promise<void> | void;

    /**
    * 
    * Called whenever a collider on this.gameObject collides.
    * 
    */
    protected onColliding?(collision: any): void;

    /**
     * 
     * Called if an other gameObjects collider intersects this.gameObject.collider.
     * 
     */
    protected onTrigger?(collision: any): void;
}