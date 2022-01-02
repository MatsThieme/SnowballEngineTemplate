import { Container } from "@pixi/display";
import { ComponentType } from "GameObject/ComponentType";
import { Dispose } from "GameObject/Dispose";
import { GameObject } from "GameObject/GameObject";
import { GameTime } from "SnowballEngine/GameTime";
import { Angle } from "Utility/Angle";
import { Color } from "Utility/Color";
import { ParticleSystemEventTypes } from "Utility/Events/EventTypes";
import { Range } from "Utility/Range";
import { Vector2 } from "Utility/Vector2";
import { Renderable } from "../Renderable";
import { Particle } from "./Particle";

/** @category Component */
export class ParticleSystem extends Renderable<ParticleSystemEventTypes> {
    public readonly particleSettings: ParticleSettings;
    public readonly emissionSettings: EmissionSettings;
    public timeScale: number;

    private _asset?: ParticleAsset;
    private _timer: number;
    private readonly _particles: Particle[];

    public constructor(gameObject: GameObject) {
        super(gameObject, ComponentType.ParticleSystem);

        this.sprite = new Container();

        this.particleSettings = {
            startSize: new Vector2(0.1, 0.1),
            rotation: new Angle(Math.PI),
            lifeTime: new Range(400, 600),
            fadeIn: 100,
            fadeOut: 100,
            startSpeed: 1,
            endSpeed: 1,
            tint: Color.white,
            rotationDirection: "random",
        };

        this.emissionSettings = {
            emit: true,
            emission: 10,
            angle: Angle.max,
            maxParticles: 10,
        };

        this.timeScale = 1;

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
    protected override update(): void {
        if (!this.active || !this._asset) return;

        this._timer += GameTime.deltaTimeSeconds;

        for (let i = this._particles.length - 1; i >= 0; i--) {
            if (this._particles[i].endTime <= GameTime.gameTimeSinceStart) {
                Dispose(this._particles.splice(i, 1)[0]);
            } else {
                this._particles[i].update();
            }
        }

        const emission = 1 / (this.emissionSettings.emission * this.timeScale);

        while (this._timer >= emission && this._particles.length < this.emissionSettings.maxParticles) {
            const particle = new Particle(this);

            this._particles.push(particle);

            this._timer -= emission;
        }
    }

    public override destroy(): void {
        this.particles.forEach((p) => Dispose(p));

        super.destroy();
    }
}
