import { Container } from "@pixi/display";
import { Sprite } from "@pixi/sprite";
import { Disposable, Dispose } from "GameObject/Dispose";
import { GameTime } from "SnowballEngine/GameTime";
import { Angle } from "Utility/Angle";
import { Color } from "Utility/Color";
import { lerp } from "Utility/Helpers";
import { Range } from "Utility/Range";
import { Vector2 } from "Utility/Vector2";
import { SpriteAnimation } from "../AnimatedSprite/SpriteAnimation";
import { ParticleSystem } from "./ParticleSystem";

export class Particle implements Disposable {
    private _sprite: Sprite;
    private readonly _container: Container;
    private readonly _particleSettings: ParticleSettings;

    public readonly spriteAnimation?: SpriteAnimation;
    public readonly particleSystem: ParticleSystem;

    public readonly startTime: number;
    public readonly endTime: number;

    public readonly startSize: Vector2;
    public readonly endSize: Vector2;
    public readonly rotation: Angle;
    public readonly startSpeed: number;
    public readonly endSpeed: number;
    public readonly lifeTime: number;
    public readonly fadeIn: number;
    public readonly fadeOut: number;
    public readonly tint: Color;
    private readonly rotationDirection: number;

    private readonly _interpolateSize: boolean;
    private readonly _interpolateSpeed: boolean;
    private readonly _direction: Vector2;

    public constructor(particleSystem: ParticleSystem) {
        this._particleSettings = Object.assign({}, particleSystem.particleSettings);

        this.startSize =
            "min" in this._particleSettings.startSize && "max" in this._particleSettings.startSize
                ? Vector2.randomRange(this._particleSettings.startSize)
                : this._particleSettings.startSize;
        this.endSize =
            (this._particleSettings.endSize &&
            "min" in this._particleSettings.endSize &&
            "max" in this._particleSettings.endSize
                ? Vector2.randomRange(this._particleSettings.endSize)
                : this._particleSettings.endSize) || this.startSize;
        this.rotation =
            "min" in this._particleSettings.rotation && "max" in this._particleSettings.rotation
                ? Angle.randomRange(this._particleSettings.rotation)
                : this._particleSettings.rotation;
        this.startSpeed =
            typeof this._particleSettings.startSpeed !== "number"
                ? (this._particleSettings.startSpeed.max - this._particleSettings.startSpeed.min) *
                      Math.random() +
                  this._particleSettings.startSpeed.min
                : this._particleSettings.startSpeed;
        this.endSpeed =
            typeof this._particleSettings.endSpeed !== "number"
                ? (this._particleSettings.endSpeed.max - this._particleSettings.endSpeed.min) *
                      Math.random() +
                  this._particleSettings.endSpeed.min
                : this._particleSettings.endSpeed;
        this.lifeTime =
            typeof this._particleSettings.lifeTime !== "number"
                ? (this._particleSettings.lifeTime.max - this._particleSettings.lifeTime.min) *
                      Math.random() +
                  this._particleSettings.lifeTime.min
                : this._particleSettings.lifeTime;
        this.fadeIn =
            typeof this._particleSettings.fadeIn !== "number"
                ? (this._particleSettings.fadeIn.max - this._particleSettings.fadeIn.min) * Math.random() +
                  this._particleSettings.fadeIn.min
                : this._particleSettings.fadeIn;
        this.fadeOut =
            typeof this._particleSettings.fadeOut !== "number"
                ? (this._particleSettings.fadeOut.max - this._particleSettings.fadeOut.min) * Math.random() +
                  this._particleSettings.fadeOut.min
                : this._particleSettings.fadeOut;
        this.tint =
            "min" in this._particleSettings.tint && "max" in this._particleSettings.tint
                ? Color.randomRange(this._particleSettings.tint)
                : this._particleSettings.tint;
        this.rotationDirection =
            this._particleSettings.rotationDirection === "left"
                ? -1
                : this._particleSettings.rotationDirection === "right"
                ? 1
                : Math.random() > 0.5
                ? -1
                : 1;

        this.fadeIn /= particleSystem.timeScale;
        this.fadeOut /= particleSystem.timeScale;
        this.startSpeed *= particleSystem.timeScale;
        this.endSpeed *= particleSystem.timeScale;
        this.lifeTime /= particleSystem.timeScale;

        this._interpolateSize = !this.startSize.equal(this.endSize);
        this._interpolateSpeed = this.startSpeed !== this.endSpeed;
        this._direction = Vector2.up
            .rotateAroundBy(
                new Vector2(),
                Angle.randomRange(new Range(new Angle(), particleSystem.emissionSettings.angle))
            )
            .scale(new Vector2(1, -1));

        if (this.fadeIn + this.fadeOut > this.lifeTime) {
            this.fadeIn *= this.lifeTime / (this.fadeIn + this.fadeOut);
            this.fadeOut = this.lifeTime - this.fadeIn;
        }

        this.startTime = GameTime.gameTimeSinceStart;
        this.endTime = this.startTime + this.lifeTime;

        this.particleSystem = particleSystem;

        const sprite = this.assetToSprite();

        sprite.tint = this.tint.rgb;

        if ("update" in sprite) {
            this.spriteAnimation = sprite;
            this._sprite = this.spriteAnimation.sprite;
            this._container = this.spriteAnimation.container;

            sprite.size = this.startSize;
        } else {
            this._container = new Container();
            this._container.addChild(sprite);
            this._sprite = sprite;
            this._sprite.anchor.set(0.5, 0.5);
            this._sprite.width = this.startSize.x;
            this._sprite.height = this.startSize.y;
        }

        this._container.angle = Math.random() * 360;
        particleSystem.sprite!.addChild(this._container);
    }

    public get sprite(): Sprite {
        return this._sprite;
    }

    private assetToSprite(): Sprite | SpriteAnimation {
        if (!this.particleSystem.asset) throw new Error("no asset");

        if ("assets" in this.particleSystem.asset) {
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
    public update(): void {
        if (this.spriteAnimation) {
            this.spriteAnimation.update();
            this._sprite = this.spriteAnimation.sprite;
        }

        let lifeprogress;

        if (this._interpolateSize) {
            const size = Vector2.lerp(
                this.startSize,
                this.endSize,
                (lifeprogress = (GameTime.gameTimeSinceStart - this.startTime) / this.lifeTime)
            );

            this._sprite.width = size.x;
            this._sprite.height = size.y;
        }

        const translation =
            (this._interpolateSpeed
                ? lerp(
                      this.startSpeed,
                      this.endSpeed,
                      lifeprogress ?? (GameTime.gameTimeSinceStart - this.startTime) / this.lifeTime
                  )
                : this.startSpeed) * GameTime.deltaTimeSeconds;

        this._container.x += this._direction.x * translation;
        this._container.y += this._direction.y * translation;

        this._container.angle += this.rotation.degree * GameTime.deltaTimeSeconds * this.rotationDirection;

        this._sprite.alpha = this.getAlpha();
    }

    /**
     *
     * Returns the current alpha value of this Particle.
     *
     */
    public getAlpha(): number {
        if (this.fadeIn === 0 && this.fadeOut === 0) return 1;

        if (GameTime.gameTimeSinceStart < this.startTime + this.fadeIn) {
            return (GameTime.gameTimeSinceStart - this.startTime) / this.fadeIn;
        } else if (GameTime.gameTimeSinceStart > this.endTime - this.fadeOut) {
            return 1 - (GameTime.gameTimeSinceStart - this.endTime + this.fadeOut) / this.fadeOut;
        }

        return 1;
    }

    public get position(): Vector2 {
        return new Vector2(this._sprite.x, this._sprite.y);
    }

    public dispose(): void {
        this._container.parent.removeChild(this._container);

        if (this.spriteAnimation) Dispose(this.spriteAnimation);
        else this._sprite.destroy({ children: true, texture: true, baseTexture: false });

        if (this._container.destroy)
            this._container.destroy({ children: true, texture: true, baseTexture: false });
    }
}
