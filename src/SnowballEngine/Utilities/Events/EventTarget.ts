import { EventHandler } from './EventHandler';
import { EventType } from './EventType';

export class EventTarget<T extends EventType> {
    private readonly _events: { [U in keyof T]: EventHandler<T[U]>[] };

    public constructor() {
        this._events = <any>{};
    }

    public addListener<U extends keyof T>(eventName: U, handler: EventHandler<T[U]>): void {
        if (!this._events[eventName]) this._events[eventName] = [];
        this._events[eventName][handler.id] = handler;
    }

    public removeListener<U extends keyof T>(eventName: U, handler: EventHandler<T[U]>): void {
        if (this._events[eventName]) delete this._events[eventName][handler.id];
    }

    public dispatchEvent<U extends keyof T>(eventName: U, ...args: T[U]): void | Promise<void> {
        if (this._events[eventName]) return <any>Promise.all(this._events[eventName].map(h => h.handler(...args)));
    }
}