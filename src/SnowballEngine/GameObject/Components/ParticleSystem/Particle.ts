import { Container, Sprite } from 'pixi.js';
import { GameTime } from '../../../GameTime';
import { clearObject } from '../../../Helpers';
import { SpriteAnimation } from '../../../SpriteAnimation';
import { Vector2 } from '../../../Vector2';
import { ParticleSystem } from './ParticleSystem';

export class Particle {
    private _sprite: Sprite;
    private readonly _container: Container;
    private readonly _particleSettings: ParticleSettings;

    public readonly spriteAnimation?: SpriteAnimation;
    public readonly particleSystem: ParticleSystem;

    public readonly startTime: number;
    public readonly endTime: number;

    public velocity: Vector2;

    public constructor(particleSystem: ParticleSystem, vel: Vector2) {
        this._particleSettings = Object.assign({}, particleSystem.particleSettings);

        if (this._particleSettings.fadeIn + this._particleSettings.fadeOut > this._particleSettings.lifeTime) {
            this._particleSettings.fadeIn *= this._particleSettings.lifeTime / (this._particleSettings.fadeIn + this._particleSettings.fadeOut);
            this._particleSettings.fadeOut = this._particleSettings.lifeTime - this._particleSettings.fadeIn;
        }


        this.velocity = vel.clone.scale(particleSystem.particleSettings.velocity);

        this.startTime = GameTime.time;
        this.endTime = this.startTime + this._particleSettings.lifeTime;

        this.particleSystem = particleSystem;


        const sprite = this.assetToSprite();

        if ('update' in sprite) {
            this.spriteAnimation = sprite;
            this._sprite = this.spriteAnimation.sprite;
            this._container = this.spriteAnimation.container;
        } else {
            this._container = new Container();
            this._container.addChild(sprite);
            this._sprite = sprite;
            this._sprite.anchor.set(0.5, 0.5);
        }

        this._sprite.width = this._particleSettings.startSize.x;
        this._sprite.height = this._particleSettings.startSize.y;
    }

    public get sprite(): Sprite {
        return this._sprite;
    }

    public get container(): Container {
        return this._container;
    }

    private assetToSprite(): Sprite | SpriteAnimation {
        if (!this.particleSystem.asset) throw new Error('no asset');

        if ('assets' in this.particleSystem.asset) {
            return new SpriteAnimation(this.particleSystem.asset.assets, this.particleSystem.asset.swapTime);
        } else {
            return this.particleSystem.asset.getPIXISprite()!;
        }
    }

    /**
     * 
     * Updates sprite animations and moves this.
     * 
     */
    public update() {
        if (this.spriteAnimation) {
            this.spriteAnimation.update();
            this._sprite = this.spriteAnimation.sprite;
        }

        if (this._particleSettings.endSize) {
            const size = this.size;

            this._sprite.width = size.x;
            this._sprite.height = size.y;
        } else if (this.spriteAnimation) {
            this._sprite.width = this._particleSettings.startSize.x;
            this._sprite.height = this._particleSettings.startSize.y;
        }


        this._container.x += this.velocity.x * GameTime.deltaTimeSeconds;
        this._container.y += this.velocity.y * GameTime.deltaTimeSeconds;


        this._container.angle += this._particleSettings.rotation.degree * GameTime.deltaTimeSeconds;


        this._sprite.alpha = this.alpha;
    }

    /**
     *
     * Returns the current alpha value of this Particle.
     * 
     */
    public get alpha(): number {
        if (GameTime.time < this.startTime + this._particleSettings.fadeIn) {
            return (GameTime.time - this.startTime) / this._particleSettings.fadeIn;
        } else if (GameTime.time > this.endTime - this._particleSettings.fadeOut) {
            return 1 - (GameTime.time - this.endTime + this._particleSettings.fadeOut) / this._particleSettings.fadeOut;
        }

        return 1;
    }

    public get size(): Vector2 {
        return this._particleSettings.endSize ? Vector2.lerp(this._particleSettings.startSize, this._particleSettings.endSize, (GameTime.time - this.startTime) / this._particleSettings.lifeTime) : this._particleSettings.startSize;
    }

    public get position(): Vector2 {
        return new Vector2(this._sprite.x, this._sprite.y);
    }

    public destroy(): void {
        if (this.spriteAnimation) this.spriteAnimation.destroy();
        else this._sprite.destroy({ children: true, texture: true, baseTexture: false });

        this._container.destroy({ children: true, texture: true, baseTexture: false });

        clearObject(this);
    }
}