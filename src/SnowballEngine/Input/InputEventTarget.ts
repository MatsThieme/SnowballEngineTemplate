import { Disposable } from 'GameObject/Dispose';
import { InputEvent } from './InputEvent';

/** @category Input */
export class InputEventTarget implements Disposable {
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

    public dispose(): void {
        this._listeners.clear();
    }
}