import { AudioMixer } from "./AudioMixer";

export abstract class AudioEffect {
    private static nextID: number;
    public abstract readonly node: AudioNode;
    public readonly id: number;
    public mixer: AudioMixer;

    public constructor(mixer: AudioMixer) {
        this.id = AudioEffect.nextID++;
        this.mixer = mixer;
    }
}