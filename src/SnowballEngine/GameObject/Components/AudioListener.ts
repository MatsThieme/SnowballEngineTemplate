import { clamp, triggerOnUserInputEvent } from '../../Helpers.js';
import { GameObject } from '../GameObject.js';
import { AudioSource } from './AudioSource.js';
import { Component } from './Component.js';
import { ComponentType } from './ComponentType.js';

export class AudioListener extends Component {
    public volume: number;
    public maxDistance: number;
    private context: AudioContext;
    private sources: Map<number, AudioSource>;
    public constructor(gameObject: GameObject, maxDistance: number = 20, volume: number = 1) {
        super(gameObject, ComponentType.AudioListener);
        this.context = new AudioContext();
        triggerOnUserInputEvent(() => this.context.resume());
        this.sources = new Map();
        this.volume = volume;
        this.maxDistance = maxDistance;
    }
    public addSource(audioSource: AudioSource): void {
        this.sources.set(audioSource.componentId, audioSource);
        audioSource.mediaElement.connect(this.context.destination);
    }
    public removeSource(audioSource: AudioSource): void {
        this.sources.delete(audioSource.componentId);
    }
    public createMediaElement(audio: HTMLAudioElement): MediaElementAudioSourceNode {
        return this.context.createMediaElementSource(audio);
    }
    public createStereoPanner(): StereoPannerNode {
        return this.context.createStereoPanner();
    }
    public createGain(): GainNode {
        return this.context.createGain();
    }
    private calcStereoPanning(audioSource: AudioSource): number {
        return clamp(-1, 1, (Math.abs(this.gameObject.transform.position.x - audioSource.gameObject.transform.position.x)) / this.maxDistance * (audioSource.gameObject.transform.position.x > this.gameObject.transform.position.x ? 1 : -1));
    }
    private calcRelativeVolume(audioSource: AudioSource): number {
        return clamp(0, 1, 1 - this.gameObject.transform.position.distance(audioSource.gameObject.transform.position) / this.maxDistance);
    }
    public update(): void {
        for (const source of this.sources.values()) {
            source.panNode.pan.value = this.calcStereoPanning(source);
            source.gainNode.gain.value = this.calcRelativeVolume(source) * this.volume;
        }
    }
    public destroy(): void {
        this.sources.clear();
        this.context.close();
    }
}