import { Behaviour, Debug, GameTime, Input, Vector2 } from 'SE';

export class ExampleBehaviour extends Behaviour {
    /**
     * 
     * Declare variables here
     * 
     */
    example1 = 123;
    example2!: string;

    /**
     * 
     * Called after the behavior has been added to the GameObject.
     * 
     */
    awake() {
        this.example2 = 'start';

        Debug.log('awake');
    }

    /**
     * 
     * Called on scene start, if scene is running it's called immediately after awake.
     * Other GameObjects and components may be accessed.
     * 
     */
    start() {
        Debug.log(this.example2);
    }

    /**
     * 
     * Called once every frame.
     * 
     */
    update() {
        this.example1 += 1;


        this.gameObject.transform.rotation.degree += 36 * GameTime.deltaTime / 1000;

        // move the object if there is user input
        const horizontal = Input.getAxis('MoveHorizontal');
        const vertical = Input.getAxis('MoveVertical');
        if (horizontal.active || vertical.active) this.gameObject.transform.position.add(new Vector2(horizontal.values[0] * GameTime.deltaTimeSeconds * 5, vertical.values[0] * GameTime.deltaTimeSeconds * 5));
    }

    /**
     * 
     * Called whenever a collider on this.gameObject enters a collision.
     * 
     */
    onCollisionEnter(e: any) {
        console.log(e);
    }

    /**
     * 
     * Called whenever a collider on this.gameObject exits a collision.
     * 
     */
    onCollisionExit() {
        console.log('collision enter');
    }
}