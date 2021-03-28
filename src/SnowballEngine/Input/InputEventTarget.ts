import { Destroyable } from '../GameObject/Destroy';
import { InputEvent } from './InputEvent';

/** @category Input */
export class InputEventTarget implements Destroyable {
    protected _listeners: Map<string, { cb: (e: InputEvent) => any, type: InputAction }>;

    public constructor() {
        this._listeners = new Map();
    }

    /**
    *
    * Returns the listener id.
    *
    */
    public addListener(type: InputAction, cb: (e: InputEvent) => any, id: string): string {
        this._listeners.set(id, { cb, type });
        return id;
    }

    public removeListener(id: string): void {
        this._listeners?.delete(id);
    }

    public destroy(): void {
        this._listeners.clear();

        delete (<any>this)._listeners;
    }
}