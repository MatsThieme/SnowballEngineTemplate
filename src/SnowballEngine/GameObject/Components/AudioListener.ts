import { triggerOnUserInputEvent } from '../../Helpers';
import { GameObject } from '../GameObject';
import { AudioSource } from './AudioSource';
import { Component } from './Component';
import { ComponentType } from './ComponentType';

export class AudioListener extends Component {
    private static context: AudioContext;
    public static node: GainNode;
    public volume: number;
    public maxDistance: number;
    public cameraDistance: number;
    private sources: Map<number, AudioSource>;
    public constructor(gameObject: GameObject, maxDistance: number = 20, volume: number = 1, cameraDistance: number = 5) {
        super(gameObject, ComponentType.AudioListener);

        this.sources = new Map();
        this.volume = volume;
        this.maxDistance = maxDistance;
        this.cameraDistance = cameraDistance;

        for (const gO of this.gameObject.scene.getAllGameObjects()) {
            for (const source of [...gO.getComponents(AudioSource)]) source.connect();
        }
    }
    public static start() {
        AudioListener.context = new AudioContext();
        AudioListener.node = AudioListener.createGain();

        AudioListener.node.connect(AudioListener.context.destination);

        if (AudioListener.context.state === 'suspended') triggerOnUserInputEvent(() => AudioListener.context.resume());
    }
    public static createMediaElement(audio: HTMLAudioElement): MediaElementAudioSourceNode {
        return AudioListener.context.createMediaElementSource(audio);
    }
    public static createPanner(): PannerNode {
        return AudioListener.context.createPanner();
    }
    public static createGain(): GainNode {
        return AudioListener.context.createGain();
    }
    public static createDelay(): DelayNode {
        return AudioListener.context.createDelay();
    }
    public addSource(audioSource: AudioSource): void {
        this.sources.set(audioSource.componentId, audioSource);
    }
    public removeSource(audioSource: AudioSource): void {
        this.sources.delete(audioSource.componentId);
    }
    public update(): void {
        for (const source of this.sources.values()) {
            if (source.node) {
                source.node.setPosition(source.gameObject.transform.position.x - this.gameObject.transform.position.x, source.gameObject.transform.position.y - this.gameObject.transform.position.y, this.cameraDistance);
                source.node.maxDistance = this.maxDistance;
            }
        }

        AudioListener.node.gain.value = this.volume;
    }
    public destroy(): void {
        for (const s of [...this.sources.values()]) {
            s.disconnect();
        }

        this.sources.clear();

        super.destroy();
    }
}