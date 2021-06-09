import { Debug } from 'SnowballEngine/Debug';
import { Scene } from 'SnowballEngine/Scene';
import { AudioListenerEventTypes } from 'Utility/Events/EventTypes';
import { triggerOnUserInputEvent } from 'Utility/Helpers';
import { Vector2 } from 'Utility/Vector2';
import { ComponentType } from '../ComponentType';
import { GameObject } from '../GameObject';
import { AudioSource } from './AudioSource';
import { Component } from './Component';

/** @category Component */
export class AudioListener extends Component<AudioListenerEventTypes>  {
    public static readonly context: AudioContext = new AudioContext();

    public static readonly node: AudioDestinationNode = AudioListener.context.destination;

    public readonly node: GainNode;
    public volume: number;

    public constructor(gameObject: GameObject) {
        super(gameObject, ComponentType.AudioListener);

        this.node = AudioListener.context.createGain();
        this.node.connect(AudioListener.node);

        this.volume = 1;

        for (const c of Component.components) {
            if (c.type === ComponentType.AudioSource) (<AudioSource>c).connect();
        }
    }

    protected override awake(): void {
        (<Mutable<Scene>>this.gameObject.scene).audioListener = this;
    }

    public static start(): void {
        AudioListener.context.addEventListener('statechange', () => {
            Debug.log(`audio context state change: ${AudioListener.context.state}`);
        });

        if (AudioListener.context.state === 'suspended') {
            triggerOnUserInputEvent(() => AudioListener.context.resume());
        }
    }

    protected override onEnable(): void {
        this.node.connect(AudioListener.node);
    }

    protected override onDisable(): void {
        this.node.disconnect();
    }

    protected override update(): void {
        const globalTransform = this.gameObject.transform.toGlobal();

        for (const source of Component.components) {
            if (source.type === ComponentType.AudioSource && (<AudioSource>source).node) {
                if (!(<AudioSource>source).playing) continue;

                const sourceGlobalTransform = source.gameObject.transform.toGlobal();

                if ((<AudioSource>source).playGlobally) {
                    (<AudioSource>source).position = globalTransform.position;
                } else {
                    (<AudioSource>source).position = new Vector2(sourceGlobalTransform.position.x - globalTransform.position.x, sourceGlobalTransform.position.y - globalTransform.position.y);
                }
            }
        }

        this.node.gain.value = this.volume;
    }

    public override destroy(): void {
        for (const c of Component.components) {
            if (c.type === ComponentType.AudioSource) (<AudioSource>c).disconnect();
        }

        this.gameObject.scene.audioListener = undefined;

        this.node.disconnect();

        super.destroy();
    }
}