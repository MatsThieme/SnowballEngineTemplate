import { triggerOnUserInputEvent } from '../../Helpers.js';
import { GameObject } from '../GameObject.js';
import { Component } from './Component.js';
import { ComponentType } from './ComponentType.js';

export class AudioSource extends Component {
    public audio: HTMLAudioElement;
    public mediaElement!: MediaElementAudioSourceNode;
    public panNode!: StereoPannerNode;
    public gainNode!: GainNode;
    public readonly connected!: boolean;
    public constructor(gameObject: GameObject) {
        super(gameObject, ComponentType.AudioSource);
        this.audio = new Audio();

        this.connected = false;

        this.connectListener();
    }

    /**
     * 
     * Connect audio to speakers, call only if connected == false
     * 
     */
    public connectListener(): void {
        const audioListener = this.gameObject.scene.audioListener;

        if (!audioListener) return;

        audioListener.addSource(this);

        this.mediaElement = audioListener.createMediaElement(this.audio);
        this.panNode = audioListener.createStereoPanner();
        this.gainNode = audioListener.createGain();

        this.mediaElement.connect(this.panNode).connect(this.gainNode);

        (<any>this).connected = true;
    }

    public disconnectListener(): void {
        this.panNode.disconnect();
        this.gainNode.disconnect();
        this.mediaElement.disconnect();

        this.gameObject.scene.audioListener?.removeSource(this);

        (<any>this).connected = false;
    }

    /**
     * 
     * The audios source string.
     * 
     */
    public get clip(): string {
        return this.audio.src;
    }
    public set clip(val: string) {
        this.audio.src = './Assets/' + val;
    }

    /**
     * 
     * Loop the clip.
     * 
     */
    public get loop(): boolean {
        return this.audio.loop;
    }
    public set loop(val: boolean) {
        this.audio.loop = val;
    }

    /**
     * 
     * The volume of the clip.
     * 
     */
    public get volume(): number {
        return this.audio.volume;
    }
    public set volume(val: number) {
        this.audio.volume = val;
    }

    /**
     * 
     * Play the audio clip.
     * 
     */
    public play(): void {
        triggerOnUserInputEvent(() => this.audio.play());
    }

    /**
     *
     * Pause the audio clip.
     *
     */
    public pause(): void {
        triggerOnUserInputEvent(() => this.audio.pause());
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
        this.disconnectListener();
        super.destroy();
    }
}