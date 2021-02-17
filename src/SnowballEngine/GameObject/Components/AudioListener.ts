import { D } from '../../Debug';
import { triggerOnUserInputEvent } from '../../Helpers';
import { ComponentType } from '../ComponentType';
import { GameObject } from '../GameObject';
import { AudioSource } from './AudioSource';
import { Component } from './Component';

export class AudioListener extends Component {
    private static readonly context: AudioContext = new AudioContext();

    public static readonly node: AudioDestinationNode = AudioListener.context.destination;

    public readonly node: GainNode;
    public volume: number;
    public maxDistance: number;
    public cameraDistance: number;

    private _sources: Map<number, AudioSource>;

    public constructor(gameObject: GameObject) {
        super(gameObject, ComponentType.AudioListener);

        this.node = AudioListener.createGain();
        this.node.connect(AudioListener.node);

        this.volume = 1;
        this.maxDistance = 20;
        this.cameraDistance = 5;

        this._sources = new Map();


        for (const gO of [...this.gameObject.scene.gameObjects.values()]) {
            for (const source of [...gO.getComponents(AudioSource)]) source.connect();
        }
    }

    public static start() {
        AudioListener.context.addEventListener('statechange', e => {
            D.log(`audio context state change: ${AudioListener.context.state}`);
        });

        if (AudioListener.context.state === 'suspended') {
            triggerOnUserInputEvent(() => AudioListener.context.resume());
        }
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

    public onEnable(): void {
        this.node.connect(AudioListener.node);
    }

    public onDisable(): void {
        this.node.disconnect();
    }

    public addSource(audioSource: AudioSource): void {
        this._sources.set(audioSource.componentId, audioSource);
    }

    public removeSource(audioSource: AudioSource): void {
        this._sources.delete(audioSource.componentId);
    }

    public update(): void {
        const globalTransform = this.gameObject.transform.toGlobal();

        for (const source of this._sources.values()) {
            if (source.node) {
                const sourceGlobalTransform = source.gameObject.transform.toGlobal();
                source.node.setPosition(sourceGlobalTransform.position.x - globalTransform.position.x, sourceGlobalTransform.position.y - globalTransform.position.y, this.cameraDistance);
                source.node.maxDistance = this.maxDistance;
            }
        }

        this.node.gain.value = this.volume;
    }

    public destroy(): void {
        for (const s of [...this._sources.values()]) {
            s.disconnect();
        }

        this._sources.clear();

        super.destroy();
    }
}