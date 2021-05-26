import { Scene } from 'SnowballEngine/Scene';
import { Disposable } from './Dispose';

let nextID = 0;

/**
 * 
 * Destroy will execute prepareDestroy(if exists) and add it to the current Scenes destroyables. The Scene will execute destroy on each destroyable and Dispose it. The result is an empty object.
 * @category Scene 
 * 
 */
export function Destroy(destroyable: Destroyable, inFrames?: number): void {
    destroyable.__destroyID__ = nextID++;
    if (inFrames !== undefined && (destroyable.__destroyInFrames__ === undefined || inFrames > destroyable.__destroyInFrames__)) {
        destroyable.__destroyInFrames__ = inFrames;
    }

    Scene.currentScene.addDestroyable(destroyable);

    if (destroyable.prepareDestroy) destroyable.prepareDestroy();
}

/** @category Scene */
export interface Destroyable extends Disposable {
    /** @internal */
    prepareDestroy?(): void;
    /** @internal */
    destroy(): void;
    /** @internal */
    __destroyID__?: number;
    /** 
     * 
     * frames after beeing Destroy()ed before it's actually destroyed
     * @internal 
     * 
     */
    __destroyInFrames__?: number;
}