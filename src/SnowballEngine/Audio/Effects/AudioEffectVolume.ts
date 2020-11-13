import { D } from '../../Debug.js';
import { AudioListener } from '../../GameObject/Components/AudioListener.js';
import { AudioEffect } from '../AudioEffect.js';

export class AudioEffectVolume extends AudioEffect {
    public readonly node: GainNode;
    public constructor() {
        super();

        this.node = AudioListener.createGain();
    }
    public get value(): number {
        return this.node.gain.value;
    }
    public set value(val: number) {
        this.node.gain.value = val;
    }
}