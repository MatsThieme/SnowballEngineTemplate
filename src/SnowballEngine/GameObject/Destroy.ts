import { Scene } from 'SnowballEngine/Scene';
import { Disposable } from './Dispose';

/**
 * 
 * Destroy will execute prepareDestroy(if exists) and add it to the current Scenes destroyables. The Scene will execute destroy on each destroyable and Dispose it. The result is an empty object.
 * @category Scene 
 * 
*/
export function Destroy(destroyable: Destroyable): void {
    if (destroyable.prepareDestroy) destroyable.prepareDestroy();

    Scene.currentScene.addDestroyable(destroyable);
}

/** @category Scene */
export interface Destroyable extends Disposable {
    /** @internal */
    prepareDestroy?(): void;
    /** @internal */
    destroy(): void;
}