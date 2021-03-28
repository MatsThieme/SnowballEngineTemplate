import { Behaviour, Debug, GameTime, Input, Vector2 } from 'SE';

export class ExampleBehaviour extends Behaviour {
    /**
     * 
     * Declare variables here
     * 
     */
    example1 = 123;
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
    async start() {
        Debug.log(this.example2);
    }

    /**
     * 
     * Called once every frame.
     * 
     */
    async update() {
        // rotate the gameObject holding the texture component
        this.gameObject.transform.rotation.degree += 36 * GameTime.deltaTime / 1000;

        // move the object if there is user input
        this.gameObject.transform.position.add(new Vector2(Input.getAxis('MoveHorizontal').values[0] * GameTime.deltaTimeSeconds * 10, Input.getAxis('MoveVertical').values[0] * GameTime.deltaTimeSeconds * 10));
    }
}