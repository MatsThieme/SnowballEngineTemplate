export abstract class AudioEffect {
    private static nextID: number;
    public abstract readonly node: AudioNode;
    public readonly _id: number;
    public constructor() {
        this._id = AudioEffect.nextID++;
    }
}