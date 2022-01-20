import { Dispose } from "../GameObject/Dispose";
import { AudioMixer } from "./AudioMixer";

export class AudioMixerManager<Name extends string> {
    private _mixers: Record<string, AudioMixer>;
    private _nextID: number;

    public constructor() {
        this._mixers = {};
        this._nextID = 0;
    }

    public getMixer(name: Name): AudioMixer {
        return this._mixers[name] ?? (this._mixers[name] = new AudioMixer(this._nextID++));
    }

    public reset(): void {
        for (const mixer in this._mixers) {
            Dispose(this._mixers[mixer]);
        }
    }
}
