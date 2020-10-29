import { Asset } from './Assets/Asset.js';
import { GameTime } from './GameTime.js';

export class SpriteAnimation {
    public sprites: Asset[];
    public swapTime: number;
    private timer: number;
    public constructor(sprites: Asset[], swapTime: number) {
        this.sprites = sprites;
        this.swapTime = swapTime || 1;
        this.timer = 0;
    }

    /*
     * 
     * Returns the current frame to render.
     * 
     */
    public get currentFrame(): CanvasImageSource {
        return <CanvasImageSource>this.sprites[this.currentIndex].data;
    }

    /**
     * 
     * Adds the deltaTime to timer property.
     * 
     */
    public update(gameTime: GameTime) {
        this.timer += gameTime.deltaTime;
        this.timer %= this.sprites.length * this.swapTime;
    }

    /**
     * 
     * Reset the animation timer.
     * 
     */
    public reset() {
        this.timer = 0;
    }
    private get currentIndex(): number {
        return Math.round(this.timer / this.swapTime) % this.sprites.length;
    }
}