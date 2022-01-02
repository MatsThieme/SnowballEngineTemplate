import { AudioEffect } from "Audio/AudioEffect";
import { AudioMixer } from "Audio/AudioMixer";
import { AudioListener } from "GameObject/Components/AudioListener";

/** @category Audio */
export class AudioEffectDistortion extends AudioEffect {
    public readonly node: WaveShaperNode;
    private _amount: number;

    public constructor(mixer: AudioMixer) {
        super(mixer);

        this.node = AudioListener.context.createWaveShaper();

        this._amount = 50;

        this.node.curve = this.makeDistortionCurve(this._amount);
        this.node.oversample = "4x";
    }

    /**
     *
     * from stackoverflow: https://stackoverflow.com/questions/22312841/waveshaper-node-in-webaudio-how-to-emulate-distortion
     *
     */
    private makeDistortionCurve(amount: number): Float32Array {
        const n_samples = 44100;
        const curve = new Float32Array(n_samples);
        const deg = Math.PI / 180;

        for (let i = 0; i < n_samples; i++) {
            const x = (i * 2) / n_samples - 1;
            curve[i] = ((3 + amount) * x * 20 * deg) / (Math.PI + amount * Math.abs(x));
        }

        return curve;
    }

    public get amount(): number {
        return this._amount;
    }
    public set amount(val: number) {
        if (this._amount !== val) {
            this._amount = val;
            this.node.curve = this.makeDistortionCurve(val);
        }
    }
}
