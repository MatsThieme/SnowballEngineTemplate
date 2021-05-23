import { Scene } from 'SnowballEngine/Scene';
import { Disposable } from './Dispose';

let nextID = 0;

/**
 * 
 * Destroy will execute prepareDestroy(if exists) and add it to the current Scenes destroyables. The Scene will execute destroy on each destroyable and Dispose it. The result is an empty object.
 * @category Scene 
 * 
*/
export function Destroy(destroyable: Destroyable): void {
    destroyable.__destroyID = nextID++;
    Scene.currentScene.addDestroyable(destroyable);

    if (destroyable.prepareDestroy) destroyable.prepareDestroy();
}

/** @category Scene */
export interface Destroyable extends Disposable {
    /** @internal */
    prepareDestroy?(): void;
    /** @internal */
    destroy(): void;

    __destroyID?: number;
}