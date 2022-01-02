import { AudioEffect } from "Audio/AudioEffect";
import { AudioMixer } from "Audio/AudioMixer";
import { AudioListener } from "GameObject/Components/AudioListener";

/** @category Audio */
export class AudioEffectVolume extends AudioEffect {
    public readonly node: GainNode;

    public constructor(mixer: AudioMixer) {
        super(mixer);

        this.node = AudioListener.context.createGain();
    }

    public get value(): number {
        return this.node.gain.value;
    }

    public set value(val: number) {
        this.node.gain.value = val;
    }
}
