import { AudioEffect } from "Audio/AudioEffect";
import { AudioMixer } from "Audio/AudioMixer";
import { AudioListener } from "GameObject/Components/AudioListener";
import { clamp } from "Utility/Helpers";

/** @category Audio */
export class AudioEffectReverb extends AudioEffect {
    public readonly node!: ConvolverNode;

    private _seconds: number;
    private _decay: number;
    private _reverse: boolean;

    /**
     * https://github.com/pixijs/pixi-sound/blob/main/src/filters/ReverbFilter.ts
     */
    public constructor(mixer: AudioMixer) {
        super(mixer);

        this._seconds = 3;
        this._decay = 50;
        this._reverse = false;

        this.rebuild();
    }

    /**
     * Length of reverb in seconds from 1 to 50
     * @default 3
     */
    public get seconds(): number {
        return this._seconds;
    }
    public set seconds(seconds: number) {
        this._seconds = clamp(seconds, 1, 50);
        this.rebuild();
    }

    /**
     * Decay value from 0 to 100
     * @default 50
     */
    public get decay(): number {
        return this._decay;
    }
    public set decay(decay: number) {
        this._decay = clamp(decay, 0, 100);
        this.rebuild();
    }

    public get reverse(): boolean {
        return this._reverse;
    }
    public set reverse(reverse: boolean) {
        this._reverse = reverse;
        this.rebuild();
    }

    private rebuild(): void {
        const rate: number = AudioListener.context.sampleRate;
        const length: number = rate * this._seconds;
        const impulse: AudioBuffer = AudioListener.context.createBuffer(2, length, rate);
        const impulseL: Float32Array = impulse.getChannelData(0);
        const impulseR: Float32Array = impulse.getChannelData(1);

        let n: number;

        for (let i = 0; i < length; i++) {
            n = this._reverse ? length - i : i;
            impulseL[i] = (Math.random() * 2 - 1) * Math.pow(1 - n / length, this._decay);
            impulseR[i] = (Math.random() * 2 - 1) * Math.pow(1 - n / length, this._decay);
        }

        const convolver = AudioListener.context.createConvolver();
        convolver.buffer = impulse;

        this.node?.disconnect();
        (<Mutable<AudioEffectReverb>>this).node = convolver;

        this.mixer.connect();
    }
}
