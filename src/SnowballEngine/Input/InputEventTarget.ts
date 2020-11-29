import { InputEvent } from './InputEvent';

export class InputEventTarget {
    protected listeners: Map<string, { cb: (e: InputEvent) => any, type: InputType }>;

    public constructor() {
        this.listeners = new Map();
    }
    /**
    *
    * Returns the listener id.
    *
    */
    public addListener(type: InputType, cb: (e: InputEvent) => any, id: string): string {
        this.listeners.set(id, { cb, type });
        return id;
    }
    public removeListener(id: string): void {
        this.listeners?.delete(id);
    }
    protected destroy(): void {
        for (const key of this.listeners.keys()) {
            this.removeListener(key);
        }

        this.listeners.clear();

        delete (<any>this).listeners;
    }
}