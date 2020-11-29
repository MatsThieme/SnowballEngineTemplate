import { Sprite } from 'pixi.js';

/**
 * 
 * Holds PIXI.Sprite and manages the stage connection, size and position.
 * 
 */
export class SpriteNew {
    private connected: boolean;
    private sprite?: Sprite;
    public constructor() {
        this.connected = false;
        this.sprite = new Sprite();
    }
    private connect(): void {



        this.connected = true;
    }
    private disconnect(): void {



        this.connected = false;
    }
    // get x, width...
    // destroy();
}