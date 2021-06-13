import { Angle } from 'Utility/Angle';
import { Color } from 'Utility/Color';
import { Range } from 'Utility/Range';
import { Vector2 } from 'Utility/Vector2';
import { Asset } from '../Assets/Asset';

declare global {
    type ParticleAsset = Asset | { readonly assets: Asset[], readonly swapTime: number };

    interface ParticleSettings {
        /** relative to the ParticleSystem */
        startSize: Vector2 | Range<Vector2>;

        /** relative to the ParticleSystem */
        endSize?: Vector2 | Range<Vector2>;

        /** rotation per second, relative to the ParticleSystem */
        rotation: Angle | Range<Angle>;

        /** velocity of particles in world units per second, relative to the ParticleSystem */
        startSpeed: number | Range<number>;

        /** velocity of particles in world units per second, relative to the ParticleSystem */
        endSpeed: number | Range<number>;

        /** milliseconds until the particle gets destroyed */
        lifeTime: number | Range<number>;

        /** fade in duration in milliseconds */
        fadeIn: number | Range<number>;

        /** fade out duration in milliseconds */
        fadeOut: number | Range<number>;

        /** sprite tint */
        tint: Color | Range<Color>;

        rotationDirection: 'random' | 'right' | 'left';
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