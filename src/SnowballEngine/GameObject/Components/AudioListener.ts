import { Debug } from 'SnowballEngine/Debug';
import { triggerOnUserInputEvent } from 'Utility/Helpers';
import { ComponentType } from '../ComponentType';
import { GameObject } from '../GameObject';
import { AudioSource } from './AudioSource';
import { Component } from './Component';

/** @category Component */
export class AudioListener extends Component {
    public static readonly context: AudioContext = new AudioContext();

    public static readonly node: AudioDestinationNode = AudioListener.context.destination;

    public readonly node: GainNode;
    public volume: number;
    public cameraDistance: number;

    private _sources: Map<number, AudioSource>;

    public constructor(gameObject: GameObject) {
        super(gameObject, ComponentType.AudioListener);

        this.node = AudioListener.context.createGain();
        this.node.connect(AudioListener.node);

        this.volume = 1;
        this.cameraDistance = 5;

        this._sources = new Map();


        for (const gO of [...this.gameObject.scene.gameObjects.values()]) {
            for (const source of [...gO.getComponents(AudioSource)]) source.connect();
        }
    }

    public static start(): void {
        AudioListener.context.addEventListener('statechange', () => {
            Debug.log(`audio context state change: ${AudioListener.context.state}`);
        });

        if (AudioListener.context.state === 'suspended') {
            triggerOnUserInputEvent(() => AudioListener.context.resume());
        }
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

                if (source.playGlobally) {
                    source.node.positionX.value = 0;
                    source.node.positionY.value = 0;
                    source.node.positionZ.value = 0;
                } else {
                    source.node.positionX.value = sourceGlobalTransform.position.x - globalTransform.position.x;
                    source.node.positionY.value = sourceGlobalTransform.position.y - globalTransform.position.y;
                }

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