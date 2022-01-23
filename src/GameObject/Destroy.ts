import { Disposable, Dispose } from "./Dispose";
import { SceneManager } from "../SceneManager";

let nextID = 0;
/**
 * Destroy will execute prepareDestroy(if exists) and add it to the current Scenes destroyables. The Scene will execute destroy on each destroyable and Dispose it.
 * @category Scene
 */
export function Destroy(destroyable: Destroyable): void {
    SceneManager.getInstance()?.getCurrentScene()?.destroySomething(destroyable);
}

/** @category Scene */
export interface Destroyable extends Disposable {
    /**
     * Called when destroyed
     * @internal
     */
    prepareDestroy?(): void;
    /** @internal */
    destroy(): void;
    /** @internal */
    __destroyID__?: number;
    /**
     * frames after beeing Destroy()ed before it's actually destroyed
     * @internal
     */
    __destroyInFrames__?: number;
}

export class Destroyer {
    private readonly _destroyables: (Destroyable | undefined)[];

    public constructor() {
        this._destroyables = [];
    }

    public addDestroyable(destroyable: Destroyable, inFrames?: number): boolean {
        destroyable.__destroyID__ = nextID++;
        if (
            inFrames !== undefined &&
            (destroyable.__destroyInFrames__ === undefined || inFrames > destroyable.__destroyInFrames__)
        ) {
            destroyable.__destroyInFrames__ = inFrames;
        }

        if (destroyable.prepareDestroy) destroyable.prepareDestroy();

        const i = this._destroyables.findIndex((d) => d && d.__destroyID__ === destroyable.__destroyID__);

        if (i === -1) {
            this._destroyables.push(destroyable);
            return true;
        }

        return false;
    }

    /**
     * Call "destroy" method and clear the object to remove any references to help the garbage collector.
     * @param force ignore the destroyInFrames property and destroy immediately.
     */
    public destroyDestroyables(force?: boolean): void {
        for (let i = this._destroyables.length - 1; i >= 0; i--) {
            if (
                (this._destroyables[i] && !(this._destroyables[i] as Destroyable).__destroyInFrames__) ||
                force
            ) {
                (this._destroyables[i] as Destroyable).destroy();
                Dispose(this._destroyables[i] as Destroyable);
                this._destroyables[i] = undefined;
            } else if (this._destroyables[i])
                ((this._destroyables[i] as Destroyable).__destroyInFrames__ as number)--;
        }
    }
}
