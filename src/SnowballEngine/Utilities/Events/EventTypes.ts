import { Camera } from 'GameObject/Components/Camera';
import { Angle } from 'Utility/Angle';
import { Vector2 } from 'Utility/Vector2';

export type ComponentEventTypes = {
    enable: [],
    disable: [],
    destroy: [],
    prerender: [camera: Camera],
    postrender: [camera: Camera],
    earlyupdate: [],
    update: unknown[],
    lateupdate: []
};

export type RenderableEventTypes = {} & ComponentEventTypes;

export type BehaviourEventTypes = { awake: [], start: [], collide: [collision: any], trigger: [collision: any] } & ComponentEventTypes;

export type AnimatedSpriteEventTypes = {} & RenderableEventTypes;
export type AudioListenerEventTypes = {} & ComponentEventTypes;
export type AudioSourceEventTypes = {} & ComponentEventTypes;
export type CameraEventTypes = {} & ComponentEventTypes;
export type ParallaxBackgroundEventTypes = {} & RenderableEventTypes;
export type ParticleSystemEventTypes = {} & RenderableEventTypes;
export type RigidbodyEventTypes = {} & ComponentEventTypes;
export type TextureEventTypes = {} & RenderableEventTypes;
export type TileMapEventTypes = {} & RenderableEventTypes;
export type TransformEventTypes = { change: [position?: Readonly<Vector2>, scale?: Readonly<Vector2>, rotation?: Readonly<Angle>], parentchange: [position?: Readonly<Vector2>, scale?: Readonly<Vector2>, rotation?: Readonly<Angle>] } & ComponentEventTypes; export type VideoEventTypes = { end: [] } & RenderableEventTypes;
