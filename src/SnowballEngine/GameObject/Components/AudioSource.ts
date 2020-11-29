import { Asset } from '../../Assets/Asset';
import { AssetType } from '../../Assets/AssetType';
import { AudioMixer } from '../../Audio/AudioMixer';
import { D } from '../../Debug';
import { clamp, triggerOnUserInputEvent } from '../../Helpers';
import { GameObject } from '../GameObject';
import { AudioListener } from './AudioListener';
import { Component } from './Component';
import { ComponentType } from './ComponentType';

export class AudioSource extends Component {
    public readonly node: PannerNode;
    private readonly mediaElement: MediaElementAudioSourceNode;
    private readonly audio: HTMLAudioElement;
    private connected: boolean;
    private _asset?: Asset;
    private _volume!: number;
    private _loop!: boolean;
    private _mixer?: AudioMixer;
    public constructor(gameObject: GameObject) {
        super(gameObject, ComponentType.AudioSource);

        this.audio = new Audio();
        this.audio.autoplay = false;

        this.volume = 0.5;
        this.loop = false;

        this.mediaElement = AudioListener.createMediaElement(this.audio);
        this.node = AudioListener.createPanner();
        this.mediaElement.connect(this.node);

        this.node.panningModel = 'HRTF';
        this.node.distanceModel = 'inverse';


        this.connected = false;

        this.connect();
    }

    public get mixer(): AudioMixer | undefined {
        return this._mixer;
    }
    public set mixer(val: AudioMixer | undefined) {
        this._mixer?.removeSource(this);

        this._mixer = val;

        this.connect();
    }

    public connect() {
        if (this.connected) this.disconnect();

        if (!this.asset) return;

        const listener = this.gameObject.scene.audioListener;

        if (!listener) return D.error('no listener');

        if (this.mixer) this.mixer.addSource(this);
        else this.node.connect(AudioListener.node);

        listener.addSource(this);

        this.connected = true;
    }

    public disconnect() {
        if (!this.connected) return;

        this.node.disconnect();

        this.gameObject.scene.audioListener?.removeSource(this);

        this.connected = false;
    }

    public get asset(): Asset | undefined {
        return this._asset;
    }
    public set asset(asset: Asset | undefined) {
        if (asset) {
            if (asset.type !== AssetType.Audio) {
                D.error('asset.type !== AssetType.Audio');
            } else {
                this.audio.src = asset.path;

                this._asset = asset;
            }

            this.connect();
        }
    }

    /**
     * 
     * Loop the clip.
     * 
     */
    public get loop(): boolean {
        return this._loop;
    }
    public set loop(val: boolean) {
        this.audio.loop = this._loop = val;
    }

    /**
     * 
     * The volume of the clip.
     * 
     */
    public get volume(): number {
        return this._volume;
    }
    public set volume(val: number) {
        this.audio.volume = this._volume = clamp(0, 1, val);
    }

    /**
     * 
     * Play the audio clip.
     * 
     */
    public async play(): Promise<void> {
        if (!this.asset) return D.error('no audio clip set');

        try {
            await this.audio.play();
        } catch {
            await triggerOnUserInputEvent(async () => await this.audio.play());
        }

    }

    /**
     *
     * Pause the audio clip.
     *
     */
    public async pause(): Promise<void> {
        if (!this.asset) return D.error('no audio clip set');

        try {
            await this.audio.pause();
        } catch {
            await triggerOnUserInputEvent(async () => await this.audio.pause());
        }
    }

    /**
     *
     * Reset the audio clip.
     *
     */
    public reset(): void {
        this.audio.currentTime = 0;
    }

    public destroy(): void {
        this.disconnect();
        super.destroy();
    }
}