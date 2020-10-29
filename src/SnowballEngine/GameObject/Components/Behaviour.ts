import { GameTime } from '../../GameTime.js';
import { Input } from '../../Input/Input.js';
import { Collision } from '../../Physics/Collision.js';
import { Scene } from '../../Scene.js';
import { GameObject } from '../GameObject.js';
import { Component } from './Component.js';
import { ComponentType } from './ComponentType.js';

export abstract class Behaviour extends Component {
    protected input: Input;
    protected readonly scene: Scene;
    public readonly __initialized__: boolean;
    public constructor(gameObject: GameObject) {
        super(gameObject, ComponentType.Behaviour);
        this.input = gameObject.scene.input;
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
    public async update(gameTime: GameTime): Promise<void> { }

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