import { AudioListener } from 'GameObject/Components/AudioListener';
import { AudioSource } from 'GameObject/Components/AudioSource';
import { Disposable, Dispose } from 'GameObject/Dispose';
import { clamp } from 'Utility/Helpers';
import { AudioEffect } from './AudioEffect';

/** @category Audio */
export class AudioMixer implements Disposable {
    private static _mixers: Record<string, AudioMixer> = {};
    private static _nextID = 0;
    private readonly _id: number;
    private readonly _name: string;

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

    private _connected: boolean;

    /**
     * 
     * Mixers are stored and can be accessed with AudioMixer.get(name);
     * 
     */
    public constructor(name: string) {
        if (AudioMixer._mixers[name]) throw new Error(`Mixer exists: ${name}`);
        AudioMixer._mixers[name] = this;

        this._id = AudioMixer._nextID++;
        this._name = name;
        this._node = AudioListener.context.createGain();

        this._effects = [];
        this._sources = [];
        this._mixers = [];

        this._connected = false;

        this.connect();
    }

    public static get(name: string): AudioMixer | undefined {
        return AudioMixer._mixers[name];
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

    public get effects(): readonly AudioEffect[] {
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
        const id = typeof mixer === 'number' ? mixer : this._sources.findIndex(s => s.componentID === mixer._id);

        if (id === -1) return;

        const m = this._mixers.splice(id, 1)[0];
        m?.disconnect();

        return m;
    }


    public addEffect<T extends AudioEffect>(effect: Constructor<T>, initializer?: (effect: T) => unknown): T {
        const reconnect = this._effects.length === 0;

        if (reconnect) this.disconnect();

        const e = new effect(this);

        if (initializer) initializer(e);

        this.disconnectEffects();
        this._effects.push(e);
        this.connectEffects();

        if (reconnect) this.connect();

        return e;
    }

    /**
     * 
     * @param effect AudioEffect instance
     * 
     */
    public removeEffect(effect: AudioEffect): void {
        const i = this._effects.findIndex(s => s.id === effect.id);
        if (i === -1) return;

        const reconnect = this._effects.length > 0;

        if (reconnect) this.disconnect();

        this.disconnectEffects();

        this._effects.splice(i, 1);

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
        if (this._connected) this.connect(this._destination);
    }


    public connect(node?: AudioNode): void {
        this.disconnect();

        this._destination = node;

        this.node.connect(node || AudioListener.node);

        this._connected = true;
    }

    public disconnect(): void {
        if (!this._connected) return;
        this.node.disconnect();

        this._connected = false;
    }

    /**
     * 
     * @internal 
     * 
     */
    public addSource(source: AudioSource): void {
        this._sources.push(source);
        source.node.connect(this._node);
    }

    /**
     * 
     * @param source AudioSource instance 
     *
     */
    public removeSource(source: AudioSource): void {
        const i = this._sources.findIndex(s => s.componentID === source.componentID);
        if (i === -1) return;

        this.disconnectSources();

        this._sources.splice(i, 1);

        this.connectSources();
    }

    private connectSources(): void {
        this._sources.forEach(s => s.node.connect(this._node));
    }

    private disconnectSources(): void {
        this._sources.forEach(s => s.node.disconnect());
    }

    public dispose(): void {
        AudioMixer._mixers[this._name];
        this.disconnect();
        this.disconnectEffects();
        this.disconnectSources();

        for (const e of this._effects) {
            this.removeEffect(e);
        }

        for (const s of this._sources) {
            this.removeSource(s);
        }

        for (const m of this._mixers) {
            this.removeChild(m);
        }
    }

    public static reset(): void {
        for (const mixer of Object.values(this._mixers)) {
            Dispose(mixer);
        }
    }
}