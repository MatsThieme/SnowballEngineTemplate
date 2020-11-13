import { AudioListener } from '../../GameObject/Components/AudioListener.js';
import { AudioEffect } from '../AudioEffect.js';

export class AudioEffectDelay extends AudioEffect {
    public readonly node: DelayNode;
    public constructor() {
        super();

        this.node = AudioListener.createDelay();
    }

    public get seconds(): number {
        return this.node.delayTime.value;
    }
    public set seconds(val: number) {
        this.node.delayTime.value = val;
    }
}