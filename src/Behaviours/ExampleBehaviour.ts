import { Behaviour, Collision, GameTime } from '../SnowballEngine/SE.js';

export class ExampleBehaviour extends Behaviour {
    /**
     * 
     * Declare variables here
     * 
     */
    example1: number = 123;
    example2!: number;

    /**
     * 
     * Called after the behavior has been added to the game object.
     * 
     */
    async awake() {
        this.example2 = 123;
    }

    /**
     * 
     * Called on scene start, if scene is running it's called by the constructor.
     * 
     */
    public async start(): Promise<void> {

    }

    /**
     * 
     * Called once every frame.
     * 
     */
    public async update(gameTime: GameTime): Promise<void> {
        this.gameObject.transform.relativeRotation.degree += 36 * gameTime.deltaTime / 1000;
    }

    /**
     * 
     * Called whenever a collider on this.gameObject collides.
     * 
     */
    public onColliding(collision: Collision): void {

    }

    /**
     * 
     * Called if an other gameObjects collider intersects this.gameObject.collider.
     * 
     */
    public onTrigger(collision: Collision): void {

    }
}