import { AudioListener } from '../../GameObject/Components/AudioListener.js';
import { AudioEffect } from '../AudioEffect.js';

export class AudioEffectFilter extends AudioEffect {
    public readonly node!: AudioNode;
    public constructor() {
        super();

    }

}