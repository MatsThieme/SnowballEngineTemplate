import { Angle } from '../../Angle';
import { Asset } from '../../Assets/Asset';
import { Frame } from '../../Camera/Frame';
import { GameTime } from '../../GameTime';
import { Particle } from '../../Particle';
import { SpriteAnimation } from '../../SpriteAnimation';
import { Vector2 } from '../../Vector2';
import { AlignH, AlignV } from '../Align';
import { Drawable } from '../Drawable';
import { GameObject } from '../GameObject';
import { Component } from './Component';
import { ComponentType } from './ComponentType';

export class ParticleSystem extends Component implements Drawable {
    public distance: number;
    public angle: Angle;
    public sprites: (Asset | SpriteAnimation)[];
    public relativePosition: Vector2;
    public size: Vector2;
    public emission: number;
    public speed: number;
    public rotationSpeed: number;
    private readonly particles: Particle[];
    private timer: number;
    public lifeTime: number;
    public fadeInDuration: number;
    public fadeOutDuration: number;
    public maxParticles: number;
    public constructor(gameObject: GameObject, distance: number = 1, angle: Angle = new Angle(), sprites: (Asset | SpriteAnimation)[] = [], emission: number = 100, speed: number = 0, rotationSpeed: number = 1, particleLifeTime: number = 500, fadeInDuration: number = 0, fadeOutDuration: number = 0, relativePosition: Vector2 = new Vector2(), size: Vector2 = new Vector2(1, 1), alignH: AlignH = AlignH.Center, alignV: AlignV = AlignV.Center) {
        super(gameObject, ComponentType.ParticleSystem);
        this.distance = distance;
        this.angle = angle;
        this.sprites = sprites;
        this.relativePosition = relativePosition;
        this.size = size;
        this.emission = emission;
        this.speed = speed;
        this.rotationSpeed = rotationSpeed;
        this.lifeTime = particleLifeTime;
        this.maxParticles = 100;

        this.particles = [];
        this.timer = 0;

        this.fadeInDuration = fadeInDuration;
        this.fadeOutDuration = fadeOutDuration;
    }
    public get currentFrame(): Frame[] {
        return this.particles.map(p => p.currentFrame);
    }

    /**
     * 
     * Move and emit particles.
     * 
     */
    public update() {
        this.timer += GameTime.deltaTime;

        if (this.sprites.length === 0) return;

        for (let i = this.particles.length - 1; i >= 0; i--) {
            this.particles[i].update();
            if (this.particles[i].startTime + this.lifeTime < GameTime.now) this.particles.splice(i, 1);
        }

        while (this.timer >= this.emission && this.particles.length < this.maxParticles) {
            this.particles.push(new Particle(this, this.sprites[~~(Math.random() * this.sprites.length)], new Angle(Math.random() * this.angle.radian + this.gameObject.transform.rotation.radian).toVector2().setLength(this.speed)));
            this.timer -= this.emission;
        }
    }
    public get scaledSize(): Vector2 {
        return new Vector2(this.size.x * this.gameObject.transform.scale.x, this.size.y * this.gameObject.transform.scale.y);
    }
    public get position() {
        return Vector2.add(this.relativePosition, this.gameObject.transform.position);
    }
}