import { Collision } from '../../Physics/Collision';
import { Scene } from '../../Scene';
import { ComponentType } from '../ComponentType';
import { GameObject } from '../GameObject';
import { Component } from './Component';

/**@category Component */
export class Behaviour extends Component {
    protected readonly scene: Scene;
    public readonly __initialized__: boolean;

    public constructor(gameObject: GameObject) {
        super(gameObject, ComponentType.Behaviour);
        this.scene = this.gameObject.scene;
        this.__initialized__ = false;
    }
}

export interface Behaviour {
    /**
    *
    * Called after the behavior has been added to the game object.
    *
    */
    awake?(): Promise<void> | void;

    /**
    * 
    * Called on scene start, if scene is running it's called by the constructor.
    * 
    */
    start?(): Promise<void> | void;

    /**
    *
    * Called once every frame. May return a Promise.
    *
    */
    update?(): Promise<void> | void;

    /**
    * 
    * Called whenever a collider on this.gameObject collides.
    * 
    */
    onColliding?(collision: Collision): void;

    /**
     * 
     * Called if an other gameObjects collider intersects this.gameObject.collider.
     * 
     */
    onTrigger?(collision: Collision): void;

}