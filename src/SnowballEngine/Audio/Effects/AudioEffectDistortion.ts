import { AudioListener } from '../../GameObject/Components/AudioListener';
import { AudioEffect } from '../AudioEffect';

export class AudioEffectDistortion extends AudioEffect {
    public readonly node!: AudioNode;

    public constructor() {
        super();

    }

}