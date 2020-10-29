import { Angle } from './Angle.js';
import { Asset } from './Assets/Asset.js';
import { Frame } from './Camera/Frame.js';
import { D } from './Debug.js';
import { ParticleSystem } from './GameObject/Components/ParticleSystem.js';
import { Drawable } from './GameObject/Drawable.js';
import { GameTime } from './GameTime.js';
import { Sprite } from './Sprite.js';
import { SpriteAnimation } from './SpriteAnimation.js';
import { Vector2 } from './Vector2.js';

export class Particle implements Drawable {
    public relativePosition: Vector2;
    public rotation: Angle;
    public velocity: Vector2;
    public sprite: Asset | SpriteAnimation;
    public readonly startTime: number;
    public readonly particleSystem: ParticleSystem;
    public constructor(particleSystem: ParticleSystem, sprite: Asset | SpriteAnimation, velocity: Vector2 = new Vector2()) {
        this.relativePosition = new Vector2();
        this.velocity = velocity;
        this.sprite = sprite;
        this.startTime = performance.now();
        this.particleSystem = particleSystem;
        this.rotation = new Angle(undefined, Math.random() * 360);

        if (!this.sprite) D.error(JSON.stringify(this) + '\nsprite missing');
    }

    /**
     *
     * Returns the size of the 
     * 
     */
    public get size(): Vector2 {
        return this.particleSystem.size;
    }
    public get scaledSize(): Vector2 {
        return this.particleSystem.scaledSize;
    }

    /**
     *
     * Returns the current frame of this.
     * 
     */
    public get currentFrame(): Frame {
        if (!this.sprite) {
            console.log(this);
            debugger;
        }
        return new Frame(this.position, this.scaledSize, new Sprite(this.sprite && 'sprites' in this.sprite ? this.sprite.currentFrame : <CanvasImageSource>this.sprite.data), new Angle(this.particleSystem.gameObject.transform.rotation.radian + this.rotation.radian), this.particleSystem.gameObject.drawPriority, this.alpha);
    }

    /**
     * 
     * Returns the absolute position of this.
     * 
     */
    public get position(): Vector2 {
        return this.particleSystem.position.clone.add(this.relativePosition);
    }

    /**
     * 
     * Updates sprite animations and moves this.
     * 
     */
    public update(gameTime: GameTime) {
        this.rotation.degree += 360 / 1000 * gameTime.deltaTime * this.particleSystem.rotationSpeed;
        this.relativePosition.add(this.velocity.clone.scale(gameTime.deltaTime));
        if ('sprites' in this.sprite) this.sprite.update(gameTime);
    }

    /**
     *
     * Returns the current alpha value of this Particle.
     * 
     */
    public get alpha(): number {
        if (performance.now() < this.startTime + this.particleSystem.fadeInDuration && this.particleSystem.fadeInDuration > 0) {
            return (performance.now() - this.startTime) / this.particleSystem.fadeInDuration;
        } else if (performance.now() > this.startTime + this.particleSystem.lifeTime - this.particleSystem.fadeOutDuration && this.particleSystem.fadeOutDuration > 0) {
            return 1 - (performance.now() - this.startTime - this.particleSystem.lifeTime + this.particleSystem.fadeOutDuration) / this.particleSystem.fadeOutDuration;
        }

        return 1;
    }
}