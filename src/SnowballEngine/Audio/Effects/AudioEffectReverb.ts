import { AudioListener } from '../../GameObject/Components/AudioListener.js';
import { AudioEffect } from '../AudioEffect.js';

export class AudioEffectReverb extends AudioEffect {
    public readonly node!: AudioNode;
    public constructor() {
        super();

        //this.node = AudioListener.createDelay();
    }

}