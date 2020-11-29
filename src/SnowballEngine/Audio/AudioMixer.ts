import { AudioListener } from '../GameObject/Components/AudioListener';
import { AudioSource } from '../GameObject/Components/AudioSource';
import { clamp } from '../Helpers';
import { AudioEffect } from './AudioEffect';

export class AudioMixer {
    private static _mixers: Map<string, AudioMixer> = new Map();
    private static _nextID: number = 0;
    private readonly _id: number;

    private readonly _node: GainNode;
    private _destination?: AudioNode;

    /**
     * 
     * Effects are applied in ascending index order.
     * 
     */
    private readonly _effects: AudioEffect[];
    private readonly _sources: AudioSource[];
    private readonly _mixers: AudioMixer[];

    private connected: boolean;

    public constructor() {
        this._id = AudioMixer._nextID++;
        this._node = AudioListener.createGain();

        this._effects = [];
        this._sources = [];
        this._mixers = [];

        this.connected = false;

        this.connect();
    }

    public static get(name: string): AudioMixer | undefined {
        return AudioMixer._mixers.get(name);
    }

    public static create(name: string): AudioMixer {
        if (AudioMixer._mixers.has(name)) return AudioMixer.get(name)!;

        const mixer = new AudioMixer();
        AudioMixer._mixers.set(name, mixer);

        return mixer;
    }

    private get node(): AudioNode {
        return this._effects[0]?.node || this._node;
    }

    public get volume(): number {
        return this._node.gain.value
    }
    public set volume(val: number) {
        this._node.gain.value = clamp(0, 1, val);
    }

    public get effects(): ReadonlyArray<AudioEffect> {
        return this._effects;
    }


    public setChild(mixer: AudioMixer): void {
        if (this._mixers.find(m => m._id === mixer._id) || this._id === mixer._id) return;

        this._mixers.push(mixer);
        mixer.connect(this._node);
    }

    /**
     * 
     * @param mixer AudioMixer instance or instance._id
     * 
     */
    public removeChild(mixer: AudioMixer | number): AudioMixer | undefined {
        const id = typeof mixer === 'number' ? mixer : this._sources.findIndex(s => s.componentId === mixer._id);

        if (id === -1) return;

        const m = this._mixers.splice(id, 1)[0];
        m?.disconnect();

        return m;
    }


    public addEffect<T extends AudioEffect>(effect: Constructor<T>, initializer: (effect: T) => any): AudioEffect {
        const reconnect = this._effects.length === 0;

        if (reconnect) this.disconnect();

        const e = new effect();

        initializer(e);

        this.disconnectEffects();
        this._effects.push(e);
        this.connectEffects();

        if (reconnect) this.connect();

        return e;
    }

    /**
     * 
     * @param effect AudioEffect instance or instance._id
     * 
     */
    public removeEffect(effect: AudioEffect | number): void {
        const id = typeof effect === 'number' ? effect : this._sources.findIndex(s => s.componentId === effect._id);
        if (id === -1) return;

        const reconnect = this._effects.length > 0;

        if (reconnect) this.disconnect();

        this.disconnectEffects();

        this._sources.splice(id, 1);

        this.connectEffects();

        if (reconnect) this.connect();
    }

    private connectEffects(): void {
        if (!this._effects.length) return;

        this._node.disconnect();
        this._node.connect(this._effects[this._effects.length - 1].node);

        if (this._effects.length > 1) {
            for (let i = 0; i < this._effects.length - 1; i++) {
                this._effects[i + 1].node.connect(this._effects[i].node);
            }
        }
    }

    private disconnectEffects(): void {
        this._effects.forEach(e => e.node.disconnect());
        if (this.connected) this.connect(this._destination);
    }


    public connect(node?: AudioNode): void {
        this.disconnect();

        this._destination = node;

        this.node.connect(node || AudioListener.node);

        this.connected = true;
    }

    public disconnect(): void {
        if (!this.connected) return;
        this.node.disconnect();

        this.connected = false;
    }

    public addSource(source: AudioSource): void {
        this._sources.push(source);
        source.node.connect(this._node);
    }

    /**
     * 
     * @param source AudioSource instance or instance.componentId
     *
     */
    public removeSource(source: AudioSource | number): void {
        const id = typeof source === 'number' ? source : this._sources.findIndex(s => s.componentId === source.componentId);
        if (id === -1) return;

        this.disconnectSources();

        this._sources.splice(id, 1);

        this.connectSources();
    }

    private connectSources(): void {
        this._sources.forEach(s => s.node.connect(this._node));
    }

    private disconnectSources(): void {
        this._sources.forEach(s => s.node.disconnect());
    }

    public destroy(): void {
        this.disconnect();
        this.disconnectEffects();
        this.disconnectSources();

    }

    public static reset(): void {
        for (const mixer of this._mixers.values()) {
            mixer.destroy();
        }
    }
}