import { Behaviour, Collision, GameTime, Input, Vector2 } from '../SnowballEngine/SE';

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
     * Called on scene start, if scene is running it's called immediately after awake.
     * 
     */
    public async start(): Promise<void> {

    }

    /**
     * 
     * Called once every frame.
     * 
     */
    public async update(): Promise<void> {
        // rotate the gameObject holding the texture component
        this.gameObject.transform.rotation.degree += 36 * GameTime.deltaTime / 1000;

        // move the camera if there is user input
        this.gameObject.scene.cameraManager.cameras[0].gameObject.transform.position.add(new Vector2(Input.getAxis(InputType.MoveHorizontal).values[0] * GameTime.deltaTimeSeconds * 10, Input.getAxis(InputType.MoveVertical).values[0] * GameTime.deltaTimeSeconds * 10));
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