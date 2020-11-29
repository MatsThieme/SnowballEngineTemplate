import { GameTime } from '../../GameTime';
import { Input } from '../../Input/Input';
import { Collision } from '../../Physics/Collision';
import { Scene } from '../../Scene';
import { GameObject } from '../GameObject';
import { Component } from './Component';
import { ComponentType } from './ComponentType';

export abstract class Behaviour extends Component {
    protected readonly scene: Scene;
    public readonly __initialized__: boolean;
    public constructor(gameObject: GameObject) {
        super(gameObject, ComponentType.Behaviour);
        this.scene = this.gameObject.scene;
        this.__initialized__ = false;
    }

    /**
     * 
     * Called after the behavior has been added to the game object.
     * 
     */
    public async awake(): Promise<void> { }

    /**
     * 
     * Called on scene start, if scene is running it's called by the constructor.
     * 
     */
    public async start(): Promise<void> { }

    /**
     * 
     * Called once every frame.
     * 
     */
    public async update(): Promise<void> { }

    /**
     * 
     * Called whenever a collider on this.gameObject collides.
     * 
     */
    public onColliding(collision: Collision): void { }

    /**
     * 
     * Called if an other gameObjects collider intersects this.gameObject.collider.
     * 
     */
    public onTrigger(collision: Collision): void { }
}