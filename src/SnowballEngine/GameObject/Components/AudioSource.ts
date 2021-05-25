import { Asset } from 'Assets/Asset';
import { AssetType } from 'Assets/AssetType';
import { AudioMixer } from 'SnowballEngine/Audio/AudioMixer';
import { Client } from 'SnowballEngine/Client';
import { Debug } from 'SnowballEngine/Debug';
import { AudioSourceEventTypes } from 'Utility/Events/EventTypes';
import { clamp } from 'Utility/Helpers';
import { Stopwatch } from 'Utility/Stopwatch';
import { ComponentType } from '../ComponentType';
import { GameObject } from '../GameObject';
import { AudioListener } from './AudioListener';
import { Component } from './Component';

/** @category Component */
export class AudioSource extends Component<AudioSourceEventTypes>  {
    public readonly node: PannerNode;

    public playGlobally: boolean;

    private _audioBufferNode!: AudioBufferSourceNode;

    private _connected: boolean;

    private _asset?: Asset;
    private _mixer?: AudioMixer;

    private _loop: boolean;
    private _loopStart: number;
    private _loopEnd: number;
    private _rate: number;
    private _sw: Stopwatch;
    private _playing: boolean;

    private _maxDistance: number;
    private _zPosition: number;

    public constructor(gameObject: GameObject) {
        super(gameObject, ComponentType.AudioSource);

        this._loop = false;
        this._loopStart = 0;
        this._loopEnd = 0;
        this._rate = 1;
        this._sw = new Stopwatch(false);
        this._playing = false;
        this._maxDistance = 50;
        this._zPosition = 5;

        this.playGlobally = false;

        this.node = AudioListener.context.createPanner();
        this.renewNode();

        this.node.panningModel = 'HRTF';
        this.node.distanceModel = 'linear';
        this.node.maxDistance = this._maxDistance;
        this.node.positionZ.value = this._zPosition;

        this._connected = false;
    }

    protected override start(): void {
        this.connect();
    }

    protected override onEnable(): void {
        this.connect();
    }

    protected override onDisable(): void {
        this.disconnect();
    }

    public get mixer(): AudioMixer | undefined {
        return this._mixer;
    }
    public set mixer(val: AudioMixer | undefined) {
        this._mixer?.removeSource(this);

        this._mixer = val;

        this.connect();
    }

    public connect(): void {
        if (!this.asset) return;

        const listener = this.gameObject.scene.audioListener;

        if (!listener) return Debug.warn('No AudioListener');


        if (this._connected) this.disconnect();

        if (this.mixer) this.mixer.addSource(this);
        else this.node.connect(listener.node);

        listener.addSource(this);

        this._connected = true;
    }

    public disconnect(): void {
        if (!this._connected) return;

        this.node.disconnect();

        this.gameObject.scene.audioListener?.removeSource(this);

        this._connected = false;
    }

    /**
     * 
     * Playback will be stopped when switching Asset.
     * 
     */
    public get asset(): Asset | undefined {
        return this._asset;
    }
    public set asset(asset: Asset | undefined) {
        if (asset) {
            if (asset.type !== AssetType.Audio) {
                throw new Error('asset.type !== AssetType.Audio');
            } else {
                if (this._playing) this.stop();

                this._asset = asset;

                this.connect();
            }
        } else {
            if (this._playing) this.stop();

            this.disconnect();

            this._asset = undefined;
        }
    }

    public get loop(): boolean {
        return this._loop;
    }
    public set loop(val: boolean) {
        this._audioBufferNode.loop = this._loop = val;
    }

    public get loopStart(): number {
        return this._loopStart;
    }
    public set loopStart(val: number) {
        this._loopStart = this._audioBufferNode.loopStart = val;
    }

    public get loopEnd(): number {
        return this._loopEnd;
    }
    public set loopEnd(val: number) {
        this._loopEnd = this._audioBufferNode.loopEnd = val;
    }

    public get rate(): number {
        return this._rate;
    }
    public set rate(val: number) {
        const ms = this._sw.milliseconds * this._rate / val;

        this._rate = this._audioBufferNode.playbackRate.value = val;

        if (ms) this._sw.milliseconds = ms;
    }

    /**
     * 
     * The current playback time in seconds.
     * 
     */
    public get currentTime(): number {
        if (!this._asset) return 0;

        return (this._sw.seconds % ((<AudioBuffer>this._asset.data).duration / this._rate)) * this._rate;
    }
    public set currentTime(val: number) {
        this._sw.seconds = val;

        if (this._playing) this.play();
    }

    public get playing(): boolean {
        return this._playing;
    }

    public get paused(): boolean {
        return !this._sw.running;
    }

    public get maxDistance(): number {
        return this._maxDistance;
    }
    public set maxDistance(val: number) {
        this._maxDistance = val;
        this.node.maxDistance = val;
    }

    public get zPosition(): number {
        return this._zPosition;
    }
    public set zPosition(val: number) {
        this._zPosition = val;
        this.node.positionZ.value = val;
    }


    /**
     * 
     * Play the audio clip.
     * 
     */
    public play(): void {
        if (!this.asset) return Debug.warn('No audio clip set');

        if (this._playing) return Debug.warn('Already playing, stop the playback before calling play');

        if (!Client.hasMediaPlayPermission) return Debug.warn('Need permission to play media first');


        this.renewNode();

        this._playing = true;
        this._audioBufferNode.onended = () => {
            if (this.__destroyed__ === null) return;
            this._playing = false;

            const diff = Math.abs((this._sw.seconds - this._audioBufferNode.buffer!.duration / this._rate)) * 1000;
            if (diff > 20 && diff < 50) Debug.warn(`Inaccurate time measurement detected: ${((this._sw.seconds - this._audioBufferNode.buffer!.duration / this._rate) * 1000).toFixed(3)}ms, tolerance: < 20ms`);

            if (this._sw.seconds + 0.02 > this._audioBufferNode.buffer!.duration / this._rate) {
                this._sw.stop();
                this._sw.milliseconds = 0;
            }
        };

        this._sw.start();
        this._audioBufferNode.start(AudioListener.context.currentTime, this._loop ? clamp(this._loopStart, this._loopEnd, this.currentTime) : this.currentTime);
    }

    /**
     *
     * Pause the audio clip.
     *
     */
    public pause(): void {
        if (!this._playing) return;

        this._sw.stop();

        this._audioBufferNode.stop();
    }

    public stop(): void {
        if (!this._playing && !this.paused) return;

        if (this._playing) this._audioBufferNode.stop();

        this._playing = false;
        this._sw.reset();
    }

    /**
     *
     * Reset the audio clip.
     *
     */
    public reset(): void {
        this.currentTime = 0;
    }

    private renewNode(): void {
        if (this._playing) this._audioBufferNode.stop();

        if (this._audioBufferNode) {
            this._audioBufferNode.disconnect();
            this._audioBufferNode.onended = null;
            this._audioBufferNode.buffer = null;
        }

        this._audioBufferNode = AudioListener.context.createBufferSource();
        this._audioBufferNode.buffer = <AudioBuffer>this.asset?.data;
        this._audioBufferNode.loop = this._loop;
        this._audioBufferNode.loopStart = this._loopStart;
        this._audioBufferNode.loopEnd = this._loopEnd;
        this._audioBufferNode.playbackRate.value = this._rate;

        this._audioBufferNode.connect(this.node);
    }

    public override destroy(): void {
        this.disconnect();

        super.destroy();
    }
}