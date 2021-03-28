import { AudioListener } from '../../GameObject/Components/AudioListener';
import { clamp } from '../../Utilities/Helpers';
import { AudioEffect } from '../AudioEffect';
import { AudioMixer } from '../AudioMixer';

/** @category Audio */
export class AudioEffectDelay extends AudioEffect {
    public readonly node: DelayNode;

    public constructor(mixer: AudioMixer) {
        super(mixer);

        this.node = AudioListener.context.createDelay();
    }

    public get seconds(): number {
        return this.node.delayTime.value;
    }
    public set seconds(val: number) {
        this.node.delayTime.value = clamp(0, Infinity, val);
    }
}