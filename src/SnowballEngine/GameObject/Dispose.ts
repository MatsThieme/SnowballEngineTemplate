import { clearObject } from "Utility/Helpers";

/**
 *
 * Use Dispose to immediately dispose Objects.
 * @category Scene
 *
 */
export function Dispose(disposable: Disposable | Record<string, any>): void {
    if (disposable.dispose) disposable.dispose();
    clearObject(disposable, true);
}

/**
 *
 * Disposable is an Object thats properties and methods may be cleared at any time without preparation, unlike Destroyable, which can only be disposed at the end of a frame.
 * @category Scene
 *
 */
export interface Disposable {
    /** @internal */
    dispose?(): void;
}
