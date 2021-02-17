import { Angle } from '../Angle';
import { Asset } from '../Assets/Asset';
import { Vector2 } from '../Vector2';

declare global {
    type ParticleAsset = Asset | { readonly assets: Asset[], readonly swapTime: number };

    interface ParticleSettings {
        /** relative to the ParticleSystem */
        startSize: Vector2;

        /** relative to the ParticleSystem */
        endSize?: Vector2;

        /** rotation per second, relative to the ParticleSystem */
        rotation: Angle;

        /** velocity of particles in world units per second, relative to the ParticleSystem */
        velocity: number;

        /** milliseconds until the particle gets destroyed */
        lifeTime: number;

        /** fade in duration in milliseconds */
        fadeIn: number;

        /** fade out duration in milliseconds */
        fadeOut: number;
    }

    interface EmissionSettings {
        /** Specifies whether the ParticleSystem should emit particles */
        emit: boolean;

        /** particles emitted per second */
        emission: number;

        /** particles are emitted in a random direction within this angle */
        angle: Angle;

        maxParticles: number;
    }
}