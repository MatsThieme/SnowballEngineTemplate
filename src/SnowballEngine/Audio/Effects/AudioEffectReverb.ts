import { AudioListener } from '../../GameObject/Components/AudioListener';
import { AudioEffect } from '../AudioEffect';

export class AudioEffectReverb extends AudioEffect {
    public readonly node!: AudioNode;
    public constructor() {
        super();

        //this.node = AudioListener.createDelay();
    }

}