import { Container } from '@pixi/display';
import { ComponentType } from 'GameObject/ComponentType';
import { GameObject } from 'GameObject/GameObject';
import { GameTime } from 'SnowballEngine/GameTime';
import { Angle } from 'Utility/Angle';
import { Vector2 } from 'Utility/Vector2';
import { Renderable } from '../Renderable';
import { Particle } from './Particle';

/**@category Component */
export class ParticleSystem extends Renderable {
    public readonly particleSettings: ParticleSettings;
    public readonly emissionSettings: EmissionSettings;

    private _asset?: ParticleAsset;
    private _timer: number;
    private readonly _particles: Particle[];

    public constructor(gameObject: GameObject) {
        super(gameObject, ComponentType.ParticleSystem);

        this.sprite = new Container();

        this.particleSettings = {
            startSize: new Vector2(0.1, 0.1),
            rotation: new Angle(0.5),
            velocity: 1,
            lifeTime: 500,
            fadeIn: 100,
            fadeOut: 100
        };

        this.emissionSettings = {
            emit: true,
            emission: 10,
            angle: Angle.max,
            maxParticles: 10
        };

        this._timer = 0;
        this._particles = [];
    }

    public get asset(): ParticleAsset | undefined {
        return this._asset;
    }
    public set asset(val: ParticleAsset | undefined) {
        this._asset = val;
    }

    public get particles(): Particle[] {
        return this._particles;
    }

    /**
     * 
     * Move and emit particles.
     * 
     */
    public update(): void {
        super.update();

        if (!this.active || !this._asset) return;

        this._timer += GameTime.deltaTimeSeconds;

        while (this._timer >= 1 / this.emissionSettings.emission && this._particles.length < this.emissionSettings.maxParticles) {
            const particle = new Particle(this, Vector2.up.rotateAroundTo(new Vector2(), Angle.random(this.emissionSettings.angle)).setLength(this.particleSettings.velocity));

            this.sprite!.addChild(particle.container);

            this._particles.push(particle);

            this._timer -= 1 / this.emissionSettings.emission;
        }


        for (let i = this._particles.length - 1; i >= 0; i--) {
            if (this._particles[i].endTime < GameTime.time) {
                const particle = this._particles.splice(i, 1)[0];

                this.sprite?.removeChild(particle.container);

                particle.destroy();
            }
            else this._particles[i].update();
        }
    }
}