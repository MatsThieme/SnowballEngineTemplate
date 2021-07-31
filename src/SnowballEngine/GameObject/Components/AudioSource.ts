import { Asset } from 'Assets/Asset';
import { AudioMixer } from 'SnowballEngine/Audio/AudioMixer';
import { Client } from 'SnowballEngine/Client';
import { Debug } from 'SnowballEngine/Debug';
import { EventHandler } from 'Utility/Events/EventHandler';
import { AudioSourceEventTypes } from 'Utility/Events/EventTypes';
import { Vector2 } from 'Utility/Vector2';
import { ComponentType } from '../ComponentType';
import { GameObject } from '../GameObject';
import { AudioListener } from './AudioListener';
import { Component } from './Component';

/** @category Component */
export class AudioSource extends Component<AudioSourceEventTypes>  {
    public readonly node: PannerNode;

    public playGlobally: boolean;

    public readonly duration: number;

    private _audioBufferNode?: AudioBufferSourceNode;

    private _connected: boolean;

    private _asset?: Asset;
    private _mixer?: AudioMixer;

    private _loop: boolean;
    private _startTime: number;
    private _endTime: number;
    private _rate: number;

    private _startedAt: number;

    private _ended: boolean;
    private _stopped: boolean;
    private _paused: number;

    private _maxDistance: number;
    private _zPosition: number;
    private _position: IVector2;

    public constructor(gameObject: GameObject) {
        super(gameObject, ComponentType.AudioSource);

        this.duration = 0;

        this._loop = false;
        this._startTime = 0;
        this._endTime = 0;
        this._rate = 1;

        this._startedAt = 0;

        this._ended = true;
        this._stopped = false;
        this._paused = -1;

        this._maxDistance = 50;
        this._zPosition = 10;
        this._position = new Vector2();


        this.playGlobally = false;

        this.node = AudioListener.context.createPanner();
        this.renewNode();

        this.node.panningModel = 'HRTF';
        this.node.distanceModel = 'linear';
        this.node.maxDistance = this._maxDistance;
        this.zPosition = this._zPosition;

        this._connected = false;

        const listeneradd = new EventHandler(listener => {
            this.connect();
            console.log('listener add');
        });

        const listenerremove = new EventHandler(listener => {
            this.disconnect();
        });

        this.gameObject.scene.addListener('audiolisteneradd', listeneradd);
        this.gameObject.scene.addListener('audiolistenerremove', listenerremove);

        this.addListener('destroy', new EventHandler(() => {
            this.gameObject.scene.removeListener('audiolisteneradd', listeneradd);
            this.gameObject.scene.removeListener('audiolistenerremove', listenerremove);
        }));

        this.connect();
    }

    /**
     * 
     * Playback will be stopped when switching Asset.
     * startTime is set to 0 and endTime to duration.
     * 
     */
    public get asset(): Asset | undefined {
        return this._asset;
    }
    public set asset(val: Asset | undefined) {
        if (this.playing) this.stop();

        this._startTime = 0;

        if (val) {
            this._endTime = (<Mutable<AudioSource>>this).duration = (<AudioBuffer>val.data).duration;
        } else {
            this._endTime = (<Mutable<AudioSource>>this).duration = 0;
        }

        this._asset = val;
    }

    public get mixer(): AudioMixer | undefined {
        return this._mixer;
    }
    public set mixer(val: AudioMixer | undefined) {
        this.disconnect();

        this._mixer = val;

        this.connect();
    }

    public get loop(): boolean {
        return this._loop;
    }
    public set loop(val: boolean) {
        this._loop = val;
        if (this._audioBufferNode) this._audioBufferNode.loop = val;
    }

    public get startTime(): number {
        return this._startTime;
    }
    public set startTime(val: number) {
        this._startTime = val;
        if (this._audioBufferNode) this._audioBufferNode.loopStart = val;
    }

    public get endTime(): number {
        return this._endTime;
    }
    public set endTime(val: number) {
        this._endTime = val;
        if (this._audioBufferNode) this._audioBufferNode.loopEnd = val;
    }

    public get rate(): number {
        return this._rate;
    }
    public set rate(val: number) {
        if (this.playing) {
            this._startedAt = AudioListener.context.currentTime - (AudioListener.context.currentTime - this._startedAt) * this._rate / val;
        }

        if (this._audioBufferNode) {
            this._audioBufferNode.playbackRate.value = val;
        }

        this._rate = val;
    }

    /**
     * 
     * The current playback time in seconds.
     * if not playing return -1
     * 
     */
    public get currentTime(): number {
        if (this._ended || this._stopped) return -1;

        if (this._paused === -1) {
            return (AudioListener.context.currentTime - this._startedAt) * this._rate;
        } else {
            return this._paused * this._rate;
        }
    }
    public set currentTime(val: number) {
        const isPaused = this.paused;

        if (!isPaused) this.pause();

        this._paused = val;

        if (!isPaused) this.play();
    }

    public get playing(): boolean {
        return !this._ended && !this._stopped && !this.paused;
    }


    public get paused(): boolean {
        return this._paused !== -1 && !this._ended;
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
        if (!this.node.positionZ) this.node.setPosition(this._position.x, this._position.y, this._zPosition);
        else if (this.node.positionZ.value !== val) this.node.positionZ.value = val;
    }

    public get position(): IVector2 {
        return this._position;
    }
    public set position(val: IVector2) {
        if (Vector2.equal(this._position, val)) return;

        this._position = val;
        if (!this.node.positionX) this.node.setPosition(val.x, val.y, this._zPosition);
        else {
            this.node.positionX.value = val.x;
            this.node.positionY.value = val.y;
        }
    }


    protected override onEnable(): void {
        this.connect();
    }

    protected override onDisable(): void {
        this.disconnect();
    }


    /**
     * 
     * Connect to mixer? or listener
     * 
     */

    public connect(): void {
        const listener = this.gameObject.scene.audioListener;

        if (!listener) return Debug.warn('No AudioListener');


        if (this._connected) this.disconnect();

        if (this.mixer) this.mixer.addSource(this);
        else this.node.connect(listener.node);

        this._connected = true;
    }

    public disconnect(): void {
        if (!this._connected) return;

        this.node.disconnect();

        this._connected = false;
    }


    /**
     * 
     * Play the audio clip.
     * 
     */
    public play(): void {
        if (!this.asset) return Debug.warn('No audio clip set');
        if (!Client.hasMediaPlayPermission) return Debug.warn('Need permission to play media first');

        if (this.playing) this.stop();


        const start = Math.max(this._paused, this._startTime);
        const duration = this._endTime - start;

        if (this._endTime - this._startTime <= 0) return Debug.warn('endTime - startTime <= 0; must be greater than 0');
        if (duration <= 0) return;


        this.renewNode();

        this._audioBufferNode!.onended = () => {
            if (this.__destroyed__ === null) return; // component has been destroyed

            if (!this.paused) {
                this._paused = -1;
                this.dispatchEvent('end');
                this._ended = true;
                this._stopped = false;
            }
        };

        this._startedAt = AudioListener.context.currentTime;

        if (this.paused) this._startedAt -= this._paused;


        this._audioBufferNode!.start(AudioListener.context.currentTime, start, this._loop ? undefined : duration);
        this.dispatchEvent('play');

        this._ended = false;
        this._stopped = false;
        this._paused = -1;
    }

    /**
     *
     * Pause the audio clip.
     *
     */
    public pause(): void {
        if (!this.playing || !this._audioBufferNode) return;

        this._paused = this.currentTime;
        this._ended = false;
        this._stopped = true;

        this.dispatchEvent('pause');

        this._audioBufferNode.stop();
    }

    public stop(): void {
        if (!this.playing || !this._audioBufferNode) return;

        if (!this.paused) this._audioBufferNode.stop();

        this._paused = this.currentTime;
        this._ended = false;
        this._stopped = true;
    }

    /**
     *
     * Reset the audio clip.
     *
     */
    public reset(): void {
        this.asset = this.asset;
    }

    private renewNode(): void {
        this._audioBufferNode?.disconnect();

        if (!this._asset) return;

        if (this.playing) this._audioBufferNode!.stop();

        if (this._audioBufferNode) {
            this._audioBufferNode.disconnect();
            this._audioBufferNode.onended = null;
            this._audioBufferNode.buffer = null;
        }

        this._audioBufferNode = AudioListener.context.createBufferSource();
        this._audioBufferNode.buffer = <AudioBuffer>this._asset.data;
        this._audioBufferNode.playbackRate.value = this._rate;
        this._audioBufferNode.loop = this._loop;
        this._audioBufferNode.loopStart = this._startTime;
        this._audioBufferNode.loopEnd = this._endTime;

        this._audioBufferNode.connect(this.node);
    }

    public override destroy(): void {
        if (this._audioBufferNode) {
            this.disconnect();
            this._audioBufferNode.onended = null;
            this._audioBufferNode.buffer = null;
        }

        this.node.disconnect();

        super.destroy();
    }
}